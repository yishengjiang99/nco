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
let awn;
let envelope;
let analyser;
let ready = false;

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

async function startAudio() {
  if (!ctx) {
    ctx = new AudioContext({ sampleRate: 48000 });
    await ctx.audioWorklet.addModule(
      new URL("audio-thread.js", import.meta.url).href
    );
    awn = new AudioWorkletNode(ctx, "rendproc", {
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
    awn.onprocessorerror = (e) => log("worklet error: " + e);
    envelope = new GainNode(ctx, { gain: 0 });
    analyser = new AnalyserNode(ctx, { fftSize: 2048 });
    awn.connect(envelope).connect(analyser).connect(ctx.destination);
  }
  if (ctx.state !== "running") await ctx.resume();
  ready = true;
  startBtn.textContent = "Audio running";
  log("audio " + ctx.state + " — tap a piano key");
  window.__nco = { ctx, awn, envelope, analyser, noteOn, noteOff, measure };
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
    if (ctx.state !== "running") await ctx.resume();
    const now = ctx.currentTime;
    awn.port.postMessage({ setMidiNote: { channel: 0, value: midi } });
    awn.port.postMessage({ setFade: { channel: 0, value: state.onSetFade } });
    envelope.gain.cancelScheduledValues(now);
    envelope.gain.setValueAtTime(Math.max(envelope.gain.value, 0.0001), now);
    envelope.gain.linearRampToValueAtTime(1, now + Math.max(0.01, state.attack));
    log("note on midi " + midi);
  } catch (e) {
    log(e && e.message ? e.message : String(e));
  }
}

function noteOff() {
  if (!ctx || !envelope) return;
  const now = ctx.currentTime;
  envelope.gain.cancelScheduledValues(now);
  envelope.gain.setValueAtTime(envelope.gain.value, now);
  envelope.gain.linearRampToValueAtTime(0, now + Math.max(0.02, state.release));
}

startBtn.onclick = () => startAudio().catch((e) => log(e.message || String(e)));

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
    if (!li || !li.title) return;
    const hz = 440 * Math.pow(2, (midiFromHzName(li.title) - 69) / 12);
    noteOn(midiFromHz(hz));
  },
  { passive: true }
);

function midiFromHzName(name) {
  const m = /^([A-G]#?)(-?\d+)$/.exec(name);
  if (!m) return 69;
  const order = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const idx = order.indexOf(m[1]);
  const oct = Number(m[2]);
  return 12 * (oct + 1) + idx;
}
