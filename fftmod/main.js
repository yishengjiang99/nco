function stderr(e){alert(e.message);}
function init(){
		try {
    ctx = new AudioContext({ sampleRate: 48000 });
    await ctx.audioWorklet.addModule("fftproc.js"); 
    awn = new AudioWorkletNode(ctx, "rendproc");
    awn.onprocessorerror = (e) => {
      console.trace(e);
    };
    awn.port.onmessageerror = (e) => stderr(e);
  } catch (e) {
    stderr(e.message);
    throw e;
  }
  return [ctx, awn];
}