'use strict';
const fs = require('fs');

require('child_process')
    .execSync(
        'npx wa compile src/wavetable_oscillator.c -o build/wavetable_oscillator.wasm');
require('child_process').execSync('npx wa compile src/fft.c -o build/fft.wasm');

fs.writeFileSync(`build/wavetable_oscillator.js`, `// prettier-ignore
  export const wasmBinary = new Uint8Array([
    ${fs.readFileSync('build/wavetable_oscillator.wasm').join(',')}
  ]);
  `);
fs.writeFileSync(`build/fft.js`, `// prettier-ignore
  export const wasmBinary = new Uint8Array([
    ${fs.readFileSync('build/fft.wasm').join(',')}
  ]);
  `);
