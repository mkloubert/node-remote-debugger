/**
 * Information about a function.
 */
export interface FunctionInfo {
    /**
     * The list of arguments.
     */
    args: string[];
    /**
     * The name.
     */
    name: string;
    /**
     * The underlying object / value.
     */
    obj: any;
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
 * Gets information about a function.
 *
 * @param {any} func The function value.
 *
 * @return {FunctionInfo} The function information.
 */
export declare function getFunctionInfo(func: any): FunctionInfo;
/**
 * Tries to return the name of an object.
 *
 * @param {any} val The value / object.
 *
 * @return {String} The name.
 */
export declare function getObjectName(val: any): string;
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
