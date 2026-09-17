# nco (numerically controlled oscillator)

WebAssembly port of Robert Bristow-Johnson's wavetable oscillator.

## Files

- `src/wavetable_oscillator.c` — audio engine (phase accumulator + 0/1/2/3-D table morph)
- `index.html` — demo page
- `web/main-thread.js` — UI, keyboard, MIDI; sends note params to the audio thread
- `web/audio-thread.js` — AudioWorklet processor that fills PCM from the wasm engine
- `make.js` — compiles the C source to wasm and emits `build/wavetable_oscillator.js`

## Build / test the engine

```sh
# native smoke test (no wasm toolchain required)
cc -O2 -o src/test_render src/test_render.c -lm && ./src/test_render

# wasm module used by the worklet
npm run build
```

Open `index.html` from a local static server (AudioWorklet and ES modules need http(s)).

## MIDI status bytes

Channel voice messages use the high nibble for command and the low nibble for
channel (`status & 0xF0`, `status & 0x0F`). Note-on with velocity 0 is note-off.
