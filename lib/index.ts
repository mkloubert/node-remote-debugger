/// <reference types="node" />

// The MIT License (MIT)
// 
// vs-remote-debugger (Node.js SDK) (https://github.com/mkloubert/node-remote-debugger)
// Copyright (c) Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

import FS = require('fs');
import Net = require('net');
import Path = require('path');
import * as nrd_helpers from './helpers';

/**
 * The default host address.
 */
export const DEFAULT_HOST = '127.0.0.1';
/**
 * Default value for the maximum depth of a variable tree.
 */
export const DEFAULT_MAX_DEPTH = 32;
/**
 * The default port.
 */
export const DEFAULT_PORT = 5979;

/**
 * A condition.
 */
export type Condition = (data: EventData) => boolean;
/**
 * A function that provides data.
 */
export type DataProvider<T> = (obj: RemoteDebugger, data: EventData, step: number, maxSteps: number) => T | DataProvider<T>;
/**
 * A function that transforms data into another format.
 */
export type DataTransformer = (input: Buffer) => Buffer;
/**
 * A function for handling an error.
 */
export type ErrorHandler = (category: string, ctx: ErrorContext, data: EventData) => void;
/**
 * A function that provides data of a target host.
 */
export type HostProvider = (obj: RemoteDebugger) => HostData;
/**
 * A handler for sending a debugger entry.
 */
export type Sender = (buffer: Buffer, data: EventData, errHandler: ErrorHandler) => void;

/**
 * An error context.
 */
export interface ErrorContext {
    /**
     * The code.
     */
    code?: number;

    /**
     * The message.
     */
    message?: string;
}

/**
 * A debugger event / context.
 */
export interface EventData {
    /**
     * Stores the stack trace.
     */
    backtrace: StackFrame[];

    /**
     * The calling line.
     */
    calling_line: StackFrame;

    /**
     * Defines the condition value.
     */
    condition?: boolean;

    /**
     * The underlying debugger.
     */
    debugger: RemoteDebugger;

    /**
     * The current host.
     */
    host: HostData;

    /**
     * The underlying debugger.
     */
    me: RemoteDebugger;

    /**
     * The function that provides the connection data of the target host.
     */
    provider: HostProvider;

    /**
     * The current timestamp.
     */
    time: Date;

    /**
     * The debugger variables.
     */
    vars?: RemoteDebuggerVariable[];
}

/**
 * Stores data for a target host.
 */
export interface HostData {
    /**
     * The remote address.
     */
    addr?: string;

    /**
     * The TCP port.
     */
    port?: number;
}

/**
 * Describes a debugger entry.
 */
export interface RemoteDebuggerEntry {
    /**
     * The name of the app the entry is for.
     */
    a?: string;

    /**
     * The name of the client the entry is for.
     */
    c?: string;

    /**
     * The name of the file.
     */
    f?: string;

    /**
     * Notes
     */
    n?: string;

    /**
     * The stacktrace.
     */
    s?: RemoteDebuggerStackFrame[];

    /**
     * The list of threads.
     */
    t?: RemoteDebuggerThread[];

    /**
     * The list of variables.
     */
    v?: RemoteDebuggerVariable[];
}

/**
 * A scope.
 */
export interface RemoteDebuggerScope {
    /**
     * The name.
     */
    n?: string;

    /**
     * The reference number.
     */
    r?: number;

    /**
     * The list of debugger variables.
     */
    v?: RemoteDebuggerVariable[];
}

/**
 * A frame of a stacktrace.
 */
export interface RemoteDebuggerStackFrame {
    /**
     * The file path.
     */
    f?: string;

    /**
     * The file name.
     */
    fn?: string;
    
    /**
     * The ID.
     */
    i?: number;

    /**
     * The line in the file.
     */
    l?: number;

    /**
     * The full path of the file on the running machine.
     */
    ln?: string;

    /**
     * The name.
     */
    n?: string;

