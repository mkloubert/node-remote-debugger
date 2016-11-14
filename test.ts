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

import { RemoteDebugger } from './lib/index';
import * as ZLib from 'zlib';

let remoteDebugger = new RemoteDebugger();

class MyClass {
    public testMethod() {
        let obj: any = {};
        obj.i1 = 0.1;
        obj.i2 = "123";

        remoteDebugger.dbg({
            'a': new Date(),
            'b':1,
            'c':2.34,
            'd':'Marcel K! Marcel K! Marcel K!',
            'e': false,
            'f': null,
            'g':true,
            'h':{
                'h1': 0,
                'h2': 1.2,
                'h3': remoteDebugger.addHost,
            },
            'i': obj,
            'j': [ 'MK', 'TM' ],
            'k': function(a, b, c = []) {
                return 23.979;
            }
        });

        remoteDebugger.dbgIf(
            true,
            {
                'AA': new Date().toString(),
                'BB': 1,
                'CC': 2.34,
                'DD': 'Marcel K! Marcel K! Marcel K!',
                'EE': false,
                'FF': null,
                'GG': true,
            });

        remoteDebugger.dbgIf(
            () => false,
            {
                'AAA': new Date().toString(),
                'BBB': 1,
                'CCC': 2.34,
                'DDD': 'Marcel K! Marcel K! Marcel K!',
                'EEE': false,
                'FFF': null,
                'GGG': true,
            });
    }
}

remoteDebugger.addHost('localhost', 23979);
remoteDebugger.scriptRoot = __dirname;

remoteDebugger.jsonTransformer = (buff) => {
    return ZLib.gzipSync(buff);
};

remoteDebugger.errorHandler = (type, ctx) => {
    console.log('[ERROR] :: ' + type + ' => [' + ctx.code + '] ' + ctx.message);
};

let test = new MyClass();
test.testMethod();
