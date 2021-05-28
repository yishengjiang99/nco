#include <assert.h>
#include <stdio.h>

#include "wavetable_oscillator.c"
int main()
{
	float *saw = oscillator[0].wave100;

	void *ref = init_oscillators();
	fread(saw, 4, 4096, fopen("./pcm/06_Warm_Saw_4096.pcm", "rb"));

	for (int i = 0; i < 17; i++)
	{
		oscillator[i].wave000 = sinewave;
		oscillator[i].wave001 = silence2;
	}
	FILE *w = popen("ffplay  -ac 1 -ar 48000 -f f32le -i pipe:0", "w");

	for (int midi = 33; midi < 70; midi++)
	{
		set_midi(0, midi);

		oscillator[0].fadeDim1Increment = 1.0f / 48000.0f;
		oscillator[0].fadeDim1 = 0.0f;

		for (int i = 0; i < 48000; i += SAMPLE_BLOCKSIZE)
		{
			wavetable_1dimensional_oscillator(&oscillator[0]);

			fwrite(oscillator[0].output_ptr, 4, SAMPLE_BLOCKSIZE, w);
			printf("\n%f", oscillator[0].fadeDim1);
		}

		//	break;
	}
	//	pclose(f);
	pclose(w);
}