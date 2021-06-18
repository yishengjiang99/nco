import {
  stdout,
  stderr,
  statediv,
  state,
  piano,
  midiBtn,
  controlPanel,
  canvasA,
} from "./main.js";
import { bindMidiAccess } from "./midi-connect.js";
import { mkdiv, draw } from "./mkdiv.js";
import { loadPeriodicForms, tbs } from "./periodic-waveform.js";
// @ts-ignore
//@ts-ignore
import io_samplers from "./charts.js";
new Worker("./wavetable-oscillator.js", { type: "module" });

stdout("page load");
let ctx: AudioContext;
let awn: AudioWorkletNode;
let envelope: any;
let analy: AnalyserNode;

async function init_audio_ctx() {
  try
  {
    ctx = new AudioContext({ sampleRate: 48000 });
    if (!ctx)
    {
      stderr("failed to init audio ctx");
    }

    await ctx.audioWorklet.addModule("web/audio-thread.js");
    awn = new AudioWorkletNode(ctx, "rendproc", {
      numberOfOutputs: 16,
      outputChannelCount: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    });
    awn.onprocessorerror = (e) => {
      console.trace(e);
      stderr("e");
    };
    awn.port.onmessageerror = (e) => stderr(e.toString());
    awn.port.onmessage = (e) => {
      if (e.data.osc_table)
      {
        statediv.innerHTML = Object.keys(e.data.osc_table)
          .map((k) => `${k}:${e.data.osc_table[k]}`)
          .join("\n");
      }
      if (e.data.setMidi)
      {
        stdout(JSON.stringify(e.data.setMidi));
      }
    };
    if (!envelope)
    {
      envelope = new GainNode(ctx, { gain: 0 });
    }
  } catch (e)
  {
    stderr(e.message);
    throw e;
  }
}

async function noteOn(midi: number, channel: number, velocity: number) {
  let [initialMix, fadeVelocity, attack, decay, release, sustain] = Array.from(
    Object.values(state)
  ).map((v) => v[0]);

  //[]
  awn.port.postMessage({
    setMidiNote: { channel: channel, value: midi },
  });
  awn.port.postMessage({
    setFade: { channel: channel, value: initialMix },
  });
  awn.port.postMessage({
    setFadeDelta: {
      channel: channel,
      value: (-1 * fadeVelocity) / ctx.sampleRate,
    },
  });
  envelope.gain.linearRampToValueAtTime(1, ctx.currentTime + attack);
  envelope.gain.exponentialRampToValueAtTime(sustain, ctx.currentTime + decay);
}
function noteOff(midi: number, channel: number = 0) {
  envelope.gain.cancelAndHoldAtTime(ctx.currentTime);
  envelope.gain.exponentialRampToValueAtTime(0.00001, state.release[0]);
}
async function gotCtx() {
  const { inputAnalyzer, outputAnalyzer, run_samples, disconnect } =
    io_samplers(ctx, 1024);
  analy = new AnalyserNode(ctx, { fftSize: 256 });
  awn
    .connect(inputAnalyzer)
    .connect(envelope)
    .connect(outputAnalyzer)
    .connect(ctx.destination);
  stdout("loading engine ready");

  const keys = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j"];
  stdout(`use keys ${keys.join(",")} to request midi tones 48 + index of key `);
  window.onkeydown = async (e: KeyboardEvent) => {
    if (ctx.state != "running")
      await ctx.resume().then(() => {
        prockey(e);
        run_samples();
      });
    else prockey(e);
  };
  function prockey(e: KeyboardEvent) {
    if (e.repeat) return;
    if (keys.indexOf(e.key) > -1)
    {
      stdout("key down " + e.key);

      noteOn(48 + keys.indexOf(e.key), 0, 89);
      window.addEventListener(
        "keyup",
        (e) => {
          if (keys.indexOf(e.key) > -1)
          {
            stdout("key key up " + e.key);

            noteOff(48 + keys.indexOf(e.key), 0);
          }
        },
        { once: true }
      );
    }
  }
  loadtbls(['pages/0_0.dat', 'pages/60_0.dat', 'pages/80_0.dat', 'pages/128_0']);
  run_samples();
}
init_audio_ctx().then(gotCtx);
// @ts-ignore
piano.addEventListener("noteOn", (e: CustomEvent) =>
  noteOn(e.detail.note, 0, 56)
);
// @ts-ignore

piano.addEventListener("noteOff", (e: CustomEvent) =>
  noteOff(e.detail.note, 0)
);
midiBtn.onclick = () =>
  bindMidiAccess(awn.port, noteOn, noteOff, stdout, stderr).then(
    (midiInputs: any) =>
    (midiBtn.parentElement!.innerHTML = `listening for signals from ${Array.from(
      midiInputs
    )
      .map((input: any) => input.name)
      .join("<br>")}`)
  )
