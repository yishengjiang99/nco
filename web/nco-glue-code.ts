function wavetable_info(dv: DataView) {
  let offset = 0;
  const [
    output_ptr,
    samples_per_block,
    phase,
    phaseIncrement,
    frequencyIncrement,
    num_fractionalBits,
    mask_fractionalBits,
    mask_wavIndex,
    scaler_fractionalBits,
    fadeDim1,
    fadeDim1Increment,
    fadeDim2,
    fadeDim2Increment,
    fadeDim3,
    fadeDim3Increment,
    ref_wave000,
    ref_wave001,
    ref_wave010,
    ref_wave011,
    ref_wave100,
    ref_wave101,
    ref_wave110,
    ref_wave111,
  ] = [
    dv.getInt32((offset += 4), true),
    dv.getUint32((offset += 4), true),
    dv.getInt32((offset += 4), true),
    dv.getInt32((offset += 4), true),
    dv.getUint32((offset += 4), true),
    dv.getUint32((offset += 4), true),
    dv.getUint32((offset += 4), true),
    dv.getFloat32((offset += 4), true),
    dv.getFloat32((offset += 4), true),
    dv.getFloat32((offset += 4), true),
    dv.getFloat32((offset += 4), true),
    dv.getFloat32((offset += 4), true),
    dv.getFloat32((offset += 4), true),
    dv.getFloat32((offset += 4), true),

    dv.getUint32((offset += 4), true),
    dv.getUint32((offset += 4), true),
    dv.getUint32((offset += 4), true),
    dv.getUint32((offset += 4), true),
    dv.getUint32((offset += 4), true),
    dv.getUint32((offset += 4), true),
    dv.getUint32((offset += 4), true),
    dv.getUint32((offset += 4), true),
  ];
  return {
    output_ptr,
    samples_per_block,
    phase,
    phaseIncrement,
    frequencyIncrement,
    num_fractionalBits,
    mask_fractionalBits,
    mask_wavIndex,
    scaler_fractionalBits,
    fadeDim1,
    fadeDim1Increment,
    fadeDim2,
    fadeDim2Increment,
    fadeDim3,
    fadeDim3Increment,
    ref_wave000,
    ref_wave001,
    ref_wave010,
    ref_wave011,
    ref_wave100,
    ref_wave101,
    ref_wave110,
    ref_wave111,
  };
}
/**
 * getting a list of info corresponding to  @wavetable_oscillator_data from the shared heap
 * @param wasmModule
 * @param osc_ref &oscillator[0]
 */
function wavetable_list(heap, osc_ref, osc_struct_size: number) {
  return Array.from(Array(16).keys()).map((index) =>
    wavetable_info(
      new DataView(heap, osc_ref + index * osc_struct_size, osc_struct_size)
    )
  );
}
