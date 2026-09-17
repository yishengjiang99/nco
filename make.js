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
  `build/wavetable_oscillator.js`,
  `// prettier-ignore
  const wasmBinary = new Uint8Array([
    ${fs.readFileSync("build/wavetable_oscillator.wasm").join(",")}
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

  const table = new WebAssembly.Table({ element: "anyfunc", initial: 61 });
  const instance = new WebAssembly.Instance(module, {
    env: {
      memory: mem,
      sinf: (x) => Math.sin(x),
      powf: (base, exp) => Math.pow(base, exp),
      table,
      sbrk,
      _abort: () => {},
      _grow: () => {
        heap = new Uint8Array(mem.buffer);
      },
      heap,
    },
  });

  export default {
    mem,
    HEAPF32: new Float32Array(mem.buffer),
    HEAPU8: new Uint8Array(mem.buffer),
    table,
    ...instance.exports,
  };
  `
);
