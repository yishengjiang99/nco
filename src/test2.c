#include <assert.h>
#include <stdio.h>
#include <mm_malloc.h>
#include <string.h>

#include "wavetable_oscillator.c"
typedef struct wav_header
{
	// RIFF Header
	char riff_header[4]; // Contains "RIFF"
	int wav_size;				 // Size of the wav portion of the file, which follows the first 8 bytes. File size - 8
	char wave_header[4]; // Contains "WAVE"

	// Format Header
	char fmt_header[4]; // Contains "fmt " (includes trailing space)
	int fmt_chunk_size; // Should be 16 for PCM
	short audio_format; // Should be 1 for PCM. 3 for IEEE Float
	short num_channels;
	int sample_rate;
	int byte_rate;					// Number of bytes per second. sample_rate * num_channels * Bytes Per Sample
	short sample_alignment; // num_channels * Bytes Per Sample
	short bit_depth;				// Number of bits per sample

	// Data
	char data_header[4]; // Contains "data"
	int data_bytes;			 // Number of bytes in data. Number of samples * num_channels * sample byte size
											 // uint8_t bytes[]; // Remainder of wave file is bytes
} wav_header;
int main()
{
	void *ref = init_oscillators();
	FILE *fd;
	float *piano = (float *)malloc(sizeof(float) * WAVETABLE_SIZE);
	fd = fopen("wvtable_pcm/Piano_img.pcm", "rb");
	fread(piano, sizeof(float), WAVETABLE_SIZE, fd);
	fclose(fd);

	fd = fopen("wvtable_pcm/02_Triangle_real.pcm", "rb");
	fread(oscillator[0].wave001, sizeof(float), WAVETABLE_SIZE, fd);
	fclose(fd);
	oscillator[0].wave000 = piano;
	oscillator[0].wave001 = &(squarewave[0]);
	oscillator[0].wave010 = &(sinewave[0]);
	oscillator[0].wave011 = &(silence2[0]);

	FILE *w = popen("ffplay -showmode rdft -ac 1 -ar 48000 -f f32le -i pipe:0", "w");
	set_midi(0, 44);
	oscillator[0].fadeDim1 = 0.0f;
	oscillator[0].fadeDim1Increment = 0.0f; //+55.0f / 48000;

	oscillator[0].fadeDim2 = 1.0f;
	oscillator[0].fadeDim2Increment = -55.0f / 48000;

	int n = 48000;
	while (n > 0)
	{
		wavetable_1dimensional_oscillator(&oscillator[0]);
		fwrite(oscillator[0].output_ptr, sizeof(float), SAMPLE_BLOCKSIZE, w);
		n -= SAMPLE_BLOCKSIZE;
	}
	fclose(w);
}