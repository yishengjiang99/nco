#include <assert.h>
#include <stdio.h>

#include "app.c"
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
	assert(&oscillator[0] != NULL);
	assert(&oscillator[NUM_OSCILLATORS - 1] != NULL);
	float fades[3] = {.1f};

	set_midi(0, 60);
	wavetable_1dimensional_oscillator(&oscillator[0]);

#define printout()                                                                                       \
	{                                                                                                      \
		printf("\n %u,%u,%p ", oscillator[0].phase, oscillator[0].phaseIncrement, oscillator[0].output_ptr); \
		for (int i = 0; i < SAMPLE_BLOCKSIZE; i++)                                                           \
			printf("\n%u, %f, %04f ", oscillator[0].phase, oscillator[0].fadeDim1, output_samples[0][i]);      \
	}
	FILE *w = popen("ffmpeg -y -ac 1 -f f32le -i pipe:0 -f wav sweep_midi_35_70_sine_square_cross.wav", "w");

	for (int midi = 35; midi < 70; midi++)
	{
		set_midi(0, midi);
		for (int i = 0; i < 24000; i += 128)
		{
			wavetable_1dimensional_oscillator(&oscillator[0]);
			//	fwrite(oscillator[0].output_ptr, 4, 128, f);
			fwrite(oscillator[0].output_ptr, 4, 128, w);
		}
	}
	//	pclose(f);
	pclose(w);
}