    /**
     * The list of scopes.
     */
    s?: RemoteDebuggerScope[];

    /**
     * The list of variables.
     */
    v?: RemoteDebuggerVariable[];
}

/**
 * A thread.
 */
export interface RemoteDebuggerThread {
    /**
     * The ID.
     */
    i?: number;

    /**
     * The name.
     */
    n?: string;
}

/**
 * A variable.
 */
export interface RemoteDebuggerVariable {
    /**
     * If type is 'function' this is the function name.
     */
    fn?: string;
    
    /**
     * The name.
     */
    n?: string;

    /**
     * If type is 'object' this is the object name.
     */
    on?: string;

    /**
     * The reference.
     */
    r?: number;

    /**
     * The data type.
     */
    t?: string;
    
    /**
     * The value.
     */
    v?: any;
}

/**
 * A frame of a stack trace.
 */
export interface StackFrame {
    /**
     * The column.
     */
    column?: number;

    /**
     * The file path.
     */
    file?: string;

    /**
     * The name of the underlying function.
     */
    func?: string;

    /**
     * The line.
     */
    line?: number;
}

/**
 * Wraps a value.
 */
export interface ValueWrapper<T> {
    /**
     * The wrapped value.
     */
    value?: T;
}

/**
 * A remote debugger.
 * 
 * @author Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
 */
export class RemoteDebugger {
    /**
     * Stores the list of provides that return the host address
     * and port of the remote debugger host.
     */
    protected _hostProviders: HostProvider[] = [];

    /**
     * Adds a target host.
     * 
     * @param {string | HostProvider} The host address or a function that provides the host data.
     * @param {number} [port] The custom TCP port.
     * 
     * @chainable
     */
    public addHost(addressOrProvider: string | HostProvider = DEFAULT_HOST,
                   port: number = DEFAULT_PORT): RemoteDebugger {

        let me = this;

        let normalizeAddress = (addr: string = null): string => {
            if (addr) {
                addr = ('' + addr).trim();
            }

            if (!addr) {
                addr = DEFAULT_HOST;
            }

            return addr;
        };

        let normalizePort = function(port?: number): number {
            let p = '';
            if (arguments.length > 0) {
                p = '' + port;
            }

            if (!p) {
                p = '' + DEFAULT_PORT;
            }

            return parseInt(p);
        };

        let provider: HostProvider = () => {
            let a = normalizeAddress('' + addressOrProvider);
            let p = normalizePort(port);

            return {
                addr: a,
                port: p,
            };
        };

        if (1 == arguments.length) {
            if (nrd_helpers.isCallable(addressOrProvider)) {
                provider = <HostProvider>addressOrProvider;
            }
        }

        if (provider) {
            this._hostProviders.push(provider);
        }

        return this;
    }

    /**
     * The name of the app or a function that provides it.
     */
    public app: string | DataProvider<string>;

    /**
     * The name for the current function stack frame or the function that provides it.
     */
    public currentFunctionStackFrame: string | DataProvider<string>;

    /**
     * Gets the current thread or the function that provides it.
     */
    public currentThread: RemoteDebuggerThread | DataProvider<RemoteDebuggerThread>;

    /**
     * Sends a debugger message.
     * 
     * @param {Object} [vars] The custom variables to send.
     * @param {number} [skipFrames] The number of stack frames to skip.
     */
    public dbg(vars?: any, skipFrames = 0) {
        this.dbgIf(true,
                   vars, skipFrames + 1);
    }
    
