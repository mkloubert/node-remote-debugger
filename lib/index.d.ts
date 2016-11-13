/// <reference types="node" />
/**
 * A condition.
 */
export declare type Condition = () => boolean;
/**
 * A handler for sending a debugger entry.
 */
export declare type Sender = (buffer: Buffer) => void;
/**
 * A debugger entry.
 */
export interface RemoteDebuggerEntry {
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
export declare class RemoteDebugger {
    /**
     * Sends a debugger message.
     *
     * @param {Array} [vars] The custom variables to send.
     * @param {number} [skipFrames] The number of stack frames to skip.
     */
    dbg(vars?: any[], skipFrames?: number): void;
    /**
     * Sends a debugger message if a condition matches.
     *
     * @param {Condition|boolean} condition The condition (value) to use.
     * @param {Array} [vars] The custom variables to send.
     * @param {number} [skipFrames] The number of stack frames to skip.
     */
    dbgIf(condition: Condition | boolean, vars?: any[], skipFrames?: number): void;
    /**
     * The default sender logic.
     */
    defaultSender(buffer: Buffer): void;
    /**
     * Returns the stack trace.
     *
     * @param {number} [skipFrames] The optional number of frames to skip.
     */
    protected getStackTrace(skipFrames?: number): StackFrame[];
    /**
     * A function that is used to send the data.
     */
    sender: Sender;
}
