#include <stdint.h>
#include <stdlib.h>
#include <strings.h>
#include "wavetable_oscillator.c"

#define AUD_CTX_BUFFER 128
#define SAMPLE_RATE 48000

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
		oscillator[channel].fadeDim1 = 1;
		oscillator[channel].fadeDim2 = 1;
		oscillator[channel].fadeDim3 = 1;
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
#define AUD_CTX_BUFFER 128
#define BYTES_PER_OSC AUD_CTX_BUFFER * sizeof(float)
static float ctx_outputBuffer[BYTES_PER_OSC * NUM_OSCILLATORS];
float *audio_thread_cb(uint32_t currentFrame)
{
	for (int i = 0; i < NUM_OSCILLATORS; i++)
	{
		bzero(&ctx_outputBuffer[i * BYTES_PER_OSC], AUD_CTX_BUFFER * sizeof(float));
		for (int output_offset = 0; output_offset < AUD_CTX_BUFFER - SAMPLE_BLOCKSIZE; output_offset += SAMPLE_BLOCKSIZE)
		{
			oscillator[i].output_ptr = &ctx_outputBuffer[i * BYTES_PER_OSC + output_offset];
			wavetable_1dimensional_oscillator(&oscillator[i]);
		}
	}
	return &ctx_outputBuffer[0];
}
