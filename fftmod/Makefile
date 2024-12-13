build: fft.c
	emcc --bind -O1 \
	-s WASM=1 \
	-s BINARYEN_ASYNC_COMPILATION=0 \
	-s SINGLE_FILE=1 \
	-s EXPORTED_RUNTIME_METHODS='["cwrap","ccall"]' \
	FFTProc.cc \
	-o fft.wasmmodule.js \
	--post-js fftes6.js

clean:
	@rm -f fft.wasmmodule.js
