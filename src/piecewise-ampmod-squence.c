#include <assert.h>
#include <stdio.h>

#include "wavetable_oscillator.c"
#include "math.h"
typedef wavetable_oscillator_data wosc;
int main()
{
	init_oscillators();

	float bass[4096];
	FILE *fd = fopen("pcm/Bass_4096.pcm", "rb");
	fread(&bass[0], 4096, 4, fd);
	FILE *output = popen("ffplay -i pipe:0 -ac 1 -ar 48000", "w");
	set_midi(0, 66);

	float sustain = 0.7f;
	float fade_sequence[5] = {
			powf(2, -7973.f / 1200.0f) * SAMPLE_RATE,
			powf(2, -1586.f / 1200.0f) * SAMPLE_RATE,
			powf(2, -11999.f / 1200.0f) * SAMPLE_RATE,
			powf(2, 713.f / 1200.0f) * SAMPLE_RATE,
			powf(2, 8000.f / 1200.0f) * SAMPLE_RATE};

	float *from_wave[5] = {
			silence, silence, sinewave, sinewave, sinewave};
	float *dest_wave[5] = {silence,
												 sinewave,
												 sinewave, silence, silence};
	float dim1fade[5] = {1.0f, 1.0f, 1.0f, sustain, 1.0f};

	int state = 0;
	for (int timer = 0; state < 6 && timer < 48000 * 10; timer += 128)
	{
		if (timer > fade_sequence[state])
		{
			state++;

			oscillator[0].wave000 = from_wave[state]; //++;
			oscillator[0].wave001 = dest_wave[state];
			oscillator[0].fadeDim1 = 0.0f;
			oscillator[0].fadeDim1Increment = (float)1.0f / fade_sequence[state];
		}
		wavetable_1dimensional_oscillator(&(oscillator[0]));
		fwrite(oscillator[0].output_ptr, 128, 4, output);
	}
}