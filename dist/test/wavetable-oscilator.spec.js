import { init_wasm, init_ctx, Osc } from "./wavetable-oscillator.js";
const expect = chai.expect;
describe('init_wasm', () => {
    it('turns url into heap+callabe api functions', done => {
        init_wasm({ url: "build/wavetable_oscillator.wasm" }).then(({ heap, instance }) => {
            expect(heap).exist;
            expect(instance).exist;
            expect(heap.byteLength).gt(150 * 0xffff);
            expect(instance.exports.init_oscillators).exist;
            done();
        });
    });
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
    });
});
describe('end-to-end', () => {
    let oscs, heap, api;
    before((done) => {
        init_wasm({ url: "build/wavetable_oscillator.wasm" }).then(init_ctx).then(ret => {
            oscs = ret.oscs;
            api = ret;
            done();
        });
    });
    it('instantiate wasm module and call its api', () => {
        expect(oscs.length).eq(16);
        api.setMidi(0, 1);
        expect(oscs[0].phaseIncrement - new Int32Array([(440 * 4294967296.0) / 48000.0])[0]).lt(2);
        const phase1 = oscs[0].phase;
        api.wavetable_1dimensional_oscillator(oscs[0].ref);
    });
    mocha.run();
});
