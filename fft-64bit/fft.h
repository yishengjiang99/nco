#define HALFPI 1.570796326794897
#define PI 3.141592653589793
#define TWOPI 6.283185307179586

// #include "complex.h"

typedef struct
{
	double real;
	double imag;
} complex;

#define Re(z) (z).real
#define Im(z) (z).imag

void FFT(complex *x, int n, double *stbl);
void iFFT(complex *x, int n, double *stbl);
void bit_reverse(register complex *x, int n);
void sin_table(double *stbl, int n);