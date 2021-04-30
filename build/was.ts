import { logdiv, mkdiv } from "../node_modules/mkdiv/rollup.js";
function renderStruct(wavetable_oscillators, port) {
  const cards = wavetable_oscillators.map((osc, idx) =>
    mkdiv("div", { class: "card" }, [
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
      ...Array.from(Object.keys(osc)).map((k) => `<b>${k}<b>:osc`),
    ])
  );
}
