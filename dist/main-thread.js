import { stdout, stderr, statediv, state, piano, midiBtn, controlPanel, } from "./main.js";
import { bindMidiAccess } from "./midi-connect.js";
import { mkdiv } from "./mkdiv.js";
import { loadPeriodicForms, tbs } from "./periodic-waveform.js";
// @ts-ignore
//@ts-ignore
import io_samplers from "./charts.js";
new Worker("./wavetable-oscillator.js", { type: "module" });
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
        };
        if (!envelope) {
            envelope = new GainNode(ctx, { gain: 0 });
        }
    }
    catch (e) {
        stderr(e.message);
        throw e;
    }
}
async function noteOn(midi, channel, velocity) {
    let [initialMix, fadeVelocity, attack, decay, release, sustain] = Array.from(Object.values(state)).map((v) => v[0]);
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
function noteOff(midi, channel = 0) {
    envelope.gain.cancelAndHoldAtTime(ctx.currentTime);
    envelope.gain.exponentialRampToValueAtTime(0.00001, state.release[0]);
}
async function gotCtx() {
    const { inputAnalyzer, outputAnalyzer, run_samples, disconnect } = io_samplers(ctx, 1024);
    analy = new AnalyserNode(ctx, { fftSize: 256 });
    awn
        .connect(inputAnalyzer)
        .connect(envelope)
        .connect(outputAnalyzer)
        .connect(ctx.destination);
    stdout("loading engine ready");
    const keys = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j"];
    stdout(`use keys ${keys.join(",")} to request midi tones 48 + index of key `);
    window.onkeydown = async (e) => {
        if (ctx.state != "running")
            await ctx.resume().then(() => {
                prockey(e);
                run_samples();
            });
        else
            prockey(e);
    };
    function prockey(e) {
        if (e.repeat)
            return;
        if (keys.indexOf(e.key) > -1) {
            stdout("key down " + e.key);
            noteOn(48 + keys.indexOf(e.key), 0, 89);
            window.addEventListener("keyup", (e) => {
                if (keys.indexOf(e.key) > -1) {
                    stdout("key key up " + e.key);
                    noteOff(48 + keys.indexOf(e.key), 0);
                }
            }, { once: true });
        }
    }
    loadtbls();
    run_samples();
}
init_audio_ctx().then(gotCtx);
// @ts-ignore
piano.addEventListener("noteOn", (e) => noteOn(e.detail.note, 0, 56));
// @ts-ignore
piano.addEventListener("noteOff", (e) => noteOff(e.detail.note, 0));
midiBtn.onclick = () => bindMidiAccess(awn.port, noteOn, noteOff, stdout, stderr).then((midiInputs) => (midiBtn.parentElement.innerHTML = `listening for signals from ${Array.from(midiInputs)
    .map((input) => input.name)
    .join("<br>")}`));
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
            while (_tbs.length) {
                const name = _tbs.shift();
                const fl32arr = await loadPeriodicForms(name);
                yield { name, fl32arr };
            }
            return;
        })()) {
            writer.write(fl32arr);
            stdout("loaded " + name);
        }
    })();
    [0, 1].map((tbIndex) => {
        controlPanel.append(mkdiv("div", {}, [
            mkdiv("label", { for: "select" + tbIndex }, "wf" + tbIndex.toString(2)),
            mkdiv("select", {
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
            }, tbs.map((tname, idx) => mkdiv("option", { value: idx }, tname))),
        ]));
    });
}
