const fs = require("fs");
const execSync = require("child_process").execSync;
execSync("EMCC_DEBUG=1 emcc src/test.c -o test.html");
execSync("EMCC_DEBUG=1 emcc src/test.c -o test.html");

execSync(
  "npx wa-compile src/wavetable_oscillator.c -o build/wavetable_oscillator.wasm"
);

fs.writeFileSync(
  "build/wavetable_oscillator.wasm",
  /* javascript */ `
// prettier-ignore
const wasmBinary = new Uint8Array([
  ${fs.readFileSync("./wavetable_oscillator.wasm").join(",")}
]);
const _mod = new WebAssembly.Module(wasmBinary);

const mem = new WebAssembly.Memory({
  initial: 1,
  maximum: 1
});
const insts=new WebAssembly.Instance(_mod, {
  env: {
    memory: mem,
		function:aj
  },
});
export const inst.exports.lerp;
  `
);
