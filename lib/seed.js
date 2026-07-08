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
    mk(11, { material: "asphalt", shade: "shade", shadeSource: "building", temp: 41 }),
    mk(12, { material: "asphalt", shade: "shade", shadeSource: "tree", temp: 35 }),
    mk(13, { material: "asphalt", shade: "partial", shadeSource: "building", temp: 50 }),
    mk(14, { material: "playground", color: "red", shade: "shade", shadeSource: "building", temp: 44 }),
    mk(15, { material: "playground", color: "red", shade: "shade", shadeSource: "tree", temp: 39 }),
    mk(16, { material: "pavers", shade: "shade", shadeSource: "tree", temp: 34 }),
    mk(17, { material: "white-sand", shade: "shade", shadeSource: "tree", temp: 31 }),
    mk(18, { material: "grass", shade: "shade", shadeSource: "tree", temp: 30 }),
  ];
}
