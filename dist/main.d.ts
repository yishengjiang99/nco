import "./keyboard.js";
export declare const stderr: (str: string) => void, stdout: (str: string) => void, infoPanel: HTMLElement;
export declare const statediv: HTMLElement;
export declare var state: {
    initialMix: number[];
    fadeVelocity: number[];
    attack: number[];
    decay: number[];
    release: number[];
    sustain: number[];
    vibratoLFO: number[];
};
export declare const midiBtn: HTMLElement;
export declare const controlPanel: HTMLElement, startBtn: HTMLElement, piano: HTMLElement, canvasA: HTMLElement, canvasB: HTMLElement;
