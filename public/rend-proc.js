import Module from "./build/wavetable_oscillator.js";
class RendProc extends AudioWorkletProcessor {
  constructor() {
    super();
    this.moduleInit = false;
    Module["onRuntimeInitialized"] = this.onInit.bind(this);
  }
  onInit() {
    Module._init_oscillators();
    this.port.postMessage({ ready: 1 });
    this.port.onmessage = ({ midi: payload }) => {
      Module._handle_midi_channel_msg(payload);
    };
  }
  process(_, output) {
    //return true here just means come back later. no data yet.
    //returning false would end thread.
    if (this.moduleInit == false) return true;

    return true;
  }
}
registerProcessor("rendproc", RendProc);
