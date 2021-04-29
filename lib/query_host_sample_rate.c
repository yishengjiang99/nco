#ifdef __EMSCRIPTEN__

#include <emscripten.h>

// Avoid calling this more than once! Caching the value is up to you.
unsigned query_sample_rate_of_audiocontexts()
{
	return EM_ASM_INT({
		var AudioContext = window.AudioContext || window.webkitAudioContext;
		var ctx = new AudioContext();
		var sr = ctx.sampleRate;
		ctx.close();
		return sr;
	});
}
#endif