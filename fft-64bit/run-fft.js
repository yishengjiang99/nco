//@ts-ignore
import {createModule} from './fft.wasmmodule.js';
// Module['onRuntimeInitialized'] = init(wasmModule, fftbin, sampleRate)
let _mod;
async function init(fftbin, sharedBuffer) {
    _mod = _mod || await createModule();
    const {_FFT, _iFFT, _bit_reverse, _sin_table, _malloc, HEAPU8, HEAPF64} = _mod();
    const N = fftbin, n = Math.log2(fftbin);
    const stbl = _malloc(fftbin / 4 * Float64Array.BYTES_PER_ELEMENT);
    _sin_table(stbl, n);
    const fft_ptrs = [
        _malloc(fftbin * Float64Array.BYTES_PER_ELEMENT * 2 * 2),
        _malloc(fftbin * Float64Array.BYTES_PER_ELEMENT * 2 * 2),
        _malloc(fftbin * Float64Array.BYTES_PER_ELEMENT * 2 * 2),
    ];
    const fft_buffers = fft_ptrs.map((void_ref) => {
        const fft_buffer_ref = void_ref >> 3; //cover ptr from uint8_t* to complex*
        return HEAPF64.subarray(fft_buffer_ref, 2 * fftbin);
    });
    const writeIndex = [0, fftbin / 4];
    const fftIndex = [0, 0];
    return {
        stbl, fft_buffers, writeIndex, fftIndex,
        _FFT, _iFFT, _bit_reverse, _sin_table,
        HEAPU8,
        voidPtr: (tbIndex, idx) => (tbIndex * 3 + idx) << 3,
        fftSize: N, nHarmonics: n, sharedBuffer
    };
}
function load_pcm(fctx, floats) {
    const table = fctx.fft_buffers[fctx.writeIndex[0]++];
    const tbIndex = fctx.writeIndex[1];
    for (let i = 0;i < floats.length;i++) {
        table[tbIndex + 2 * i] = floats[i];
        table[tbIndex + 2 * i + 1] = floats[i];
    }
    fctx.writeIndex[1] += floats.length;
}
function getFloatFFTBin(fft_ctx, windowFunction) {
    const table = fft_ctx.fft_buffers[fft_ctx.ftIndex[0]];
    const tbIndex = fft_ctx.fftIndex[1];
    const voidPtr = fft_ctx.voidPtr(table, tbIndex);
    const {nHarmonics, fftSize, fftIndex, stbl, _FFT} = fft_ctx;
    _FFT(voidPtr, nHarmonics, stbl);
    fft_ctx.sharedBuffer.buffer.set(HEAPU8[voidPtr], fftSize * 8 * 2);
}
const fft_bins = window.location.hash.length ? parseInt(window.location.hash.substring(1)) : 1024;
const sharedBuffer = new SharedArrayBuffer(8 * 4096);
init(fft_bins, sharedBuffer).then(ret => {
    fftCtx = ret;
    postMessage({sharedBuffer}, "*");
});
onmessage = (e) => {
    if (e.data.arraybuffer) {
        fftCtx.load_pcm(fftCtx, new Float32Array(e.data.arraybuffer));

        fftCtx.getFloatFFTBin(fftCtx, function (phase, val) {
            return val * Math.sin(phase) / phase
        });
        sharedBuffer.buffer.set(HEAPU8.buffer, 0, fftbin * Float64Array.BYTES_PER_ELEMENT * 2 * 2)
    }
}

};
