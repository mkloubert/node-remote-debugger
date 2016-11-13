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

remoteDebugger.addHost('localhost', 23979);
remoteDebugger.scriptRoot = __dirname;

remoteDebugger.jsonTransformer = (buff) => {
    return ZLib.gzipSync(buff);
};

remoteDebugger.errorHandler = (type, ctx) => {
    console.log('[ERROR] :: ' + type + ' => [' + ctx.code + '] ' + ctx.message);
};

let a = 11;
let b = 22;
let c = 33;

remoteDebugger.dbg({
    'a': 11,
    'b': 22,
    'c': 33,
});

let aa = '11a';
let bb = '22b';
let cc = '33c';

remoteDebugger.dbgIf(
    true,
    {
        'aa': aa,
        'bb': bb,
        'cc': cc,
    });

let aaa = '_11a';
let bbb = '_22b';
let ccc = '_33c';

remoteDebugger.dbgIf(
    () => false,
    {
        'aaa': aaa,
        'bbb': bbb,
        'ccc': ccc,
    });
