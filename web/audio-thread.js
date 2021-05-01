import Module from "../build/wavetable_oscillator.js";
let awpport; //msg port to main thread; instantiates in the RendProc constructors

const osc_ref = Module.init_oscillators();
const osc_struct_size = Module.wavetable_struct_size();
console.assert(osc_struct_size > 1);
const faderView = new DataView(
  Module.mem.buffer,
  osc_ref + 9 * Float32Array.BYTES_PER_ELEMENT,
  24
);
function osc_info(ref) {
  const table = new Uint32Array(Module.mem.buffer, osc_ref, osc_struct_size);
  const [
    output_ptr,
    samples_per_block,
    phase,
    phaseIncrement,
  ] = new Uint32Array(Module.mem.buffer, osc_ref, 4);
  const [
    fadeDim1,
    fadeDim1Increment,
    fadeDim2,
    fadeDim2Increment,
    fadeDim3,
    fadeDim3Increment,
  ] = new Float32Array(
    Module.mem.buffer,
    osc_ref + 9 * Float32Array.BYTES_PER_ELEMENT,
    6
  );
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
  e.target.postMessage(e.data);
  const { setMidi, setFade, setFadeDelta, keyOn, keyOff, info } = e.data;
  if (setMidi) {
    const { channel, value } = setMidi;
    Module.set_midi(channel, value);
    awpport.postMessage({ osc_table: osc_info(osc_info) });
  }
  if (setFade) {
    const { channel, value } = setFade;
    faderView.setFloat32(0, value, true);
    awpport.postMessage({ osc_table: osc_info(osc_info) });
  }
  if (setFadeDelta) {
    const { channel, value } = setFadeDelta;
    faderView.setFloat32(4, value, true);
    awpport.postMessage({ osc_table: osc_info(osc_info) });
  }
  if (keyOn) {
    const { channel, midi, vel } = keyOn;
    awpport.handle_midi_channel_msg([0x90 | channel, midi & 0x7f, vel & 0x7f]);
  }
  if (keyOff) {
    const { channel, midi, vel } = keyOff;
    awpport.handle_midi_channel_msg(
      new Uint8Array([0x80 | channel, midi & 0x7f, vel & 0x7f])
    );
  }
  if (info) {
    awpport.postMessage({ osc_table: osc_ref });
  }
}
function get_sound(channel) {
  const flrr = new DataView(
    Module.HEAPU8.buffer,
    osc_ref,
    128 * Float32Array.BYTES_PER_ELEMENT
  );
  Module.wavetable_1dimensional_oscillator(osc_ref);

  return flrr;
}

class RendProc extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.postMessage({
      ready: 1,
      osc_table: osc_info(Module.HEAPU8, osc_ref),
    });
    this.port.onmessage = onMSG;
    this.lastUpdate = 0;
    awpport = this.port;
  }
  process(_, outputs) {
    const flrr = get_sound();
    for (let j = 0; j < 128; j++) {
      outputs[0][0][j] = flrr.getFloat32(j * 4, true); //[i];
    }
    if (currentFrame - this.lastUpdate > 1000) {
      const sum = outputs[0][0].reduce((prev, v) => prev + v, 0);
      this.port.postMessage({
        currentFrame,
        sum: sum * sum,
        osc_table: osc_info(Module.HEAPU8, osc_ref),
      });
      this.lastUpdate = currentFrame;
    }
    return true;
  }
}
registerProcessor("rendproc", RendProc);
