const Module = require("../readnode.js");

let api;
 async function init() {
    await new Promise(resolve => {
        Module.addOnInit(resolve);
    })
    const ff = require('fs').readFileSync("./file.sf2");
    const p = Module._malloc(ff.byteLength);
    Module.HEAP8.set(ff, p);
    Module._read_sf(p, ff.byteLength);
    api = {
        loadSound: Module.cwrap("load_sound", '', ['number', 'number', 'number', 'number', 'number']),
        ...Module
    }
    return api;
}
init();


export default function loadSF(presetId, midi, velocity, duration) {
    if (!api)
        init();

    const n = 48000 * duration * 2;
    const ptr = Module._malloc(n);
    api.loadSound(ptr, presetId, midi, velocity, n); //._load_sound(ptr, presetId, midi, velocity, n);
    const r = new Float32Array(Module.HEAPF32.buffer, ptr, n);
    Module._free(ptr);
    return r;
};


