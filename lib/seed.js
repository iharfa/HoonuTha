// A few example readings so charts and insights are alive on first open.
// Realistic midday values for the Maldives (surfaces get MUCH hotter than air).
export function buildSeed() {
  const now = Date.now();
  const H = 36e5;
  const mk = (h, r) => ({ id: "HD-" + (900 + h), at: now - h * H, airTemp: 31, by: "Sample", place: "Hulhumalé", ...r });
  return [
    mk(1, { material: "asphalt", shade: "full-sun", temp: 61 }),
    mk(2, { material: "playground", color: "red", shade: "full-sun", temp: 63 }),
    mk(3, { material: "playground", color: "blue", shade: "full-sun", temp: 56 }),
    mk(4, { material: "black-sand", shade: "full-sun", temp: 54 }),
    mk(5, { material: "pavers", shade: "full-sun", temp: 51 }),
    mk(6, { material: "road-marking", color: "yellow", shade: "full-sun", temp: 49 }),
    mk(7, { material: "pavers", shade: "full-sun", temp: 48 }),
    mk(8, { material: "road-marking", color: "white", shade: "full-sun", temp: 43 }),
    mk(9, { material: "white-sand", shade: "full-sun", temp: 38 }),
    mk(10, { material: "grass", shade: "full-sun", temp: 34 }),
    mk(11, { material: "asphalt", shade: "shade", temp: 39 }),
    mk(12, { material: "grass", shade: "shade", temp: 30 }),
    mk(13, { material: "asphalt", shade: "partial", temp: 50 }),
    mk(14, { material: "playground", color: "red", shade: "shade", temp: 42 }),
    mk(15, { material: "pavers", shade: "shade", temp: 35 }),
    mk(16, { material: "white-sand", shade: "shade", temp: 31 }),
  ];
}
