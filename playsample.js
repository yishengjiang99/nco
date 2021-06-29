import {draw} from '../chart.js';
// "<script type='module' src='./playsample.js'></script>";
import { fftmod } from "./fft-64bit/FFT.js";
let fftmodw;let fftInputBuffer=new Float32Array(256);
let fftspectraRef;
fftmod(12).then(mod=>{
	fftspectraRef=new Float64Array(mod.heap,mod.complexRef,2048)
	fftmodw=mod;
});
let pt, ctx, sharedBuffer;
const pcmCache = new WeakMap();
const activeChains=[];

const canvas=document.createElement("canvas");
canvas.setAttribute("width", 1029);
canvas.setAttribute("height", 300);
// const canvas2=document.createElement("canvas");
// canvas2.setAttribute("width", 300);
// canvas2.setAttribute("height", 250);

const canvasContainer=document.createElement('div');
canvasContainer.style='position:fixed;right:0;top:0px;display:grid;align-items:right';
canvasContainer.appendChild(canvas);
// canvasContainer.appendChild(canvas2);

document.body.append(canvasContainer);
const canvasDraw=draw(()=>{
	
	return new Float64Array(fftmodw.heap,fftmodw.complexRef,4096);
	
},()=>[],4096,canvas);

function renderSynth({abs, pt, lpf,modEmvelope,volumeEnveope}){
	const panel =document.querySelector("aside");
	document.querySelector("header").innerHTML= `<div>
	<span>src:${abs.playbackRate.value}</span>
	<meter value='${volumeEnveope.gain.value}' max='2'></meter>
	<span>filter cutff${lpf.frequency.value}' <input type='range' value=${lpf.frequency}></input></span>`; //+	panel.innerHTML
}

async function init(){
	document.querySelector("header").innerHTML='loading';
	ctx = new AudioContext()
	// sharedBuffer = new SharedArrayBuffer((10 + 4096 * 4) * Float64Array.BYTES_PER_ELEMENT);
	// await ctx.audioWorklet.addModule(pt_code());
};
function effectsChain(idx,ctx){
	if(!activeChains[idx]){

	}
}
async function processClicks(e) {
	if (e.target.classList.contains("fftbins"))
	{
		e.preventDefault(); playbins();
	}
	if (e.target.classList.contains("attlist"))
	{
		e.preventDefault();
		if (ctx.state == 'suspended') ctx.resume().then(() => processClicks(e));

		const attrs = e.target.getAttribute("attrs").split(",");

		document.querySelector("#details").innerHTML = attrs.map((attr, index) => `${genstrs[index]}:${attr}`).join('<br>')
		return;
	}
	if (e.target.classList.contains('pcm'))
	{
    e.preventDefault();
    const attbag = e.target.parentElement.querySelector(".attlist");
    if (attbag == null) return;
    const [sr, startloop, pitch, endloop, file, range] =
      "sr,startloop,pitch,endloop,file,range"
        .split(",")
        .map((i, id) =>
          id < 4 ? parseInt(attbag.getAttribute(i)) : attbag.getAttribute(i)
        );
    const attrs = attbag.getAttribute("zone").split(",");
    const zone = new Proxy(attrs, {
      get: (target, key) =>
        genstr().indexOf(key) > -1
          ? parseInt(target[genstr().indexOf(key)])
          : null,
    });
    const mid = parseInt(e.target.getAttribute("midi")) || zone.VelRange & 0x7f;

    const rangeHeaders = {
      headers: {
        Range: range,
      },
    };
    const cacheKey = rangeHeaders;
    if (!pcmCache.has(cacheKey)) {
      const pcm = await (await fetch(file, rangeHeaders)).arrayBuffer();
      pcmCache.set(cacheKey, pcm);
    }
    const ab = pcmCache.get(cacheKey);

    const s16tof32 = (i16) => i16 / 0xffff;

    const s16s = new Int16Array(ab);
    const audb = ctx.createBuffer(2, s16s.length, sr);
    const buffer = audb.getChannelData(0);
    for (let i = 0; i < audb.length; i++) {
      buffer[i] = s16tof32(s16s[i]);
    }
    console.log((mid * 100) / pitch);
    const abs = new AudioBufferSourceNode(ctx, {
      buffer: audb,
      playbackRate: (mid * 100) / pitch,
      loop: true,
      loopStart: startloop / sr,
      loopEnd: endloop / sr,
    });
    let lpf = new BiquadFilterNode(ctx, {
      frequency: Math.min(
        Math.pow(2, zone.FilterFc / 1200) * 8.176,
        ctx.sampleRate / 2
      ),
      Q: zone.FilterQ / 10,
      type: "lowpass",
    });
    const modEnvelope = new GainNode(ctx, { gain: 0 });

    modEnvelope.connect(lpf.frequency);
    const cent2sec = (cent) => Math.pow(2, cent / 1200);
    if (zone.ModEnvAttack > -12000) {
      modEnvelope.gain.linearRampToValueAtTime(1, cent2sec(zone.ModEnvAttack)); //Math.pow(2, (zone.ModEnvAttack) / 1200));
    } else {
      modEnvelope.gain.value = 1.0;
    }
    modEnvelope.gain.setTargetAtTime(
      1 - zone.ModEnvSustain / 1000,
      cent2sec(zone.ModEnvDecay),
      0.4
    );

    const volumeEnveope = new GainNode(ctx, { gain: 0 });

    volumeEnveope.gain.linearRampToValueAtTime(
      Math.pow(10, -zone.Attenuation / 200),
      Math.pow(2, zone.VolEnvAttack / 1200)
    );

    volumeEnveope.gain.setTargetAtTime(
      1 - zone.VolEnvSustain / 1000,
      Math.pow(2, zone.VolEnvDecay / 1200),
      0.4
    );

    // const analy = new AnalyserNode(ctx, { fftSize: 4096 });
    const ghetoproc = ctx.createScriptProcessor(256, 1, 1);

		ghetoproc.onaudioprocess=({inputBuffer,outputBuffer})=>{
			inputBuffer.copyFromChannel(outputBuffer.getChannelData(0),0);
			inputBuffer.copyFromChannel(fftInputBuffer,0);
			queueMicrotask(()=>fftmodw.inputPCM(fftInputBuffer));
			 return true;
		}
		abs
    
      .connect(volumeEnveope)
    
      .connect(lpf)
    
      .connect(ghetoproc)
    
      .connect(ctx.destination);

    abs.start();
    canvasDraw.start();
    // canvasDraw2.start();
    const timer = setInterval(() => {
			fftspectraRef=fftmodw.getFloatFrequencyData();
    }, 1);
    abs.onended = () => {
      clearInterval(timer);
      canvasDraw.stop();
    //  canvasDraw2.stop();
    };

    e.target.addEventListener(
      "mouseup",
      function () {
        volumeEnveope.gain.cancelScheduledValues(0);
        volumeEnveope.gain.exponentialRampToValueAtTime(
          0.00000001,
          cent2sec(zone.VolEnvRelease)
        );
        volumeEnveope.gain.linearRampToValueAtTime(
          0,
          cent2sec(zone.VolEnvRelease) + 1
        );
        abs.stop(cent2sec(zone.VolEnvRelease) + 1);
      },
      { once: true }
    );
  }
}
init();
window.onmousedown=processClicks;

