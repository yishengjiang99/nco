const fs = require("fs");

fs.readdirSync("./wave-tables/original").forEach((file) => {
  const [nnum, ...lines] = fs
    .readFileSync("./wave-tables/original/" + file)
    .toString()
    .split("\n");
  console.log(nnum);
  if (parseInt(nnum) !== 4096) return;
  const rs = new Float32Array(nnum);
  const is = new Float32Array(nnum);
  lines.forEach((l, i) => {
    const [real, img] = l.split("\t");
    rs[i] = real;
    is[i] = img;
  });
  fs.writeFileSync("wvtable_pcm/" + file + "_real.pcm", rs);
  fs.writeFileSync("wvtable_pcm/" + file + "_img.pcm", is);

  //console.log(rs, is);
});
