import { write } from "node:fs";
import { stdout, stderr, statediv, state, piano, midiBtn } from "./main.js";
import { bindMidiAccess } from "./midi-connect.js";
import { loadPeriodicForms, tbs } from "./periodic-waveform.js";

stdout("page load");
let ctx: AudioContext;
let awn: AudioWorkletNode;
let envelope: any;

async function init_audio_ctx() {
  try {
    ctx = new AudioContext({ sampleRate: 48000 });
    if (!ctx) {
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
      if (e.data.osc_table) {
        statediv.innerHTML = Object.keys(e.data.osc_table)
          .map((k) => `${k}:${e.data.osc_table[k]}`)
          .join("\n");
      }
      if (e.data.setMidi) {
        stdout(JSON.stringify(e.data.setMidi));
      }
    };
    if (!envelope) {
      envelope = new GainNode(ctx, { gain: 0 });
    }
    awn.connect(envelope).connect(ctx.destination);
    stdout("loading engine ready");
  } catch (e) {
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
  awn.port.postMessage({
    setFadeDelta: {
      channel: channel,
      value: 0,
    },
    setPhaseIncrement: {
      channel: channel,
      value: 0,
    },
  });
}
async function gotCtx() {
  const keys = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j"];
  stdout(`use keys ${keys.join(",")} to request midi tones 48 + index of key `);
  window.onkeydown = async (e: KeyboardEvent) => {
    if (ctx.state != "running") await ctx.resume().then(() => prockey(e));
    else prockey(e);
  };
  function prockey(e: KeyboardEvent) {
    if (e.repeat) return;
    if (keys.indexOf(e.key) > -1) {
      stdout("key down " + e.key);

      noteOn(48 + keys.indexOf(e.key), 0, 89);
      window.addEventListener(
        "keyup",
        (e) => {
          if (keys.indexOf(e.key) > -1) {
            stdout("key key up " + e.key);

            noteOff(48 + keys.indexOf(e.key), 0);
          }
        },
        { once: true }
      );
    }
  }
  const http_to_audio_thread_pipe = new TransformStream();
  // @ts-ignore
  awn.port.postMessage({ readable: http_to_audio_thread_pipe.readable }, [
    http_to_audio_thread_pipe.readable,
  ]);
  const writer = http_to_audio_thread_pipe.writable.getWriter();
  (async () => {
    for await (const { name, fl32arr } of (async function* dl_queue() {
      let _tbs = tbs;
      while (_tbs.length) {
        const name = _tbs.shift();
        const fl32arr = await loadPeriodicForms(name!);
        yield { name, fl32arr };
      }
      return;
    })()) {
      writer.write(fl32arr);
      stdout("loaded " + name);
    }
  })();
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
  bindMidiAccess(awn.port, stdout, stderr).then(
    (midiInputs: any) =>
      (midiBtn.parentElement!.innerHTML = `listening for signals from ${Array.from(
        midiInputs
      )
        .map((input: any) => input.name)
        .join("<br>")}`)
  );
