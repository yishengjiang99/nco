#include "fft.c"
#include "wavetable_oscillator.c"
#include "sintbl_lut.c"
int main()
{
	FILE *fd;
	float samples[WAVETABLE_SIZE];
	float *sawtooth = (float *)malloc(sizeof(float) * WAVETABLE_SIZE);
	fd = fopen("wvtable_pcm/01_Saw_img.pcm", "rb");
	fread(sawtooth, 4, WAVETABLE_SIZE, fd);
	fclose(fd);
	init_oscillators();

#define bit32frqe(frequency) (int32_t)(BIT32_NORMALIZATION * frequency / SAMPLE_RATE + 0.5f);
	oscillator[0].wave000 = sinewave;
	oscillator[0].wave001 = sawtooth;
	oscillator[0].fadeDim1 = 0.5;
	oscillator[0].fadeDim2 = 1.0;
	// oscillator[0].wave010 = oscillator[1].output_ptr;
	// oscillator[0].wave011 = oscillator[1].output_ptr;

	//FILE *outptu = popen("ffmpeg -y -f f32le -i pipe:0 -ac 1 -ar 48000 -f wav sawtooth_3C_with_60_lfo_tremelo.wav", "w");
	FILE *outptu = popen("ffplay -f f32le -i pipe:0 -ac 1 -ar 48000", "w");

	oscillator[0].samples_per_block = 128;
	uint8_t notes[] = {60, 62, 60, 64, 60, 67};
	for (int i = 0; i < 6; i++)
	{
		set_midi(0, i + 60);
		set_midi(1, i + 60);
		oscillator[0].fadeDim1 = 0.0f;
		oscillator[0].fadeDim1Increment = 45.0f / SAMPLE_RATE;
		int pb = 48000;
		while (pb > 0)
		{
			//	wavetable_0dimensional_oscillator(&oscillator[1]);
			wavetable_1dimensional_oscillator(&oscillator[0]);
			fwrite(&oscillator[0].output_ptr, 4, 128, outptu);
			pb -= 128;
		}
	}
	pclose(outptu);
}