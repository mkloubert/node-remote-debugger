# vs-remote-debugger (Node.js SDK)

[![npm](https://img.shields.io/npm/v/node-remote-debugger.svg)](https://www.npmjs.com/package/node-remote-debugger)

Server-side Node.js library for interacting with [vs-remote-debugger](https://github.com/mkloubert/vs-remote-debugger) Visual Studio Code extension, e.g.

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=GFV9X2A64ZK3Y)

## License

[MIT license](https://github.com/mkloubert/node-remote-debugger/blob/master/LICENSE)

## Install

Run

```bash
npm install node-remote-debugger
```

inside your app project to install the module.

## Usage

If you look at the [example code](https://github.com/mkloubert/node-remote-debugger/blob/master/test.ts) you can see how the class can be used:

```typescript
import { RemoteDebugger } from 'node-remote-debugger';
import * as ZLib from 'zlib';

let remoteDebugger = new RemoteDebugger();
remoteDebugger.addHost('localhost', 23979);

// compress JSON data with GZIP
// 
// activate the "gzip" plugin in your
// launch.json file in VS Code!
remoteDebugger.jsonTransformer = (buff) => {
    return ZLib.gzipSync(buff);
};

remoteDebugger.dbg({
    a: 11,
    b: 22,
    c: 33,
});
```
