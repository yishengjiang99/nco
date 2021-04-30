const fs = require("fs");

const execSync = require("child_process").execSync;
// execSync("EMCC_DEBUG=1 emcc src/test.c -o test.html");
const fns = `wavetable_2dimensional_oscillator,
wavetable_1dimensional_oscillator,
wavetable_0dimensional_oscillator,
wavetable_3dimensional_oscillator,
init_oscillators,
set_midi,
set_fade,
set_fade_delta,
malloc, free,
handle_midi_channel_msg,
audio_thread_cb`
  .split(",")
  .map((f) => "_" + f.trim());

execSync(
  `emcc src/wavetable_oscillator.c \
  -s WASM=1 \
  -s SINGLE_FILE=1 \
	-o simple-kernel.wasmmodule.js \
	--post-js es-module.js \
  -s EXPORTED_FUNCTIONS='${JSON.stringify(
    fns
  )}' -o build/wavetable_oscillator.js`
);
// );
// fs.writeFileSync(
//   `build/wavetable_oscillator.js`,
//   `const wasmBinary = new Uint8Array([
//     ${fs.readFileSync("build/wavetable_oscillator.wasm").join(",")}
//   ]);
// const module = new WebAssembly.Module(wasmBinary);
// const mem = new WebAssembly.Memory({
// initial: 100, //100 x 64k ..just putting in some safe values now
// maximum: 100
// });
// const insts=new WebAssembly.Instance(module, {
// env: {
//   memory: mem,
//    table: new WebAssembly.Table({ element: "anyfunc", initial: 2 })
// },
// });
// export const { ${fns} }=inst.exports;`
// );
