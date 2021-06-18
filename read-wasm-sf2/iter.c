#include <stdio.h>
#include <stdlib.h>
	char *generator[60] = {"Gen_StartAddrOfs", "Gen_EndAddrOfs", "Gen_StartLoopAddrOfs", "Gen_EndLoopAddrOfs", "Gen_StartAddrCoarseOfs", "Gen_ModLFO2Pitch", "Gen_VibLFO2Pitch", "Gen_ModEnv2Pitch", "Gen_FilterFc", "Gen_FilterQ", "Gen_ModLFO2FilterFc", "Gen_ModEnv2FilterFc", "Gen_EndAddrCoarseOfs", "Gen_ModLFO2Vol", "Gen_Unused1", "Gen_ChorusSend", "Gen_ReverbSend", "Gen_Pan", "Gen_Unused2", "Gen_Unused3", "Gen_Unused4", "Gen_ModLFODelay", "Gen_ModLFOFreq", "Gen_VibLFODelay", "Gen_VibLFOFreq", "Gen_ModEnvDelay", "Gen_ModEnvAttack", "Gen_ModEnvHold", "Gen_ModEnvDecay", "Gen_ModEnvSustain", "Gen_ModEnvRelease", "Gen_Key2ModEnvHold", "Gen_Key2ModEnvDecay", "Gen_VolEnvDelay", "Gen_VolEnvAttack", "Gen_VolEnvHold", "Gen_VolEnvDecay", "Gen_VolEnvSustain", "Gen_VolEnvRelease", "Gen_Key2VolEnvHold", "Gen_Key2VolEnvDecay", "Gen_Instrument", "Gen_Reserved1", "Gen_KeyRange", "Gen_VelRange", "Gen_StartLoopAddrCoarseOfs", "Gen_Keynum", "Gen_Velocity", "Gen_Attenuation", "Gen_Reserved2", "Gen_EndLoopAddrCoarseOfs", "Gen_CoarseTune", "Gen_FineTune", "Gen_SampleId", "Gen_SampleModes", "Gen_Reserved3", "Gen_ScaleTune", "Gen_ExclusiveClass", "Gen_OverrideRootKey", "Gen_Dummy"};

