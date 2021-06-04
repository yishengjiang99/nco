import { logdiv, mkdiv, wrapDiv } from "./mkdiv.js";
import "./keyboard.js";
const main = document.querySelector("main");
export const { stderr, stdout, infoPanel } = logdiv();
export const statediv = mkdiv("pre", {}, "");
export var state = {
    initialMix: [0.8, 0.0, 1.0],
    fadeVelocity: [1, 0.2, 3],
    attack: [1, 0, 2],
    decay: [1, 0, 5],
    release: [0.5, 0, 10],
    sustain: [0.5, 0, 1],
    vibratoLFO: [5, 0, 60],
};
export const midiBtn = mkdiv("button", {}, "Connect To Midi");
document
    .querySelector("nav")
    .appendChild(mkdiv("div", { id: "midiListen" }, midiBtn));
const sliders = Object.keys(state).map((attr) => {
    //@ts-ignore
    const [value, min, max] = state[attr];
    return mkdiv("div", {}, [
        mkdiv("label", { for: `${attr}Slide` }, attr + ""),
        mkdiv("input", {
            type: "range",
            id: `${attr}Slide`,
            value,
            min,
            max,
            step: 0.1,
            // @ts-ignore,
            oninput: (e) => {
                document.querySelector(`#${attr}val`).innerHTML = e.target.value + "";
            },
        }),
        // @ts-ignore
        mkdiv("label", { id: `${attr}val` }, "" + state[attr][0]),
    ]);
});
export const [controlPanel, startBtn, piano, canvasA, canvasB] = [
    mkdiv("div", { id: "panel" }, sliders),
    mkdiv("button", { class: "btn btn-primary" }, "start"),
    mkdiv("piano-keyboard", {}, []),
    mkdiv("canvas", { id: "canvasA" }),
    mkdiv("canvas", { id: "canvasB" }),
];
document.body.append(mkdiv("main", {
    style: `display:grid;width:100vw; \
      grid-template-columns:1fr 1fr 1fr;  grid-template-rows:1fr 1fr 1fr;`,
}, [
    wrapDiv(canvasA, "div", { style: "width:25vw;height:25vw" }),
    wrapDiv(canvasB, "div", { style: "width:25vw;height:25vw" }),
    infoPanel,
    statediv,
    controlPanel,
    startBtn,
    piano,
]));
