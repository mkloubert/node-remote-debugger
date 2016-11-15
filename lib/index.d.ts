/// <reference types="node" />
import * as nrd_helpers from './helpers';
/**
 * The default host address.
 */
export declare const DEFAULT_HOST: string;
/**
 * Default value for the maximum depth of a variable tree.
 */
export declare const DEFAULT_MAX_DEPTH: number;
/**
 * The default port.
 */
export declare const DEFAULT_PORT: number;
/**
 * A condition.
 */
export declare type Condition = (data: EventData) => boolean;
/**
 * A function that provides data.
 */
export declare type DataProvider<T> = (obj: RemoteDebugger, data: EventData, step: number, maxSteps: number) => T | DataProvider<T>;
/**
 * A function that transforms data into another format.
 */
export declare type DataTransformer = (input: Buffer) => Buffer;
/**
 * A function for handling an error.
 */
export declare type ErrorHandler = (category: string, ctx: ErrorContext, data: EventData) => void;
/**
 * A function that provides data of a target host.
 */
export declare type HostProvider = (obj: RemoteDebugger) => HostData;
/**
 * A handler for sending a debugger entry.
 */
export declare type Sender = (buffer: Buffer, data: EventData, errHandler: ErrorHandler) => void;
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
    backtrace: nrd_helpers.StackFrame[];
    /**
     * The calling line.
     */
    calling_line: nrd_helpers.StackFrame;
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
     * Number of the column
     */
    c?: number;
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
export declare class RemoteDebugger {
    /**
     * Stores the list of provides that return the host address
     * and port of the remote debugger host.
     */
    protected _hostProviders: HostProvider[];
    /**
     * Adds a target host.
     *
     * @param {string | HostProvider} The host address or a function that provides the host data.
     * @param {number} [port] The custom TCP port.
     *
     * @chainable
     */
    addHost(addressOrProvider?: string | HostProvider, port?: number): RemoteDebugger;
    /**
     * The name of the app or a function that provides it.
     */
    app: string | DataProvider<string>;
    /**
     * The name for the current function stack frame or the function that provides it.
     */
    currentFunctionStackFrame: string | DataProvider<string>;
    /**
     * Gets the current thread or the function that provides it.
     */
    currentThread: RemoteDebuggerThread | DataProvider<RemoteDebuggerThread>;
    /**
     * Sends a debugger message.
     *
     * @param {Object} [vars] The custom variables to send.
     * @param {number} [skipFrames] The number of stack frames to skip.
     */
    dbg(vars?: any, skipFrames?: number): void;
    /**
     * Sends a debugger message if a condition matches.
     *
     * @param {Condition|boolean} condition The condition (value) to use.
     * @param {Object} [vars] The custom variables to send.
     * @param {number} [skipFrames] The number of stack frames to skip.
     */
    dbgIf(condition: Condition | boolean, vars?: any, skipFrames?: number): void;
    /**
     * The name for the Debugger stack frame or the function that provides it.
     */
    debuggerStackFrame: string | DataProvider<string>;
    /**
     * The default sender logic.
     */
    defaultSender(buffer: Buffer, data: EventData, errHandler: ErrorHandler): void;
    /**
     * A function that filters an entry BEFORE it is send.
     */
    entryFilter: (input: RemoteDebuggerEntry) => RemoteDebuggerEntry | DataProvider<RemoteDebuggerEntry>;
    /**
     * Stores the error handler.
     */
    errorHandler: ErrorHandler;
    /**
     * Transforms JSON data into a new format.
     */
    jsonTransformer: DataTransformer;
    /**
     * A value that defines how deep a tree of
     * variables can be to prevent stack overflows.
     */
    maxDepth: number | DataProvider<number>;
    /**
     * Gets the path to the script's root directory or the function that provides it.
     */
    scriptRoot: string | DataProvider<string>;
    /**
     * A function that is used to send the data.
     */
    sender: Sender;
    /**
     * The name of the target client or a function that provides it.
     */
    targetClient: string | DataProvider<string>;
    /**
     * Tries to convert a full path to a relative path.
     *
     * @param {string} path The input value.
     *
     * @return {string} The output value.
     */
    toRelativePath(path: string): string;
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
    toVariableEntry(name: string, value: any, ref?: number, nextVarRef?: ValueWrapper<number>, step?: number, maxSteps?: number): RemoteDebuggerVariable;
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
    unwrapValue<T>(val: T | DataProvider<T>, args?: EventData, step?: number, maxSteps?: number): T | DataProvider<T>;
}
