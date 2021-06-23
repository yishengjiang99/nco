

mocha.setup('bdd');

describe('mocha', () => {
	it('tests things', async (done) => {
		const worker = new Worker("run-fft.js", {type: "module"});
		chai.expect(worker).to.exist;
		// worker.onmessageerror = (e) => done(e);
		// await new Promise(r =>
		// 	worker.onmessage = (e) => r(e.data.sharedBuffer)
		// )
		done();
	});
});
mocha.run();