#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <strings.h>

#include "LUT.h"
#include "wavetable_oscillator.c"
void cleanTable(float* table, int N);
#include <string.h>

#include "utils_playtable.c"
int main() {
  //  wavetable_oscillator_data* osc = init_oscillators();
  int N = 1024;  //, n = 12, sr = 441000, nyquist = 22000;
  float* swv = (float*)malloc(sizeof(float) * N);
  float f = 400;
  for (int i = 0; i < N; i++) {
    swv[i] = .9 * sinf(2.0f * PI * i * f / (float)N);       //      // 32.0f);
    swv[i] = .9 * sinf(10 * 2.0f * PI * i * f / (float)N);  //      // 32.0f);
  }
  for (int n = 0; n < N / 4; n++) {
    squarewave[n] = 0.5;
    squarewave[n + N / 4] = -0.5;
    squarewave[n + 3 * N / 4] = -0.5;
  }
  cleanTable(squarewave, N);
  wavetable_oscillator_data* osc = init_oscillators();
  // cleanTable(squarewave, N);
  float* output = (float*)malloc(sizeof(float) * 48000);
  playTable(osc, squarewave, 422.0f, output);
  //  float* output = (float*)malloc(sizeof(float) * 48000);

  // playTable(swv, 440.0f);
  /*
   440.0f * powf(2.0f, (float)(midi - 69) / 12.0f);
    osc->phaseIncrement = (int)(frequency / SAMPLE_RATE * BIT32_NORMALIZATION
   + .5f);
    */
  return 1;
}

void cleanTable(float* table, int N) {
  int n = log2(N);
  double sine[N / 4];
  sin_table(sine, n);
  complex t[N];
  float bin_freq[N];

  bzero(t, sizeof(double) * 2);
  for (int i = 0; i < N; i++) {
    t[i].real = (double)table[i];
    t[i].imag = 0.0f;
  }

  FFT(t, n, sine);
  bit_reverse(t, n);
  for (int i = 0; i < N / 2; i++) {
    if (t[i].imag > 20) {
      printf("\nbins: %d %f, %f", i, t[i].imag, t[i].real);
      t[i].real = 0.0f;
      t[i].imag = 0.f;
      t[N - 1 - i].real = 0.0f;
      t[N - 1 - i].imag = 0.0f;
    }
  }
  bit_reverse(t, n);
  iFFT(t, n, stbl);
  for (int i = 0; i < N; i++) {
    table[i] = t[i].real;  // = t[i];
    //  if (table[i] > 0) printf("\n%d of %d: %f", i, N, table[i]);
    printf("\n%d %f", i, t[i].real);
  }
}