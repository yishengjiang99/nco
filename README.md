# nco (numerically controlled oscillator(s)

WebAssembly porting of wavetable_oscillator.c from (the) Robert Bristow-Johnson.

# files
- src/wavetable_oscillator.c: audio engine.
- index.html: the webpage
- web/main-thread.js: javascript for usr input and sending input to audio thread
- web/audio-thread.js: invoked from audio thread to provide pcm and talks to the audio engine 
- node_modules/mkdiv/bundle.js: feature weight React,js killer by yours truthly. Sick of webpack.config, babelrc, and endless pestering from eslint to put 
keys in each eleent? What faster than 50 fps on your UI? try  `npm install mkdiv` !!
- make.js: compiles the c code, prints bytrcode out in an Uint8Array, and instantiates the WebAssembly Memory, Table, Module and Instance. Provides synchornous loading (off the main thread) of the wasm module. It's like Emscripten, but actually fast, and less judgemental, 
