const fs = require("fs");
const execSync = require("child_process").execSync;

function loadbin(program) {
  execSync(
    "npx wa-compile src/" + program + ".c -o build/" + program + ".wasm"
  );
  fs.writeFileSync(
    `build/${program}.js`,
    `// prettier-ignore
  const wasmBinary = new Uint8Array([
    ${fs.readFileSync("build/" + program + ".wasm").join(",")}
  ]);
  const module = new WebAssembly.Module(wasmBinary);`
  );
}
module.exports = loadbin;
