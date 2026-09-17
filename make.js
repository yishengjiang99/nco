"use strict";
const fs = require("fs");
const { execSync } = require("child_process");

fs.mkdirSync("build", { recursive: true });

function have(cmd) {
  try {
    execSync(`command -v ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function compileWasm() {
  const out = "build/wavetable_oscillator.wasm";
  const src = "src/wavetable_oscillator.c";
  if (have("clang") && (have("wasm-ld") || have("wasm-ld-18") || have("lld"))) {
    execSync(
      [
        "clang",
        "--target=wasm32",
        "-O2",
        "-nostdlib",
        "-Wl,--no-entry",
        "-Wl,--export-all",
        "-Wl,--allow-undefined",
        "-Wl,--initial-memory=9830400",
        `-o ${out}`,
        src,
      ].join(" "),
      { stdio: "inherit" }
    );
    return;
  }
  execSync(`npx --yes wa compile ${src} -o ${out}`, { stdio: "inherit" });
}

compileWasm();

fs.writeFileSync(
  "build/wavetable_oscillator.js",
  `const wasmBinary = new Uint8Array([
    ${fs.readFileSync("build/wavetable_oscillator.wasm").join(",")}
  ]);

  const module = new WebAssembly.Module(wasmBinary);
  const env = {
    sinf: (x) => Math.sin(x),
    cosf: (x) => Math.cos(x),
    powf: (base, exp) => Math.pow(base, exp),
    exp2f: (x) => Math.pow(2, x),
    expf: (x) => Math.exp(x),
    logf: (x) => Math.log(x),
    log2f: (x) => Math.log2(x),
    sqrtf: (x) => Math.sqrt(x),
    abort: () => {},
    _abort: () => {},
  };
  const instance = new WebAssembly.Instance(module, { env });
  if (instance.exports.__wasm_call_ctors) instance.exports.__wasm_call_ctors();
  const mem = instance.exports.memory;
  if (!mem) throw new Error("wasm module did not export memory");

  export default {
    mem,
    HEAPF32: new Float32Array(mem.buffer),
    HEAPU8: new Uint8Array(mem.buffer),
    ...instance.exports,
  };
`
);
