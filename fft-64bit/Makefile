build: 
	@emcc --bind -O1 \
	  -s WASM=1 \
		-s BINARYEN_ASYNC_COMPILATION=1 \
		-s SINGLE_FILE=1 \
		-s ENVIRONMENT='worker'  \
		fft.c \
		-o fft.wasmmodule.js \
		-s MODULARIZE=1 \
		-s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
		-s EXPORTED_FUNCTIONS=["_FFT","_iFFT","_bit_reverse","_sin_table"] \
	  -s EXPORT_NAME='createModule'  \
	  -s USE_ES6_IMPORT_META=0
		
clean:
	@rm -f fft.wasmmodule.js
