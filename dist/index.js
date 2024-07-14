import { sfbkstream, PDTA, readAB, logdiv } from "./libs.js";
import { draw } from "https://unpkg.com/draw-canvas-60fps@1.0.0/index.js";
async function load_proc_controller(ctx, url, stderr, stdout) {
    const workletjoin = ctx.audioWorklet.addModule("rendctx.js");
    const { pdtaBuffer, sdtaStream, nsamples, infos } = await sfbkstream(url);
    const pdta = new PDTA(readAB(pdtaBuffer));
    await workletjoin;
    const proc = new AudioWorkletNode(ctx, "rend-proc", {
        outputChannelCount: [2],
        processorOptions: {
            pdtaBuffer,
        },
    });
    proc.port.postMessage({ sdtaStream, nSamples: nsamples }, [sdtaStream]);
    return {
        proc,
        pdta: new PDTA(readAB(pdta)),
    };
}
const ctx = new AudioContext();
const statediv = document.querySelector("#sfdiv");
let _ctxView;
const analy = new AnalyserNode(ctx, { fftSize: 0x1000 });
const fftFlts = new Float32Array(0x1000);
const { stdout, stderr } = logdiv({ containerID: "stdout" });
stdout("pgload");
await ctx.suspend();
const { proc, pdta } = await load_proc_controller(ctx, "file.sf2", stdout, stderr);
const channelInfo = (ch) => new Uint8Array(_ctxView, chstart + ch * ch_size, ch_size);
function voiceview(vptr) {
    return ({
        start,
        end,
        startloop,
        endloop,
        pos,
        frac,
        ratio,
        panLeft,
        panRight,
        att_steps,
        decay_steps,
        release_steps,
        sustain,
        db_attenuate,
        att_rate,
        decay_rate,
        release_rate,
    } = [
        ...new Uint32Array(heap, (vptr += 20), 5),
        ...new Float32Array(heap, (vptr += 16), 4),
        ...new Uint32Array(heap, (vptr += 20), 5),
        ...new Float32Array(heap, (vptr += 20), 5),
    ]);
}
function updateState() {
    if (_ctxView) {
        statediv.innerHTML = new Uint32Array(_ctxView).join(",");
        requestAnimationFrame(updateState);
    }
}
//@ts-ignore
proc.port.onmessageerror = stderr;
proc.port.onmessage = ({ data: { ctxView } }) => {
    if (ctxView) {
        _ctxView = ctxView;
        updateState();
    }
};
proc.connect(analy).connect(ctx.destination);
const { start, stop } = draw(function getData() {
    analy.getFloatFrequencyData(fftFlts);
    return fftFlts;
}, 0x1000);
const keys = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j"];
function noteOn(channel, key, vel = 122) {
    if (proc && proc.port) {
        proc.port.postMessage({
            midi: {
                event: "on",
                channel,
                key,
                vel,
            },
        });
    }
}
function noteOff(channel, key, vel = 123) {
    if (proc && proc.port) {
        proc.port.postMessage({
            midi: {
                event: "off",
                channel,
                key,
                vel,
            },
        });
    }
}
window.onkeydown = async (e) => {
    if (ctx.state != "running") {
        await ctx.resume();
    }
    if (keys.indexOf(e.key) > -1) {
        noteOn(0, 48 + keys.indexOf(e.key), 33);
    }
};
window.addEventListener("keyup", (e) => {
    if (keys.indexOf(e.key) > -1) {
        noteOff(0, 48 + keys.indexOf(e.key));
    }
});
