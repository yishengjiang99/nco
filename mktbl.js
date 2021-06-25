const { execSync, spawn } = require("child_process");
const Fs = require("fs");
require("child_process")
  .execSync("ls wave-tables/original")
  .toString()
  .trim()
  .split("\n")
  //.slice(0, 1)
  .map((fp) => {
    const f = "wave-tables/original/" + fp;
    const lines = Fs.readFileSync(f).toString().trim().split("\n");
    console.log(lines.length);
    const rs = new Float32Array(2048 * 2);

    lines.map((l, i) => {
      //console.log(l);
      let ig = i - 1;
      const tok = l.split("\t");
      if (tok.length == 1) {
        console.log("line 1", tok);
      } else {
        rs[ig] = parseFloat(tok[0].trim());
        rs[2048 + ig] = parseFloat(tok[1].trim());
      }
    });
    //  console.log(rs.buffer);

    // const fname = process.argv[2].split("/").reverse().shift();
    // console.log(is);
    Fs.writeFileSync("fftbins/" + fp, new Uint8Array(rs.buffer));
    // spawn("cat fftbins/11" + fp + " |od -f").stdout.pipe(process.stdout);

    //Fs.writeFileSync("fftbins/" + fp, new Uint8Array(is.buffer)); //is.buffer);
  });
