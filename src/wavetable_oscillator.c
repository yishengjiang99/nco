#include <stdint.h>
#include <math.h>
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
	phaseIncrement = 4;
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

#define MASK_FRACTIONAL_BITS 0x000FFFFF
#define MASK_WAVEINDEX 0x00000FFFUL
#define NUM_OSCILLATORS 16
#define SAMPLE_BLOCKSIZE 8
#define WAVETABLE_SIZE 4096
#define LOG2_WAVETABLE_SIZE 12

#define PI 3.1415926539f
#define BIT32_NORMALIZATION 4294967296.0f
static wavetable_oscillator_data oscillator[NUM_OSCILLATORS];
static float sinewave[WAVETABLE_SIZE], squarewave[WAVETABLE_SIZE];
static float output_samples[NUM_OSCILLATORS][SAMPLE_BLOCKSIZE];

wavetable_oscillator_data *init_oscillators(wavetable_oscillator_data *oscillator)
{

	//
	//	This sets up NUM_OSCILLATORS (16) simulataneous waveform oscillators
	//
	for (int i = 0; i < NUM_OSCILLATORS; i++)
	{
		oscillator[i].output_ptr = &(output_samples[i][0]);
		oscillator[i].samples_per_block = SAMPLE_BLOCKSIZE;

		oscillator[i].phase = 0;
		oscillator[i].phaseIncrement = 0;
		oscillator[i].frequencyIncrement = 0;

		oscillator[i].num_fractionalBits = 32 - LOG2_WAVETABLE_SIZE;
		oscillator[i].mask_fractionalBits = (0x00000001L << (32 - LOG2_WAVETABLE_SIZE)) - 1;
		oscillator[i].mask_waveIndex = WAVETABLE_SIZE - 1;
		oscillator[i].scaler_fractionalBits = ((float)WAVETABLE_SIZE) / BIT32_NORMALIZATION;

		oscillator[i].fadeDim1 = 0.0;
		oscillator[i].fadeDim1Increment = 0.0;

		oscillator[i].wave000 = &(sinewave[0]);
		oscillator[i].wave001 = &(squarewave[0]);
	}
	return &oscillator[0];
}

int wavetable_struct_size()
{
	return sizeof(wavetable_oscillator_data);
}
wavetable_oscillator_data *osc_ref(int channel)
{
	return &oscillator[channel];
}