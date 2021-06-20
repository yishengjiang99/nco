import {API as Module} from '../build/wavetable_oscillator.js';
let awpport;

const osc_ref = Module.init_oscillators();
const osc_struct_size = Module.wavetable_struct_size();
const chref = (ch) => osc_ref + osc_struct_size * ch;
const structViews = [];
const soundCards = [];
const waveTableRegistry = [];
const sampleTableBuffer = (idx) => new Float32Array(Module.memory.buffer, Module.sampleTableRef(idx), 4096);
const output_ptr_index = 0,
	samples_per_block_index = 4,
	phase_index = 8,
	phaseIncrement_index = 12,
	frequencyIncrement_index = 16,
	num_fractionalBits_index = 20,
	mask_fractionalBits_index = 24,
	mask_waveIndex_index = 28,
	scaler_fractionalBits_index = 32,
	fadeDim1_index = 36,
	fadeDim1Increment_index = 40,
	fadeDim2_index = 44,
	fadeDim2Increment_index = 48,
	fadeDim3_index = 52,
	fadeDim3Increment_index = 56;
const wavetableIndices = [60, 64, 68, 72, 76, 80, 84, 88];//didn't know i could count this high.

for (let i = 0;i < 16;i++) {
	const outputPtr = new Uint32Array(Module.mem.buffer, osc_ref + osc_struct_size * i, 1)[0];
	soundCards.push(new Float32Array(Module.mem.buffer, outputPtr, 128));
	structViews.push(new DataView(Module.mem.buffer, osc_ref + osc_struct_size * i, osc_struct_size));
}

function osc_info(ref) {
	const table = new Uint8Array(Module.mem.buffer, ref, osc_struct_size);
	const [output_ptr, samples_per_block, phase, ...table1] = new Uint32Array(table.buffer, 0);
	const [phaseIncrement, frequencyIncrement, ...table2] = new Int32Array(table1.buffer, 0);
	const [num_fractionalBits, mask_fractionalBits, mask_waveIndex, ...table4] = new Uint32Array(table2.buffer, 0);
	const [scaler_fractionalBits, ...table5] = new Float32Array(table4.buffer);
	const [fadeDim1, fadeDim1Increment, fadeDim2, fadeDim2Increment, fadeDim3, fadeDim3Increment, ...wvtableRefs] = new Float32Array(table5.buffer);
	const [waveTableRefs] = new Uint32Array(wvtableRefs.buffer, 0, 8);
	return {output_ptr, samples_per_block, phase, phaseIncrement, frequencyIncrement, num_fractionalBits, mask_fractionalBits, mask_waveIndex, scaler_fractionalBits, fadeDim1, fadeDim1Increment, fadeDim2, fadeDim2Increment, fadeDim3, fadeDim3Increment, waveTableRefs};
}

let downloadableWaveTableIndex = 0;
const sampleRate = 48000;
export function onMSG(e) {
	const {
		setTable, noteOn, noteOff, setProgram, info, channel
	} = e.data;

	if (setTable) {
		const {buffer} = setTable;
		console.assert(buffer.byteLength, 4096);
		sampleTableBuffer(downloadableWaveTableIndex++).set(buffer);
	}
	if (setProgram) {
		const {tableIndex, channel, sampleTableRef} = setProgram;
		structViews[channel].setUint32(wavetableIndices[0], sampleTableRef, true);
	}
	if (noteOn) {
		const {channel, note, velocity} = noteOn;
		Module.set_midi(channel, note);
		structViews[channel].setFloat(fadeDim1_index, 0.0, true);
		structViews[channel].setFloat(fadeDim1Increment_index, 0.1 / sampleRate, true);
		structViews[channel].setFloat(fadeDim2_index, .5, true);
	}
	if (noteOff) {
		const {channel, note, velocity} = noteOn;
		structViews[channel].setFloat(fadeDim1Increment_index, -0.3 / sampleRate, true);
	}

	awpport.postMessage({osc_table: osc_info(chref(channel))});


}

export function spinOscillators(channel, ob) {
	for (let k = 0;k < 128;k += 36) {
		for (let f = 0;f < 36;f++) {
			soundCards[channel][f] = 0;
		}

		Module.wavetable_3dimensional_oscillator(osc_ref + osc_struct_size * channel);

		for (let f = 0;f < 36;f++) {
			ob[k] = soundCards[channel][k + f];
		}
	}
}
