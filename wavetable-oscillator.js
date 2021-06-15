import {wasmBinary} from './build/load_wave_tables.js';

export class OscillatorTable {
    constructor(heap, ref, presetRef) {
        this.struct = new DataView(heap.buffer, ref);
        this.ref = ref;
        this.heap = heap;
        this.presetRef = presetRef;
    }
    loadPreset(ab) {
        this.heap.set(ab, this.presetRef);
    }
    get rendblock() {
        return this.struct.getUint32(4, true);
    }
    get output() {
        return new Float32Array(this.heap.buffer, this.ref, this.struct.getInt32(4, true));
    }
    get phase() {
        return this.struct.getUint32(8, true);
    }
    set phase(fl) {
        this.struct.setUint32(8, fl, true);
    }
    get phaseIncrement() {
        return this.struct.getInt32(12, true);
    }
    set phaseIncrement(fl) {
        this.struct.setInt32(12, fl, true);
    }
    get phaseVelocity() {
        return this.struct.getInt32(16, true);
    }
    set phaseVelocity(fl) {
        this.struct.setInt32(16, fl, true);
    }
    get fadeDim1() {
        return this.struct.getFloat32(32, true);
    }
    set fadeDim1(fl) {
        this.struct.setFloat32(32, fl, true);
    }
    get fadeDim1Increment() {
        return this.struct.getFloat32(36, true);
    }
    set fadeDim1Increment(fl) {
        this.struct.setFloat32(36, fl, true);
    }
    get fadeDim2() {
        return this.struct.getFloat32(40, true);
    }
    set fadeDim2(fl) {
        this.struct.setFloat32(40, fl, true);
    }
    get fadeDim2Increment() {
        return this.struct.getFloat32(44, true);
    }
    set fadeDim2Increment(fl) {
        this.struct.setFloat32(44, fl, true);
    }
    get fadeDim3() {
        return this.struct.getFloat32(48, true);
    }
    set fadeDim3(fl) {
        this.struct.setFloat32(48, fl, true);
    }
    get fadeDim3Increment() {
        return this.struct.getFloat32(52, true);
    }
    set fadeDim3Increment(fl) {
        this.struct.setFloat32(52, fl, true);
    }
    //these are pointers to float array. hence the uint32's
    get wave000() {
        return this.struct.getUint32(56, true);
    }
    get wave001() {
        return this.struct.getUint32(60, true);
    }
    get wave010() {
        return this.struct.getUint32(64, true);
    }
    get wave011() {
        return this.struct.getUint32(68, true);
    }
    get wave100() {
        return this.struct.getUint32(72, true);
    }
    get wave101() {
        return this.struct.getUint32(76, true);
    }
    get wave110() {
        return this.struct.getUint32(80, true);
    }
    get wave111() {
        return this.struct.getUint32(84, true);
    }
    set wave000(ref) {
        this.struct.setUint32(56, ref, true);
    }
    set wave001(ref) {
        this.struct.setUint32(60, ref, true);
    }
    set wave010(ref) {
        this.struct.setUint32(64, ref, true);
    }
    set wave011(ref) {
        this.struct.setUint32(68, ref, true);
    }
    set wave100(ref) {
        this.struct.setUint32(72, ref, true);
    }
    set wave101(ref) {
        this.struct.setUint32(76, ref, true);
    }
    set wave110(ref) {
        this.struct.setUint32(80, ref, true);
    }
    set wave111(ref) {
        this.struct.setUint32(84, ref, true);
    }
}


export async function init_wasm() {
    const mem = new WebAssembly.Memory({
        initial: 666,
        maximum: 666,
    });
    let heap = new Uint8Array(mem.buffer);
    const table = new WebAssembly.Table({element: "anyfunc", initial: 10});
    const importObj = {
        env: {
            memory: mem,
            sinf: (x) => Math.sin(x),
            powf: (base, exp) => Math.pow(base, exp),
            table,
            memcpy: (dest, src, bytes) => heap.set(heap.subarray(src, bytes), dest),
            _abort: () => console.log('abort?'),
            _grow: () => {
                heap = new Uint8Array(mem.buffer);
            }
        }
    };
    const {instance} = await WebAssembly.instantiate(wasmBinary, importObj);

    const osc_ref = instance.exports.init_oscillators();
    const osc_struct_size = instance.exports.wavetable_struct_size();
    const oscillators = [];
    const chref = (ch) => osc_ref + osc_struct_size * ch;
    const tbRef = (ch) => instance.exports.ref_wavetable_set(ch);
    for (let i = 0;i < 16;i++) {
        oscillators.push(new OscillatorTable(heap, chref(i), tbRef(i))); // instance.exports.wavetable_set_ref()));
    }
    return {
        instance,
        heap,
        oscillators,
        proc_note_on: instance.exports.proc_note_on,
        proc_note_off: instance.exports.proc_note_off,
        spin_wavetables: function () {
            for (let i = 0;i < 16;i++) {
                if (oscillators[i].phaseIncrement != 0) {
                    instance.exports.wavetable_3dimensional_oscillator(oscillators[i].ref)
                }
            }
        }
    };
}
