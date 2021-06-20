#include <stdio.h>
#include <string.h>

#include "fft.c"
#include "tbls.c"
#include "wavetable_oscillator.c"
static inline void loadpcm(float *arr, const char *filename) {
  FILE *fd = fopen(filename, "rb");
  fread(arr, 4, WAVETABLE_SIZE, fd);
  fclose(fd);
}

int main() {
  void *ref = init_oscillators(1);
  FILE *fd;
  float *sample;
  oscillator->wave000 = (float *)sawt;

  complex *instrument = (complex *)sawt;
  bzero(instrument, 4096 * 2 * 8);
  double sbtl[WAVETABLE_SIZE / 4];
  sin_table(sbtl, LOG2_WAVETABLE_SIZE);

  bit_reverse(instrument, LOG2_WAVETABLE_SIZE);
  iFFT(instrument, WAVETABLE_SIZE, sbtl);

  oscillator[0].wave001 = &(squarewave[0]);
  oscillator[0].wave000 = &(sinewave[0]);
  oscillator[0].wave011 = &(silence[0]);
  oscillator[0].wave010 = &(silence[0]);

  for (int i = 0; i < 4096; i++) sample_tables[i] = (float)instrument[i].imag;

  FILE *w =
      popen("ffplay -showmode rdft -ac 1 -ar 48000 -f f32le -i pipe:0", "w");
  set_midi(0, 66);
  oscillator[0].fadeDim1 = 0.4f;
  oscillator[0].fadeDim1Increment = +4.0f / 48000;

  oscillator[0].fadeDim2 = 0.0f;
  oscillator[0].fadeDim2Increment = 44.0f / 48000;

  int n = 48000;
  while (n > 0) {
    wavetable_1dimensional_oscillator(oscillator);
    fwrite(oscillator->output_ptr, sizeof(float), SAMPLE_BLOCKSIZE, w);
    n -= oscillator->samples_per_block;
  }
  fclose(w);
}