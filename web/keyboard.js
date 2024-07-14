"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PianoKeyboard = void 0;
var mkdiv_js_1 = require("./mkdiv.js");
var css = ":host{box-sizing:border-box;} \nul{height:18.875em;margin:1em auto;padding:.5em 0 0 .1em;position:relative;border:1px solid #160801;border-radius:1em;background:black} \nli{margin:0;padding:0;list-style:none;position:relative;float:left} ul .white{height:16em;width:3.8em;z-index:1;border-left:1px solid #bbb;border-bottom:1px solid #bbb;border-radius:0 0 5px 5px;box-shadow:-1px 0 0 rgba(255,255,255,.8) inset,0 0 5px #ccc inset,0 0 3px rgba(0,0,0,.2);background:linear-gradient(to bottom,#eee 0,#fff 100%);margin:0 0 0 -1em}\nul .white:active{border-top:1px solid #777;border-left:1px solid #999;border-bottom:1px solid #999;box-shadow:2px 0 3px rgba(0,0,0,.1) inset,-5px 5px 20px rgba(0,0,0,.2) inset,0 0 3px rgba(0,0,0,.2);background:linear-gradient(to bottom,#fff 0,#e9e9e9 100%)}\nul .white.pressed{border-top:1px solid #777;border-left:1px solid #999;border-bottom:1px solid #999;box-shadow:2px 0 3px rgba(0,0,0,.1) inset,-5px 5px 20px rgba(0,0,0,.2) inset,0 0 3px rgba(0,0,0,.2);background:linear-gradient(to bottom,#fff 0,#e9e9e9 100%)}\n.black{height:8em;width:2em;margin:0 0 0 -1em;z-index:2;border:1px solid #000;border-radius:0 0 3px 3px;box-shadow:-1px -1px 2px rgba(255,255,255,.2) inset,0 -5px 2px 3px rgba(0,0,0,.6) inset,0 2px 4px rgba(0,0,0,.5);background:linear-gradient(45deg,#222 0,#555 100%)}\n.black:active{box-shadow:-1px -1px 2px rgba(255,255,255,.2) inset,0 -2px 2px 3px rgba(0,0,0,.6) inset,0 1px 2px rgba(0,0,0,.5);background:linear-gradient(to right,#444 0,#222 100%)}.a,.c,.d,.f,.g{margin:0 0 0 -1em}ul li:first-child{border-radius:5px 0 5px 5px}ul li:last-child{border-radius:0 5px 5px 5px}\n.black.pressed{box-shadow:-1px -1px 2px rgba(255,255,255,.2) inset,0 -2px 2px 3px rgba(0,0,0,.6) inset,0 1px 2px rgba(0,0,0,.5);background:linear-gradient(to right,#444 0,#222 100%)}.a,.c,.d,.f,.g{margin:0 0 0 -1em}ul li:first-child{border-radius:5px 0 5px 5px}ul li:last-child{border-radius:0 5px 5px 5px}";
var PianoKeyboard = /** @class */ (function (_super) {
    __extends(PianoKeyboard, _super);
    function PianoKeyboard() {
        var _this = _super.call(this) || this;
        var keyclass = function (key) {
            return [1, 3, 6, 8].indexOf(key) >= 0 ? "black" : "white";
        };
        var keys = [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11];
        var octaves = [2, 3, 4];
        _this.attachShadow({ mode: "open" });
        _this.shadowRoot.appendChild((0, mkdiv_js_1.mkdiv)("style", {}, css));
        var key2midi = function (key, octave) {
            if (octave === void 0) { octave = 3; }
            return octave * 12 + key;
        };
        var keyLi = function (key) {
            return (0, mkdiv_js_1.mkdiv)("li", {
                id: key,
                "data-note": key2midi(key),
                class: keyclass(key),
            });
        };
        _this.shadowRoot.appendChild((0, mkdiv_js_1.mkdiv)("ul", {}, keys.map(function (key) { return keyLi(key); })));
        _this.shadowRoot.addEventListener("mousedown", function (e) {
            if (!e.target.dataset.note)
                return false;
            var note = e.target.dataset.note;
            _this.dispatchEvent(new CustomEvent("noteOn", { detail: { note: note } }));
            e.target.classList.add("pressed");
        });
        _this.shadowRoot.addEventListener("mouseup", function (e) {
            var note = e.target.dataset.note;
            _this.dispatchEvent(new CustomEvent("noteOff", { detail: { note: note } }));
        });
        return _this;
    }
    Object.defineProperty(PianoKeyboard, "observedAttributes", {
        get: function () {
            return ["octaves", "params", "samplelist"];
        },
        enumerable: false,
        configurable: true
    });
    return PianoKeyboard;
}(HTMLElement));
exports.PianoKeyboard = PianoKeyboard;
window.customElements.define("piano-keyboard", PianoKeyboard);
