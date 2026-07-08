// Science model + reference data for Heat Detectives.
// Albedo = how much sunlight a surface bounces back (0 = soaks up everything
// and gets hot, 1 = mirror). These are approximate, kid-friendly values used
// for the Field Guide and to explain the readings the children collect.

export const APP = {
  name: "Heat Detectives",
  short: "HeatDetectives",
  tagline: "Maldives surface-temperature science",
  theme: "#f97316",
};

// How much sun is hitting the spot when measured.
export const SHADE = {
  "full-sun": { id: "full-sun", label: "Full sun", iconName: "sun", hint: "No shade at all" },
  partial:    { id: "partial",  label: "Partial sun", iconName: "cloudSun", hint: "A bit of sun, a bit of shade" },
  shade:      { id: "shade",    label: "Full shade", iconName: "tree", hint: "Under a tree, roof or wall" },
};
export const SHADE_LIST = Object.values(SHADE);

// When a reading is shaded, what is casting the shade? Tree shade is usually
// cooler than building shade because leaves also release water vapour
// (evapotranspiration) — comparing the two shows that effect, while both
// beating full sun shows that any shade helps.
export const SHADE_SOURCE = {
  tree:     { id: "tree",     label: "Under a tree",             short: "tree shade",     iconName: "tree", hint: "Leaves overhead" },
  building: { id: "building", label: "Under a building or wall", short: "building shade", iconName: "city", hint: "A roof, wall or building casts it" },
};
export const SHADE_SOURCE_LIST = Object.values(SHADE_SOURCE);
export const srcById = (id) => SHADE_SOURCE[id];

// Fallback Maldives daytime air temperature (°C). The live value comes from
// lib/ambient.js (Open-Meteo, refreshed once a day); this is used offline or
// before it loads. Surfaces in full sun sit well above this baseline.
export const AMBIENT = 32;

// The surfaces kids will find around Malé, Hulhumalé and the islands.
// `sunTemp` = a scientifically-typical surface temperature at solar noon in
// full sun with ~32°C air (from published surface-temperature studies of sand,
// asphalt, concrete and rubber in hot climates). Grass is deliberately cooler
// than its albedo alone predicts because evapotranspiration removes heat.
// `colors: true` + `colorSet` means we ask which of those colours it is.
export const MATERIALS = [
  { id: "white-sand", label: "White sand", icon: "🏖️", family: "Sand", albedo: 0.40, colors: false, sunTemp: 40,
    about: "Bright coral sand bounces back lots of sunlight, so it stays the coolest sand." },
  { id: "grey-sand", label: "Greyish sand", icon: "🌫️", family: "Sand", albedo: 0.30, colors: false, sunTemp: 46,
    about: "Greyer sand soaks up a little more sun than white sand." },
  { id: "brown-sand", label: "Brown sand", icon: "🟫", family: "Sand", albedo: 0.22, colors: false, sunTemp: 50,
    about: "Brown sand is darker, so it heats up more in the sun." },
  { id: "black-sand", label: "Black sand", icon: "⚫", family: "Sand", albedo: 0.12, colors: false, sunTemp: 57,
    about: "Dark volcanic sand drinks up almost all the sunlight — it can get very hot!" },
  { id: "asphalt", label: "Asphalt road", icon: "🛣️", family: "Paving", albedo: 0.08, colors: false, sunTemp: 62,
    about: "Black tar roads are one of the hottest surfaces in any city." },
  { id: "pavers", label: "Concrete pavers", icon: "🧱", family: "Paving", albedo: 0.32, colors: false, sunTemp: 49,
    about: "Interlocking paver blocks — in the Maldives these are almost always grey concrete." },
  { id: "playground", label: "Playground rubber", icon: "🛝", family: "Play area", albedo: 0.12, colors: true, colorSet: ["red", "green", "blue"], sunTemp: 62,
    about: "Soft rubber play surfaces (EPDM), usually red, green or blue. Dark ones get surprisingly hot." },
  { id: "road-marking", label: "Road-marking paint", icon: "🚧", family: "Paint", albedo: 0.45, colors: true, colorSet: ["white", "yellow", "red"], sunTemp: 44,
    about: "Painted lines on the road — white and yellow, and sometimes red in the Maldives." },
  { id: "grass", label: "Grass / plants", icon: "🌿", family: "Living", albedo: 0.25, colors: false, sunTemp: 36,
    about: "Plants 'sweat' out water (evapotranspiration) which keeps them cool even in full sun." },
];

// Colours we offer for surfaces that vary. `light` (0..1) is roughly how bright
// the colour is, which we use to estimate its albedo.
export const COLORS = [
  { id: "white",  label: "White",  hex: "#f8fafc", light: 0.95 },
  { id: "cream",  label: "Cream",  hex: "#f0e4c3", light: 0.82 },
  { id: "yellow", label: "Yellow", hex: "#facc15", light: 0.75 },
  { id: "grey",   label: "Grey",   hex: "#94a3b8", light: 0.55 },
  { id: "green",  label: "Green",  hex: "#22c55e", light: 0.50 },
  { id: "orange", label: "Orange", hex: "#fb923c", light: 0.55 },
  { id: "blue",   label: "Blue",   hex: "#3b82f6", light: 0.42 },
  { id: "red",    label: "Red",    hex: "#dc2626", light: 0.38 },
  { id: "brown",  label: "Brown",  hex: "#92400e", light: 0.28 },
  { id: "black",  label: "Black",  hex: "#1e293b", light: 0.10 },
];

export const matById = (id) => MATERIALS.find((m) => m.id === id);
export const colorById = (id) => COLORS.find((c) => c.id === id);

// Estimate a surface's albedo from its material and (if it has one) its colour.
export function estAlbedo(materialId, colorId) {
  const m = matById(materialId);
  if (!m) return 0.2;
  if (m.colors && colorId) {
    const c = colorById(colorId);
    if (c) return Math.round((0.05 + c.light * 0.55) * 100) / 100; // light 0..1 -> ~0.05..0.6
  }
  return m.albedo;
}

// A friendly hot/cold colour for a temperature, blue -> green -> yellow -> red.
export function tempColor(t) {
  if (t < 32) return "#38bdf8"; // cool blue
  if (t < 40) return "#22c55e"; // green
  if (t < 48) return "#eab308"; // yellow
  if (t < 56) return "#f97316"; // orange
  return "#ef4444"; // hot red
}

// A one-word feel for a temperature, for kid-friendly labels.
export function tempFeel(t) {
  if (t < 32) return "comfy";
  if (t < 40) return "warm";
  if (t < 48) return "hot";
  if (t < 56) return "very hot";
  return "scorching";
}

export const fmtTemp = (t) => `${Math.round(t)}°C`;
