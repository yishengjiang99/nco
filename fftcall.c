#include "src/fft.c"
int main()
{
	complex *tbl = (complex *)malloc(sizeof(complex) * 3);
	float n[6] = {1.f, 1.f, 1.f, 1.f, 1.f, 1.f}; //, 0l, 1.1l, 3l, 1l, 3l};
	tbl = (complex *)(&n[0]);
	printf("%f", tbl->real);
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