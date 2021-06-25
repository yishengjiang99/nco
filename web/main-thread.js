import {
  stdout,
  stderr,
  statediv,
  state,
  piano,
  midiBtn,
  controlPanel,
  presetBtns,
  canvas1
} from "./main.js";
import { bindMidiAccess } from "./midi-connect.js";
import {  mkdiv } from "./mkdiv.js";
import { loadPeriodicForms, tbs } from "./periodic-waveform.js";
import {chart} from './charts.js';
// @ts-ignore
//@ts-ignore
// import io_samplers from "./charts.js";
stdout("page load");
let ctx;
let awn;
let envelope;
let analy;
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
      if(e.data.tableGot){
        chart(new Float32Array( e.data.tableGot),canvas1);
      }
    };
    if (!envelope) {
      envelope = new GainNode(ctx, { gain: 0 });
    }
  } catch (e) {
    stderr(e.message);
    throw e;
  }
}
async function noteOn(midi, channel, velocity) {
  let [initialMix, fadeVelocity, attack, decay, release, sustain] = Array.from(
    Object.values(state)
  ).map((v) => v[0]);
  //[]
  awn.port.postMessage({
    noteOn: { channel, note: midi, velocity: fadeVelocity },
  });

  envelope.gain.linearRampToValueAtTime(1, ctx.currentTime + attack);
  envelope.gain.exponentialRampToValueAtTime(sustain, ctx.currentTime + decay);
}
function noteOff(midi, channel = 0) {
  awn.port.postMessage({
    noteOff: { channel, velocity: 55 },
  });
  envelope.gain.cancelAndHoldAtTime(ctx.currentTime);
  envelope.gain.exponentialRampToValueAtTime(0.00001, state.release[0]);
}
async function gotCtx() {
  analy = new AnalyserNode(ctx, { fftSize: 256 });
  awn.connect(envelope).connect(analy).connect(ctx.destination);
  stdout("loading engine ready");
  const keys = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j"];
  stdout(`use keys ${keys.join(",")} to request midi tones 48 + index of key `);
  window.onkeydown = async (e) => {
    if (ctx.state != "running")
      await ctx.resume().then(() => {
        prockey(e);
      });
    else prockey(e);
  };
  function prockey(e) {
    if (e.repeat) return;
    if (keys.indexOf(e.key) > -1) {
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
  for(const t of tbs){
      const btn=mkdiv("button",  {
        onclick:  async ()  =>{
            const fltbl=await loadPeriodicForms(t)
            awn.port.postMessage({table:fltbl.buffer,channel:0,tableIdx:2},[fltbl.buffer]);
            },
        },t);
     presetBtns.appendChild(btn);
  }

}
init_audio_ctx().then(gotCtx);
// @ts-ignore
piano.addEventListener("noteOn", (e) => noteOn(e.detail.note, 0, 56));
// @ts-ignore
piano.addEventListener("noteOff", (e) => noteOff(e.detail.note, 0));
midiBtn.onclick = () =>
  bindMidiAccess(awn.port, noteOn, noteOff, stdout, stderr).then(
    (midiInputs) =>
      (midiBtn.parentElement.innerHTML = `listening for signals from ${Array.from(
        midiInputs
      )
        .map((input) => input.name)
        .join("<br>")}`)
  );
