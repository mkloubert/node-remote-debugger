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
 * Returns the stack trace.
 *
 * @param {number} [skipFrames] The optional number of frames to skip.
 */
export declare function getStackTrace(skipFrames?: number): StackFrame[];
/**
 * Checks if a value is a function.
 *
 * @param {any} val The value to check.
 *
 * @return {boolean} Is function or not.
 */
export declare function isCallable(val: any): boolean;
