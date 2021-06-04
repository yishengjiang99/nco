import {draw} from './draw-canvas/es6.js';
import Module from './read.js';

let api;
let module;
export async function init() {
    const module = await Module();
    api = {
        init: module.cwrap("init_tsf", "", []),
        load_sound: module.cwrap("load_sound", "", ["number", "number", "number", "number", "number"]),
        ...module
    };
    api.init();
}


export async function loadSF(presetId, note, velocity, duration) {
    if (!api) {
        await init();
    }
    const metaquery =
        console.log("loading " + note);
    const {_malloc, _free, load_sound, HEAPF32} = api;
    const n = duration * 48000 + 4 + 2;
    const buffer = _malloc(n * Float32Array.BYTES_PER_ELEMENT);
    console.log('ptr' + buffer);
    api.load_sound(buffer, presetId, note, 120, n);

    const [pitchRatio, sampleRate, attack, hold, decay, sustain, release, lpf_cf, lpf_q, ...sound] = new Float32Array(HEAPF32.buffer, buffer, n);
    //  const r = new Float32Array(HEAPF32.buffer, buffer, n);

    _free(buffer);
    return {
        sound, pitchRatio, sampleRate, attack, hold, decay, sustain, release, lpf_cf, lpf_q
    }; //new Float32Array(Module.HEAPF32.buffer, resPtr, n)
}
const crtx = new AudioContext({sampleRate: 31000});
let t0;
for (let j = 0;j < 90;j++) {
    for (let i = 21;i < 88;i++) {
        const button = document.createElement("button");
        button.innerHTML = `${i}`;
        let t0;

        button.onclick = () => play(j, i, j);

        document.body.append(button);
    }
}
const [before, after, r2, r3] = Array.from(document.querySelectorAll("canvas"));

function play(preset, i, vel) {

    loadSF(0, i, vel, 1).then({sound, pitchRatio, sampleRate, attack, hold, decay, sustain, release, lpf_cf, lpf_q} => {

        let ctx = new OfflineAudioContext({
            numberOfChannels: 1,
            length: sound.length,
            sampleRate: 31000,
        });

        const ab = new AudioBuffer({numberOfChannels: 1, length: sound.length, sampleRate: 31000});
        ab.copyToChannel(sound, 0);

        const abs = new AudioBufferSourceNode(ctx, {buffer: ab})
        const ff = new AnalyserNode(ctx, {fftSize: 4096});
        abs.connect(ff).connect(ctx.destination);
        const fl = new Float32Array(4096); const im = new Float32Array(4096);


        //  const g = new GainNode(ctx);
        // g.gain.exponentialRampToValueAtTime(sustain / 2, Math.pow(2, decay / 12000));
        abs.connect(ctx.destination);

        abs.start();
        ctx.startRendering().then(ab => {
            for (let i = 16;i < 300;i += 10) {
                const ctx2 = new OfflineAudioContext({
                    numberOfChannels: 1,
                    length: 4096,
                    sampleRate: 4096,
                });
                draw(() => ab.getChannelData(0), ab.length, before);
                ff.getFloatTimeDomainData(fl);
                ff.getFloatFrequencyData(im);
                fl.map((v, ia) => (ia < i || ia > 4096 - i) ? v : 0)
                const oc = new OscillatorNode(ctx2, {
                    type: "custom", frequency: 1,
                    periodicWave: new PeriodicWave(ctx2, {real: fl.map((v, ia) => (ia < i || ia > 4096 - i) ? v : 0), imag: im.map((v, ia) => (ia < i || ia > 4096 - i) ? v : 0)})
                }); oc.start();
                oc.connect(ctx2.destination);
                ctx2.startRendering().then(ab => {
                    draw(() => ab.getChannelData(0), ab.length, r2);
                    // const abb = new AudioBufferSourceNode(crtx, {playbackRate: 20, loop: true, buffer: ab}); abb.connect(crtx.destination);
                    // abb.start(); abb.stop(1);
                })
            }
        })


    });
}
