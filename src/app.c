#include <stdint.h>
#include <strings.h>

#define AUD_CTX_BUFFER 128
#define SAMPLE_RATE 48000
extern float powf(float, float);
extern float sinf(float);
#include "wavetable_oscillator.c"
#define BIT32_NORMALIZATION 4294967296.0f

void set_midi(int channel, uint8_t midiPitch)
{
	float frequency = 440.0f * powf(2.0f, (float)(midiPitch - 69) / 12.0f);
	oscillator[channel].phaseIncrement = (int32_t)(BIT32_NORMALIZATION * frequency / SAMPLE_RATE + 0.5f);
}
void handle_midi_channel_msg(uint8_t bytes[3])
{
	int cmd = bytes[0] & 0x80;
	int channel = bytes[0] & 0x0f;
	float temp_hard_coded_release = 0.5f;
	switch (cmd)
	{
	case 0x80:
	{
		int midiKey = bytes[1] & 0x7f;
		int velocity = bytes[2] & 0x7f;
		oscillator[channel].fadeDim1Increment = 0.1;

		break;
	}
	case 0x90:
	{ //note on.
		int midiKey = bytes[1] & 0x7f;
		int velocity = bytes[2] & 0x7f;
		set_midi(channel, midiKey);
		oscillator[channel].fadeDim1 = 0;
		oscillator[channel].fadeDim2 = 0;
		oscillator[channel].fadeDim3 = 0;
		break;
	}
	default:
		break; //TODO: break;
	}
}