    /**
     * Sends a debugger message if a condition matches.
     * 
     * @param {Condition|boolean} condition The condition (value) to use.
     * @param {Object} [vars] The custom variables to send.
     * @param {number} [skipFrames] The number of stack frames to skip.
     */
    public dbgIf(condition: Condition | boolean,
                 vars?: any, skipFrames = 0) {

        let now = new Date();

        let me = this;

        // error handler
        let errHandler = this.errorHandler;
        let handlerError: ErrorHandler = (type, err, eventData) => {
            if (errHandler) {
                errHandler(type, err, eventData);
            }
        };

        // the logic to send the data
        let sender = this.sender;
        if (!sender) {
            sender = this.defaultSender;
        }

        // condition
        if (!nrd_helpers.isCallable(condition)) {
            let conditionValue = condition ? true : false;

            condition = () => conditionValue;
        }

        let filter = this.entryFilter;
        let transformer = this.jsonTransformer;

        let backtrace = this.getStackTrace();

        let callingLine = backtrace[0];

        this._hostProviders.forEach((provider, providerIndex) => {
            let connData = provider(me);
            if (!connData) {
                return;
            }

            let eventData: EventData = {
                backtrace: backtrace,
                calling_line: callingLine,
                debugger: me,
                host: connData,
                me: me,
                provider: provider,
                time: now,
            };

            let maxSteps = <number>me.unwrapValue(me.maxDepth, eventData);
            if (maxSteps) {
                maxSteps = parseInt(('' + maxSteps).trim());
            }
            if (!maxSteps) {
                maxSteps = DEFAULT_MAX_DEPTH;
            }

            try {
                let nextVarRef: ValueWrapper<number> = { value: 1 };

                let debuggerVars: RemoteDebuggerVariable[] = null;
                if (vars) {
                    debuggerVars = [];

                    for (var k in vars) {
                        debuggerVars.push(me.toVariableEntry('' + k, vars[k],
                                                             0, nextVarRef,
                                                             0, maxSteps));
                    }

                    vars = debuggerVars;
                }

                eventData.vars = debuggerVars;

                eventData.condition = false !== (<Condition>condition)(eventData);
                if (!eventData.condition) {
                    return;
                }

                let entry: RemoteDebuggerEntry = {
                    t: [],
                    s: [],
                    v: debuggerVars,
                };

                let client = <string>me.unwrapValue(me.targetClient, eventData);
                if (client) {
                    entry.c = '' + client;
                }

                let app = <string>me.unwrapValue(me.app);
                if (app) {
                    entry.a = '' + app;
                }

                let currentThread = <RemoteDebuggerThread>me.unwrapValue(me.currentThread, eventData);
                if (!currentThread) {
                    currentThread = {
                        i: 1,
                        n: 'Thread #1',
                    };
                }
                entry.t.push(currentThread);

                backtrace.forEach((bt, i) => {
                    if (i < skipFrames) {
                        return;
                    }

                    if (!bt) {
                        return;
                    }

                    let stackFrame: RemoteDebuggerStackFrame = {
                        i: i,
                    };

                    if (bt.file) {
                        stackFrame.ln = bt.file;
                        stackFrame.f = me.toRelativePath(stackFrame.ln);
                        stackFrame.fn = Path.basename(stackFrame.ln);
                    }

                    if (bt.line) {
                        stackFrame.l = bt.line;
                    }

                    if (bt.func) {
                        stackFrame.n = bt.func;
                    }

                    stackFrame.s = [];

                    let sfCurrentFunc = <string>me.unwrapValue(me.currentFunctionStackFrame, eventData);
                    if (!sfCurrentFunc) {
                        sfCurrentFunc = 'Current function';
                    }

                    let sfDebugger = <string>me.unwrapValue(me.debuggerStackFrame, eventData);
                    if (!sfDebugger) {
                        sfDebugger = 'Debugger';
                    }

                    ++nextVarRef.value;

                    // Current function
                    stackFrame.s.push({
                        n: '' + sfCurrentFunc,
                        r: nextVarRef.value,
                    });

                    // Debugger
                    stackFrame.s.push({
                        n: '' + sfDebugger,
                        r: 1,
                    });

                    entry.s.push(stackFrame);
                });

                if (filter) {
                    entry = <RemoteDebuggerEntry>me.unwrapValue(filter(entry),
                                                                eventData);
                }

                if (!entry) {
                    // nothing to send
                    return;
                }

                let json = JSON.stringify(entry);
                if (!json) {
                    // nothing to send
                    return;    
                }

                let data = new Buffer(json, 'utf8');
                if (transformer) {
                    data = transformer(data);
                }

                if (!data || data.length < 1) {
                    // nothing to send
                    return;
                }

                sender(data, eventData, handlerError);
            }
            catch (e) {
                handlerError('exception',
                             {
                                 code: 0,
                                 message: '' + e,
                             },
                             eventData);
            }
        });
    }

