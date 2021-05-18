#include "./src/fft.c"
#include "stbl.c"

int n = 1024;
#include "src/wavetable_oscillator.c"

int main()
{
	FILE *fd;
	float samples[WAVETABLE_SIZE];
	float *piano = (float *)malloc(sizeof(float) * WAVETABLE_SIZE);
	fd = fopen("wvtable_pcm/Piano_real.pcm", "rb");
	fread(piano, 4, WAVETABLE_SIZE, fd);
	fclose(fd);
	float *pianoimg = (float *)malloc(sizeof(float) * WAVETABLE_SIZE);
	fd = fopen("wvtable_pcm/Piano_img.pcm", "rb");
	fread(pianoimg, 4, WAVETABLE_SIZE, fd);
	init_oscillators();
	complex c[4096];
	for (int i = 0; i < WAVETABLE_SIZE; i++)
	{
		c[i] = (complex){piano[i], pianoimg[i]};
	}
	set_midi(0, 66);
	// iFFT(&(c[0]), WAVETABLE_SIZE, stbl);
	float pianoIFFT[WAVETABLE_SIZE];
	for (int i = 0; i < WAVETABLE_SIZE; i++)
	{
		pianoIFFT[i] = c[i].real; //, c[i].imag);
	}
	oscillator[0].wave000 = &(pianoIFFT[0]);
	FILE *outptu = popen("ffplay -ac 1 -i pipe:0 -f f32le", "w");
	oscillator[0].samples_per_block = 12000;
	int pb = 48000;
	while (pb > 0)
	{
		wavetable_0dimensional_oscillator(&oscillator[0]);
		fwrite(oscillator[0].output_ptr, 4, SAMPLE_BLOCKSIZE, outptu);
		pb -= SAMPLE_BLOCKSIZE;
	}

	// iFFT(&(tbls[0]), n, stbl);
	// for (int i = 0; i < n; i++)
	// {
	// 	printf("\n %f %f", tbls[i].real, tbls[i].imag);
	// 	fwrite(tbls[i].imag, );
	// }
	pclose(outptu);
}