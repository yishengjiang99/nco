#include <stdint.h>
#include <stdlib.h>
#include <stdio.h>
#include <strings.h>
#include <math.h>
#include <unistd.h>
//
//  This typedef in wavetable_oscillator.h
//
typedef struct
{
	float *output_ptr;
	int samples_per_block;

	uint32_t phase;
	int32_t phaseIncrement;
	int32_t frequencyIncrement;

	unsigned int num_fractionalBits;
	uint32_t mask_fractionalBits; // 2^num_fractionalBits - 1
	unsigned int mask_waveIndex;
	float scaler_fractionalBits; // 2^(-num_fractionalBits)

	float fadeDim1;
	float fadeDim1Increment;
	float fadeDim2;
	float fadeDim2Increment;
	float fadeDim3;
	float fadeDim3Increment;

	float *wave000;
	float *wave001;
	float *wave010;
	float *wave011;
	float *wave100;
	float *wave101;
	float *wave110;
	float *wave111;
} wavetable_oscillator_data;
//
// #include "wavetable_oscillator.h"
//

void wavetable_0dimensional_oscillator(wavetable_oscillator_data *this_oscillator)
{
	float *out = this_oscillator->output_ptr;
	int num_samples_remaining = this_oscillator->samples_per_block;

	uint32_t phase = this_oscillator->phase;
	int32_t phaseIncrement = this_oscillator->phaseIncrement;
	int32_t frequencyIncrement = this_oscillator->frequencyIncrement;

	float scaler_fractionalBits = this_oscillator->scaler_fractionalBits;
	unsigned int num_fractionalBits = this_oscillator->num_fractionalBits;
	uint32_t mask_fractionalBits = this_oscillator->mask_fractionalBits;
	unsigned int mask_waveIndex = this_oscillator->mask_waveIndex;

	float *wave000 = this_oscillator->wave000;

	while (num_samples_remaining-- > 0)
	{
		unsigned int waveIndex0 = (unsigned int)(phase >> num_fractionalBits) & mask_waveIndex;
		unsigned int waveIndex1 = (waveIndex0 + 1) & mask_waveIndex;
		float linearGain1 = scaler_fractionalBits * (float)(phase & mask_fractionalBits);
		float linearGain0 = 1.0f - linearGain1;

		float _wave000 = wave000[waveIndex0] * linearGain0 + wave000[waveIndex1] * linearGain1;

		phase += phaseIncrement;
		phaseIncrement += frequencyIncrement;

		*out++ = _wave000;
	}

	this_oscillator->phase = phase;
	this_oscillator->phaseIncrement = phaseIncrement;
}

void wavetable_1dimensional_oscillator(wavetable_oscillator_data *this_oscillator)
{
	float *out = this_oscillator->output_ptr;
	int num_samples_remaining = this_oscillator->samples_per_block;

	uint32_t phase = this_oscillator->phase;
	int32_t phaseIncrement = this_oscillator->phaseIncrement;
	int32_t frequencyIncrement = this_oscillator->frequencyIncrement;

	float scaler_fractionalBits = this_oscillator->scaler_fractionalBits;
	unsigned int num_fractionalBits = this_oscillator->num_fractionalBits;
	uint32_t mask_fractionalBits = this_oscillator->mask_fractionalBits;
	unsigned int mask_waveIndex = this_oscillator->mask_waveIndex;

	float fadeDim1 = this_oscillator->fadeDim1;
	float fadeDim1Increment = this_oscillator->fadeDim1Increment;

	float *wave000 = this_oscillator->wave000;
	float *wave001 = this_oscillator->wave001;

	while (num_samples_remaining-- > 0)
	{
		unsigned int waveIndex0 = (unsigned int)(phase >> num_fractionalBits) & mask_waveIndex;
		unsigned int waveIndex1 = (waveIndex0 + 1) & mask_waveIndex;
		float linearGain1 = scaler_fractionalBits * (float)(phase & mask_fractionalBits);
		float linearGain0 = 1.0f - linearGain1;

		float _wave000 = wave000[waveIndex0] * linearGain0 + wave000[waveIndex1] * linearGain1;
		float _wave001 = wave001[waveIndex0] * linearGain0 + wave001[waveIndex1] * linearGain1;

		_wave000 += (_wave001 - _wave000) * fadeDim1;

		fadeDim1 += fadeDim1Increment;

		phase += phaseIncrement;
		phaseIncrement += frequencyIncrement;

		*out++ = _wave000;
	}

	this_oscillator->fadeDim1 = fadeDim1;

	this_oscillator->phase = phase;
	this_oscillator->phaseIncrement = phaseIncrement;
}

