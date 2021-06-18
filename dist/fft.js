//@ts-ignore
import { wasmBinary } from "../build/fft.js";
async function init() {
    const mem = new WebAssembly.Memory({ maximum: 1, initial: 1 });
    let heap = new Uint8Array(mem.buffer);
    let brk = 0x7fff;
    const sbrk = function (size) {
        while (brk % 0x08)
            brk++;
        const old = brk;
        brk += size;
        return old;
    };
    const { instance } = await WebAssembly.instantiate(wasmBinary, {
        env: {
            table: new WebAssembly.Table({ element: "anyfunc", initial: 20 }),
            memory: mem,
            sin: Math.sin
        }
    });
    const sin_table = instance.exports.sin_table;
    const fft = instance.exports.FFT;
    const ifft = instance.exports.iFFT;
    const bitreverse = instance.exports.bit_reverse;
    const sntl = sbrk(32 * Float64Array.BYTES_PER_ELEMENT);
    sin_table(sntl, 8);
    console.log(sntl);
    const syt = new Float64Array(heap.buffer, sntl, 32);
    console.log(syt);
    const len = 32 * Float64Array.BYTES_PER_ELEMENT * 2;
    const complex = sbrk(len);
    console.log(complex);
    bitreverse(complex, 5);
    const arr = new Float64Array(heap.buffer, complex, len);
    console.log(new Float64Array(heap.buffer, complex, 64));
    console.log(new Float64Array(heap.buffer, complex, 64));
    fft(complex, 5, sntl);
    bitreverse(complex, 5);
    console.log(new Float64Array(heap.buffer, complex, 64));
    arr[0] = 1.0;
    for (let i = 1; i < 30; i++) {
        arr[i] = 0;
    }
    ifft(complex, 5, sntl);
    console.log(new Float64Array(heap.buffer, complex, 64));
}
init();
