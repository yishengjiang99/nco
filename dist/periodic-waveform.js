export const tbs = [
    "01_Saw",
    "02_Triangle",
    "03_Square",
    "04_Noise",
    "05_Pulse",
    "06_Warm_Saw",
    "07_Warm_Triangle",
    "08_Warm_Square",
    "09_Dropped_Saw",
    "10_Dropped_Square",
    "11_TB303_Square",
    "Bass_Amp360",
    "Bass_Fuzz_ 2",
    "Bass_Fuzz",
    "Bass_Sub_Dub_2",
    "Bass_Sub_Dub",
    "Bass",
    "Brass",
    "Brit_Blues_Driven",
    "Brit_Blues",
    "Buzzy_1",
    "Buzzy_2",
    "Celeste",
    "Chorus_Strings",
    "Dissonant Piano",
    "Dissonant_1",
    "Dissonant_2",
    "Dyna_EP_Bright",
    "Dyna_EP_Med",
    "Ethnic_33",
    "Full_1",
    "Full_2",
    "Guitar_Fuzz",
    "Harsh",
    "Mkl_Hard",
    "Organ_2",
    "Organ_3",
    "Phoneme_ah",
    "Phoneme_bah",
    "Phoneme_ee",
    "Phoneme_o",
    "Phoneme_ooh",
    "Phoneme_pop_ahhhs",
    "Piano",
    "Putney_Wavering",
    "Throaty",
    "Trombone",
    "Twelve String Guitar 1",
    "Twelve_OpTines",
    "Wurlitzer_2",
    "Wurlitzer",
];
export async function loadPeriodicForms(tablename) {
    let ctx = new OfflineAudioContext({
        numberOfChannels: 1,
        length: 4096,
        sampleRate: 4096,
    });
    let osc = new OscillatorNode(ctx, {
        type: "custom",
        periodicWave: new PeriodicWave(ctx, {
            imag: new Float32Array(await (await fetch("wvtable_pcm/" + tablename + "_img.pcm")).arrayBuffer()),
            real: new Float32Array(await (await fetch("wvtable_pcm/" + tablename + "_real.pcm")).arrayBuffer()),
        }),
        frequency: 1,
    });
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(1.0);
    return (await ctx.startRendering()).getChannelData(0);
}
export async function fft(fl) {
}