void wavetable_2dimensional_oscillator(wavetable_oscillator_data *this_oscillator)
{
	float *out = this_oscillator->output_ptr;
	int num_samples_remaining = this_oscillator->samples_per_block;

	uint32_t phase = this_oscillator->phase;
	int32_t phaseIncrement = this_oscillator->phaseIncrement;
	int32_t frequencyIncrement = this_oscillator->frequencyIncrement;

	float scaler_fractionalBits = this_oscillator->scaler_fractionalBits;
	unsigned int num_fractionalBits = this_oscillator->num_fractionalBits;
	uint32_t mask_fractionalBits = this_oscillator->mask_fractionalBits;
	unsigned int mask_waveIndex = this_oscillator->mask_waveIndex;

	float fadeDim1 = this_oscillator->fadeDim1;
	float fadeDim1Increment = this_oscillator->fadeDim1Increment;
	float fadeDim2 = this_oscillator->fadeDim2;
	float fadeDim2Increment = this_oscillator->fadeDim2Increment;

	float *wave000 = this_oscillator->wave000;
	float *wave001 = this_oscillator->wave001;
	float *wave010 = this_oscillator->wave010;
	float *wave011 = this_oscillator->wave011;

	while (num_samples_remaining-- > 0)
	{
		unsigned int waveIndex0 = (unsigned int)(phase >> num_fractionalBits) & mask_waveIndex;
		unsigned int waveIndex1 = (waveIndex0 + 1) & mask_waveIndex;
		float linearGain1 = scaler_fractionalBits * (float)(phase & mask_fractionalBits);
		float linearGain0 = 1.0f - linearGain1;

		float _wave000 = wave000[waveIndex0] * linearGain0 + wave000[waveIndex1] * linearGain1;
		float _wave001 = wave001[waveIndex0] * linearGain0 + wave001[waveIndex1] * linearGain1;
		float _wave010 = wave010[waveIndex0] * linearGain0 + wave010[waveIndex1] * linearGain1;
		float _wave011 = wave011[waveIndex0] * linearGain0 + wave011[waveIndex1] * linearGain1;

		_wave000 += (_wave010 - _wave000) * fadeDim2;
		_wave001 += (_wave011 - _wave001) * fadeDim2;

		_wave000 += (_wave001 - _wave000) * fadeDim1;

		fadeDim2 += fadeDim2Increment;
		fadeDim1 += fadeDim1Increment;

		phase += phaseIncrement;
		phaseIncrement += frequencyIncrement;

		*out++ = _wave000;
	}

	this_oscillator->fadeDim1 = fadeDim1;
	this_oscillator->fadeDim2 = fadeDim2;

	this_oscillator->phase = phase;
	this_oscillator->phaseIncrement = phaseIncrement;
}