int main()
{


	char riff[4], info[4], list[4],idc;
	unsigned int size, size2;
	char name[20];
	FILE* fo;

	//FILE *file = fopen("/Volumes/RAMDisk/small.sf2", "rb");
		FILE *file = fopen("file.sf2", "rb");

	fread(riff, 4, 1, file);
	printf("\n%.4s", riff);

	fread(&size, 1, 4, file);
	printf("\n%u", size);

	fread(riff, 4, 1, file);
	printf("\n%.4s", riff);

	fread(riff, 4, 1, file);
	printf("\n%.4s", riff);

	fread(&size, 1, 4, file);
	printf("\n%u", size);
	fread(riff, 4, 1, file);
	printf("\n%.4s", riff);
	fseek(file, size, SEEK_CUR);


	fread(&size, 1, 4, file);
	printf("\n%u", size);
	fread(riff, 4, 1, file);
	printf("\n%.4s", riff);
	fseek(file, size, SEEK_CUR);

	fread(&size, 1, 4, file);
	printf("\n%u", size);

	fread(riff, 4, 1, file);
	printf("\n%.4s", riff);

	fread(riff, 4, 1, file);
	printf("\n%.4s", riff);

	fread(&size, 1, 4, file);
	printf("\n%u kk", size);

	fo=fopen("./presets.csv","w+");

	fprintf(fo, "\nname, presetid, bank, preset_bag_index\n");

	for (int i = 0; i < size; i += 38)
	{
		uint16_t presetId, bank, presetBagIndex;
		uint32_t ignore;
		fread(name, 20, 1, file);
		fread(&presetId, 1, 2, file);
		fread(&bank, 1, 2, file);
		fread(&presetBagIndex, 1, 2, file);
		fread(riff, 1, 12, file);
		fprintf(fo,"\n%.20s: %u %u %u", name, presetId, bank, presetBagIndex);
	}
	fclose(fo);

	fread(riff, 4, 1, file);
	printf("\n%.4s", riff);

	fread(&size, 1, 4, file);
	fo=fopen("./pbag.csv","w");
	printf("\n%u\n genNdx, modNdex", size);
	for (int i = 0; i < size/4; i ++)
	{
		fprintf(fo,"\n%d", i);
		fprintf(fo,"\t%u", (fgetc(file) << 4) + fgetc(file));
		fprintf(fo,"\t%u", (fgetc(file) << 4) + fgetc(file));
	}
	fclose(fo);

	fread(riff, 4, 1, file);
	printf("\n%.4s PMOD START", riff);

	fread(&size, 1, 4, file);
	printf("\n%u", size);
	
	fo=fopen("./mod.csv","w+");
	fprintf(fo,"\nmod src, mod dest, mod amount, mod amt, src mod, transope");
	for (int i = 0; i < size/10; i++)
	{
		fprintf(fo,"\n%d\t%u", i, (fgetc(file) << 4) + fgetc(file));
		fprintf(fo,"\t%u", (fgetc(file) << 4) + fgetc(file));
		fprintf(fo,"\t%u", (fgetc(file) << 4) + fgetc(file));
		fprintf(fo,"\t%d", (fgetc(file) << 4) + fgetc(file));
		fprintf(fo,"\t%u", (fgetc(file) << 4) + fgetc(file));
	}
	fclose(fo);


	fread(riff, 4, 1, file);
	printf("\n%.4s PGEN START\ngenoper, lo, hi", riff);

	fread(&size, 1, 4, file);
	printf("\n%u", size);
	enum
	{
		GEN_FLOAT = 0x01,
		GEN_INT = 0x02,
		GEN_UINT_ADD = 0x03,
		GEN_UINT_ADD15 = 0x04,
		GEN_KEYRANGE = 0x05,
		GEN_VELRANGE = 0x06,
		GEN_LOOPMODE = 0x07,
		GEN_GROUP = 0x08,
		GEN_KEYCENTER = 0x09
	};
	fo=fopen("generator.csv","w");

	for (int i = 0; i < size/4; i ++)
	{
		uint16_t genOper;
		uint8_t b1, b2;

		fread(&genOper, sizeof(uint16_t), 1, file);
		b1 = fgetc(file);
		b2 = fgetc(file);
		fprintf(fo,"\n%d, %2x\t%x,%x\t%s", i, genOper,b1, b2, generator[genOper]);
		//*endlist = (genss) { genOper,b1,b2 };
		//endlist++;
	}
	fclose(fo);


	fread(riff, 4, 1, file);
	printf("\n%.4s", riff);
	fread(&size, 1, 4, file);
	printf("\n%u", size);
	fo=fopen("instlist.csv","w");
	for (int i = 0; i < size/22; i ++)
	{
		char instname[20];
		unsigned int instBagNdx;

		fread(instname, 1, 20, file); //, sizeof(uint16_t), 1, file);
		fread(&instBagNdx, 2, 1, file);
		fprintf(fo,"\n%d, %u, %s", i, instBagNdx, instname); //.20s, %u", instname, instBagNdx);
	}
	fclose(fo);

	fread(riff, 4, 1, file);
	printf("\n%.4s", riff);
	fread(&size, 1, 4, file);
	printf("\n%u", size);
	fo=fopen("instbag.csv","w");

	for (int i = 0; i < size/4; i ++)
	{
		fprintf(fo,"\n%d, %u",i, (fgetc(file) << 4) + fgetc(file));
		fprintf(fo,"\t%u", (fgetc(file) << 4) + fgetc(file));
	}
	fclose(fo);
	fread(riff, 4, 1, file);
	printf("\n%.4s insmode START", riff);

	fread(&size, 1, 4, file);
	printf("\n%u", size);
	printf("\nmod src, mod dest, mod amount, mod amt,src mod ,transope");
	fo=fopen("instmode.csv","w");
	for (int i = 0; i < size; i += 10)
	{
		fprintf(fo,"\n%u", (fgetc(file) << 4) + fgetc(file));
			fprintf(fo,"\t%u", (fgetc(file) << 4) + fgetc(file));
		fprintf(fo,"\t%u", (fgetc(file) << 4) + fgetc(file));
			fprintf(fo,"\t%d", (fgetc(file) << 4) + fgetc(file));
		fprintf(fo,"\t%u", (fgetc(file) << 4) + fgetc(file));
	}fclose(fo);

	fread(riff, 4, 1, file);
	printf("\n%.4s", riff);
	fread(&size, 1, 4, file);
	printf("\n%u", size);

	for (int i = 0; i < size; i += 4)
	{
		uint16_t genOper;
		uint8_t b1, b2;
		uint16_t amt;

		fread(&genOper, sizeof(uint16_t), 1, file);
		b1 = fgetc(file);
		b2 = fgetc(file);
		amt = (b1 << 4) + b2;
		if (genOper & 0x0f)
			switch (genOper & 0x0f)
			{
			case GEN_KEYRANGE:
			case GEN_VELRANGE:
				printf("\ngenerator range: %u %s: %u %u", genOper, generator[genOper], b1, b2);
				break;
			default:
				printf("\ngenerator %u %x,%s: %i", genOper, genOper & 0x0f, generator[genOper], amt);
			}
	}

	fread(riff, 4, 1, file);
	printf("\n%.4s", riff);
	fread(&size, 1, 4, file);
	printf("\n%u", size);


	for (int i = 0; i < size; i += (20 + 2 * 5 + 1 + 1 + 4))
	{
		//	fread(riff, 20, 1, file);
		// struct tsf_hydra_shdr { tsf_char20 sampleName; tsf_u32 start, end, startLoop, endLoop, sampleRate;
		// tsf_u8 originalPitch; tsf_s8 pitchCorrection; tsf_u16 sampleLink, sampleType; };

		uint32_t param;
		uint8_t op;
		fread(name, 20, 1, file);
		printf("\n%.20s", name);

		fread(&param, 1, 4, file);
		printf("\n%u", param);
		fread(&param, 1, 4, file);
		printf("\t%u", param);
		fread(&param, 1, 4, file);
		printf("\t%u", param);
		fread(&param, 1, 4, file);
		printf("\t%u", param);
		fread(&param, 1, 4, file);
		printf("\t%u", param);

		printf("\t %x", fgetc(file));
		printf("\t %x", fgetc(file));
		fgetc(file);	
		fgetc(file);
		fgetc(file);
		fgetc(file);	


	}
	return 0;
}