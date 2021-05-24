import { logdiv, mkdiv, wrapList } from "./mkdiv.js";
import "./keyboard.js";
const main = document.querySelector("main")!;
export const { stderr, stdout, infoPanel } = logdiv();
export const statediv = mkdiv("pre", {}, "");
export const state = Object.assign(
  {},
  {
    initialMix: [0.8, 0.0, 1.0],
    fadeVelocity: [1, 0.2, 3],
    attack: [1, 0, 2],
    decay: [1, 0, 5],
    release: [0.5, 0, 10],
    sustain: [0.5, 0, 1],
    vibratoLFO: [5, 0, 60],
  }
);

export const midiBtn = mkdiv("button", {}, "Connect To Midi");
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
        state[attr][0] = e.target.value;
        document.querySelector(`#${attr}val`)!.innerHTML = "" + state.attr[0];
      },
    }),
    mkdiv("label", { id: `${attr}val` }, "" + state[attr][0]),
  ]);
});
export const piano = mkdiv("piano-keyboard");
main.append(
  mkdiv(
    "div",
    {
      style: `display:grid; grid-template-columns: 1fr 1fr`,
    },
    [
      infoPanel,
      statediv,
      mkdiv("div", { id: "midiListen" }, midiBtn),
      mkdiv("div", { id: "panel" }, sliders),
      piano,
    ]
  )
);
