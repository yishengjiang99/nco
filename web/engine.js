import Module from "../build/wavetable_oscillator.js";

const BIT32 = 4294967296.0;

export function createEngine() {
  const osc = Module.init_oscillators();
  const size = Module.wavetable_struct_size();
  const outPtr = new Uint32Array(Module.mem.buffer, osc, 1)[0];
  const block = new Float32Array(Module.mem.buffer, outPtr, 128);

  function view(ch, byteOffset, length) {
    return new DataView(Module.mem.buffer, osc + size * ch + byteOffset, length);
  }

  return {
    Module,
    osc,
    size,
    block,
    setNote(ch, midi, sampleRate) {
      const freq = 440 * Math.pow(2, ((midi & 127) - 69) / 12);
      const inc = Math.round((BIT32 * freq) / sampleRate);
      view(ch, 12, 4).setInt32(0, inc, true);
    },
    setFade(ch, value) {
      view(ch, 36, 4).setFloat32(0, value, true);
    },
    render() {
      Module.wavetable_1dimensional_oscillator(osc);
    },
  };
}
