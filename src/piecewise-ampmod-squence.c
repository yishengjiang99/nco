#include <assert.h>
#include <stdio.h>

#include "wavetable_oscillator.c"
#include "math.h"
typedef wavetable_oscillator_data wosc;
int main()
{
	init_oscillators();

	float instrument[4096];
	FILE *fd = fopen("pcm/Piano_4096.pcm", "rb");
	fread(sample_tables + 0, 4096, 4, fd);
	FILE *output = popen("ffmpeg -f f32le -i pipe:0 -ac 1 -ar 48000 -f WAV piano_midi66_adsr.wav", "w");
	set_midi(0, 66);

	float sustain = 0.7f;
	float fade_sequence[5] = {
			powf(2, -7973.f / 1200.0f) * SAMPLE_RATE,
			powf(2, -8000.f / 1200.0f) * SAMPLE_RATE,
			powf(2, -11999.f / 1200.0f) * SAMPLE_RATE,
			powf(2, 713.f / 1200.0f) * SAMPLE_RATE,
			powf(2, 8000.f / 1200.0f) * SAMPLE_RATE};

	float *from_wave[5] = {
			silence, silence, sample_tables, sample_tables, sample_tables};
	float *dest_wave[5] = {silence,
												 sample_tables,
												 sample_tables, silence, silence};
	float dim1fade[5] = {1.0f, 1.0f, 1.0f, 1.0f, sustain};
	float *piano_minus_5_db = sample_tables;
	int state = 0;

	for (int timer = 0; state < 4 && timer < 48000 * 10; timer += 128)
	{
		if (timer > fade_sequence[state])
		{
			state++;
			oscillator[0].wave000 = from_wave[state]; //++;
			oscillator[0].wave001 = dest_wave[state];
			oscillator[0].fadeDim1 = 0.0f;
			oscillator[0].fadeDim1Increment = (float)1.0f / fade_sequence[state];
		}

		wavetable_2dimensional_oscillator(&(oscillator[0]));
		fwrite(oscillator[0].output_ptr, 128, 4, output);
	}
}