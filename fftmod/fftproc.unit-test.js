function onNextMsg(worker,cb){
	await new Promise(resolve=>{
		worker.onmessage=({data})=>{
			cb(data);
			resolve()
		}
	});
}

mocha.setup('bdd');
describe('fftmod', () => {
	it('inituates', () => {

	});
});

mocha.run();	
chai.expect(true);
const worker=	new Worker("./fftproc.js",{"type":'module'});
onNextMsg(worker,(data)=>{
	chai.expect(data.ptr).gt(firstptr)
});