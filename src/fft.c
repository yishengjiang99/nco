
/*
    A set of utility programs to compute the Fast Fourier Transform (FFT):

                                   N-1
                        X[k] =     SUM { x[n]exp(-j2 pi nk/N) }
                                   n=0

    and inverse Fast Fourier Transform (iFFT):

                                   N-1
                        x[n] = 1/N SUM { X[k]exp(+j2 pi nk/N) }
                                   k=0

    To speed things up, multiplication by 1 and j are avoided.  The input, x[],
   is an array of complex numbers (pairs of doubles) of length N = 2^n.  The
   calling program supplies n = log2(N) not the array length, N.  The output is
   placed in BIT REVERSED order in x[]. Call bit_reverse(x, n) to swap back to
   normal order, if needed. However, iFFT(X, n, stbl) requires its input, X[],
   to be in bit reversed order making bit reversing unnecessary in some cases,
   such as convolution.  stbl is an array of doubles of length N/4 containing
   the sine function from 0 to pi/2 used to compute the FFT.  Call
   sin_table(stbl, n) ONLY ONCE before either FFT(x, n, stbl) or iFFT(X, n,
   stbl) to set up a sin table for FFT computation.

    Written ca. 1985 in THINK C by Robert Bristow-Johnson.
*/
extern double sin(double x);
#define HALFPI 1.570796326794897
#define PI 3.141592653589793
#define TWOPI 6.283185307179586

// #include "complex.h"

typedef struct {
  double real;
  double imag;
} complex;

#define Re(z) (z).real
#define Im(z) (z).imag

void FFT(complex *x, int n, double *stbl) {
  int size;
  register int length, step, stepsize, end;
  register complex *top, *bottom; /* top & bottom of FFT butterfly */
  complex temp;

  size = 1L << (n - 2);
  end = (int)x + 4 * sizeof(temp) * size;

  length = size;
  stepsize = 1;
  while (length >= 1) {
    top = x;
    while ((int)top < end) {
      bottom = top + 2 * length;

      Re(temp) = Re(*top) - Re(*bottom); /* butterfly: twiddle = 1 */
      Im(temp) = Im(*top) - Im(*bottom);
      Re(*top) += Re(*bottom);
      Im(*top) += Im(*bottom);
      *bottom = temp;
      top++;
      bottom++;

      for (step = stepsize; step < size; step += stepsize) {
        Re(temp) =
            Re(*top) - Re(*bottom); /* butterfly: twiddle = exp(-j theta) */
        Im(temp) = Im(*top) - Im(*bottom);
        Re(*top) += Re(*bottom);
        Im(*top) += Im(*bottom);
        Re(*bottom) = Re(temp) * stbl[size - step] + Im(temp) * stbl[step];
        Im(*bottom) = Im(temp) * stbl[size - step] - Re(temp) * stbl[step];
        top++;
        bottom++;
      }

      Re(temp) = Im(*top) - Im(*bottom); /* butterfly: twiddle = -j */
      Im(temp) = Re(*bottom) - Re(*top);
      Re(*top) += Re(*bottom);
      Im(*top) += Im(*bottom);
      *bottom = temp;
      top++;
      bottom++;

      for (step = stepsize; step < size; step += stepsize) {
        Re(temp) =
            Im(*top) - Im(*bottom); /* butterfly: twiddle = -j*exp(-j theta) */
        Im(temp) = Re(*bottom) - Re(*top);
        Re(*top) += Re(*bottom);
        Im(*top) += Im(*bottom);
        Re(*bottom) = Re(temp) * stbl[size - step] + Im(temp) * stbl[step];
        Im(*bottom) = Im(temp) * stbl[size - step] - Re(temp) * stbl[step];
        top++;
        bottom++;
      }
      top = bottom;
    }
    length >>= 1;
    stepsize <<= 1;
  }

  top = x;
  bottom = x + 1;
  while ((int)top < end) {
    Re(temp) = Re(*top) - Re(*bottom); /* butterfly: twiddle = 1 */
    Im(temp) = Im(*top) - Im(*bottom);
    Re(*top) += Re(*bottom);
    Im(*top) += Im(*bottom);
    *bottom = temp;
    top += 2;
    bottom += 2;
  }
}

