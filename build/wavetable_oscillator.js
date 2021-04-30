// prettier-ignore
  const wasmBinary = new Uint8Array([
    0,97,115,109,1,0,0,0,1,160,128,128,128,0,6,96,3,127,127,127,1,127,96,2,125,125,1,125,96,1,127,0,96,1,127,1,127,96,0,1,127,96,2,127,127,0,2,167,128,128,128,0,3,3,101,110,118,6,109,101,109,115,101,116,0,0,3,101,110,118,4,112,111,119,102,0,1,3,101,110,118,6,109,101,109,111,114,121,2,0,1,3,139,128,128,128,0,10,2,2,2,2,3,4,3,5,2,5,4,132,128,128,128,0,1,112,0,0,7,253,129,128,128,0,10,33,119,97,118,101,116,97,98,108,101,95,48,100,105,109,101,110,115,105,111,110,97,108,95,111,115,99,105,108,108,97,116,111,114,0,2,33,119,97,118,101,116,97,98,108,101,95,49,100,105,109,101,110,115,105,111,110,97,108,95,111,115,99,105,108,108,97,116,111,114,0,3,33,119,97,118,101,116,97,98,108,101,95,50,100,105,109,101,110,115,105,111,110,97,108,95,111,115,99,105,108,108,97,116,111,114,0,4,33,119,97,118,101,116,97,98,108,101,95,51,100,105,109,101,110,115,105,111,110,97,108,95,111,115,99,105,108,108,97,116,111,114,0,5,16,105,110,105,116,95,111,115,99,105,108,108,97,116,111,114,115,0,6,21,119,97,118,101,116,97,98,108,101,95,115,116,114,117,99,116,95,115,105,122,101,0,7,7,111,115,99,95,114,101,102,0,8,8,115,101,116,95,109,105,100,105,0,9,23,104,97,110,100,108,101,95,109,105,100,105,95,99,104,97,110,110,101,108,95,109,115,103,0,10,15,97,117,100,105,111,95,116,104,114,101,97,100,95,99,98,0,11,9,129,128,128,128,0,0,10,223,157,128,128,0,10,141,131,128,128,0,2,1,127,1,125,2,64,65,0,40,2,4,65,192,0,107,34,1,32,0,54,2,60,32,1,32,0,40,2,0,54,2,56,32,1,32,1,40,2,60,40,2,4,54,2,52,32,1,32,1,40,2,60,40,2,8,54,2,48,32,1,32,1,40,2,60,40,2,12,54,2,44,32,1,32,1,40,2,60,40,2,16,54,2,40,32,1,32,1,40,2,60,42,2,32,56,2,36,32,1,32,1,40,2,60,40,2,20,54,2,32,32,1,32,1,40,2,60,40,2,24,54,2,28,32,1,32,1,40,2,60,40,2,28,54,2,24,32,1,32,1,40,2,60,40,2,60,54,2,20,2,64,3,64,32,1,32,1,40,2,52,34,0,65,127,106,54,2,52,32,0,65,1,72,13,1,32,1,32,1,40,2,48,32,1,40,2,32,118,32,1,40,2,24,113,34,0,54,2,16,32,1,32,0,65,1,106,32,1,40,2,24,113,54,2,12,32,1,32,1,42,2,36,32,1,40,2,48,32,1,40,2,28,113,179,148,34,2,56,2,8,32,1,67,0,0,128,63,32,2,147,34,2,56,2,4,32,1,32,1,40,2,20,34,0,32,1,40,2,16,65,2,116,106,42,2,0,32,2,148,32,0,32,1,40,2,12,65,2,116,106,42,2,0,32,1,42,2,8,148,146,56,2,0,32,1,32,1,40,2,48,32,1,40,2,44,106,54,2,48,32,1,32,1,40,2,44,32,1,40,2,40,106,54,2,44,32,1,42,2,0,33,2,32,1,32,1,40,2,56,34,0,65,4,106,54,2,56,32,0,32,2,56,2,0,12,0,11,0,11,32,1,40,2,60,34,0,32,1,40,2,48,54,2,8,32,0,32,1,40,2,44,54,2,12,11,11,162,132,128,128,0,2,1,127,2,125,2,64,65,0,40,2,4,65,208,0,107,34,1,32,0,54,2,76,32,1,32,0,40,2,0,54,2,72,32,1,32,1,40,2,76,40,2,4,54,2,68,32,1,32,1,40,2,76,40,2,8,54,2,64,32,1,32,1,40,2,76,40,2,12,54,2,60,32,1,32,1,40,2,76,40,2,16,54,2,56,32,1,32,1,40,2,76,42,2,32,56,2,52,32,1,32,1,40,2,76,40,2,20,54,2,48,32,1,32,1,40,2,76,40,2,24,54,2,44,32,1,32,1,40,2,76,40,2,28,54,2,40,32,1,32,1,40,2,76,42,2,36,56,2,36,32,1,32,1,40,2,76,42,2,40,56,2,32,32,1,32,1,40,2,76,40,2,60,54,2,28,32,1,32,1,40,2,76,40,2,64,54,2,24,32,1,65,4,54,2,60,2,64,3,64,32,1,32,1,40,2,68,34,0,65,127,106,54,2,68,32,0,65,1,72,13,1,32,1,32,1,40,2,64,32,1,40,2,48,118,32,1,40,2,40,113,34,0,54,2,20,32,1,32,0,65,1,106,32,1,40,2,40,113,54,2,16,32,1,32,1,42,2,52,32,1,40,2,64,32,1,40,2,44,113,179,148,34,2,56,2,12,32,1,67,0,0,128,63,32,2,147,34,2,56,2,8,32,1,32,1,40,2,28,34,0,32,1,40,2,20,65,2,116,106,42,2,0,32,2,148,32,0,32,1,40,2,16,65,2,116,106,42,2,0,32,1,42,2,12,148,146,56,2,4,32,1,32,1,40,2,24,34,0,32,1,40,2,20,65,2,116,106,42,2,0,32,1,42,2,8,148,32,0,32,1,40,2,16,65,2,116,106,42,2,0,32,1,42,2,12,148,146,34,2,56,2,0,32,1,32,1,42,2,4,34,3,32,2,32,3,147,32,1,42,2,36,148,146,56,2,4,32,1,32,1,42,2,36,32,1,42,2,32,146,56,2,36,32,1,32,1,40,2,64,32,1,40,2,60,106,54,2,64,32,1,32,1,40,2,60,32,1,40,2,56,106,54,2,60,32,1,42,2,4,33,2,32,1,32,1,40,2,72,34,0,65,4,106,54,2,72,32,0,32,2,56,2,0,12,0,11,0,11,32,1,40,2,76,34,0,32,1,42,2,36,56,2,36,32,0,32,1,40,2,64,54,2,8,32,0,32,1,40,2,60,54,2,12,11,11,133,134,128,128,0,2,1,127,2,125,2,64,65,0,40,2,4,65,240,0,107,34,1,32,0,54,2,108,32,1,32,0,40,2,0,54,2,104,32,1,32,1,40,2,108,40,2,4,54,2,100,32,1,32,1,40,2,108,40,2,8,54,2,96,32,1,32,1,40,2,108,40,2,12,54,2,92,32,1,32,1,40,2,108,40,2,16,54,2,88,32,1,32,1,40,2,108,42,2,32,56,2,84,32,1,32,1,40,2,108,40,2,20,54,2,80,32,1,32,1,40,2,108,40,2,24,54,2,76,32,1,32,1,40,2,108,40,2,28,54,2,72,32,1,32,1,40,2,108,42,2,36,56,2,68,32,1,32,1,40,2,108,42,2,40,56,2,64,32,1,32,1,40,2,108,42,2,44,56,2,60,32,1,32,1,40,2,108,42,2,48,56,2,56,32,1,32,1,40,2,108,40,2,60,54,2,52,32,1,32,1,40,2,108,40,2,64,54,2,48,32,1,32,1,40,2,108,40,2,68,54,2,44,32,1,32,1,40,2,108,40,2,72,54,2,40,2,64,3,64,32,1,32,1,40,2,100,34,0,65,127,106,54,2,100,32,0,65,1,72,13,1,32,1,32,1,40,2,96,32,1,40,2,80,118,32,1,40,2,72,113,34,0,54,2,36,32,1,32,0,65,1,106,32,1,40,2,72,113,54,2,32,32,1,32,1,42,2,84,32,1,40,2,96,32,1,40,2,76,113,179,148,34,2,56,2,28,32,1,67,0,0,128,63,32,2,147,34,2,56,2,24,32,1,32,1,40,2,52,34,0,32,1,40,2,36,65,2,116,106,42,2,0,32,2,148,32,0,32,1,40,2,32,65,2,116,106,42,2,0,32,1,42,2,28,148,146,56,2,20,32,1,32,1,40,2,48,34,0,32,1,40,2,36,65,2,116,106,42,2,0,32,1,42,2,24,148,32,0,32,1,40,2,32,65,2,116,106,42,2,0,32,1,42,2,28,148,146,56,2,16,32,1,32,1,40,2,44,34,0,32,1,40,2,36,65,2,116,106,42,2,0,32,1,42,2,24,148,32,0,32,1,40,2,32,65,2,116,106,42,2,0,32,1,42,2,28,148,146,56,2,12,32,1,32,1,40,2,40,34,0,32,1,40,2,36,65,2,116,106,42,2,0,32,1,42,2,24,148,32,0,32,1,40,2,32,65,2,116,106,42,2,0,32,1,42,2,28,148,146,56,2,8,32,1,32,1,42,2,20,34,2,32,1,42,2,12,32,2,147,32,1,42,2,60,148,146,56,2,20,32,1,32,1,42,2,16,34,2,32,1,42,2,8,32,2,147,32,1,42,2,60,148,146,34,2,56,2,16,32,1,32,1,42,2,20,34,3,32,2,32,3,147,32,1,42,2,68,148,146,56,2,20,32,1,32,1,42,2,60,32,1,42,2,56,146,56,2,60,32,1,32,1,42,2,68,32,1,42,2,64,146,56,2,68,32,1,32,1,40,2,96,32,1,40,2,92,106,54,2,96,32,1,32,1,40,2,92,32,1,40,2,88,106,54,2,92,32,1,42,2,20,33,2,32,1,32,1,40,2,104,34,0,65,4,106,54,2,104,32,0,32,2,56,2,0,12,0,11,0,11,32,1,40,2,108,34,0,32,1,42,2,68,56,2,36,32,0,32,1,42,2,60,56,2,44,32,0,32,1,40,2,92,54,2,12,32,0,32,1,40,2,96,54,2,8,11,11,219,137,128,128,0,2,1,127,2,125,2,64,65,0,65,0,40,2,4,65,144,1,107,34,1,54,2,4,32,1,32,0,54,2,140,1,32,1,32,0,40,2,0,54,2,136,1,32,1,32,1,40,2,140,1,40,2,4,54,2,132,1,32,1,32,1,40,2,140,1,40,2,8,54,2,128,1,32,1,32,1,40,2,140,1,40,2,12,54,2,124,32,1,32,1,40,2,140,1,40,2,16,54,2,120,32,1,32,1,40,2,140,1,42,2,32,56,2,116,32,1,32,1,40,2,140,1,40,2,20,54,2,112,32,1,32,1,40,2,140,1,40,2,24,54,2,108,32,1,32,1,40,2,140,1,40,2,28,54,2,104,32,1,32,1,40,2,140,1,42,2,36,56,2,100,32,1,32,1,40,2,140,1,42,2,40,56,2,96,32,1,32,1,40,2,140,1,42,2,44,56,2,92,32,1,32,1,40,2,140,1,42,2,48,56,2,88,32,1,32,1,40,2,140,1,42,2,52,56,2,84,32,1,32,1,40,2,140,1,42,2,56,56,2,80,32,1,32,1,40,2,140,1,40,2,60,54,2,76,32,1,32,1,40,2,140,1,40,2,64,54,2,72,32,1,32,1,40,2,140,1,40,2,68,54,2,68,32,1,32,1,40,2,140,1,40,2,72,54,2,64,32,1,32,1,40,2,140,1,40,2,76,54,2,60,32,1,32,1,40,2,140,1,40,2,80,54,2,56,32,1,32,1,40,2,140,1,40,2,84,54,2,52,32,1,32,1,40,2,140,1,40,2,88,54,2,48,2,64,3,64,32,1,32,1,40,2,132,1,34,0,65,127,106,54,2,132,1,32,0,65,1,72,13,1,32,1,32,1,40,2,128,1,32,1,40,2,112,118,32,1,40,2,104,113,34,0,54,2,44,32,1,32,0,65,1,106,32,1,40,2,104,113,54,2,40,32,1,32,1,42,2,116,32,1,40,2,128,1,32,1,40,2,108,113,179,148,34,2,56,2,36,32,1,67,0,0,128,63,32,2,147,34,2,56,2,32,32,1,32,1,40,2,76,34,0,32,1,40,2,44,65,2,116,106,42,2,0,32,2,148,32,0,32,1,40,2,40,65,2,116,106,42,2,0,32,1,42,2,36,148,146,56,2,28,32,1,32,1,40,2,72,34,0,32,1,40,2,44,65,2,116,106,42,2,0,32,1,42,2,32,148,32,0,32,1,40,2,40,65,2,116,106,42,2,0,32,1,42,2,36,148,146,56,2,24,32,1,32,1,40,2,68,34,0,32,1,40,2,44,65,2,116,106,42,2,0,32,1,42,2,32,148,32,0,32,1,40,2,40,65,2,116,106,42,2,0,32,1,42,2,36,148,146,56,2,20,32,1,32,1,40,2,64,34,0,32,1,40,2,44,65,2,116,106,42,2,0,32,1,42,2,32,148,32,0,32,1,40,2,40,65,2,116,106,42,2,0,32,1,42,2,36,148,146,56,2,16,32,1,32,1,40,2,60,34,0,32,1,40,2,44,65,2,116,106,42,2,0,32,1,42,2,32,148,32,0,32,1,40,2,40,65,2,116,106,42,2,0,32,1,42,2,36,148,146,56,2,12,32,1,32,1,40,2,56,34,0,32,1,40,2,44,65,2,116,106,42,2,0,32,1,42,2,32,148,32,0,32,1,40,2,40,65,2,116,106,42,2,0,32,1,42,2,36,148,146,56,2,8,32,1,32,1,40,2,52,34,0,32,1,40,2,44,65,2,116,106,42,2,0,32,1,42,2,32,148,32,0,32,1,40,2,40,65,2,116,106,42,2,0,32,1,42,2,36,148,146,56,2,4,32,1,32,1,40,2,48,34,0,32,1,40,2,44,65,2,116,106,42,2,0,32,1,42,2,32,148,32,0,32,1,40,2,40,65,2,116,106,42,2,0,32,1,42,2,36,148,146,56,2,0,32,1,32,1,42,2,28,34,2,32,1,42,2,12,32,2,147,32,1,42,2,84,148,146,56,2,28,32,1,32,1,42,2,24,34,2,32,1,42,2,8,32,2,147,32,1,42,2,84,148,146,56,2,24,32,1,32,1,42,2,20,34,2,32,1,42,2,4,32,2,147,32,1,42,2,84,148,146,56,2,20,32,1,32,1,42,2,16,34,2,32,1,42,2,0,32,2,147,32,1,42,2,84,148,146,56,2,16,32,1,32,1,42,2,28,34,2,32,1,42,2,20,32,2,147,32,1,42,2,92,148,146,56,2,28,32,1,32,1,42,2,24,34,2,32,1,42,2,16,32,2,147,32,1,42,2,92,148,146,34,2,56,2,24,32,1,32,1,42,2,28,34,3,32,2,32,3,147,32,1,42,2,100,148,146,56,2,28,32,1,32,1,42,2,84,32,1,42,2,80,146,56,2,84,32,1,32,1,42,2,92,32,1,42,2,88,146,56,2,92,32,1,32,1,42,2,100,32,1,42,2,96,146,56,2,100,32,1,32,1,40,2,128,1,32,1,40,2,124,106,54,2,128,1,32,1,32,1,40,2,124,32,1,40,2,120,106,54,2,124,32,1,42,2,28,33,2,32,1,32,1,40,2,136,1,34,0,65,4,106,54,2,136,1,32,0,32,2,56,2,0,12,0,11,0,11,32,1,40,2,140,1,34,0,32,1,42,2,100,56,2,36,32,0,32,1,42,2,92,56,2,44,32,0,32,1,40,2,128,1,54,2,8,32,0,32,1,40,2,124,54,2,12,32,0,32,1,42,2,84,56,2,52,65,0,32,1,65,144,1,106,54,2,4,11,11,167,129,128,128,0,1,2,127,2,127,65,0,40,2,4,65,16,107,34,2,32,0,54,2,12,32,2,65,0,54,2,8,2,64,3,64,32,2,40,2,8,65,15,74,13,1,32,2,40,2,12,32,2,40,2,8,34,1,65,220,0,108,106,34,0,65,8,54,2,4,32,0,32,1,65,5,116,65,16,106,54,2,0,32,0,66,128,128,128,128,192,2,55,2,16,32,0,66,255,255,191,128,240,255,3,55,2,24,32,0,66,128,128,128,172,3,55,2,32,32,0,65,0,54,2,40,32,0,65,144,4,54,2,60,32,0,65,144,132,1,54,2,64,32,0,66,0,55,2,8,32,2,32,1,65,1,106,54,2,8,12,0,11,0,11,32,2,40,2,12,11,11,133,128,128,128,0,0,65,220,0,11,157,128,128,128,0,0,2,127,65,0,40,2,4,65,16,107,32,0,54,2,12,32,0,65,220,0,108,65,144,132,2,106,11,11,238,128,128,128,0,2,1,127,1,125,2,64,65,0,65,0,40,2,4,65,16,107,34,2,54,2,4,32,2,32,0,54,2,12,32,2,32,1,58,0,11,32,2,67,0,0,0,64,32,2,45,0,11,65,187,127,106,178,67,0,0,64,65,149,16,1,67,0,0,220,67,148,34,3,56,2,4,32,2,32,3,67,0,0,128,79,148,67,0,128,59,71,149,67,0,0,0,63,146,168,54,2,0,65,0,32,2,65,16,106,54,2,4,11,11,163,130,128,128,0,1,1,127,2,64,65,0,65,0,40,2,4,65,32,107,34,1,54,2,4,32,1,32,0,54,2,28,32,1,32,0,45,0,0,65,128,1,113,54,2,24,32,1,32,1,40,2,28,45,0,0,65,15,113,54,2,20,32,1,65,128,128,128,248,3,54,2,16,2,64,2,64,32,1,40,2,24,34,0,65,144,1,70,13,0,32,0,65,128,1,71,13,1,32,1,32,1,40,2,28,45,0,1,65,255,0,113,54,2,12,32,1,32,1,40,2,28,45,0,2,65,255,0,113,54,2,8,32,1,40,2,20,65,220,0,108,34,0,65,180,132,2,106,65,128,128,128,252,3,54,2,0,32,0,65,188,132,2,106,65,128,128,128,252,3,54,2,0,32,0,65,196,132,2,106,65,128,128,128,252,3,54,2,0,12,1,11,32,1,32,1,40,2,28,45,0,1,65,255,0,113,54,2,4,32,1,32,1,40,2,28,45,0,2,65,255,0,113,54,2,0,32,1,40,2,20,32,1,45,0,4,16,9,32,1,40,2,20,65,220,0,108,34,0,65,180,132,2,106,65,0,54,2,0,32,0,65,188,132,2,106,65,0,54,2,0,32,0,65,196,132,2,106,65,0,54,2,0,11,65,0,32,1,65,32,106,54,2,4,11,11,195,129,128,128,0,1,1,127,2,64,65,0,65,0,40,2,4,65,16,107,34,2,54,2,4,32,2,32,0,54,2,12,32,2,32,1,54,2,8,32,2,65,0,54,2,4,3,64,2,64,2,64,32,2,40,2,4,65,15,74,13,0,32,2,40,2,8,32,2,40,2,4,65,11,116,106,65,0,65,128,4,16,0,26,32,2,65,0,54,2,0,3,64,32,2,40,2,0,65,247,0,74,13,2,32,2,40,2,4,34,1,65,220,0,108,65,144,132,2,106,34,0,32,2,40,2,8,32,1,65,11,116,106,32,2,40,2,0,65,2,116,106,54,2,0,32,0,16,3,32,2,32,2,40,2,0,65,8,106,54,2,0,12,0,11,0,11,65,0,32,2,65,16,106,54,2,4,15,11,32,2,32,2,40,2,4,65,1,106,54,2,4,12,0,11,0,0,11,0,11,11,138,128,128,128,0,1,0,65,4,11,4,224,174,0,0
  ]);
  const module = new WebAssembly.Module(wasmBinary);
  const mem = new WebAssembly.Memory({
    initial: 100, //100 x 64k ..just putting in some safe values now
    maximum: 100,
  });
  const instance = new WebAssembly.Instance(module, {
    env: {
      memory: mem,
      memset: (dest, src, len) => {
        debugger;
      },
      powf: (base, exp) => Math.pow(base, exp),
      table: new WebAssembly.Table({ element: "anyfunc", initial: 2 }),
    },
  });
  export default {
    mem,
    HEAPU8: new Uint8Array(mem.buffer),
    ...instance.exports,
  };
  
  