// Controlled vocabularies for project frontmatter. Keeps `rf`, `RF`, and
// `radio-frequency` from coexisting as three different tags: `domains` and
// `tech` in a post must come from these lists, and the build fails loudly
// with the exact bad value if they don't.
//
// Adding a genuinely new tag is a one-line addition here, not a schema
// change — add it to the relevant list below.

export const DOMAINS = [
  'rf',
  'antennas',
  'electronic-warfare',
  'signal-processing',
  'embedded',
  'firmware',
  'controls',
  'power',
  'pcb',
  'mechanical',
  'thermal',
  'manufacturing',
  'test',
  'software',
] as const;

export const TECH = [
  'HFSS',
  'CST Studio',
  'Altium',
  'KiCad',
  'Python',
  'MATLAB',
  'C',
  'C++',
  'VNA',
  'Spectrum Analyzer',
  'Oscilloscope',
  'STM32',
  'Arduino',
  'FreeRTOS',
  'SolidWorks',
  'LTspice',
] as const;

export type Domain = (typeof DOMAINS)[number];
export type Tech = (typeof TECH)[number];