void iFFT(complex *X, int n, double *stbl) {
  int size;
  register int length, step, stepsize, end;
  double scale;
  register complex *top, *bottom; /* top & bottom of FFT butterfly */
  complex temp;

  size = 1L << (n - 2);
  end = (int)X + 4 * sizeof(temp) * size;

  scale = 0.25 / size;
  top = X;
  bottom = X + 1;
  while ((int)top < end) {
    Re(temp) = (Re(*top) - Re(*bottom)) * scale; /* butterfly: twiddle = 1/N */
    Im(temp) = (Im(*top) - Im(*bottom)) * scale;
    Re(*top) = (Re(*top) + Re(*bottom)) * scale;
    Im(*top) = (Im(*top) + Im(*bottom)) * scale;
    *bottom = temp;
    top += 2;
    bottom += 2;
  }

  length = 1;
  stepsize = size;
  while (stepsize >= 1) {
    top = X;
    while ((int)top < end) {
      bottom = top + 2 * length;

      temp = *bottom; /* butterfly: twiddle = 1 */
      Re(*bottom) = Re(*top) - Re(temp);
      Im(*bottom) = Im(*top) - Im(temp);
      Re(*top) += Re(temp);
      Im(*top) += Im(temp);
      top++;
      bottom++;

      for (step = stepsize; step < size;
           step += stepsize) { /* butterfly: twiddle = exp(+j theta) */
        Re(temp) = Re(*bottom) * stbl[size - step] - Im(*bottom) * stbl[step];
        Im(temp) = Im(*bottom) * stbl[size - step] + Re(*bottom) * stbl[step];
        Re(*bottom) = Re(*top) - Re(temp);
        Im(*bottom) = Im(*top) - Im(temp);
        Re(*top) += Re(temp);
        Im(*top) += Im(temp);
        top++;
        bottom++;
      }

      Re(temp) = -Im(*bottom); /* butterfly: twiddle = +j */
      Im(temp) = Re(*bottom);
      Re(*bottom) = Re(*top) - Re(temp);
      Im(*bottom) = Im(*top) - Im(temp);
      Re(*top) += Re(temp);
      Im(*top) += Im(temp);
      top++;
      bottom++;

      for (step = stepsize; step < size;
           step += stepsize) { /* butterfly: twiddle = +j*exp(+j theta) */
        Re(temp) = -Im(*bottom) * stbl[size - step] - Re(*bottom) * stbl[step];
        Im(temp) = Re(*bottom) * stbl[size - step] - Im(*bottom) * stbl[step];
        Re(*bottom) = Re(*top) - Re(temp);
        Im(*bottom) = Im(*top) - Im(temp);
        Re(*top) += Re(temp);
        Im(*top) += Im(temp);
        top++;
        bottom++;
      }
      top = bottom;
    }
    length <<= 1;
    stepsize >>= 1;
  }
}

void sin_table(double *stbl, int n) {
  register int size, i;
  double theta;

  size = 1L << (n - 2);
  theta = HALFPI / size;

  for (i = 0; i < size; i++) {
    stbl[i] = sin(theta * i);
  }
}
#include <stdint.h>
void bit_reverse(complex *x, int n) {
  complex temp;
  uint64_t k, i, r, size, count;

  size = n;
  for (k = 1; k < size; k++) {
    i = k;
    r = 0;
    for (count = n; count > 0; count--) {
      r <<= 1;
      r += i & 0x00000001;
      i >>= 1;
    }
    if (r > k) {
      temp = x[r];
      x[r] = x[k];
      x[k] = temp;
    }
  }
}
