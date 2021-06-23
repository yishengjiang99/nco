
const genstrs = ["StartAddrOfs", "EndAddrOfs", "StartLoopAddrOfs", "EndLoopAddrOfs", "StartAddrCoarseOfs", "ModLFO2Pitch", "VibLFO2Pitch", "ModEnv2Pitch", "FilterFc", "FilterQ", "ModLFO2FilterFc", "ModEnv2FilterFc", "EndAddrCoarseOfs", "ModLFO2Vol", "Unused1", "ChorusSend", "ReverbSend", "Pan", "Unused2", "Unused3", "Unused4", "ModLFODelay", "ModLFOFreq", "VibLFODelay", "VibLFOFreq", "ModEnvDelay", "ModEnvAttack", "ModEnvHold", "ModEnvDecay", "ModEnvSustain", "ModEnvRelease", "Key2ModEnvHold", "Key2ModEnvDecay", "VolEnvDelay", "VolEnvAttack", "VolEnvHold", "VolEnvDecay", "VolEnvSustain", "VolEnvRelease", "Key2VolEnvHold", "Key2VolEnvDecay", "Instrument", "Reserved1", "KeyRange", "VelRange", "StartLoopAddrCoarseOfs", "Keynum", "Velocity", "Attenuation", "Reserved2", "EndLoopAddrCoarseOfs", "CoarseTune", "FineTune", "SampleId", "SampleModes", "Reserved3", "ScaleTune", "ExclusiveClass", "OverrideRootKey", "Dummy"];
const attrsym = genstrs.map(str => Symbol(str));

let cstx;
const pcmCache = new WeakMap();
document.body.onclick = async (e) => {
	if (e.target.classList.contains("fftbins")) {
		e.preventDefault();

		rctx = rctx || new AudioContext();
		const real = e.target.getAttribute("real").split(",");
		const imag = e.target.getAttribute("img").split(",");
		let ctx = new OfflineAudioContext({
			numberOfChannels: 1,
			length: 4096,
			sampleRate: 4096,
		});

		let osc = new OscillatorNode(ctx, {
			type: "custom",
			periodicWave: new PeriodicWave(ctx, {
				imag, real
			}),
			frequency: 1,
		});
		osc.connect(ctx.destination);
		osc.start();
		osc.stop(1.0);
		const ab = (await ctx.startRendering());
		const abs = new AudioBufferSourceNode(rctx, {buffer: ab, loop: true});
		abs.start(); abs.stop(1);
		const curve = ab.getChannelData(0);
		//	chart(curve, document.querySelector("canvas"));
		return;
	}
	if (e.target.classList.contains("attlist")) {
		e.preventDefault();

		const attrs = e.target.getAttribute("attrs").split(",");

		document.querySelector("#details").innerHTML = attrs.map((attr, index) => `${genstrs[index]}:${attr}`).join('<br>')
		return;
	}
	if (e.target.classList.contains('pcm')) {
		e.preventDefault();

		const sr = e.target.getAttribute('sr');
		const startloop = parseInt(e.target.getAttribute("startloop"))
		const endloop = parseInt(e.target.getAttribute("endloop"))
		const pitch = e.target.getAttribute("pitch");
		const file = e.target.getAttribute('file');
		const mid = e.target.getAttribute('midi') || 55;
		const range = e.target.getAttribute('range');
		const attrs = e.target.parentElement.parentElement.querySelector(".attlist")
			.getAttribute("attrs").split(",");
		const zone = new Proxy(attrs, {
			get: (target, key) => genstrs.indexOf(key) > -1
				? parseInt(target[genstrs.indexOf(key)])
				: null
		})
		const rangeHeaders = {
			headers: {
				Range: range
			}
		};
		const cacheKey = rangeHeaders;
		if (!pcmCache.has(cacheKey)) {
			const pcm = await (await fetch(file, rangeHeaders)).arrayBuffer();
			pcmCache.set(cacheKey, pcm);
		}
		const ab = pcmCache.get(cacheKey)


		const s16tof32 = (i16) => i16 / 0xffff;
		cstx = cstx || new AudioContext({sampleRate: sr});
		const ctx = new OfflineAudioContext(1, 4096, 4096); // new AudioContext({sampleRate: sr});

		const s16s = new Int16Array(ab)
		// const audb = ctx.createBuffer(1, s16s.length, sr);
		// const buffer = audb.getChannelData(0);
		const rolls = [new Float32Array(startloop), new Float32Array(endloop - startloop)].map(ab =>
			ctx.createBuffer(2, ab.length, sr)
		);
		for (let i = 0;i < s16s.length;i++) {
			if (i < startloop + 128) rolls[0][i] = s16tof32(s16s[i]);
			if (i > startloop) rolls[1][i] = s16tof32(s16s[i]);
		}
		const tapes = rolls.map((adb, idx) =>
			new AudioBufferSourceNode(ctx, {
				loop: idx == 1, buffer: adb
			})
		);

		let lpf = new BiquadFilterNode(ctx,
			{
				frequency: Math.min(Math.pow(2, zone.FilterFc / 1200) * 8.176, ctx.sampleRate / 2),
				Q: zone.FilterQ / 10,
				type: "lowpass"
			});
		const modEnvelope = new GainNode(ctx, {gain: 0});

		modEnvelope.connect(lpf.frequency);
		const cent2sec = (cent) => Math.pow(2, cent / 1200);
		if (zone.ModEnvAttack > -12000) {

			modEnvelope.gain.linearRampToValueAtTime(1, cent2sec(zone.ModEnvAttack)); //Math.pow(2, (zone.ModEnvAttack) / 1200));
		} else {
			modEnvelope.gain.value = 1.0;
		}
		modEnvelope.gain.setTargetAtTime(1 - zone.ModEnvSustain / 1000, cent2sec(zone.ModEnvDecay), .4);

		const volumeEnveope = new GainNode(ctx, {gain: 0});

		volumeEnveope.gain.linearRampToValueAtTime(
			Math.pow(10, -zone.Attenuation / 200),
			Math.pow(2, (zone.VolEnvAttack) / 1200));

		volumeEnveope.gain.setTargetAtTime(1 - zone.VolEnvSustain / 1000, Math.pow(2, zone.VolEnvDecay / 1200), .4);
		// abs.connect(volumeEnveope).connect(lpf).connect(ctx.destination);
		tapes[0].connect(volumeEnveope).connect(lpf).connect(ctx.destination);
		//tapes[1].connect(volumeEnveope)
		tapes[0].start();
		tapes[0].onended = () => {
			tapes[1].start();
		}
		ctx.startRendering().then(abb => {
			const arraybuffer = abb.getChannelData(0).buffer
			window.fftWorker.postMessage({
				arraybuffer
			}, [arraybuffer]);


			e.target.addEventListener("mouseup", function () {
				volumeEnveope.gain.cancelScheduledValues(0);
				volumeEnveope.gain.exponentialRampToValueAtTime(.00000001, cent2sec(zone.VolEnvRelease));
				volumeEnveope.gain.linearRampToValueAtTime(0, cent2sec(zone.VolEnvRelease) + 1);



			}, {once: true});
			return false;
		});
	}
}