"use strict";
describe("wavetable oscillator", () => {
    let ctx, awn;
    beforeEach(async () => { });
    it("init", async (done) => {
        ctx = new AudioContext();
        if (!ctx) {
            expect.fail("failed to init audio ctx");
        }
        await ctx.audioWorklet.addModule("web/rend-proc.js");
        awn = new AudioWorkletNode(ctx, "rendproc");
        awn.onprocessorerror = (e) => {
            console.trace(e);
        };
        awn.port.onmessageerror = (e) => Fail(e);
        ctx.suspend;
        expect(awn.port).to.exist;
    });
});
