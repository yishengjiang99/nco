#include <assert.h>
#include <stdio.h>

#include "fft.c"
#include "math.h"
#include "string.h"
#include "tbls.c"
#include "wavetable_oscillator.c"
typedef wavetable_oscillator_data wosc;
int main() {
  FILE *output = stdout;
  init_oscillators(1);
  int N = 4096, n = 12;
  set_midi(0, 69);
  printf("\n %d, %f", oscillator->phaseIncrement,
         ((float)oscillator->phaseIncrement));
  set_midi(0, 68);
  printf("\n %d, %f", oscillator->phaseIncrement,
         ((float)oscillator->phaseIncrement));
  complex *instrument = (complex *)sawt;
  bzero(instrument, 4096 * 2 * 8);
  double sbtl[N / 4];
  sin_table(sbtl, n);
  for (int i = 0; i < N; i++)
    printf("\n %d, \n%f,\t%f ", i, sbtl[i / 4], (double)instrument[i].real);

  bit_reverse(instrument, n);
  iFFT(instrument, N, sbtl);
  // for (int i = 0; i < N; i++)
  //   printf("\n $d %d, \t %f", i, (float)instrument[i].real,
  //          (float)instrument[i].imag);

  for (int i = 0; i < N; i++) sample_tables[i] = (float)instrument[i].imag;

  set_midi(0, 33);

  float sustain = 0.7f;
  for (int i = 0; i < N; i++)
    sample_tables[128 + i] = (float)instrument[i].real * sustain;
  float fade_sequence[5] = {.001 * SAMPLE_RATE, .1 * SAMPLE_RATE,
                            .2 * SAMPLE_RATE, .3 * SAMPLE_RATE,
                            .1 * SAMPLE_RATE};

  float *from_wave[5] = {sample_tables, sample_tables, sample_tables,
                         sample_tables, sample_tables};
  float *dest_wave[5] = {silence, sample_tables, sample_tables,
                         sample_tables + 128, silence};
  int state = 0;
  output = fopen("ffplay -i pipe:0 -ac 1", "w");
  for (int timer = 0; state < 4 && timer < 48000 * 10; timer += 128) {
    if (timer > fade_sequence[state]) {
      state++;
      oscillator[0].wave000 = from_wave[state];  //++;
      oscillator[0].wave001 = dest_wave[state];
      oscillator[0].fadeDim1 = 0.0f;
      oscillator[0].fadeDim1Increment = fade_sequence[state];
    }

    wavetable_1dimensional_oscillator(oscillator);
    bzero(oscillator->output_ptr, 128 * 4);
    //  for (int i = 0; i < N; i++) printf("\n%f", oscillator[0].output_ptr[i]);

    fwrite(oscillator[0].output_ptr, 128, 4, output);
  }
}