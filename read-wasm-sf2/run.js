const Module = require("./readnode.js");

let api;


module.exports = class SFReader {
    constructor(filename = "./file.sf2") {

    }
    async init() {
        await new Promise(resolve => {
            Module.addOnInit(resolve);
        })
        const ff = require('fs').readFileSync("./file.sf2");
        const p = Module._malloc(ff.byteLength);
        Module.HEAP8.set(ff, p);
        Module._read_sf(p, ff.byteLength);
        this.api = {
            loadSound: Module.cwrap("load_sound", '', ['number', 'number', 'number', 'number', 'number']),
            ...Module
        }
        return this;
    }
    loadSound(presetId, midi, velocity, duration) {
        const n = 48000 * duration;
        const ptr = Module._malloc(n);
        api.loadSound(ptr, presetId, midi, velocity, n); //._load_sound(ptr, presetId, midi, velocity, n);
        const r = new Float32Array(Module.HEAPF32.buffer, ptr, n);
        Module._free(ptr);
        return r;
    }
}