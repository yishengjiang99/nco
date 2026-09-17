import { logdiv, mkdiv, wrapDiv } from "../mkdiv.js";
const BIT32_NORMALIZATION = 4294967296.0;
const main = document.querySelector("main");
const { stderr, stdout, infoPanel, errPanel } = logdiv({ container: main });
const statediv = mkdiv("pre", {}, "statediv");
void wrapDiv;

stdout("page load");
let ctx, awn, envelope;
let state = {
  onSetFade: 0.8,
  fadeVelocity: 10,
  attack: 0.1,
  decay: 1,
  release: 0.3,
  sustain: 0.5,
};
const sliders = Object.keys(state).map((attr) => {
  return mkdiv("div", {}, [
    mkdiv("label", { for: `${attr}Slide` }, attr),
    mkdiv("input", {
      type: "range",
      id: `${attr}Slide`,
      value: state[attr],
      max: 2,
      oninput: (e) => {
        state[attr] = Number(e.target.value);
        document.querySelector(`#${attr}val`).innerHTML = e.target.value;
      },
    }),
    mkdiv("label", { id: `${attr}val` }, state[attr]),
  ]);
});
main.append(
  mkdiv(
    "div",
    {
      style:
        "display:grid; grid-template-columns: 1fr 1fr;grid-template-rows:auto; gap:8px; width:100%;",
    },
    [
      infoPanel,
      statediv,
      mkdiv(
        "div",
        { id: "midiListen" },
        `  <button class='button primary' id='midc'>connect midi(usb)</button>`
      ),
      mkdiv("div", { id: "panel" }, sliders),
    ]
  )
);
var keyboard = { keyDown: null, keyUp: null };
if (typeof QwertyHancock === "function" && document.getElementById("keyboard")) {
  keyboard = new QwertyHancock({
    id: "keyboard",
    width: Math.min(999, Math.max(280, window.innerWidth - 24)),
    height: 150,
    octaves: 2,
    startNote: "A3",
    whiteNotesColour: "white",
    blackNotesColour: "black",
    hoverColour: "#f3e939",
  });
}

async function init_audio_ctx(stdout, stderr) {
  try {
    ctx = new AudioContext({ sampleRate: 48000 });
    if (!ctx) {
      stderr("failed to init audio ctx");
    }

    await ctx.audioWorklet.addModule(new URL("audio-thread.js", import.meta.url).href);
    awn = new AudioWorkletNode(ctx, "rendproc", {
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
    awn.onprocessorerror = (e) => {
      console.trace(e);
      stderr(e);
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
      stderr(
        Object.keys(e.data.osc_table)
          .map((k) => `${k}:${e.data.osc_table[k]}`)
          .join("<br>")
      );
    }
    if (e.data.setMidi) {
      stdout(JSON.stringify(e.data.setMidi));
    }
  };

  window.onkeydown = (e) => {
    if (e.repeat) return;
    if (keys.indexOf(e.key) > -1) {
      stdout("key down " + e.key);

      noteOn(48 + keys.indexOf(e.key), 0, 89);
      window.addEventListener(
        "keyup",
        (e) => {
          if (keys.indexOf(e.key) > -1) {
            stdout("key key up " + e.key);

            noteOff(48 + keys.indexOf(e.key), 0, 99);
          }
        },
        { once: true }
      );
    }
  };
}).catch((e) => stderr(e && e.message ? e.message : String(e)));
function noteOn(midi, channel, velocity) {
  const { onSetFade, fadeVelocity, attack, decay, release, sustain } = state;
  ctx.resume();
  awn.port.postMessage({
    setMidiNote: { channel: 0, value: midi },
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
  envelope.gain.linearRampToValueAtTime(1, ctx.currentTime + attack);
  envelope.gain.linearRampToValueAtTime(0.4, ctx.currentTime + decay);
}
function noteOff(midi) {
  envelope.gain.cancelAndHoldAtTime(ctx.currentTime);
  envelope.gain.linearRampToValueAtTime(
    0,
    ctx.currentTime + Number(state.release || 0.3)
  );
}
const keys = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j"];
stdout(`use keys ${keys.join(",")} to request midi tones 48 + index of key `);
keyboard.keyDown = function (note, Hertz) {
  noteOn((Math.log(Hertz / 440.0) / Math.log(2)) * 12 + 69, 0, 77);
};

keyboard.keyUp = function (note, Hertz) {
  noteOff((Math.log(Hertz / 440.0) / Math.log(2)) * 12 + 69, 0, 88);
};
function bindMidiAccess(proc) {
  navigator.requestMIDIAccess().then(
    (midiAccess) => {
      stdout("midi access grant");
      const midiInputs = Array.from(midiAccess.inputs.values());
      let midiListenID;
      for (const input of midiInputs) {
        midiListenID = input.id;
        input.onmidimessage = ({ data }) => {
          awn.port.postMessage({ midi: data });
          const channel = data[0] & 0x0f;
          const cmd = data[0] & 0xf0;
          const note = data[1];
          const velocity = data.length > 2 ? data[2] : 0;
          switch (cmd) {
            case 0x90:
              if (velocity === 0) noteOff(note, channel, 0);
              else noteOn(note, channel, velocity);
              break;
            case 0x80:
              noteOff(note, channel, velocity);
              break;
            default:
              break;
          }
        };
      }
      document.querySelector("#midiListen").innerHTML = "";
      document.querySelector("#midiListen").append(
        mkdiv(
          "div",
          {},
          midiInputs.map((input) => {
            return mkdiv("div", {}, [
              mkdiv("input", {
                type: "radio",
                value: input.id,
                name: "outputselect",
                checked: input.id == midiListenID ? "true" : "false",
              }),
              mkdiv(
                "span",
                { role: "label", for: "input" + input.id },
                input.name
              ),
            ]);
          })
        )
      );
    },
    () => {
      stderr("access not granted");
    }
  );
}
document.querySelector("button#midc").onclick = bindMidiAccess;
