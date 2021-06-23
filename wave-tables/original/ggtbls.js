const fs = require("fs");
for (const f of fs.readdirSync("wave-tables")) {
	const fla = new aFloat32Array(4096)
	for (const line of fs.readFileSync(f).toString().split('\n')) {
		const fl = line.trim().split("\n").map(t => parseFloat(t));
		fla[i++]
	}
}
