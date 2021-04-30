#include <assert.h>
#include <stdio.h>

#include "wavetable_oscillator.c"
int main()
{
	init_oscillators();
	assert(&oscillator[0] != NULL);
	assert(&oscillator[NUM_OSCILLATORS - 1] != NULL);
	float fades[3] = {.1f};

	set_midi(0, 69);

	assert(oscillator[0].phase == 0);
	assert(oscillator[0].phaseIncrement == (int32_t)(bit32_normalization * 440.0f / sampleRate));
	wavetable_1dimensional_oscillator(&oscillator[0]);
}