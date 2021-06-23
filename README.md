# nco (numerically controlled oscillator(s))

WebAssembly porting of wavetable_oscillator.c from (the) Robert Bristow-Johnson.

# files
- src/wavetable_oscillator.c: audio engine.

- index.html: the webpage

- web/main-thread.js: javascript for usr input and sending input to audio thread

- web/audio-thread.js: invoked from audio thread to provide pcm and talks to the audio engine 

- make.js: compiles the c code, prints bytrcode out in an Uint8Array, and instantiates the WebAssembly Memory, Table, Module and Instance. Provides synchornous loading (off the main thread) of the wasm module. It's like Emscripten, but actually fast, and less judgemental, 
website host here now https://yishengjiang99.github.io/nco/

press anykey on keyboard to start. but prefereable on the row 'a,s,d,f,g,h' and less frequently 'w,e'
