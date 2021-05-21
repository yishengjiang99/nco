const fs = require("fs");

const ws = fs.createWriteStream("sample_tables.c");

const files = fs.readdirSync("./offline-periodicwaves/pcm");
ws.write(`
typedef struct
{
	float pcm[4096];
	char name[20];
	short coarseTune, fineTune, originalPitch;
	uint8_t lo_key, hi_key;
} sample_table;
static sample_table smpls[${files.length}];`);

files.forEach((file: string, idx: any) => {
  const pcm = new Float32Array(
    fs.readFileSync("./offline-periodicwaves/pcm/" + file).buffer
  );

  ws.write(
    `smpls[${idx}].name = "${file}";\n
		smpls[${idx}].pcm = (float){
			${pcm.join(", ")}
		}; \n`
  );
});
ws.end();

require("child_process").execSync(
  "npx wa compile sample_tables.c src/wavetable_oscillator.c -o build/wavetable_oscillator.wasm"
);

fs.writeFileSync(
  `build/wavetable_oscillator.js`,
  `// prettier-ignore
  const wasmBinary = new Uint8Array([
    ${fs.readFileSync("build/wavetable_oscillator.wasm").join(",")}
  ]);
  const module = new WebAssembly.Module(wasmBinary);
  const mem = new WebAssembly.Memory({
    initial: 100, //100 x 64k ..just putting in some safe values now
    maximum: 100,
  });
  const instance = new WebAssembly.Instance(module, {
    env: {
      memory: mem,
      sinf:(x)=>Math.sin(x),
      powf: (base, exp) => Math.pow(base, exp),
      table: new WebAssembly.Table({ element: "anyfunc", initial: 6 }),
    },
  });

  export default {
    mem,
    HEAPU8: new Uint8Array(mem.buffer),
    ...instance.exports,
  };
  
  `
);

const execSync = require("child_process").execSync;
// execSync("EMCC_DEBUG=1 emcc src/test.c -o test.html");
const fns = [
  "wavetable_0dimensional_oscillator",
  "wavetable_1dimensional_oscillator",
  "wavetable_2dimensional_oscillator",
  "wavetable_3dimensional_oscillator",
  "init_oscillators",
  "wavetable_struct_size",
  "set_midi",
  "malloc",
  "free",
  "handle_midi_channel_msg",
  "audio_thread_cb",
].map((fn) => `_${fn}`);
