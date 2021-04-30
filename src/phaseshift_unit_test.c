#include <stdint.h>
#include <stdlib.h>
#include <stdio.h>
#include <math.h>

#define LOG2_WAVETABLE_SIZE 12
#define NUM_FRACTIONAL_BITS (32 - LOG2_WAVETABLE_SIZE)
#define MASK_FRACTIONAL_BITS (1 << NUM_FRACTIONAL_BITS) - 1
#define WAVETABLE_SIZE 4096
#define MASK_WAVEINDEX 0x00000FFFUL
#define scaler_fractionalBits 1.0 / ((float)WAVETABLE_SIZE)
#define bit32_normalization 4294967296.0f
#define sampleRate 48000

int main()
{
#define bit32_normalization 4294967296.0f
	int midiPitch;

	float frequency = 440.0f * powf(2.0f, (float)(midiPitch - 69) / 12.0f);

	int32_t phaseIncrement = (int32_t)(bit32_normalization * frequency / sampleRate + 0.5f);

	int n = sampleRate * 10;
	uint32_t phase = 0;
	int midiPitch = 60;
	float frequency = 440.0f * powf(2.0f, (float)(midiPitch - 69) / 12.0f);
	int32_t phaseIncrement = (int32_t)(bit32_normalization * frequency / sampleRate + 0.5f);
	unsigned int lastWaveIndex = 0;
	int cycles = 0;
	while (n-- > 0)
	{
		unsigned int waveIndex0 = (phase >> NUM_FRACTIONAL_BITS) & MASK_WAVEINDEX;
		if (waveIndex0 < lastWaveIndex)
		{
			cycles++;
			printf("\n phase int32_t %4x\twave\t%d diff: %d, cycles: %d", phase, waveIndex0, waveIndex0 - lastWaveIndex, cycles);
		}

		phase += phaseIncrement;
		lastWaveIndex = waveIndex0;
	}
}