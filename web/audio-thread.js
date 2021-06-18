import {API as Module} from '../build/wavetable_oscillator.js';
let awpport;  // msg port to main thread; instantiates in the RendProc
              // constructors

const osc_ref = Module.init_oscillators();
const osc_struct_size = Module.wavetable_struct_size();
console.assert(osc_struct_size > 1);
const chref = (ch) => osc_ref + osc_struct_size * ch;

const soundCards = [];
const phaseViews = [];
const faderViews = [];
const tbViews = [];
const waveTableRegistry = [];
for (let i = 0; i < 16; i++) {
  const ptr =
      new Uint32Array(Module.mem.buffer, osc_ref + osc_struct_size * i, 1)[0];

  soundCards.push(new Float32Array(Module.mem.buffer, ptr, 128));
  phaseViews.push(new DataView(
      Module.mem.buffer,
      osc_ref + osc_struct_size * i + 2 * Float32Array.BYTES_PER_ELEMENT, 24));
  faderViews.push(new DataView(
      Module.mem.buffer,
      osc_ref + osc_struct_size * i + 9 * Float32Array.BYTES_PER_ELEMENT, 24));
  tbViews.push(new DataView(Module.mem.buffer, chref(i) + 15 * 4));
}
function osc_info(ref) {
  const table = new Uint32Array(Module.mem.buffer, ref, osc_struct_size);
  const [output_ptr, samples_per_block, phase, phaseIncrement] =
      new Uint32Array(Module.mem.buffer, osc_ref, 4);
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
  const [wv00, wv01, wv10, wv11] = new Uint32Array(
      Module.mem.buffer, osc_ref + 15 * Float32Array.BYTES_PER_ELEMENT, 6);
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
  const {data, target} = e;
  const {
    readable,
    setMidiNote,
    setFade,
    setFadeDelta,
    setPhaseIncrement,
    keyOn,
    keyOff,
    info,
    setTable,
  } = e.data;
  if (readable) {
    const reader = readable.getReader();
    let tbIdx = 0;
    reader.read().then(function process({value, done}) {
      if (done || value.length == 0) return;
      const ref = Module.sampleTableRef(tbIdx++);
      Module.HEAPF32.set(new Float32Array(value), ref);

      reader.read().then(process);
    });
    return;
  }

  if (setMidiNote) {
    const {channel, value} = setMidiNote;
    Module.set_midi(channel, value & 0x7f);
  }
  if (setPhaseIncrement) {
    const {channel, value} = setPhaseIncrement;
    phaseViews[channel].setFloat32(2, value, true);
  }
  if (setFade) {
    const {channel, value} = setFade;
    faderViews[channel].setFloat32(0, value, true);
  }
  if (setFadeDelta) {
    const {channel, value} = setFadeDelta;
    faderViews[channel].setFloat32(4, value, true);
  }
  if (info) {
    awpport.postMessage({osc_table: osc_ref});
  }
  if (setTable) {
    let {channel, tbIndex, formIndex} = setTable;
    formIndex = parseInt(formIndex);  // from 'string'....
    tbViews[channel].setUint32(
        tbIndex * Uint32Array.BYTES_PER_ELEMENT,
        Module.sampleTableRef(formIndex), true);

    awpport.postMessage({fl, osc_table: osc_info(chref(channel))});
  }
}
function spinOscillators(channel) {
  for (let i = 0; i < 16; i++) {
    for (let f = 0; f < 128; f++) {
      soundCards[i][f] = 0;
    }
    Module.wavetable_1dimensional_oscillator(osc_ref + osc_struct_size * i);
  }
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
  process(inputs, outputs) {
    for (let i = 0; i < outputs.length; i++) {
      outputs[i][0].set(soundCards[i]);
      outputs[i][1].set(soundCards[i]);
    }
    spinOscillators();
    if (currentFrame - this.lastUpdate > 12000) {
      this.port.postMessage({osc_table: osc_info(osc_ref)});
      this.lastUpdate = currentFrame;
    }
    return true;
  }
}
registerProcessor('rendproc', RendProc);
