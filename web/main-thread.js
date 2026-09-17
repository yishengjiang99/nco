import { createEngine } from "./engine.js";

const statusEl = document.querySelector("#status");
const panel = document.querySelector("#panel");
const startBtn = document.querySelector("#start");

function log(msg) {
  statusEl.textContent = String(msg);
}

const state = {
  onSetFade: 0.8,
  attack: 0.03,
  release: 0.2,
};

for (const attr of Object.keys(state)) {
  const row = document.createElement("label");
  row.textContent = attr;
  const input = document.createElement("input");
  input.type = "range";
  input.min = "0";
  input.max = attr === "onSetFade" ? "1" : "2";
  input.step = "0.01";
  input.value = String(state[attr]);
  const val = document.createElement("span");
  val.textContent = String(state[attr]);
  input.oninput = () => {
    state[attr] = Number(input.value);
    val.textContent = input.value;
  };
  row.append(input, val);
  panel.append(row);
}

let ctx;
let envelope;
let analyser;
let ready = false;
let starting = false;
let engine;
let useWorklet = false;
let awn;

const keyboardWidth = Math.min(999, Math.max(280, window.innerWidth - 24));
const keyboard =
  typeof QwertyHancock === "function"
    ? new QwertyHancock({
        id: "keyboard",
        width: keyboardWidth,
        height: 150,
        octaves: 2,
        startNote: "A3",
        whiteNotesColour: "white",
        blackNotesColour: "black",
        hoverColour: "#f3e939",
      })
    : { keyDown() {}, keyUp() {} };

function midiFromHz(hz) {
  return Math.round(69 + 12 * Math.log2(hz / 440));
}

function midiFromName(name) {
  const m = /^([A-G]#?)(-?\d+)$/.exec(name || "");
  if (!m) return 69;
  const order = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return 12 * (Number(m[2]) + 1) + order.indexOf(m[1]);
}

function unlock(ctx) {
  try {
    const buf = ctx.createBuffer(1, 1, ctx.sampleRate);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
  } catch (_) {}
  const p = ctx.resume && ctx.resume();
  return p && typeof p.then === "function" ? p.catch(() => {}) : Promise.resolve();
}

async function startAudio() {
  if (ready) {
    await unlock(ctx);
    log("audio " + ctx.state + " @ " + ctx.sampleRate);
    return;
  }
  if (starting) return;
  starting = true;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) throw new Error("no AudioContext");
    ctx = ctx || new AC();
    await unlock(ctx);

    envelope = envelope || new GainNode(ctx, { gain: 0 });
    analyser = analyser || new AnalyserNode(ctx, { fftSize: 2048 });

    if (ctx.audioWorklet && ctx.audioWorklet.addModule) {
      try {
        await ctx.audioWorklet.addModule(new URL("audio-thread.js", import.meta.url).href);
        awn = new AudioWorkletNode(ctx, "rendproc", {
          numberOfOutputs: 1,
          outputChannelCount: [1],
        });
        awn.connect(envelope);
        useWorklet = true;
      } catch (e) {
        log("worklet failed, using fallback: " + (e.message || e));
      }
    }

    if (!useWorklet) {
      engine = createEngine();
      const sp = ctx.createScriptProcessor(128, 0, 1);
      sp.onaudioprocess = (ev) => {
        engine.render();
        ev.outputBuffer.getChannelData(0).set(engine.block);
      };
      sp.connect(envelope);
    }

    envelope.connect(analyser).connect(ctx.destination);
    await unlock(ctx);
    ready = true;
    startBtn.textContent = useWorklet ? "Audio running" : "Audio running (iOS fallback)";
    log("audio " + ctx.state + " @ " + Math.round(ctx.sampleRate) + " via " + (useWorklet ? "worklet" : "script"));
    window.__nco = { ctx, envelope, analyser, noteOn, noteOff, measure, useWorklet };
  } catch (e) {
    log(e && e.message ? e.message : String(e));
  } finally {
    starting = false;
  }
}

function measure() {
  if (!analyser) return { rms: 0, peak: 0 };
  const data = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(data);
  let energy = 0;
  let peak = 0;
  for (const s of data) {
    energy += s * s;
    peak = Math.max(peak, Math.abs(s));
  }
  return { rms: Math.sqrt(energy / data.length), peak, state: ctx && ctx.state };
}

async function noteOn(midi) {
  try {
    if (!ready) await startAudio();
    if (!ready) return;
    await unlock(ctx);
    if (useWorklet && awn) {
      const freq = 440 * Math.pow(2, ((midi & 127) - 69) / 12);
      const inc = Math.round((4294967296 * freq) / ctx.sampleRate);
      awn.port.postMessage({ setPhaseIncrement: { channel: 0, value: inc } });
      awn.port.postMessage({ setFade: { channel: 0, value: state.onSetFade } });
    } else if (engine) {
      engine.setNote(0, midi, ctx.sampleRate);
      engine.setFade(0, state.onSetFade);
    }
    const now = ctx.currentTime;
    envelope.gain.cancelScheduledValues(now);
    envelope.gain.setValueAtTime(Math.max(envelope.gain.value, 0.001), now);
    envelope.gain.linearRampToValueAtTime(1, now + Math.max(0.01, state.attack));
    log("note " + midi + " " + ctx.state);
  } catch (e) {
    log(e && e.message ? e.message : String(e));
  }
}

function noteOff() {
  if (!ctx || !envelope) return;
  const now = ctx.currentTime;
  envelope.gain.cancelScheduledValues(now);
  envelope.gain.setValueAtTime(Math.max(envelope.gain.value, 0), now);
  envelope.gain.linearRampToValueAtTime(0.0001, now + Math.max(0.03, state.release));
}

function onStart(ev) {
  if (ev && ev.preventDefault) ev.preventDefault();
  startAudio();
}
startBtn.addEventListener("pointerup", onStart, { passive: false });
startBtn.addEventListener("click", onStart);

keyboard.keyDown = function (_note, hz) {
  noteOn(midiFromHz(hz));
};
keyboard.keyUp = function () {
  noteOff();
};

document.querySelector("#keyboard").addEventListener(
  "pointerdown",
  (e) => {
    const li = e.target.closest("li");
    if (!li) return;
    noteOn(midiFromName(li.title || li.id));
  },
  { passive: true }
);
