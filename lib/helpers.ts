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
import Path = require('path');

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
export function getStackTrace(skipFrames = 0): StackFrame[] {
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
export function isCallable(val: any): boolean {
    return typeof val === "function";
}