void wavetable_3dimensional_oscillator(wavetable_oscillator_data *this_oscillator)
{
	float *out = this_oscillator->output_ptr;
	int num_samples_remaining = this_oscillator->samples_per_block;

	uint32_t phase = this_oscillator->phase;
	int32_t phaseIncrement = this_oscillator->phaseIncrement;
	int32_t frequencyIncrement = this_oscillator->frequencyIncrement;

	float scaler_fractionalBits = this_oscillator->scaler_fractionalBits;
	unsigned int num_fractionalBits = this_oscillator->num_fractionalBits;
	uint32_t mask_fractionalBits = this_oscillator->mask_fractionalBits;
	unsigned int mask_waveIndex = this_oscillator->mask_waveIndex;

	float fadeDim1 = this_oscillator->fadeDim1;
	float fadeDim1Increment = this_oscillator->fadeDim1Increment;
	float fadeDim2 = this_oscillator->fadeDim2;
	float fadeDim2Increment = this_oscillator->fadeDim2Increment;
	float fadeDim3 = this_oscillator->fadeDim3;
	float fadeDim3Increment = this_oscillator->fadeDim3Increment;

	float *wave000 = this_oscillator->wave000;
	float *wave001 = this_oscillator->wave001;
	float *wave010 = this_oscillator->wave010;
	float *wave011 = this_oscillator->wave011;
	float *wave100 = this_oscillator->wave100;
	float *wave101 = this_oscillator->wave101;
	float *wave110 = this_oscillator->wave110;
	float *wave111 = this_oscillator->wave111;

	while (num_samples_remaining-- > 0)
	{
		unsigned int waveIndex0 = (unsigned int)(phase >> num_fractionalBits) & mask_waveIndex;
		unsigned int waveIndex1 = (waveIndex0 + 1) & mask_waveIndex;
		float linearGain1 = scaler_fractionalBits * (float)(phase & mask_fractionalBits);
		float linearGain0 = 1.0f - linearGain1;

		float _wave000 = wave000[waveIndex0] * linearGain0 + wave000[waveIndex1] * linearGain1;
		float _wave001 = wave001[waveIndex0] * linearGain0 + wave001[waveIndex1] * linearGain1;
		float _wave010 = wave010[waveIndex0] * linearGain0 + wave010[waveIndex1] * linearGain1;
		float _wave011 = wave011[waveIndex0] * linearGain0 + wave011[waveIndex1] * linearGain1;
		float _wave100 = wave100[waveIndex0] * linearGain0 + wave100[waveIndex1] * linearGain1;
		float _wave101 = wave101[waveIndex0] * linearGain0 + wave101[waveIndex1] * linearGain1;
		float _wave110 = wave110[waveIndex0] * linearGain0 + wave110[waveIndex1] * linearGain1;
		float _wave111 = wave111[waveIndex0] * linearGain0 + wave111[waveIndex1] * linearGain1;

		_wave000 += (_wave100 - _wave000) * fadeDim3;
		_wave001 += (_wave101 - _wave001) * fadeDim3;
		_wave010 += (_wave110 - _wave010) * fadeDim3;
		_wave011 += (_wave111 - _wave011) * fadeDim3;

		_wave000 += (_wave010 - _wave000) * fadeDim2;
		_wave001 += (_wave011 - _wave001) * fadeDim2;

		_wave000 += (_wave001 - _wave000) * fadeDim1;

		fadeDim3 += fadeDim3Increment;
		fadeDim2 += fadeDim2Increment;
		fadeDim1 += fadeDim1Increment;

		phase += phaseIncrement;
		phaseIncrement += frequencyIncrement;

		*out++ = _wave000;
	}

	this_oscillator->fadeDim1 = fadeDim1;
	this_oscillator->fadeDim2 = fadeDim2;
	this_oscillator->fadeDim3 = fadeDim3;

	this_oscillator->phase = phase;
	this_oscillator->phaseIncrement = phaseIncrement;
}

#define NUM_OSCILLATORS 16
#define SAMPLE_BLOCKSIZE 8

#define WAVETABLE_SIZE 4096
#define LOG2_WAVETABLE_SIZE 12
#define MASK_FRACTIONAL_BITS 0x000FFFFF
#define MASK_WAVEINDEX 0x000FFFFF

