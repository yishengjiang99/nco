'use strict';
const fs = require('fs');
const execSync = require('child_process').execSync;

execSync(
  'npx wa compile -g3 -b src/wavetable_oscillator.c -o build/wavetable_oscillator.wasm');
fs.writeFileSync(`build/wavetable_oscillator.js`, `
// prettier-ignore
  const wasmBinary = new Uint8Array([
    ${fs.readFileSync('build/wavetable_oscillator.wasm').join(',')}
  ]);
  const mem = new WebAssembly.Memory({
    initial: 150,
    maximum: 150,
  });
  let heap = new Uint8Array(mem.buffer);
  let brk = 0;
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

  const table = new WebAssembly.Table({ element: "anyfunc", initial: 1 });
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
      memset:(dest,len,val)=>{
        heap.set(dest, val, len);
      },
      heap
    },
  });


export const API = {
  mem,
  HEAPF32: new Float32Array(mem.buffer),
  HEAPU8: new Uint8Array(mem.buffer),
  table,
  malloc:sbrk,
  ...instance.exports,
};

`);