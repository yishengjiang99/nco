
export async function init_wasm({
	url,
	wasmbin
}: { url?: string, wasmbin?: Uint8Array }) {
	const mem = new WebAssembly.Memory({
		initial: 150,
		maximum: 150,
	});
	let heap = new Uint8Array(mem.buffer);
	const table = new WebAssembly.Table({ element: "anyfunc", initial: 10 });
	const importObj = {
		env: {
			memory: mem,
			sinf: (x: number) => Math.sin(x),
			powf: (base: number, exp: number) => Math.pow(base, exp),
			table,
			_abort: () => console.log('abort?'),
			_grow: () => {
				heap = new Uint8Array(mem.buffer);
			}
		}
	};

	const { instance } = url ? await WebAssembly.instantiateStreaming(fetch(url), importObj) :
		wasmbin ? await WebAssembly.instantiate(wasmbin!, importObj) : { instance: null };
	return { heap, instance };
}
export class Osc {
	struct: DataView;
	ref: number;
	heap: Uint8Array;
	constructor(heap: Uint8Array, ref: number) {
		this.struct = new DataView(heap.buffer, ref);
		this.ref = ref;
		this.heap = heap;
	}
	get rendblock() {
		return this.struct.getUint32(4, true);
	}
	get output() {
		return new Float32Array(this.heap.buffer, this.ref, this.struct.getInt32(4, true));
	}
	get phase() {
		return this.struct.getUint32(8, true);
	}
	set phase(fl: number) {
		this.struct.setUint32(8, fl, true);
	}
	get phaseIncrement() {
		return this.struct.getInt32(12, true);
	}
	set phaseIncrement(fl: number) {
		this.struct.setInt32(12, fl, true);
	}
	get phaseVelocity() {
		return this.struct.getInt32(16, true);
	}
	set phaseVelocity(fl: number) {
		this.struct.setInt32(16, fl, true);
	}
	get fadeDim1() {
		return this.struct.getFloat32(32, true)
	}
	set fadeDim1(fl: number) {
		this.struct.setFloat32(32, fl, true);
	}
	get fadeDim1Increment() {
		return this.struct.getFloat32(36, true)
	}
	set fadeDim1Increment(fl: number) {
		this.struct.setFloat32(36, fl, true);
	}
	get fadeDim2() {
		return this.struct.getFloat32(40, true)
	}
	set fadeDim2Increment(fl: number) {
		this.struct.setFloat32(40, fl, true);
	}
	get fadeDim3() {
		return this.struct.getFloat32(44, true)
	}
	set fadeDim3Increment(fl: number) {
		this.struct.setFloat32(44, fl, true);
	}
	//these are pointers to float array. hence the uint32's
	get wave000() {
		return this.struct.getUint32(48, true)
	}

	get wave001() {
		return this.struct.getUint32(52, true)
	}
	get wave010() {
		return this.struct.getUint32(56, true)
	}
	get wave011() {
		return this.struct.getUint32(60, true)
	}
	get wave100() {
		return this.struct.getUint32(64, true)
	}
	get wave101() {
		return this.struct.getUint32(68, true)
	}
	get wave110() {
		return this.struct.getUint32(72, true)
	}
	get wave111() {
		return this.struct.getUint32(76, true)
	}
	set wave000(ref: number) {
		this.struct.setUint32(48, ref, true);
	}
	set wave001(ref: number) {
		this.struct.setUint32(52, ref, true);
	}
	set wave010(ref: number) {
		this.struct.setUint32(56, ref, true);
	}
	set wave011(ref: number) {
		this.struct.setUint32(60, ref, true);
	}
	set wave100(ref: number) {
		this.struct.setUint32(64, ref, true);
	}
	set wave101(ref: number) {
		this.struct.setUint32(68, ref, true);
	}
	set wave110(ref: number) {
		this.struct.setUint32(72, ref, true);
	}
	set wave111(ref: number) {
		this.struct.setUint32(76, ref, true);
	}
}

export async function init_ctx({ heap, instance }: { heap: Uint8Array, instance: WebAssembly.Instance }) {

	const osc_ref = (instance.exports.init_oscillators as CallableFunction)();
	const osc_struct_size = (instance.exports.wavetable_struct_size as CallableFunction)();
	const oscs: Osc[] = [];
	const chref = (ch: number) => osc_ref + osc_struct_size * ch;

	for (let i = 0; i < 16; i++)
	{
		oscs.push(new Osc(heap, chref(i)));
	}
	return {
		instance,
		heap,
		wavetable_0dimensional_oscillator: instance.exports.wavetable_0dimensional_oscillator as CallableFunction,
		wavetable_1dimensional_oscillator: instance.exports.wavetable_1dimensional_oscillator as CallableFunction,
		wavetable_2dimensional_oscillator: instance.exports.wavetable_2dimensional_oscillator as CallableFunction,
		wavetable_3dimensional_oscillator: instance.exports.wavetable_3dimensional_oscillator as CallableFunction,

		sampleTableRef: instance.exports.sampleTableRef as CallableFunction,
		setMidi: instance.exports.set_midi as CallableFunction,
		setWaveTable: (flarr: Float32Array, tableIndex: number) => {
			heap.set(flarr, (instance.exports.sampleTableRef as CallableFunction)(tableIndex))
		},
		oscs,

	}
}
