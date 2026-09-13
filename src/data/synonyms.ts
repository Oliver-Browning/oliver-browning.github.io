// Domain synonym layer for search. Maps a query term to related terms —
// entries are one-directional here for readability, but src/utils/synonymGraph.ts
// derives the reverse edge for every entry at build/run time, so listing
// "beamforming" -> "phased array" automatically makes "phased array" reach
// "beamforming" too. Don't type each pair twice.
//
// Adding an entry: pick the term someone would actually type, list what it
// should also find. Lowercase both sides. That's the whole format.
export const SYNONYMS: Record<string, string[]> = {
  // --- RF / radar bands -> frequency ranges and typical applications ---
  'x band': ['8 ghz', '12 ghz', '8-12 ghz', 'radar', 'phased array', 'satcom'],
  'ka band': ['26 ghz', '40 ghz', 'millimeter wave', 'mmwave', 'point to point'],
  's band': ['2 ghz', '4 ghz', 'weather radar', 'surveillance radar'],
  'l band': ['1 ghz', '2 ghz', 'gps', 'gnss'],
  'c band': ['4 ghz', '8 ghz', 'satcom', 'wifi backhaul'],

  // --- RF / antennas concept clusters ---
  beamforming: ['phased array', 'aesa', 'beam steering', 'phase shifter'],
  'phased array': ['beamforming', 'aesa', 'antenna array', 'beam steering'],
  radar: ['pulse compression', 'range resolution', 'doppler', 'x band'],
  'link budget': ['path loss', 'friis equation', 'eirp', 'noise figure', 'g/t'],
  'antenna pattern': ['radiation pattern', 'sidelobe', 'beamwidth', 'gain'],
  's-parameters': ['s11', 's21', 'return loss', 'insertion loss', 'vna'],
  vna: ['s-parameters', 'network analyzer', 'return loss', 'calibration'],
  impedance: ['matching network', 'smith chart', 'vswr', 'return loss'],
  filter: ['bandpass', 'lowpass', 'highpass', 'insertion loss'],

  // --- signal processing ---
  'signal processing': ['fft', 'filtering', 'sampling', 'nyquist'],
  fft: ['spectrum', 'frequency domain', 'signal processing'],
  sdr: ['software defined radio', 'rtl-sdr', 'tuner', 'direct conversion'],

  // --- PCB / hardware design ---
  pcb: ['schematic capture', 'layout', 'copper', 'altium', 'kicad'],
  'power supply': ['buck converter', 'regulator', 'switching regulator', 'ripple'],
  'buck converter': ['power supply', 'switching regulator', 'inductor', 'ripple'],
  eps: ['electrical power system', 'power supply', 'battery', 'solar array'],
  emi: ['electromagnetic interference', 'ground plane', 'shielding', 'layout'],
  layout: ['pcb', 'ground plane', 'trace routing', 'emi'],

  // --- embedded / firmware ---
  fpga: ['vhdl', 'verilog', 'vivado', 'quartus', 'rtl'],
  rtl: ['vhdl', 'verilog', 'fpga', 'digital logic'],
  microcontroller: ['mcu', 'stm32', 'arduino', 'embedded', 'firmware'],
  rtos: ['freertos', 'scheduler', 'embedded', 'firmware'],
  spi: ['serial peripheral interface', 'microcontroller', 'communication protocol'],
  i2c: ['serial communication', 'microcontroller', 'communication protocol'],

  // --- power / controls ---
  'control loop': ['pid', 'feedback', 'controls', 'stability'],
  pid: ['control loop', 'feedback controller', 'controls'],
  motor: ['brushless', 'bldc', 'motor controller', 'controls'],

  // --- mechanical / thermal ---
  thermal: ['heat sink', 'thermal management', 'conduction', 'cooling'],
  'heat sink': ['thermal', 'cooling', 'thermal management'],
  vibration: ['modal analysis', 'resonance', 'structural', 'mechanical'],
  cad: ['solidworks', 'mechanical design', '3d model'],

  // --- manufacturing / test ---
  'bring-up': ['bench testing', 'validation', 'debug'],
  'bench testing': ['bring-up', 'validation', 'test equipment'],
  oscilloscope: ['scope', 'bench testing', 'test equipment', 'waveform'],
  '3d printing': ['additive manufacturing', 'prototyping', 'fdm'],

  // --- software ---
  python: ['scripting', 'data analysis', 'automation'],
  matlab: ['simulation', 'signal processing', 'data analysis'],
};
