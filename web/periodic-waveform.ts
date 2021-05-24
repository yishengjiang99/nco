type SampleTable = Float32Array;
export async function loadPeriodicForms(
  tablename: string
): Promise<Float32Array> {
  let ctx = new OfflineAudioContext({
    numberOfChannels: 1,
    length: 4096,
    sampleRate: 4096,
  });

  let osc = new OscillatorNode(ctx, {
    type: "custom",
    periodicWave: new PeriodicWave(ctx, {
      imag: new Float32Array(
        await (
          await fetch("../wvtable_pcm/" + tablename + "_img.pcm")
        ).arrayBuffer()
      ).slice(0, 10),
      real: new Float32Array(
        await (
          await fetch("../wvtable_pcm/" + tablename + "_real.pcm")
        ).arrayBuffer()
      ).slice(0, 10),
    }),
    frequency: 1,
  });
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(1.0);
  return (await ctx.startRendering()).getChannelData(0);
}
