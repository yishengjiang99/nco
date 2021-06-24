#include <stdio.h>
#include <strings.h>

#include "LUT.h"
#include "wavetable_oscillator.c"
int main() {
  wavetable_oscillator_data* osc = init_oscillators();
  int N = 4096, n = 12, sr = 441000, nyquist = 22000;
  float bin_freq[4096];

  complex t[4096];
  bzero(t, sizeof(double) * 2);
  for (int i = 0; i < N / 2; i++) {
    bin_freq[i] = 22000 / N * i;
    // printf("\n%d %f", i, bin_freq[i]);
    t[i].real = (double)sinewave[i];
    t[i].imag = 0.0f;
  }
  for (int i = 0; i < N; i++) bin_freq[i] = 0.0f;

  FFT(t, n, stbl);
  bit_reverse(t, n);

  bzero(&t, 800);
  for (int i = 0; i < N / 2; i++) {
    bin_freq[i] = 22000 / N * i;
    printf("\n%d %f %f", i, t[i].imag, t[i].real);
  }
  return 1;
}