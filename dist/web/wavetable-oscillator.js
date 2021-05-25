import Module from "../build/wavetable_oscillator.js";
const osc_ref = Module.init_oscillators();
const osc_struct_size = Module.wavetable_struct_size();
console.assert(osc_struct_size > 1);
const soundCards = [];
const phaseViews = [];
const faderViews = [];
const waveTableRegistry = [];
for (let i = 0; i < 16; i++) {
    const ptr = new Uint32Array(Module.mem.buffer, osc_ref + osc_struct_size * i, 1)[0];
    soundCards.push(new Float32Array(Module.mem.buffer, ptr, 128));
    phaseViews.push(new DataView(Module.mem.buffer, osc_ref + osc_struct_size * i + 2 * Float32Array.BYTES_PER_ELEMENT, 24));
    faderViews.push(new DataView(Module.mem.buffer, osc_ref + osc_struct_size * i + 9 * Float32Array.BYTES_PER_ELEMENT, 24));
}
function osc_info(ref) {
    const table = new Uint32Array(Module.mem.buffer, ref, osc_struct_size);
    const [output_ptr, samples_per_block, phase, phaseIncrement] = new Uint32Array(Module.mem.buffer, osc_ref, 4);
    const [fadeDim1, fadeDim1Increment, fadeDim2, fadeDim2Increment, fadeDim3, fadeDim3Increment,] = new Float32Array(Module.mem.buffer, osc_ref + 9 * Float32Array.BYTES_PER_ELEMENT, 6);
    return {
        output_ptr,
        samples_per_block,
        phase,
        phaseIncrement,
        fadeDim1,
        fadeDim1Increment,
        fadeDim2,
        fadeDim2Increment,
        fadeDim3,
        fadeDim3Increment,
    };
}
function onMSG(e) {
    const { data, target } = e;
    const { readable, setMidiNote, setFade, setFadeDelta, setPhaseIncrement, keyOn, keyOff, info, } = e.data;
    if (readable) {
        const reader = readable.getReader();
        reader.read().then(function process({ value, done }) {
            if (done || value.length == 0)
                return;
            const register = Module.sbrk(value.byteLength);
            console.log(register, value.byteLength);
            const arrStart = register >> 2;
            for (let i = 0; i < value.length; i++) {
                Module.HEAPF32[arrStart + i] = value[i];
            }
            // new Uint8Array(Module.mem.buffer).set(register, value.slice(0, 4096 * 8));
            reader.read().then(process);
        });
        return;
    }
    const chref = (ch) => osc_ref + osc_struct_size * ch;
    if (setMidiNote) {
        const { channel, value } = setMidiNote;
        Module.set_midi(channel, value);
    }
    if (setPhaseIncrement) {
        const { channel, value } = setPhaseIncrement;
        phaseViews[channel].setFloat32(2, value, true);
    }
    if (setFade) {
        const { channel, value } = setFade;
        faderViews[channel].setFloat32(0, value, true);
    }
    if (setFadeDelta) {
        const { channel, value } = setFadeDelta;
        faderViews[channel].setFloat32(4, value, true);
    }
    if (info) {
        awpport.postMessage({ osc_table: osc_ref });
    }
    if (setTable)
        awpport.postMessage({
            osc_table: osc_info(chref(channel)),
        });
}
function spinOscillators(channel) {
    for (let i = 0; i < 16; i++) {
        for (let f = 0; f < 128; f++) {
            soundCards[i][f] = 0;
        }
        Module.wavetable_1dimensional_oscillator(osc_ref + osc_struct_size * i);
    }
}
