import { logdiv, mkdiv } from "../node_modules/mkdiv/rollup.js";
const main = document.querySelector("main");
let ctx, awn;
function renderStruct(wavetable_oscillators, port) {
  document.body.appendChild(
    mkdiv(
      "main",
      { class: "container" },

      wavetable_oscillators
        .map((osc, idx) =>
          mkdiv("summary", { class: "card" }, [
            mkdiv("input", {
              type: "range",
              min: 0,
              max: 128,
              step: 1,
              default: 60,
              oninput: (e) =>
                port.postMessage({
                  setMidi: { channel: idx, value: e.target.value },
                }),
            }),
            mkdiv(
              "details",
              {},
              Array.from(Object.keys(osc)).map((k) => `<li>${k} ${osc[k]}</li>`)
            ),
          ])
        )
        .concat(
          mkdiv(
            "button",
            { onclick: async () => await ctx.resume() },
            "click to start audio ctx"
          )
        )
    )
  );
}

async function init_audio_ctx(stdout, stderr) {
  try {
    ctx = new AudioContext();
    if (!ctx) {
      stderr("failed to init audio ctx");
    }
    await ctx.audioWorklet.addModule("web/rend-proc.js");
    awn = new AudioWorkletNode(ctx, "rendproc");
    awn.onprocessorerror = (e) => stderr(e);
    awn.port.onmessageerror = (e) => stderr(e);

    const osc_table = await new Promise((resolve) => {
      awn.port.addEventListener(
        "message",
        ({ data: { ready, osc_table } }) => {
          if (ready) renderStruct(osc_table, awn.port);
        },
        { once: true }
      );
    });
    stdout(JSON.stringify(osc_table, null, "\t"));
    awn.port.onmessage = (e) => stdout(JSON.stringify(e.message));
  } catch (e) {
    stderr(e.message);
    throw e;
  }
  return [ctx, awn];
}

async function bind_midi_ports() {
  try {
    //@ts-ignore
    midiAccess = await navigator.requestMIDIAccess();
    for (const entry of midiAccess.outputs) {
      const output = entry[1];
      selector.append(new Option(output.name, output.id));
    }
  } catch (e) {
    stdout("midiAccess not granted");
    return;
  }
}

const { stderr, stdout } = logdiv();
stdout("page load");

init_audio_ctx(stdout, stderr).then(async ([_ctx, awn]) => {
  ctx = _ctx;
  stdout("ctx load");
  await new Promise((resolve, reject) => {
    _ctx.onstatechange = () => {
      _ctx.state === "running"
        ? resolve()
        : rejects(
            new Error(
              "audio ctx state changed but not in the right direction?>"
            )
          );
    };
  });
  awn.connect(ctx.destination);
  stdout(ctx);
});
