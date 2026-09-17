import Module from "../build/wavetable_oscillator.js";
let awpport;

const osc_ref = Module.init_oscillators();
const osc_struct_size = Module.wavetable_struct_size();
console.assert(osc_struct_size > 1);
const chref = (ch) => osc_ref + osc_struct_size * ch;
const NUM_OSCILLATORS = 16;
const BLOCK = 128;

const soundCards = [];
const phaseViews = [];
const faderViews = [];
const tbViews = [];
for (let i = 0; i < NUM_OSCILLATORS; i++) {
  const ptr = new Uint32Array(Module.mem.buffer, chref(i), 1)[0];
  soundCards.push(new Float32Array(Module.mem.buffer, ptr, BLOCK));
  phaseViews.push(new DataView(Module.mem.buffer, chref(i) + 8, 12));
  faderViews.push(new DataView(Module.mem.buffer, chref(i) + 9 * 4, 24));
  tbViews.push(new DataView(Module.mem.buffer, chref(i) + 15 * 4, 32));
}

function osc_info(ref) {
  const base = ref || osc_ref;
  const header = new Uint32Array(Module.mem.buffer, base, 4);
  const [output_ptr, samples_per_block, phase, phaseIncrement] = header;
  const [
    fadeDim1,
    fadeDim1Increment,
    fadeDim2,
    fadeDim2Increment,
    fadeDim3,
    fadeDim3Increment,
  ] = new Float32Array(Module.mem.buffer, base + 9 * 4, 6);
  const [wv00, wv01, wv10, wv11] = new Uint32Array(
    Module.mem.buffer,
    base + 15 * 4,
    4
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
    wv00,
    wv01,
    wv10,
    wv11,
  };
}

function onMSG(e) {
  const {
    readable,
    setMidiNote,
    setFade,
    setFadeDelta,
    setPhaseIncrement,
    info,
    setTable,
    midi,
  } = e.data || {};

  if (readable) {
    const reader = readable.getReader();
    let tbIdx = 0;
    reader.read().then(function process({ value, done }) {
      if (done || !value || value.length == 0) return;
      const ref = Module.sampleTableRef(tbIdx++);
      const floats =
        value instanceof Float32Array
          ? value
          : new Float32Array(value.buffer || value);
      Module.HEAPF32.set(floats, ref >> 2);
      reader.read().then(process);
    });
    return;
  }

  if (midi && midi.length >= 3) {
    const cmd = midi[0] & 0xf0;
    const channel = midi[0] & 0x0f;
    const note = midi[1] & 0x7f;
    const velocity = midi[2] & 0x7f;
    if (cmd === 0x90 && velocity > 0) {
      Module.set_midi(channel, note);
    }
  }

  if (setMidiNote) {
    const { channel, value } = setMidiNote;
    Module.set_midi(channel, value & 0x7f);
  }
  if (setPhaseIncrement) {
    const { channel, value } = setPhaseIncrement;
    phaseViews[channel].setInt32(4, value, true);
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
    awpport.postMessage({ osc_table: osc_info(chref(0)) });
  }
  if (setTable) {
    let { channel, tbIndex, formIndex } = setTable;
    formIndex = parseInt(formIndex, 10);
    tbViews[channel].setUint32(
      tbIndex * Uint32Array.BYTES_PER_ELEMENT,
      Module.sampleTableRef(formIndex),
      true
    );
    awpport.postMessage({ osc_table: osc_info(chref(channel)) });
  }
}

function spinOscillators() {
  for (let i = 0; i < NUM_OSCILLATORS; i++) {
    Module.wavetable_1dimensional_oscillator(chref(i));
  }
}

class RendProc extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.postMessage({
      ready: 1,
      osc_table: osc_info(osc_ref),
    });
    this.port.onmessage = onMSG;
    this.lastUpdate = 0;
    awpport = this.port;
  }
  process(inputs, outputs) {
    spinOscillators();
    const n = Math.min(outputs.length, NUM_OSCILLATORS);
    for (let i = 0; i < n; i++) {
      if (outputs[i][0]) outputs[i][0].set(soundCards[i]);
      if (outputs[i][1]) outputs[i][1].set(soundCards[i]);
    }
    if (currentFrame - this.lastUpdate > 12000) {
      this.port.postMessage({ osc_table: osc_info(osc_ref) });
      this.lastUpdate = currentFrame;
    }
    return true;
  }
}
registerProcessor("rendproc", RendProc);
