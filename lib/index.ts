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

/**
 * The default port.
 */
export const DEFAULT_PORT = 5979;
/**
 * The default timeout.
 */
export const DEFAULT_TIMEOUT = 5;

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

export interface EventData {
    backtrace: StackFrame[];
    condition?: boolean;
    debugger: RemoteDebugger;
    host: HostData;
    me: RemoteDebugger;
    provider: HostProvider;
    time: Date;
    vars?: any[];
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

    /**
     * The timeout.
     */
    timeout?: number;
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

    public addHost(addressOrProvider: string | HostProvider = '127.0.0.1',
                   port: number = DEFAULT_PORT,
                   timeout: number = DEFAULT_TIMEOUT): RemoteDebugger {
        
        //TODO
        
        return this;
    }

    /**
     * The name of the app or a function that provides it.
     */
    public app: string | DataProvider<string>;

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
        if (!this.isCallable(condition)) {
            let conditionValue = condition ? true : false;

            condition = () => conditionValue;
        }

        let transformer = this.jsonTransformer;

        let backtrace = this.getStackTrace(skipFrames);

        this._hostProviders.forEach((provider, providerIndex) => {
            let connData = provider(me);
            if (!connData) {
                return;
            }

            let eventData: EventData = {
                backtrace: backtrace,
                debugger: me,
                host: connData,
                me: me,
                provider: provider,
                time: now,
            };

            try {
                let debuggerVars: any = null;
                if (vars) {
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

                let client = <string>me.unwrapValue(me.targetClient);
                if (client) {
                    entry.c = '' + client;
                }

                let app = <string>me.unwrapValue(me.app);
                if (app) {
                    entry.a = '' + app;
                }

                backtrace.forEach((bt, i) => {
                    if (i < skipFrames) {
                        return;
                    }

                    if (!bt) {
                        return;
                    }


                });

                //TODO

                if (!entry) {
                    return;
                }

                let json = new Buffer(JSON.stringify(entry), 'utf8');
                if (transformer) {
                    json = transformer(json);
                }

                if (!json || json.length < 1) {
                    return;
                }

                sender(json, eventData, handlerError);
            }
            catch (e) {
                handlerError('exception',
                             {
                                 message: '' + e,
                             },
                             eventData);
            }
        });
    }

    /**
     * The default sender logic.
     */
    public defaultSender(buffer: Buffer) {
        if (!buffer || buffer.length < 1) {
            return;
        }
    }

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
     * Checks if a value is a function.
     * 
     * @param {any} val The value to check.
     * 
     * @return {boolean} Is function or not.
     */
    protected isCallable(val: any): boolean {
        return typeof val !== "function";
    }

    /**
     * Transforms JSON data into a new format.
     */
    public jsonTransformer: DataTransformer;

    /**
     * A function that is used to send the data.
     */
    public sender: Sender;

    /**
     * The name of the target client or a function that provides it.
     */
    public targetClient: string | DataProvider<string>;

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
            if (this.isCallable(val)) {
                let provider: DataProvider<T> = <DataProvider<T>>val;

                val = this.unwrapValue(provider(this, args,
                                                step + 1, maxSteps));
            }
        }

        return val;
    }
}