#define PI 3.1415926539
static wavetable_oscillator_data oscillator[NUM_OSCILLATORS];
static float sinewave[WAVETABLE_SIZE], squarewave[WAVETABLE_SIZE];
void init_oscillators()
{
	wavetable_oscillator_data oscillator[NUM_OSCILLATORS];
	float output_samples[NUM_OSCILLATORS][SAMPLE_BLOCKSIZE];
	//
	//	This sets up two wavetables for interpolation in one dimension.
	//
	for (int n = 0; n < WAVETABLE_SIZE; n++)
	{
		sinewave[n] = sinf(2.0 * PI * ((float)n) / (float)WAVETABLE_SIZE);
	}

	for (int n = 0; n < WAVETABLE_SIZE / 2; n++)
	{
		squarewave[n] = 0.5;
		squarewave[n + WAVETABLE_SIZE / 2] = -0.5;
	}

	//
	//	This sets up NUM_OSCILLATORS (16) simulataneous waveform oscillators
	//
	uint16_t frequency = 110;
	for (int i = 0; i < NUM_OSCILLATORS; i++)
	{
		oscillator[i].output_ptr = &(output_samples[i][0]);
		oscillator[i].samples_per_block = SAMPLE_BLOCKSIZE;

		oscillator[i].phase = 0;
		oscillator[i].phaseIncrement = 0;
		oscillator[i].frequencyIncrement = 0;

		oscillator[i].num_fractionalBits = 32 - LOG2_WAVETABLE_SIZE;
		oscillator[i].mask_fractionalBits = (0x00000001 << (oscillator[i].num_fractionalBits)) - 1;
		oscillator[i].mask_waveIndex = WAVETABLE_SIZE - 1;
		oscillator[i].scaler_fractionalBits = 1.0 / ((float)WAVETABLE_SIZE);

		oscillator[i].fadeDim1 = 0.0;
		oscillator[i].fadeDim1Increment = 0.0;

		oscillator[i].wave000 = &(sinewave[0]);
		oscillator[i].wave001 = &(squarewave[0]);
	}
}

#define powf_2_32 4294967296.0f
#define sampleRate 48000
void set_midi(int channel, uint8_t midiPitch, uint8_t velocity)
{
	oscillator[channel].phaseIncrement = 440.0f * powf(2.0f, (float)((midiPitch - 69) / 12.0f));
}
void set_fade(int channel, float fade[3])
{
	oscillator[channel].fadeDim1 = fade[0];
	oscillator[channel].fadeDim2 = fade[1];
	oscillator[channel].fadeDim3 = fade[2];
}
void set_fade_delta(int channel, float fadeDelta)
{
	oscillator[channel].fadeDim1Increment = fadeDelta;
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
		set_fade_delta(channel, -1.0f / (temp_hard_coded_release * sampleRate));
		break;
	}
	case 0x90:
	{ //note on.
		int midiKey = bytes[1] & 0x7f;
		int velocity = bytes[2] & 0x7f;
		set_midi(channel, midiKey, velocity);

		//http://basicsynth.com/uploads/SF2-DLS.pdf
		// full velocity = no attentuation;
		float attentuate_cent_db = (-200.0 / 960) * log2((velocity * velocity) / (127 * 127));
		float sustain = 0.7f, decay = 1.0f; //random hardcoded values for now
		float decayPerSample = -1 * sustain / (decay * sampleRate);
		set_fade_delta(channel, decayPerSample);
		break;
	}
	default:
		break; //TODO: break;
	}
}
#define AUD_CTX_BUFFER 128
void audio_thread_cb(uint32_t currentFrame, float output_left[NUM_OSCILLATORS][128], float output_right[NUM_OSCILLATORS][128], float gain[NUM_OSCILLATORS][128])
{
	for (int i = 0; i < NUM_OSCILLATORS; i++)
	{
		for (int output_offset = 0; output_offset < AUD_CTX_BUFFER; output_offset += SAMPLE_BLOCKSIZE)
		{
			oscillator[i].output_ptr = &(output_left[NUM_OSCILLATORS][output_offset]);
			float _gain = gain[i][output_offset];
			wavetable_1dimensional_oscillator(&oscillator[i]);
		}
	}
}