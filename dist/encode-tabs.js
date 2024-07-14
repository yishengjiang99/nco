"use strict";
const wss = require("fs").createWriteStream("wavetables.c");
function step1() {
    fs.readdirSync("./wave-tables/original").forEach((file) => {
        const [nnum, ...lines] = fs
            .readFileSync("./wave-tables/original/" + file)
            .toString()
            .split("\n");
        if (parseInt(nnum) !== 4096)
            return;
        const rs = new Float32Array(nnum);
        const is = new Float32Array(nnum);
        lines.forEach((l, i) => {
            if (l.trim() == "")
                return;
            const [real, img] = l.split("\t");
            if (real == NaN || img == NaN)
                return;
            rs[i] = real;
            is[i] = img;
        });
        ws.write(`
      static float tb_${file}_img[4096];
      tb_${file}_img=(float) {${is.join(", ")}}; \n
      static float tb_${file}_real[4096]=(float) {${rs.join(",")}};\n`);
        fs.writeFileSync("wvtable_pcm/" + file + "_img.pcm", is);
        fs.writeFileSync("wvtable_pcm/" + file + "_real.pcm", rs);
        //console.log(rs, is);
    });
}
function stop2() {
    fs.readdirSync("./pcm/").forEach((file) => {
        if (!file.endsWith("_4096.pcm") ||
            fs.statSync("./pcm/" + file).size != 4096 * Float32Array.BYTES_PER_ELEMENT)
            return;
        const pcm = fs.readFileSync("./pcm/" + file);
        fs.writeFileSync("tb_" + file + ".c", `static float ${file}[1024]={
      ${new Float32Array(pcm).join("f,")}
    }`);
    });
}
stop2();
