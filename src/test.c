#include <assert.h>
#include <stdio.h>

#include "wavetable_oscillator.c"
int main() {
  float *piano = sample_tables + 10 * 4096;

  void *ref = init_oscillators(1);

  FILE *w = popen("ffplay  -ac 1 -ar 48000 -f f32le -i pipe:0", "w");

  for (int midi = 60; midi < 70; midi++) {
    set_midi(0, midi);

    oscillator[0].fadeDim1Increment = 1.0f / 48000.0f;
    oscillator[0].fadeDim1 = 0.0f;

    for (int i = 0; i < 48000; i += SAMPLE_BLOCKSIZE) {
      wavetable_1dimensional_oscillator(oscillator);

      fwrite(oscillator[0].output_ptr, 4, SAMPLE_BLOCKSIZE, w);
      printf("\n%f", oscillator[0].fadeDim1);
    }

    //	break;
  }
  //	pclose(f);
  pclose(w);
}