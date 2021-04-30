import Module from "../build/wavetable_oscillator.js";

class RendProc extends AudioWorkletProcessor {
  constructor() {
    super();
    this.moduleInt = false;
    this.osc_ref = Module.init_oscillators();
    const osc_struct_size = Module.wavetable_struct_size();
    this.port.postMessage({
      ready: 1,
      osc_table: wavetable_list(Module.HEAPU8, this.osc_ref),
    });
    this.port.onmessage = onMSG; //bind(this)
  }

  process(_, outputs) {
    //return true here just means come back later. no data yet.
    //returning false would end thread.
    if (this.moduleInit == false) return true;
    Module.audio_thread_cb(currentFrame);

    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 128; j++) {
        outputs[0][0][j] += this.ob_buffer[i * 128 + j];
        outputs[0][1][j] += this.ob_buffer[i * 128 + j];
      }
    }
    return true;
  }
}
registerProcessor("rendproc", RendProc);

function onMSG({ data: { setMidi, setFade, setFadeDelta, keyOn, keyOff } }) {
  if (setMidi) Module.set_midi(setMidi);
  if (setFade) {
    const { channel, value } = setFade;
    Module.set_fade(channel, value);
  }
  if (setFadeDelta) {
    const { channel, value } = Module.set_fade_delta(channel, value);
  }
  if (keyOn) {
    const { channel, midi, vel } = keyOn;
    Module.handle_midi_channel_msg([0x90 | channel, midi & 0x7f, vel & 0x7f]);
  }
  if (keyOff) {
    const { channel, midi, vel } = keyOff;
    Module.handle_midi_channel_msg(
      new Uint8Array([0x80 | channel, midi & 0x7f, vel & 0x7f])
    );
  }
}

/**
 * getting a list of info corresponding to  @wavetable_oscillator_data from the shared heap
 * @param wasmModule
 * @param osc_ref &oscillator[0]
 */
function wavetable_list(heap, osc_ref, osc_struct_size) {
  return Array.from(Array(16).keys()).map((index) =>
    wavetable_info(
      new DataView(
        heap.buffer,
        osc_ref + index * osc_struct_size,
        osc_struct_size
      )
    )
  );
}
function wavetable_info(dv) {
  let offset = 0;
  const [
    output_ptr,
    samples_per_block,
    phase,
    phaseIncrement,
    frequencyIncrement,
    num_fractionalBits,
    mask_fractionalBits,
    mask_wavIndex,
    scaler_fractionalBits,
    fadeDim1,
    fadeDim1Increment,
    fadeDim2,
    fadeDim2Increment,
    fadeDim3,
    fadeDim3Increment,
    ref_wave000,
    ref_wave001,
    ref_wave010,
    ref_wave011,
    ref_wave100,
    ref_wave101,
    ref_wave110,
    ref_wave111,
  ] = [
    dv.getInt32(offset, true),
    dv.getUint32((offset += 4), true),
    dv.getInt32((offset += 4), true),
    dv.getInt32((offset += 4), true),
    dv.getUint32((offset += 4), true),
    dv.getUint32((offset += 4), true),
    dv.getUint32((offset += 4), true),
    dv.getFloat32((offset += 4), true),
    dv.getFloat32((offset += 4), true),
    dv.getFloat32((offset += 4), true),
    dv.getFloat32((offset += 4), true),
    dv.getFloat32((offset += 4), true),
    dv.getFloat32((offset += 4), true),
    dv.getFloat32((offset += 4), true),

    dv.getUint32((offset += 4), true),
    dv.getUint32((offset += 4), true),
    dv.getUint32((offset += 4), true),
    dv.getUint32((offset += 4), true),
    dv.getUint32((offset += 4), true),
    dv.getUint32((offset += 4), true),
    dv.getUint32((offset += 4), true),
    dv.getUint32((offset += 4), true),
  ];
  return {
    output_ptr,
    samples_per_block,
    phase,
    phaseIncrement,
    frequencyIncrement,
    num_fractionalBits,
    mask_fractionalBits,
    mask_wavIndex,
    scaler_fractionalBits,
    fadeDim1,
    fadeDim1Increment,
    fadeDim2,
    fadeDim2Increment,
    fadeDim3,
    fadeDim3Increment,
    ref_wave000,
    ref_wave001,
    ref_wave010,
    ref_wave011,
    ref_wave100,
    ref_wave101,
    ref_wave110,
    ref_wave111,
  };
}
