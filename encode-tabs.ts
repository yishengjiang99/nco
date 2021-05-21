const fs = require("fs");
const ws = fs.createWriteStream("wavetables.c");

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
    if (l.trim() == "") return;
    const [real, img] = l.split("\t");
    if (real == NaN || img == NaN) return;
    rs[i] = real;
    is[i] = img;
  });
  ws.write(
    `
		static float tb_${file}_img[4096];
		tb_${file}_img=(float) {${is.join(", ")}}; \n
		static float tb_${file}_real[4096]=(float) {${rs.join(",")}};\n`
  );

  fs.writeFileSync("wvtable_pcm/" + file + "_img.pcm", is);
  fs.writeFileSync("wvtable_pcm/" + file + "_real.pcm", rs);

  //console.log(rs, is);
});
