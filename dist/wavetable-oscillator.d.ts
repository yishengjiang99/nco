export declare function init_wasm({ url, wasmbin }: {
    url?: string;
    wasmbin?: Uint8Array;
}): Promise<{
    heap: Uint8Array;
    instance: WebAssembly.Instance | null;
}>;
export declare class Osc {
    struct: DataView;
    ref: number;
    heap: Uint8Array;
    constructor(heap: Uint8Array, ref: number);
    get rendblock(): number;
    get output(): Float32Array;
    get phase(): number;
    set phase(fl: number);
    get phaseIncrement(): number;
    set phaseIncrement(fl: number);
    get phaseVelocity(): number;
    set phaseVelocity(fl: number);
    get fadeDim1(): number;
    set fadeDim1(fl: number);
    get fadeDim1Increment(): number;
    set fadeDim1Increment(fl: number);
    get fadeDim2(): number;
    set fadeDim2Increment(fl: number);
    get fadeDim3(): number;
    set fadeDim3Increment(fl: number);
    get wave000(): number;
    get wave001(): number;
    get wave010(): number;
    get wave011(): number;
    get wave100(): number;
    get wave101(): number;
    get wave110(): number;
    get wave111(): number;
    set wave000(ref: number);
    set wave001(ref: number);
    set wave010(ref: number);
    set wave011(ref: number);
    set wave100(ref: number);
    set wave101(ref: number);
    set wave110(ref: number);
    set wave111(ref: number);
}
export declare function init_ctx({ heap, instance }: {
    heap: Uint8Array;
    instance: WebAssembly.Instance;
}): Promise<{
    instance: WebAssembly.Instance;
    heap: Uint8Array;
    wavetable_0dimensional_oscillator: CallableFunction;
    wavetable_1dimensional_oscillator: CallableFunction;
    wavetable_2dimensional_oscillator: CallableFunction;
    wavetable_3dimensional_oscillator: CallableFunction;
    sampleTableRef: CallableFunction;
    setMidi: CallableFunction;
    setWaveTable: (flarr: Float32Array, tableIndex: number) => void;
    oscs: Osc[];
}>;
