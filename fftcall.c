#include "src/fft.c"

void loadToComplexArr(complex **cpli, float *fl, int n)
{
	complex **a = cpli;
	while (*a != NULL)
		a++;
	while (n--)
	{
		fl = (float *)(*a);
		fl++;
		*a += sizeof(complex);
	} //.real = fl++;
}

int main()
{
	complex *tbl = (complex *)malloc(sizeof(complex) * 3);

	float n[5] = {1.f, 1.0, .9, 1.f, 0, 1.f}; //, 0l, 1.1l, 3l, 1l, 3l};
	loadToComplexArr(&tbl, &(n[0]), sizeof(n) / sizeof(float));
	tbl++;
	tbl = (complex *)(&n[0]);
	printf("\n%f,%f", tbl->real, tbl->imag);
	tbl = (complex *)(&n[1]);
	printf("\n%f,%f", tbl->real, tbl->imag);
	tbl = (complex *)(&n[2]);
	printf("\n%f,%f", tbl->real, tbl->imag);
}
void mkstbl()
{

	double stbl[1024];
	sin_table(stbl, 12l);
	FILE *stblfd = fopen("stbl.c", "w");
	fputs("double stbl[1024]={\n", stblfd);
	for (int i = 0; i < 1024; i++)
	{
		fprintf(stblfd, "%ff%c", stbl[i], i < 1023 ? ',' : '}');
	}
	fputc(';', stblfd);
}