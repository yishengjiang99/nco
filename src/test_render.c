#include <math.h>
#include <stdio.h>
#include <stdlib.h>

#include "wavetable_oscillator.c"

static int fail(const char *msg)
{
  fprintf(stderr, "FAIL: %s\n", msg);
  return 1;
}

int main(void)
{
  wavetable_oscillator_data *osc = init_oscillators();
  if (osc == NULL)
    return fail("init_oscillators returned NULL");
  if (wavetable_struct_size() <= 0)
    return fail("wavetable_struct_size");
  if (osc[0].output_ptr == NULL)
    return fail("output_ptr not initialized");
  if (osc[0].samples_per_block != SAMPLE_BLOCKSIZE)
    return fail("samples_per_block");
  if (osc[0].wave000 == NULL || osc[0].wave001 == NULL)
    return fail("wavetable pointers");

  set_midi(0, 69); /* A4 = 440 Hz */
  if (osc[0].phaseIncrement == 0)
    return fail("set_midi did not set phase increment");

  /* Out-of-range channel must not crash or clobber channel 0. */
  int32_t saved = osc[0].phaseIncrement;
  set_midi(99, 60);
  if (osc[0].phaseIncrement != saved)
    return fail("set_midi wrote past oscillator array");

  wavetable_1dimensional_oscillator(&osc[0]);

  float energy = 0.0f;
  float peak = 0.0f;
  for (int i = 0; i < SAMPLE_BLOCKSIZE; i++)
  {
    float s = osc[0].output_ptr[i];
    energy += s * s;
    if (fabsf(s) > peak)
      peak = fabsf(s);
  }
  if (energy < 1e-6f)
    return fail("1D oscillator produced silence");
  if (peak > 4.0f)
    return fail("1D oscillator produced explosive amplitude");

  osc[0].fadeDim1 = 1.0f;
  osc[0].fadeDim1Increment = 0.0f;
  wavetable_1dimensional_oscillator(&osc[0]);

  uint8_t note_on[3] = {0x90, 60, 100};
  handle_midi_channel_msg(note_on);
  if (osc[0].phaseIncrement == 0)
    return fail("note-on did not set pitch");
  if (osc[0].fadeDim1 <= 0.0f)
    return fail("note-on fadeDim1");

  uint8_t note_off[3] = {0x80, 60, 0};
  handle_midi_channel_msg(note_off);
  if (osc[0].fadeDim1Increment >= 0.0f)
    return fail("note-off should start a downward fade");

  uint8_t note_on_vel0[3] = {0x90, 64, 0};
  osc[0].fadeDim1 = 0.8f;
  handle_midi_channel_msg(note_on_vel0);
  if (osc[0].fadeDim1Increment >= 0.0f)
    return fail("note-on velocity 0 should be treated as note-off");

  printf("ok energy=%f peak=%f inc=%d fade=%f\n", energy, peak,
         (int)osc[0].phaseIncrement, osc[0].fadeDim1);
  return 0;
}
