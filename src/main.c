#include "wavetable_oscillator.c"
#include <stdio.h>
#include <stdlib.h>
#define twoPI 6.2830f
#define sampleRate 48000
#define frac_bits 16
#define blocksize 1280
#define freq_increment(freqHZ) (1 << frac_bits) / sampleRate *freqHZ
int main()
{
	FILE *output;
	FILE *samp1 = fopen("./wvtbl/Piano_real.pcm", "rb");

	wavetable_oscillator_data data;
	data.output_ptr = (float *)malloc(blocksize * sizeof(float));
	data.num_fractionalBits = frac_bits;
	data.scaler_fractionalBits = 2 ^ (-1 * frac_bits);
	data.mask_fractionalBits = 0xffff - 1;
	data.mask_waveIndex = 0x0fff;
	data.phase = 0;
	data.fadeDim1 = 1;
	data.fadeDim1Increment = 1;
	data.wave000 = (float *)malloc(44100 * sizeof(float));
	fread(data.wave000, 4, 44100, samp1);
	data.samples_per_block = blocksize;
	data.phaseIncrement = 48000;

	output = popen("ffplay -f f32le -ac 1 -ar 48k -i pipe:0", "w");
	data.frequencyIncrement = 440 * twoPI / sampleRate;
	for (int i = 0; i < 48000; i += data.samples_per_block)
	{
		wavetable_0dimensional_oscillator(&data);
		fwrite(data.output_ptr, sizeof(float), data.samples_per_block, output);
	}

	data.frequencyIncrement = 440 * twoPI / sampleRate;
	;
	for (int i = 0; i < 48000; i += data.samples_per_block)
	{
		wavetable_0dimensional_oscillator(&data);
		fwrite(data.output_ptr, sizeof(float), data.samples_per_block, output);
	}
	data.frequencyIncrement = 440 * twoPI / sampleRate;
	for (int i = 0; i < 48000; i += data.samples_per_block)
	{
		wavetable_0dimensional_oscillator(&data);
		fwrite(data.output_ptr, sizeof(float), data.samples_per_block, output);
	}

	pclose(output);
}