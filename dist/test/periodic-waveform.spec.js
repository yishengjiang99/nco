import { loadPeriodicForms } from "../dist/periodic-waveform.js";
describe('oadPiodicform', () => {
    it('turns fftbins into pcm', () => {
        loadPeriodicForms("01_Saw").then(r => {
            chai.expect(r.byteLength).eq(4096);
        });
    });
});
