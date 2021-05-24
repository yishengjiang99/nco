import { mkdiv } from "./mkdiv.js";

const css = `:host{box-sizing:border-box;} 
ul{height:18.875em;margin:1em auto;padding:.5em 0 0 .1em;position:relative;border:1px solid #160801;border-radius:1em;background:black} 
li{margin:0;padding:0;list-style:none;position:relative;float:left} ul .white{height:16em;width:3.8em;z-index:1;border-left:1px solid #bbb;border-bottom:1px solid #bbb;border-radius:0 0 5px 5px;box-shadow:-1px 0 0 rgba(255,255,255,.8) inset,0 0 5px #ccc inset,0 0 3px rgba(0,0,0,.2);background:linear-gradient(to bottom,#eee 0,#fff 100%);margin:0 0 0 -1em}
ul .white:active{border-top:1px solid #777;border-left:1px solid #999;border-bottom:1px solid #999;box-shadow:2px 0 3px rgba(0,0,0,.1) inset,-5px 5px 20px rgba(0,0,0,.2) inset,0 0 3px rgba(0,0,0,.2);background:linear-gradient(to bottom,#fff 0,#e9e9e9 100%)}
ul .white.pressed{border-top:1px solid #777;border-left:1px solid #999;border-bottom:1px solid #999;box-shadow:2px 0 3px rgba(0,0,0,.1) inset,-5px 5px 20px rgba(0,0,0,.2) inset,0 0 3px rgba(0,0,0,.2);background:linear-gradient(to bottom,#fff 0,#e9e9e9 100%)}
.black{height:8em;width:2em;margin:0 0 0 -1em;z-index:2;border:1px solid #000;border-radius:0 0 3px 3px;box-shadow:-1px -1px 2px rgba(255,255,255,.2) inset,0 -5px 2px 3px rgba(0,0,0,.6) inset,0 2px 4px rgba(0,0,0,.5);background:linear-gradient(45deg,#222 0,#555 100%)}
.black:active{box-shadow:-1px -1px 2px rgba(255,255,255,.2) inset,0 -2px 2px 3px rgba(0,0,0,.6) inset,0 1px 2px rgba(0,0,0,.5);background:linear-gradient(to right,#444 0,#222 100%)}.a,.c,.d,.f,.g{margin:0 0 0 -1em}ul li:first-child{border-radius:5px 0 5px 5px}ul li:last-child{border-radius:0 5px 5px 5px}
.black.pressed{box-shadow:-1px -1px 2px rgba(255,255,255,.2) inset,0 -2px 2px 3px rgba(0,0,0,.6) inset,0 1px 2px rgba(0,0,0,.5);background:linear-gradient(to right,#444 0,#222 100%)}.a,.c,.d,.f,.g{margin:0 0 0 -1em}ul li:first-child{border-radius:5px 0 5px 5px}ul li:last-child{border-radius:0 5px 5px 5px}`;

export class PianoKeyboard extends HTMLElement {
  static get observedAttributes() {
    return ["octaves", "params", "samplelist"];
  }

  constructor() {
    super();
    const keyclass = (key: number) =>
      [1, 3, 6, 8].indexOf(key) >= 0 ? "black" : "white";
    const keys = [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11];
    const octaves = [2, 3, 4];
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(mkdiv("style", {}, css));
    const key2midi = (key: number, octave = 3) => octave * 12 + key;
    const keyLi = (key: number) =>
      mkdiv("li", {
        id: key,
        "data-note": key2midi(key),
        class: keyclass(key),
      });
    this.shadowRoot!.appendChild(
      mkdiv(
        "ul",
        {},
        keys.map((key) => keyLi(key))
      )
    );
    this.shadowRoot!.addEventListener("mousedown", (e) => {
      if (!(e.target as HTMLElement).dataset.note) return false;
      const note = (e.target as HTMLElement).dataset.note;

      this.dispatchEvent(new CustomEvent("noteOn", { detail: { note } }));
      (e.target as HTMLElement).classList.add("pressed");
    });

    this.shadowRoot!.addEventListener("mouseup", (e) => {
      const note = (e.target as HTMLElement).dataset.note;
      this.dispatchEvent(new CustomEvent("noteOff", { detail: { note } }));
    });
  }
}
window.customElements.define("piano-keyboard", PianoKeyboard);
