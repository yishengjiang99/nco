import { logdiv, mkdiv, wrapDiv } from "../mkdiv.js";
const BIT32_NORMALIZATION = 4294967296.0;
const main = document.querySelector("main");
const { stderr, stdout, infoPanel, errPanel } = logdiv({ container: main });
const statediv = mkdiv("pre", {}, "statediv");
main.append(
  mkdiv("div", { style: "display:grid; grid-template-columns: 1fr 1fr;" }, [
    infoPanel,
    statediv,
  ])
);
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
        state.attr = e.target.value;
        document.querySelector(`#${attr}val`).innerHTML = e.target.value;
      },
    }),
    mkdiv("label", { id: `${attr}val` }, state[attr]),
  ]);
});
main.append(
  mkdiv("div", { class: "panel" }, [
    ...sliders,
    mkdiv("div", { id: "keyboard" }),
  ])
);
var keyboard = new QwertyHancock({
  id: "keyboard",
  width: 500,
  height: 150,
  octaves: 2,
  startNote: "A3",
  whiteNotesColour: "white",
  blackNotesColour: "black",
  hoverColour: "#f3e939",
});

async function init_audio_ctx(stdout, stderr) {
  try {
    ctx = new AudioContext({ sampleRate: 48000 });
    if (!ctx) {
      stderr("failed to init audio ctx");
    }

    await ctx.audioWorklet.addModule("web/audio-thread.js");
    awn = new AudioWorkletNode(ctx, "rendproc", {
      outputChannelCount: [1],
    });
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
    if (e.repeat) return;
    if (keys.indexOf(e.key) > -1) {
      stdout("key down " + e.key);

      noteOn(48 + keys.indexOf(e.key));
      window.addEventListener(
        "keyup",
        (e) => {
          if (keys.indexOf(e.key) > -1) {
            stdout("key key up " + e.key);

            noteOff(48 + keys.indexOf(e.key));
          }
        },
        { once: true }
      );
    }
  };
});
function noteOn(midi) {
  const { onSetFade, fadeVelocity, attack, decay, release, sustain } = state;
  ctx.resume();
  awn.port.postMessage({
    setMidi: { channel: 0, value: midi },
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
  envelope.gain.linearRampToValueAtTime(0, state.release);
  awn.port.postMessage({
    setFadeDelta: {
      channel: 0,
      value: 0,
    },
    setPhaseIncrement: {
      channel: 0,
      value: 0,
    },
  });
}
const keys = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j"];
stdout(`use keys ${keys.join(",")} to request midi tones 48 + index of key `);
keyboard.keyDown = function (note, Hertz) {
  // Your code here
  noteOn((Math.log(Hertz / 440.0) / Math.log(2)) * 12 + 69);
};

keyboard.keyUp = function (note, Hertz) {
  // Your code here
  noteOff((Math.log(Hertz / 440.0) / Math.log(2)) * 12 + 69);
};
function bindMidiAccess(proc) {
  navigator.requestMIDIAccess().then(
    (midiAccess) => {
      stdout("midi access grant");
      const midiInputs = Array.from(midiAccess.inputs.values());
      const midiOutputs = Array.from(midiAccess.outputs.values());
      for (const output of midiOutputs) {
        //  midiWritePort = output;
        break;
      }
      for (const input of midiInputs) {
        // @ts-ignore
        input.onmidimessage = ({ data, timestamp }) => {
          procPort.postMessage({ midi: data });
          console.log(data);
        };
      }
      const midiInputsRadio = midiInputs.map((inputs) => {
        return mkdiv("div", {}, [
          mkdiv("input", {
            type: "radio",
            value: output.id,
            name: "outputselect",
            checked: output.id == output.id ? "true" : "false",
          }),
          mkdiv("span", { role: "label", for: "o_" + output.id }, output.name),
        ]);
      });
      outputlist.append(mkdiv("form", {}, midioutputradio));
      inputlist.append(
        mkdiv(
          "form",
          {},
          midiOutputs.map((o) => {
            return mkdiv("div", {}, [
              mkdiv("input", { type: "checkbox", checked: "checked" }),
              mkdiv("span", { role: "label", for: "o_" + o.id }, o.name),
            ]);
          })
        )
      );
    },
    (err) => {
      stderr("access not granted");
    }
  );
}
