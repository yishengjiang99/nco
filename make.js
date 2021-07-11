'use strict';
const fs = require('fs');
const execSync = require('child_process')
  .execSync;

execSync('npx wa compile -g 3 -s 120 src/wavetable_oscillator.c -o build/wavetable_oscillator.wasm');
fs.writeFileSync(`build/wavetable_oscillator.js`, `// prettier-ignore
  export const wasmBinary = new Uint8Array([
    ${fs.readFileSync('build/wavetable_oscillator.wasm').join(',')}
  ]);
  const mem = new WebAssembly.Memory({
    initial: 150,
    maximum: 150,
  });
  let heap = new Uint8Array(mem.buffer);
  let brk = 0x7fff;
  const sbrk = function (size) {
    const old = brk;
    brk += size;
    if (brk > heap.length) {
      mem.grow(Math.ceil((brk - heap.length) / 65536));
      heap = new Uint8Array(mem.buffer);
    }
    return old;
  };
  const module = new WebAssembly.Module(wasmBinary);

  const table = new WebAssembly.Table({ element: "anyfunc", initial: 61 });
  const instance = new WebAssembly.Instance(module, {
    env: {
      memory: mem,
      sinf:(x)=>Math.sin(x),
      powf: (base, exp) => Math.pow(base, exp),
      table,
      sbrk,_abort:()=>{},
      _grow:()=>{
        heap = new Uint8Array(mem.buffer);
      },
      heap
      
    },
  });

  export const API = {
    mem,
    HEAPF32: new Float32Array(mem.buffer),
    HEAPU8: new Uint8Array(mem.buffer),
    table,
    ...instance.exports,
  };
  
  `);
//execSync("EMCC_DEBUG=1 emcc src/test.c -o test.html");
const fns = [
  'wavetable_0dimensional_oscillator',
  'wavetable_1dimensional_oscillator',
  'wavetable_2dimensional_oscillator',
  'wavetable_3dimensional_oscillator',
  'init_oscillators',
  'wavetable_struct_size',
  'set_midi',
  'malloc',
  'free',
  'handle_midi_channel_msg',
  'audio_thread_cb',
].map((fn) => `_${fn}`);
