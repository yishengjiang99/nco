import {
  stdout,
  stderr,
  statediv,
  state,
  piano,
  midiBtn,
  controlPanel
} from "./main.js";
import { bindMidiAccess } from "./midi-connect.js";
import { mkdiv, draw } from "./mkdiv.js";
import { loadPeriodicForms, tbs } from "./periodic-waveform.js";
// @ts-ignore
//@ts-ignore
import io_samplers from "./charts.js";

stdout("page load");
let ctx: AudioContext;
let awn: AudioWorkletNode;
let chartFFT, pauseChartFFT;

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
      numberOfOutputs: 16
      // outputChannelCount: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
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

    const { outputAnalyzer, run_samples, disconnect: pauseChartFFT } =
      io_samplers(ctx, 1024);

    chartFFT = run_samples;
    awn
      .connect(outputAnalyzer)
      .connect(ctx.destination);
    stdout("loading engine ready");
  } catch (e)
  {
    stderr(e.message);
    throw e;
  }
}

async function noteOn(midi: number, channel: number, velocity: number) {
  awn.port.postMessage({ noteOn: { midi, channel, velocity } });
  setTimeout(chartFFT, 5);
}
function noteOff(midi: number, channel: number = 0) {
  awn.port.postMessage({ noteOff: { midi, channel } });
  setTimeout(pauseChartFFT, 1000);

}
async function gotCtx() {

  const keys = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j"];
  stdout(`use keys ${keys.join(",")} to request midi tones 48 + index of key `);
  window.onkeydown = async (e: KeyboardEvent) => {
    if (ctx.state != "running")
      await ctx.resume().then(() => {
        prockey(e);
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
  loadtbls();
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
  );
function loadtbls() {
  const http_to_audio_thread_pipe = new TransformStream();
  // @ts-ignore
  awn.port.postMessage({ readable: http_to_audio_thread_pipe.readable }, [
    http_to_audio_thread_pipe.readable,
  ]);
  const writer = http_to_audio_thread_pipe.writable.getWriter();
  (async () => {
    for await (const { name, fl32arr } of (async function* dl_queue() {
      let _tbs = tbs;
      while (_tbs.length)
      {
        const name = _tbs.shift();
        const fl32arr = await loadPeriodicForms(name!);
        yield { name, fl32arr };
      }
      return { name: "done", fl32arr: new Float32Array([]) }
    })())
    {
      writer.write(fl32arr);
      stdout("loaded " + name);
    }
  })();
  [0, 1].map((tbIndex) => {
    controlPanel.append(
      mkdiv("div", {}, [
        mkdiv("label", { for: "select" + tbIndex }, "wf" + tbIndex.toString(2)),
        mkdiv(
          "select",
          {
            "aria-label": "wf" + tbIndex.toString(2),
            // @ts-ignore
            onchange: (e) => {
              awn.port.postMessage({
                setTable: {
                  channel: 0,
                  tbIndex,
                  formIndex: e.target.value,
                },
              });
            },
          },
          tbs.map((tname, idx) => mkdiv("option", { value: idx }, tname))
        ),
      ])
    );
  });
}
