// @ts-ignore
import { draw, mkdiv } from "./draw-canvas-60fps/es6.js";
const pre = document.createElement("pre");
const tbs = [
    "01_Saw",
    "02_Triangle",
    "03_Square",
    "04_Noise",
    "05_Pulse",
    "06_Warm_Saw",
    "07_Warm_Triangle",
    "08_Warm_Square",
    "09_Dropped_Saw",
    "10_Dropped_Square",
    "11_TB303_Square",
    "Bass_Amp360",
    "Bass_Fuzz_ 2",
    "Bass_Fuzz",
    "Bass_Sub_Dub_2",
    "Bass_Sub_Dub",
    "Bass",
    "Brass",
    "Brit_Blues_Driven",
    "Brit_Blues",
    "Buzzy_1",
    "Buzzy_2",
    "Celeste",
    "Chorus_Strings",
    "Dissonant Piano",
    "Dissonant_1",
    "Dissonant_2",
    "Dyna_EP_Bright",
    "Dyna_EP_Med",
    "Ethnic_33",
    "Full_1",
    "Full_2",
    "Guitar_Fuzz",
    "Harsh",
    "Mkl_Hard",
    "Organ_2",
    "Organ_3",
    "Phoneme_ah",
    "Phoneme_bah",
    "Phoneme_ee",
    "Phoneme_o",
    "Phoneme_ooh",
    "Phoneme_pop_ahhhs",
    "Piano",
    "Putney_Wavering",
    "Throaty",
    "Trombone",
    "Twelve String Guitar 1",
    "Twelve_OpTines",
    "Wurlitzer_2",
    "Wurlitzer",
];
async function playt(tablename) {
    let ctx = new OfflineAudioContext({
        numberOfChannels: 1,
        length: 4096,
        sampleRate: 4096,
    });
    const [before, after] = Array.from(document.querySelectorAll("canvas"));
    const imgPcm = await (await fetch("../wvtable_pcm/" + tablename + "_img.pcm")).arrayBuffer();
    const readPcm = await (await fetch("../wvtable_pcm/" + tablename + "_real.pcm")).arrayBuffer();
    const chart = draw(function () {
        return new Float32Array(imgPcm);
    }, 4096, before);
    chart.start();
    pre.innerHTML = new Float32Array(readPcm).join("\n");
    let osc;
    try {
        osc = new OscillatorNode(ctx, {
            type: "custom",
            periodicWave: new PeriodicWave(ctx, {
                real: new Float32Array(readPcm).slice(0, 10),
                imag: new Float32Array(imgPcm).slice(0, 10),
            }),
            frequency: 1,
        });
    }
    catch (e) {
        document.querySelector("#error").innerHTML = e.toString();
    }
    if (!osc)
        return;
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(1.1);
    ctx.startRendering().then((ab) => {
        const float = ab.getChannelData(0);
        const { start, stop } = draw(function getData() {
            return float;
        }, 4096 / 2, after);
    });
}
document.body.append(mkdiv("div", {}, tbs.map((t) => mkdiv("button", {
    onclick: () => {
        playt(t);
    },
}, t))));
console.log(pre);
document.body.append(pre);