    /**
     * The name for the Debugger stack frame or the function that provides it.
     */
    public debuggerStackFrame: string | DataProvider<string>;

    /**
     * The default sender logic.
     */
    public defaultSender(buffer: Buffer, data: EventData, errHandler: ErrorHandler) {
        if (!buffer || buffer.length < 1) {
            return;
        }

        let socket = new Net.Socket();

        let errType: string;
        let raiseError = (err: any, code: number = 0) => {
            errHandler(errType, {
                code: 0,
                message: err + '',
            }, data);
        };

        let closeSocket = () => {
            try {
                socket.destroy();
            }
            catch (e) { /* ignore */ }
        };

        socket.on('error', (err) => {
            if (err) {
                raiseError(err);
            }
        });

        errType = 'connection';
        socket.connect(data.host.port, data.host.addr, (err) => {
            if (err) {
                return;
            }

            let dataLength = Buffer.alloc(4);
            dataLength.writeUInt32LE(buffer.length, 0);

            errType = 'send.datalength';
            socket.write(dataLength, (err) => {
                if (err) {
                    closeSocket();
                    return;
                }

                errType = 'send.json';
                socket.write(buffer, (err) => {
                    closeSocket();
                });
            });
        });
    }

    /**
     * A function that filters an entry BEFORE it is send.
     */
    public entryFilter: (input: RemoteDebuggerEntry) => RemoteDebuggerEntry | DataProvider<RemoteDebuggerEntry>;

    /**
     * Stores the error handler.
     */
    public errorHandler: ErrorHandler;

    /**
     * Returns the stack trace.
     * 
     * @param {number} [skipFrames] The optional number of frames to skip.
     */
    protected getStackTrace(skipFrames = 0): StackFrame[] {
        let frames: StackFrame[] = [];

        let err = new Error("");

        let REGEX = /^(at)(\s+)(\S+)(\s+)(\()(.*)(\:)(\d*)(\:)(\d*)(\))$/i;

        let stack = err.stack.split('\n');
        for (let i = 3 + skipFrames; i < stack.length; i++) {
            let line = stack[i].trim();
            if (!REGEX.test(line)) {
                continue;
            }

            let match = REGEX.exec(line);

            let newFrame: StackFrame = {
                column: match[10] ? parseInt(match[10]) : null,
                file: match[6],
                func: match[3],
                line: match[8] ? parseInt(match[8]) : null,
            };

            if (!newFrame.file) {
                continue;
            }

            if (!Path.isAbsolute(newFrame.file) || !FS.existsSync(newFrame.file)) {
                continue;
            }

            frames.push(newFrame);
        }

        return frames;
    }

    /**
     * Transforms JSON data into a new format.
     */
    public jsonTransformer: DataTransformer;

    /**
     * A value that defines how deep a tree of
     * variables can be to prevent stack overflows.
     */
    public maxDepth: number | DataProvider<number>;

    /**
     * Gets the path to the script's root directory or the function that provides it.
     */
    public scriptRoot: string | DataProvider<string>;

    /**
     * A function that is used to send the data.
     */
    public sender: Sender;

    /**
     * The name of the target client or a function that provides it.
     */
    public targetClient: string | DataProvider<string>;

