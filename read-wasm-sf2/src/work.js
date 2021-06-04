const assert = require('assert');
const {
    Worker,
    MessageChannel,
    MessagePort,
    isMainThread,
    parentPort
} = require('worker_threads');
if (isMainThread) {
    const worker = new Worker(__filename);
    
    return;
}

parentPort.on('message', () => console.log('msg')).unref();
(function r(n) {
    if (--n < 0) return;
    const t = Date.now();
    while (Date.now() - t < 300);
    setImmediate(r, n);
})(10);