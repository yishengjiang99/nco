#include <stdio.h>
#include <string.h>

#include "fft.c"
#include "wavetable_oscillator.c"
static inline void loadpcm(float *arr, const char *filename) {
  FILE *fd = fopen(filename, "rb");
  fread(arr, 4, WAVETABLE_SIZE, fd);
  fclose(fd);
}

int main() {
  int N = 4096;
  void *ref = init_oscillators(4);
  FILE *fd;
  float *sample;

  loadpcm(oscillator[0].wave000, squarewave);
  complex *instrument = (complex *)sinewave;
  bzero(instrument, 4096 * 2 * 8);
  double sbtl[WAVETABLE_SIZE / 4];
  sin_table(sbtl, LOG2_WAVETABLE_SIZE);

  bit_reverse(instrument, LOG2_WAVETABLE_SIZE);
  iFFT(instrument, WAVETABLE_SIZE, sbtl);

  oscillator[0].wave001 = &(squarewave[0]);
  oscillator[0].wave010 = &(sinewave[0]);
  oscillator[0].wave011 = &(silence[0]);
  for (int i = 0; i < N; i++) sample_tables[i] = (float)instrument[i].imag;

  FILE *w =
      popen("ffplay -showmode rdft -ac 1 -ar 48000 -f f32le -i pipe:0", "w");
  set_midi(0, 44);
  oscillator[0].fadeDim1 = 0.0f;
  oscillator[0].fadeDim1Increment = 0.0f;  //+55.0f / 48000;

  oscillator[0].fadeDim2 = 1.0f;
  oscillator[0].fadeDim2Increment = -55.0f / 48000;

  int n = 48000;
  while (n > 0) {
    wavetable_1dimensional_oscillator(&oscillator[0]);
    fwrite(oscillator[0].output_ptr, sizeof(float), SAMPLE_BLOCKSIZE, w);
    n -= SAMPLE_BLOCKSIZE;
  }
  fclose(w);
}