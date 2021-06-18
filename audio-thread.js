import {OscillatorTable, init_wasm} from "./wavetable-oscillator.js";

class RendProc extends AudioWorkletProcessor {
    async init() {
        this.wasmapi = await init_wasm();
        const {instance, heap, oscillators, proc_note_on, proc_note_off, spin_wavetables, init_oscillators} = this.wasmapi;
        this.heap = heap;
        this.oscillators = oscillators;
        this.wasm_output = spin_wavetables();

        this.port.onmessage = ({data: {noteOn, noteOff, preset, channel}}) => {
            if (noteOn) {
                const [channel, key, vel] = noteOn;
                proc_note_on(channel, key, vel);
            }
            if (noteOff) {
                const [channel, key, vel] = noteOff;
                proc_note_off(channel, key, vel);
            }
            if (preset && channel) {
                oscillators[channel].loadPreset(preset);
            }

        }
        this.sharedBuffer = new Uint8Array(new SharedArrayBuffer(16 * instance.exports.wavetable_struct_size()));
        this.syncState = () => {
            const oscref = oscillators[0].ref;
            this.sharedBuffer.set(heap.slice(oscref, oscref + this.sharedBuffer.byteLength));
            this.lastUpdate = currentFrame;
        }
        this.port.postMessage({ready: 1, statebuffer: this.sharedBuffer.buffer});
    }

    constructor(config) {
        super(config);
        this.init(); this.lastUpdate = 0;
    }
    process(inputs, outputs) {

        if (this.wasmapi) {
            this.wasmapi.spin_wavetables();
        } else {
            return true;
        }
        const ob = new Float32Array(this.heap, this.wasm_output, outputs[0][0].length);

        for (let i = 0;i < 16;i++) {
            outputs[i][1].set(this.heap.buffer.slice(this.oscillators[i].ref, this.oscillators[i].ref + 128 * 4));// (this.oscillators[i].ref)); //new Float32Array(this.heap, this.wasm_output, outputs[0][0].length));
        }
        if (this.lastUpdate < currentFrame - 4800) {
            this.syncState();
        }
        return true;
    }
}
//@ts-ignore
registerProcessor("rendproc", RendProc);
