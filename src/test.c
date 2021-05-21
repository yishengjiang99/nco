#include <assert.h>
#include <stdio.h>

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
	for (int i = 0; i < 17; i++)
	{
		oscillator[i].wave000 = sinewave;
		oscillator[i].wave001 = squarewave;
	}
	FILE *w = popen("ffplay  -ac 2 -ar 48000 -f f32le -i pipe:0", "w");

	for (int midi = 60; midi < 70; midi++)
	{
		set_midi(0, midi);
		oscillator[0].fadeDim1Increment = 1.0f / 48000.0f;
		oscillator[0].fadeDim1 = 0.0f;

		for (int i = 0; i < 48000; i += SAMPLE_BLOCKSIZE)
		{
			wavetable_1dimensional_oscillator(&oscillator[0]);
			//	fwrite(oscillator[0].output_ptr, 4, 128, f);
			fwrite(oscillator[0].output_ptr, 4, SAMPLE_BLOCKSIZE, w);
			printf("\n%f", oscillator[0].fadeDim1);
		}
		break;
		//	break;
	}
	//	pclose(f);
	pclose(w);
}