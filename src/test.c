#include <assert.h>
#include "wavetable_oscillator.c"
int main()
{
	init_oscillators();
	assert(&oscillator[0] != NULL);
	assert(&oscillator[NUM_OSCILLATORS - 1] != NULL);
}