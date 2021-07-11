import {init_wasm, init_ctx, Osc} from "../web/wavetable-oscillator.js"
import {wasmBinary} from "../build/wavetable_oscillator.js";
const expect = chai.expect;
let _instance, _heap;
describe('init_wasm', () => {
	//build / wavetable_oscillator.js
	it('turns url into heap+callabe api functions', done => {
		init_wasm({wasmbin: wasmBinary}).then(({heap, instance}) => {
			expect(heap).exist;
			_heap = heap;
			_instance = instance;
			expect(instance).exist;
			expect(heap.byteLength).gt(150 * 0xffff);
			expect(instance.exports.init_oscillators).exist
			done();
		})
	})
	// it('alternatively, turns wasmbinary (uint8array) into heap+callabe api functions', done => {
	// 	init_wasm({wasmbin: wasmBinary}).then(({heap, instance}) => {
	// 		expect(heap).exist;
	// 		expect(instance).exist;
	// 		expect(heap.byteLength).gt(150 * 0xffff);
	// 		expect(instance.exports.init_oscillators).exist

	// 		done();
	// 	})
	// })
});
describe('Osc', () => {

	it('it constructs from heap and ref', () => {
		const heap = new Uint8Array(0xffff);
		const ref = 0;
		const osc = new Osc(heap, ref);
		chai.expect(osc).exist;
		osc.fadeDim1 = 0;
		expect(osc.fadeDim1).eq(0);
		expect(osc.wave000).eq(0);
	})
});
const line = (points) => `
<svg viewBox="0 0 500 100" class="chart">
<polyline
	 fill="none"
	 stroke="#0074d9"
	 stroke-width="3"
	 points="${points.map((p, i) => `${i},${p} `)}"/>
</svg>`;
describe('end-to-end', () => {
	let oscs, heap, api;


	it('instantiate wasm module and call its api', () => {
		expect(oscs.length).eq(16);
		document.body.append('tb+' + oscs[0].wave000 + "" + oscs[0].wave011);
		console.log(oscs[0].wave000);

		expect(oscs[0].wave000);


		api.setMidi(0, 1);
		oscs[0].fadeDim1 = 1.0;
		expect(oscs[0].phaseIncrement - new Int32Array([(440 * 4294967296.0) / 48000.0])[0]).lt(2);
		const phase1 = oscs[0].phase;
		document.body.innerHTML += oscs[0].phases + "<br>" + oscs[0].fadeDim1;
		api.wavetable_1dimensional_oscillator(oscs[0].ref);
		document.body.innerHTML += oscs[0].output.join("<br>");
		api.wavetable_1dimensional_oscillator(oscs[0].ref);
		api.wavetable_1dimensional_oscillator(oscs[0].ref);
		api.wavetable_1dimensional_oscillator(oscs[0].ref); document.body.innerHTML += oscs[0].output.join("<br>");


	});
});
// mocha.run();