const genstr = () => ["StartAddrOfs", "EndAddrOfs", "StartLoopAddrOfs", "EndLoopAddrOfs", "StartAddrCoarseOfs", "ModLFO2Pitch", "VibLFO2Pitch", "ModEnv2Pitch", "FilterFc", "FilterQ", "ModLFO2FilterFc", "ModEnv2FilterFc", "EndAddrCoarseOfs", "ModLFO2Vol", "Unused1", "ChorusSend", "ReverbSend", "Pan", "Unused2", "Unused3", "Unused4", "ModLFODelay", "ModLFOFreq", "VibLFODelay", "VibLFOFreq", "ModEnvDelay", "ModEnvAttack", "ModEnvHold", "ModEnvDecay", "ModEnvSustain", "ModEnvRelease", "Key2ModEnvHold", "Key2ModEnvDecay", "VolEnvDelay", "VolEnvAttack", "VolEnvHold", "VolEnvDecay", "VolEnvSustain", "VolEnvRelease", "Key2VolEnvHold", "Key2VolEnvDecay", "Instrument", "Reserved1", "KeyRange", "VelRange", "StartLoopAddrCoarseOfs", "Keynum", "Velocity", "Attenuation", "Reserved2", "EndLoopAddrCoarseOfs", "CoarseTune", "FineTune", "SampleId", "SampleModes", "Reserved3", "ScaleTune", "ExclusiveClass", "OverrideRootKey", "Dummy"];
function pt_code() {
	return URL.createObjectURL(new Blob([`class PtProc extends AudioWorkletProcessor {
		constructor(options) {
			super(options);
			// this.woffset = woffset;
			// this.timestampOffset = timestampOffset;
				this.disk = new Float64Array(options.processorOptions.sharedBuffer);
				this.wptr=0;
		}
		process(inputList, outputList) {
			//@ts-ignore
			if(inputList[0] && inputList[0][0]){
				outputList[0][0].set(inputList[0][0]);
				// for(let i=0;i<inputList[0][0].length; i++){
				// 	this.disk[this.wptr+=2]=inputList[0][0];
				// }
				// if(this.wptr>4096*2) this.wptr=0;
			}

			return true;
		}
	}
	// @ts-ignore
	registerProcessor("pt", PtProc);`], { 'type': 'application/javascript' }));
}

function playbins(e) {

	// rctx = rctx || new AudioContext();
	// const real = e.target.getAttribute("real").split(",");
	// const imag = e.target.getAttribute("img").split(",");
	// let ctx = new OfflineAudioContext({
	// 	numberOfChannels: 1,
	// 	length: 4096,
	// 	sampleRate: 4096,
	// });

	// let osc = new OscillatorNode(ctx, {
	// 	type: "custom",
	// 	periodicWave: new PeriodicWave(ctx, {
	// 		imag, real
	// 	}),
	// 	frequency: 1,
	// });
	// osc.connect(ctx.destination);
	// osc.start();
	// osc.stop(1.0);
	// const ab = (await ctx.startRendering());
	// const abs = new AudioBufferSourceNode(rctx, {buffer: ab, loop: true});
	// abs.start(); abs.stop(1);
	// const curve = ab.getChannelData(0);
	// //	chart(curve, document.querySelector("canvas"));
	// return;
}