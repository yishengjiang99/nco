
//@ts-ignore
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
  process(inputs: Float32Array[][], outputs: Float32Array[][]) {
    for (let i = 0; i < outputs.length; i++)
    {
      outputs[i][0].set(soundCards[i]);
      outputs[i][1].set(soundCards[i]);
    }
    spinOscillators();
    //@ts-ignore
    if (globalThis.currentFrame - this.lastUpdate > 12000)
    {
      this.port.postMessage({ osc_table: osc_info(osc_ref) });
      //@ts-ignore

      this.lastUpdate = currentFrame;
    }
    return true;
  }
}
//@ts-ignore

registerProcessor("rendproc", RendProc);
