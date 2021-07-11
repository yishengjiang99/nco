import {init_wasm } from "./wavetable-interface.js";

let oscillators;
let soundcards;
let spin;
async function gg(){
	const mod =await init_wasm();
	soundcards = mod.oscs.map(o=>o.output);

	oscillators = mod.oscs;

	document.body.innerHTML='press any key rec: a,s,d,f,g,w,e ';
}

window.onkeydown=()=>{
	const ctx=new AudioContext();
	ctx.audioWorklet.addModule("./audio-thread.js");
	const octx = new AudioContext();
	octx.suspend();
	
}

gg();