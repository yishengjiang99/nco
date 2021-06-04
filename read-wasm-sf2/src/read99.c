#include <math.h>
#define TSF_IMPLEMENTATION
#include "../tsf.h"
#include <assert.h>
#include<signal.h> 
#include<stdio.h> 
#include <node_api.h>
#include <stdio.h>
napi_value Init(napi_env env, napi_value exports) {
	
}
#define EMSCRIPTEN_KEEPALIVE /*ignore*/
static float pow2over2table[12] = {
    1,
    1.0594630943592953,
    1.122462048309373,
    1.189207115002721,
    1.2599210498948732,
    1.3348398541700344,
    1.4142135623730951,
    1.4983070768766815,
    1.5874010519681994,
    1.6817928305074292,
    1.7817974362806788,
    1.887748625363387};
EMSCRIPTEN_KEEPALIVE
float ratioc(int rdiff)
{
    float ratio = 1;
    while (rdiff > 12)
    {
        ratio *= 2;
        rdiff -= 12;
    }
    while (rdiff < -12)
    {
        ratio /= 12;
        rdiff += 12;
    }

    ratio = rdiff >= 0 ? ratio * pow2over2table[rdiff] : ratio / pow2over2table[-1 * rdiff];
    return ratio;
}
float hermite4(float frac_pos, float xm1, float x0, float x1, float x2);

EMSCRIPTEN_KEEPALIVE
static tsf *g_tsf;

EMSCRIPTEN_KEEPALIVE
void init_tsf()
{
    g_tsf = tsf_load_filename("./file.sf2");
    if(!g_tsf){
        perror("gtsf not loaded");
    }
}
EMSCRIPTEN_KEEPALIVE
uint8_t* stackbuff(int len){
    return malloc(len);
}
EMSCRIPTEN_KEEPALIVE
void read_sf(void *buffer, int size)
{
    g_tsf = tsf_load_memory(buffer, size);
    if(!g_tsf){
        perror("gtsf not loaded");
    }
}

EMSCRIPTEN_KEEPALIVE
float lerp(float v0, float v1, float t)
{
    return v0 + t * (v1 - v0);
}
EMSCRIPTEN_KEEPALIVE
void load_sound(float *buffout, int presetId, int midi, int velocity, int size)
{

    int rdiff = 128; /*scalar*/ /* integer difference between sample note and note we are trying to produce*/
    struct tsf_region r;        /* the preset region we render from*/
    struct tsf_preset p;
    p = g_tsf->presets[presetId];
    for (int j = 0; j < p.regionNum; j++)
    {
        if (abs(p.regions[j].pitch_keycenter - midi) > 10)
            continue;

        if (p.regions[j].hikey < midi)
            continue;
        if (p.regions[j].lovel > velocity)
            continue;
        if (p.regions[j].hivel < velocity)
            continue;

        if (abs(midi - p.regions[j].pitch_keycenter) < rdiff)
        {

            printf("\n*** note: %d ***\npitch center:%d\nspeed lo:%d \nhi %d\nsample rate: %d\n",
                   midi, p.regions[j].pitch_keycenter, (int)(p.regions[j].lovel), (int)(p.regions[j].hivel), p.regions[j].sample_rate);

            r = p.regions[j];

            rdiff = abs(midi - r.pitch_keycenter);
        }
    }

    int loopr = (r.loop_end - r.loop_start);
    int iterator = r.offset;
    double gain = -10 - r.attenuation - tsf_gainToDecibels(1.0f / velocity);
    int pos = 0;
    float shift = 0;
    float ratio = ratioc(midi - r.pitch_keycenter);

    for (int i = 0; i < size; i++)
    {

        // *buffout++ = g_tsf->fontSamples[iterator]; //
        if (i == 0)
            *buffout++ = 0;
        else
            *buffout++ = hermite4(shift, g_tsf->fontSamples[iterator - 1], g_tsf->fontSamples[iterator], g_tsf->fontSamples[iterator + 1], g_tsf->fontSamples[iterator + 2]); //lerp(g_tsf->fontSamples[iterator], g_tsf->fontSamples[iterator+1], shift);

        shift += ratio;

        while (shift >= 1)
        {
            shift--;
            iterator++;
        }
        if (iterator >= r.loop_end)
        {
            iterator -= loopr;
        }

        //break;
    }
}
//https://www.musicdsp.org/en/latest/Other/93-hermite-interpollation.html
float hermite4(float frac_pos, float xm1, float x0, float x1, float x2)
{
    const float c = (x1 - xm1) * 0.5f;
    const float v = x0 - x1;
    const float w = c + v;
    const float a = w + v + (x2 - x0) * 0.5f;
    const float b_neg = w + a;

    return ((((a * frac_pos) - b_neg) * frac_pos + c) * frac_pos + x0);
}

void handle_sigint(int sig) 
{ 
    printf("Caught signal %d\n", sig); 
} 
  
int main(){
	printf("Load..");
	init_tsf();
	printf("Loaded");

	u_int32_t preset, midi, vel;
	vel=100;
	preset=0;
	char* input;
    signal(SIGINT, handle_sigint); 
	    signal(SIGIO, handle_sigint); 
	    signal(SIGBUS, handle_sigint); 

    while (1) ; 

}