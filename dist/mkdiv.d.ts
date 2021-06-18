export declare function mkdiv(type: string, attr?: any, children?: (string | HTMLElement)[] | HTMLElement | string): HTMLElement;
declare type stdcb = (str: string) => void;
declare type logdivRet = {
    stdout: stdcb;
    stderr: stdcb;
    errPanel: HTMLElement;
    infoPanel: HTMLElement;
};
export declare function logdiv(): logdivRet;
export declare function wrapDiv(div: string | HTMLElement, tag: string, attrs?: {}): HTMLElement;
export declare function wrapList(divs: HTMLElement[]): HTMLElement;
export declare const draw: (getData: () => Float32Array | Boolean | void, length: number, canvas: HTMLCanvasElement) => {
    canvas: HTMLCanvasElement;
    stop: () => void;
    start: () => void;
    drawOnce: () => void;
};
export {};
