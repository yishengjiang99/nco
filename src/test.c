#include <assert.h>
#include <stdio.h>

#include "app.c"
int main()
{
	void *ref = init_oscillators();
	assert(&oscillator[0] != NULL);
	assert(&oscillator[NUM_OSCILLATORS - 1] != NULL);
	float fades[3] = {.1f};

	set_midi(0, 69);

	wavetable_1dimensional_oscillator(&oscillator[0]);
}