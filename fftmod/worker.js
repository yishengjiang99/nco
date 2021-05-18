import Module from "./fft.wasmmodule.js";

const nchannels = 16;
const channel_buffer = 128;
const fftsize = 4096;
function init(wasmModule) {
  debugger;
  const ringsize = fftsize * 4 * 2;
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
init(Module);
postMessage("init");
