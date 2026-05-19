// Product data: specs per product type
export const productSpecs = {
  'type-c': {
    key: 'prod_c',
    rows: [
      { param: 'spec_width',     value: '100 / 150 / 200 / 300 / 400 / 500 mm' },
      { param: 'spec_height',    value: '50 / 60 / 80 / 100 mm' },
      { param: 'spec_thickness', value: '1.2 / 1.5 / 2.0 mm' },
      { param: 'spec_length',    value: '3,000 mm (standard)' },
      { param: 'spec_load',      value: 'Class B — 60 kg/m (3m span)' },
      { param: 'spec_material',  value: 'SGCC JIS G3302 / DX51D' },
      { param: 'spec_finish',    value: 'Hot-Dip Galvanized Z275' },
      { param: 'spec_standard',  value: 'SNI / IEC 61537' },
    ],
    svgType: 'C',
  },
  'type-u': {
    key: 'prod_u',
    rows: [
      { param: 'spec_width',     value: '100 / 150 / 200 / 300 mm' },
      { param: 'spec_height',    value: '60 / 80 / 100 mm' },
      { param: 'spec_thickness', value: '1.5 / 2.0 mm' },
      { param: 'spec_length',    value: '3,000 mm (standard)' },
      { param: 'spec_load',      value: 'Class B — 75 kg/m (3m span)' },
      { param: 'spec_material',  value: 'SGCC JIS G3302' },
      { param: 'spec_finish',    value: 'Hot-Dip Galvanized Z275' },
      { param: 'spec_standard',  value: 'SNI / IEC 61537' },
    ],
    svgType: 'U',
  },
  'type-w': {
    key: 'prod_w',
    rows: [
      { param: 'spec_width',     value: '300 / 400 / 500 / 600 mm' },
      { param: 'spec_height',    value: '80 / 100 mm' },
      { param: 'spec_thickness', value: '1.5 / 2.0 / 2.5 mm' },
      { param: 'spec_length',    value: '3,000 mm (standard)' },
      { param: 'spec_load',      value: 'Class C — 90 kg/m (3m span)' },
      { param: 'spec_material',  value: 'SGCC JIS G3302' },
      { param: 'spec_finish',    value: 'Hot-Dip Galvanized Z275 / Powder Coat' },
      { param: 'spec_standard',  value: 'SNI / IEC 61537' },
    ],
    svgType: 'W',
  },
  'heavy-duty': {
    key: 'prod_hd',
    rows: [
      { param: 'spec_width',     value: '200 / 300 / 400 / 500 mm' },
      { param: 'spec_height',    value: '100 / 120 mm' },
      { param: 'spec_thickness', value: '2.0 / 2.5 / 3.0 mm' },
      { param: 'spec_length',    value: '3,000 mm (standard)' },
      { param: 'spec_load',      value: 'Class D — 150 kg/m (3m span)' },
      { param: 'spec_material',  value: 'SPHC JIS G3131 (hot-rolled)' },
      { param: 'spec_finish',    value: 'Hot-Dip Galvanized Z350' },
      { param: 'spec_standard',  value: 'SNI / IEC 61537 Heavy Duty' },
    ],
    svgType: 'C',
  },
  'cable-ladder': {
    key: 'prod_l',
    rows: [
      { param: 'spec_width',     value: '200 / 300 / 400 / 500 / 600 mm' },
      { param: 'spec_height',    value: '65 / 75 / 100 mm' },
      { param: 'spec_thickness', value: '2.0 / 2.5 mm (rail)' },
      { param: 'spec_length',    value: '3,000 mm (standard)' },
      { param: 'spec_load',      value: 'Class E — 200 kg/m (1m span)' },
      { param: 'spec_material',  value: 'SGCC JIS G3302 / SPCC' },
      { param: 'spec_finish',    value: 'Hot-Dip Galvanized Z275 / Stainless 304' },
      { param: 'spec_standard',  value: 'SNI / IEC 61537 / VDE 0604' },
    ],
    svgType: 'L',
  },
};

// SVG cross-section path data for each profile type
export const crossSectionSVGs = {
  C: `
    <svg class="cross-section-svg" viewBox="0 0 180 80" xmlns="http://www.w3.org/2000/svg">
      <!-- Left rail -->
      <rect x="20" y="10" width="6" height="60"/>
      <!-- Bottom pan -->
      <rect x="20" y="68" width="140" height="5"/>
      <!-- Right rail -->
      <rect x="154" y="10" width="6" height="60"/>
      <!-- Left lip -->
      <rect x="20" y="10" width="16" height="5"/>
      <!-- Right lip -->
      <rect x="144" y="10" width="16" height="5"/>
      <!-- Dimension arrows -->
      <line x1="20" y1="4" x2="160" y2="4" stroke="#4A5568" stroke-width="0.8" stroke-dasharray="3,2"/>
      <text x="90" y="2" text-anchor="middle" font-size="6" fill="#4A5568" font-family="IBM Plex Mono">W</text>
    </svg>
  `,
  U: `
    <svg class="cross-section-svg" viewBox="0 0 180 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="8" width="6" height="64"/>
      <rect x="20" y="66" width="140" height="5"/>
      <rect x="154" y="8" width="6" height="64"/>
      <line x1="20" y1="3" x2="160" y2="3" stroke="#4A5568" stroke-width="0.8" stroke-dasharray="3,2"/>
      <text x="90" y="1.5" text-anchor="middle" font-size="6" fill="#4A5568" font-family="IBM Plex Mono">W</text>
    </svg>
  `,
  W: `
    <svg class="cross-section-svg" viewBox="0 0 180 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="10" width="5" height="60"/>
      <rect x="8" y="68" width="164" height="5"/>
      <rect x="167" y="10" width="5" height="60"/>
      <rect x="86" y="14" width="4" height="60"/>
      <rect x="8" y="10" width="14" height="5"/>
      <rect x="158" y="10" width="14" height="5"/>
    </svg>
  `,
  L: `
    <svg class="cross-section-svg" viewBox="0 0 180 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="10" width="8" height="60"/>
      <rect x="152" y="10" width="8" height="60"/>
      <!-- Rungs -->
      <rect x="28" y="24" width="124" height="7"/>
      <rect x="28" y="42" width="124" height="7"/>
      <rect x="28" y="60" width="124" height="7"/>
      <line x1="20" y1="4" x2="160" y2="4" stroke="#4A5568" stroke-width="0.8" stroke-dasharray="3,2"/>
      <text x="90" y="2" text-anchor="middle" font-size="6" fill="#4A5568" font-family="IBM Plex Mono">W</text>
    </svg>
  `,
};
