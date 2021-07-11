import Module from "./fft.wasmmodule.js";
const nchannels = 16;
const channel_buffer = 128;
const fftsize = 4096;

export function init(wasmModule, blocksize, fftsize, bytes_per_sample) {
  const ringsize = fftsize * bytes_per_sample * 2;
  const dataPtr = wasmModule._malloc(ringsize);
  const statePtr = wasmModule._malloc(2 * Uint32Array.BYTES_PER_ELEMENT);
  const sin_table = wasmModule._malloc(1024 * Float64Array.BYTES_PER_ELEMENT);
  const startAddr = dataPtr << 3; //byte offset for bit64;
  const i64bytesize = Float64Array.BYTES_PER_ELEMENT;
  const dataArray = wasmModule.HEAPF64.subarray(
    startAddr,
    startAddr + ringsize
  );

  const stateArray = wasmModule.HEAPU32.subarray(
    statePtr << 2,
    statePtr << (2 + 2 * Uint32Array.BYTES_PER_ELEMENT)
  );
  const ringbuf = {
    get wptr() {
      return Atomics.get(stateArray, 0);
    },
    set wptr(val) {
      if (val) Atomics.set(stateArray, 0, val);
    },
    get rptr() {
      return Atomics.get(stateArray, 1);
    },
    set rptr(val) {
      return Atomics.set(stateArray, 1, val);
    },
  };

  function pushInput(floatArr) {
    console.assert((floatArr.byteLength = 128 * 4));
    const startPtr = dataPtr + wptr;
    for (let i = 0; i < floatArr.length; i++) {
      dataArray[startPtr + i] = floatArr[i];
      dataArray[startPtr + i + 1] = 0;
    }
  }
  function pullFilterResult(outputArray, imaginary) {
    const startPtr = dataPtr + rptr;
    for (let i = 0; i < outputArray.length; i++) {
      outputArray[i] = fwasmModule.getValue(dataPtr + rptr, "f64", true);
      ringbuff.rptr += i64bytesize;
      imaginary[i] = fwasmModule.getValue(dataPtr + rptr, "f64", true);
      ringbuff.rptr += i64bytesize;
    }
  }

  function fftcall(start, end) {
    Module._ccall("FFT", dataArray.subarray(start, end));
  }
  return {
    pushInput,
    ringbuf,
    pullFilterResult,
  };
}
class FFTProc extends AudioWorkletProcessor {
  constructor() {
    super();
   this.fftmod=init();
  }
  process(inputs, outputs){
    const input[0][0]; //first channel of first input
    this.fftmod.pushInput(input[0][0]);
    
  }
}

// /**
//  * A simple demonstration of WASM-powered AudioWorkletProcessor.
//  *
//  * @class WASMWorkletProcessor
//  * @extends AudioWorkletProcessor
//  */
// class WASMWorkletProcessor extends AudioWorkletProcessor {
//   /**
//    * @constructor
//    */
//   constructor() {
//     super();

//     // Allocate the buffer for the heap access. Start with stereo, but it can
//     // be expanded up to 32 channels.
//     this._heapInputBuffer = new HeapAudioBuffer(
//       Module,
//       RENDER_QUANTUM_FRAMES,
//       2,
//       MAX_CHANNEL_COUNT
//     );
//     this._heapOutputBuffer = new HeapAudioBuffer(
//       Module,
//       RENDER_QUANTUM_FRAMES,
//       2,
//       MAX_CHANNEL_COUNT
//     );

//     this._kernel = new Module.SimpleKernel();
//   }

//   /**
//    * System-invoked process callback function.
//    * @param  {Array} inputs Incoming audio stream.
//    * @param  {Array} outputs Outgoing audio stream.
//    * @param  {Object} parameters AudioParam data.
//    * @return {Boolean} Active source flag.
//    */
//   process(inputs, outputs, parameters) {
//     // Use the 1st input and output only to make the example simpler. |input|
//     // and |output| here have the similar structure with the AudioBuffer
//     // interface. (i.e. An array of Float32Array)
//     let input = inputs[0];
//     let output = outputs[0];

//     // For this given render quantum, the channel count of the node is fixed
//     // and identical for the input and the output.
//     let channelCount = input.length;

//     // Copy-in, process and copy-out.
//     for (let channel = 0; channel < channelCount; ++channel) {
//       this._heapInputBuffer.getChannelData(channel).set(input[channel]);
//     }
//     this._kernel.process(
//       this._heapInputBuffer.getHeapAddress(),
//       this._heapOutputBuffer.getHeapAddress(),
//       channelCount
//     );
//     for (let channel = 0; channel < channelCount; ++channel) {
//       output[channel].set(this._heapOutputBuffer.getChannelData(channel));
//     }

//     return true;
//   }
// }

// registerProcessor("wasm-worklet-processor", WASMWorkletProcessor);