    /**
     * Tries to convert a full path to a relative path.
     * 
     * @param {string} path The input value.
     * 
     * @return {string} The output value.
     */
    public toRelativePath(path: string): string {
        try {
            let normalizedPath = FS.realpathSync(path);

            let scriptRoot = this.unwrapValue(this.scriptRoot);
            if (!scriptRoot) {
                scriptRoot = process.cwd();
            }
            if (!scriptRoot) {
                scriptRoot = __dirname;
            }

            let sr = '' + scriptRoot;
            if (FS.existsSync(sr)) {
                if (0 == normalizedPath.indexOf(sr)) {
                    path = normalizedPath.substr(sr.length);
                    path = path.replace(Path.sep, '/');
                }
            }
        }
        catch (e) { /* ignore */ }

        return path;
    }

    /**
     * Creates a variable entry.
     * 
     * @param {string} $name The name of the variable.
     * @param {any} $value The value.
     * @param {number} [ref] The reference.
     * @param {ValueWrapper<number>} {nextVarRef} The next variable reference value.
     * @param {number} [step] The current step.
     * @param {number} [maxSteps] The maximum number of steps.
     * 
     * @return {RemoteDebuggerVariable} The entry.
     */
    public toVariableEntry(name: string, value: any,
                           ref: number = 0, nextVarRef: ValueWrapper<number> = { value: 0 },
                           step = 0, maxSteps = 32): RemoteDebuggerVariable {

        let me = this;

        let entry: RemoteDebuggerVariable = {};

        let type = 'string';

        if (step < maxSteps) {
            switch (typeof value) {
                case 'boolean':
                    value = value ? 'true' : 'false';
                    break;

                case 'number':
                    type = 'float';
                    value = '' + value;
                    break;

                case 'object':
                    ref = ++nextVarRef.value;

                    if ('[object Array]' == Object.prototype.toString.call(value)) {
                        let obj = [];
                        let arr = <any[]>value;

                        type = 'array';
                        arr.forEach((v, k) => {
                            obj.push(me.toVariableEntry(`[${k}]`, v,
                                                        0, nextVarRef,
                                                        step + 1, maxSteps));
                        });

                        value = obj;
                    }
                    else {
                        entry.on = 'object';

                        let obj = [];

                        let propertyNames: string[] = [];
                        for (var k in value) {
                            propertyNames.push(k);
                        }
                        propertyNames = propertyNames.sort((x, y) => {
                            let sortX = ('' + x).toLowerCase().trim();
                            let sortY = ('' + y).toLowerCase().trim();

                            if (sortX > sortY) {
                                return 1;
                            }
                            if (sortX < sortY) {
                                return -1;
                            }

                            return 0;
                        });

                        propertyNames.forEach(prop => {
                            obj.push(me.toVariableEntry(`[${prop}]`, value[prop],
                                                        0, nextVarRef,
                                                        step + 1, maxSteps));
                        });

                        value = obj;
                    }
                    break;
            }
        }
        else {
            // TOO deep

            type = 'string';
            value = '###TOO DEEP###';
        }

        if (value && 'string' == type) {
            value = '' + value;
        }

        entry.n = '' + name;
        entry.r = ref;
        entry.t = type;
        entry.v = value;

        return entry;
    }

    /**
     * Unwarps a value.
     * 
     * @param {T} val The value to unwrap.
     * @param {EventData} [args] Additional arguments if a value is a function.
     * @param {Number} [step] The current step (only for internal use).
     * @param {Number} maxSteps Maximum steps (only for internal use).
     *
     * @return {T} The unwrapped value.
     */
    public unwrapValue<T>(val: T | DataProvider<T>,
                          args?: EventData, step = 0, maxSteps = 32): T | DataProvider<T> {

        if (step < maxSteps) {
            if (nrd_helpers.isCallable(val)) {
                let provider: DataProvider<T> = <DataProvider<T>>val;

                val = this.unwrapValue(provider(this, args,
                                                step + 1, maxSteps));
            }
        }

        return val;
    }
}
