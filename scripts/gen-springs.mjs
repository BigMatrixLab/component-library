// Generates CSS linear() easings for spring presets.
// Model: perceptual duration d (s) + bounce b (0 = critically damped), as in Apple/Motion springs.
// Prints the easing and the time the spring needs to settle (use that as the CSS duration).
const presets = { snappy: [0.26, 0.12], smooth: [0.4, 0], morph: [0.42, 0.16] };

function spring(d, b) {
  const w0 = (2 * Math.PI) / d;
  const z = 1 - b;
  const x = (t) => {
    if (z >= 1) return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
  };
  let T = 0;
  for (let t = 0; t < 3; t += 0.001) if (Math.abs(1 - x(t)) > 0.002) T = t;
  T = Math.ceil(T * 100) / 100;
  const n = 48;
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(+x((T * i) / n).toFixed(4));
  pts[n] = 1;
  return { duration: Math.round(T * 1000), easing: `linear(${pts.join(', ')})`, peak: Math.max(...pts) };
}

for (const [name, [d, b]] of Object.entries(presets)) {
  const s = spring(d, b);
  console.log(`/* ${name}: perceptual ${d * 1000}ms, bounce ${b}, settles in ${s.duration}ms, peak ${s.peak} */`);
  console.log(`--ui-spring-${name}: ${s.easing};`);
  console.log(`--ui-spring-${name}-duration: ${s.duration}ms;`);
}
