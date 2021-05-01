import { logdiv, mkdiv } from "../node_modules/mkdiv/rollup.js";
const BIT32_NORMALIZATION = 4294967296.0;
const main = document.querySelector("main");
const { stderr, stdout } = logdiv({ container: main });
const statediv = mkdiv("pre", {}, "statediv");
main.append(statediv);
stdout("page load");

let ctx, awn, envelope;
let onSetFade = 0.8;
let fadeVelocity = 10; //10x sample rate
const [fade1slide, fade1Deltaslide, gain] = document.querySelectorAll("input");
fade1slide.oninput = (e) => (onSetFade = e.target.value);
fade1Deltaslide.oninput = (e) => (fadeVelocity = e.target.value);

async function init_audio_ctx(stdout, stderr) {
  try {
    ctx = new AudioContext({ sampleRate: 48000 });
    if (!ctx) {
      stderr("failed to init audio ctx");
    }

    await ctx.audioWorklet.addModule("web/audio-thread.js");
    awn = new AudioWorkletNode(ctx, "rendproc");
    awn.onprocessorerror = (e) => {
      console.trace(e);
      stderror(e);
    };
    awn.port.onmessageerror = (e) => stderr(e);
    if (!envelope) {
      envelope = new GainNode(ctx, { gain: 0 });
      awn.connect(envelope).connect(ctx.destination);
    }
  } catch (e) {
    stderr(e.message);
    throw e;
  }
  return [ctx, awn];
}
init_audio_ctx(stdout, stderr).then(async ([_ctx, awn]) => {
  ctx = _ctx;
  stdout("ctx load");

  stdout(`ctx state: ${ctx.state}`);
  stdout("press anykey to resume audio ctx");
  awn.port.onmessage = (e) => {
    if (e.data.osc_table) {
      statediv.innerHTML = Object.keys(e.data.osc_table)
        .map((k) => `${k}:${e.data.osc_table[k]}`)
        .join("\n");
    }
    if (e.data.setMidi) {
      stdout(JSON.stringify(e.data.setMidi));
    }
  };

  window.onkeydown = (e) => {
    ctx.resume();
    if (keys.indexOf(e.key) > -1) {
      awn.port.postMessage({
        setMidi: { channel: 0, value: 48 + keys.indexOf(e.key) },
      });
      awn.port.postMessage({
        setFade: { channel: 0, value: onSetFade },
      });
      awn.port.postMessage({
        setFadeDelta: {
          channel: 0,
          value: -1 * (onSetFade / ctx.sampleRate) * fadeVelocity,
        },
      });
      envelope.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.1);
      envelope.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.5);

      window.addEventListener(
        "keyup",
        () => {
          envelope.gain.cancelScheduledValues(ctx.currentTime);
          envelope.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.21);
          awn.port.postMessage({
            setFadeDelta: {
              channel: 0,
              value: 0,
            },
          });
        },
        { once: true }
      );
    }
  };
});
const keys = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j"];
