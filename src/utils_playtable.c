#define playTable(osc, swv, freq, outb)                                \
  {                                                                    \
    osc->wave000 = swv;                                                \
    osc->phaseIncrement = freq2bit32(freq);                            \
    int offset = 0;                                                    \
    FILE* fdo = popen("ffplay -f f32le -i pipe:0 -ac 1 -ar 48k", "w"); \
    int block_byte_length = sizeof(float) * osc->samples_per_block;    \
    for (int i = 0; i < 48000; i += osc->samples_per_block) {          \
      wavetable_0dimensional_oscillator(osc);                          \
      fwrite(osc->output_ptr, block_byte_length, 1, fdo);              \
      memset(outb + offset, osc->output_ptr, block_byte_length);       \
      offset += block_byte_length;                                     \
    }                                                                  \
    pclose(fdo);                                                       \
  }