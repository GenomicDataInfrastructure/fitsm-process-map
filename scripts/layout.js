// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: CC-BY-4.0

/*
 * Readability metrics for the map layout, in grid units. Used by check.js; pure, no I/O.
 *
 * Each interface's route is a polyline from its first station through its waypoints to its
 * second station. For every pair of routes it finds:
 *   - crossings: distinct points where the two routes meet, other than a station both end at;
 *   - shared segments: stretches where the two routes lie on top of each other;
 *   - close parallels: parallel stretches at most CLOSE grid units apart.
 */

const CLOSE = 1;
const EPS = 1e-9;

const round = (v) => Math.round(v * 1000) / 1000;
const pointKey = (p) => `${round(p[0])},${round(p[1])}`;

/* Compares segment p-q with segment r-s and records what it finds in `out`. */
function compareSegments(p, q, r, s, out) {
  const d = (q[0] - p[0]) * (s[1] - r[1]) - (q[1] - p[1]) * (s[0] - r[0]);
  if (Math.abs(d) > EPS) {
    const t = ((r[0] - p[0]) * (s[1] - r[1]) - (r[1] - p[1]) * (s[0] - r[0])) / d;
    const u = ((r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])) / d;
    if (t >= -EPS && t <= 1 + EPS && u >= -EPS && u <= 1 + EPS) out.points.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    return;
  }
  // Parallel: how far apart, and how long they run side by side.
  const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
  const dir = [(q[0] - p[0]) / len, (q[1] - p[1]) / len];
  const dist = Math.abs(dir[0] * (r[1] - p[1]) - dir[1] * (r[0] - p[0]));
  const along = (v) => (v[0] - p[0]) * dir[0] + (v[1] - p[1]) * dir[1];
  const lo = Math.max(0, Math.min(along(r), along(s)));
  const hi = Math.min(len, Math.max(along(r), along(s)));
  const from = [p[0] + dir[0] * lo, p[1] + dir[1] * lo];
  const to = [p[0] + dir[0] * hi, p[1] + dir[1] * hi];
  if (dist < EPS) {
    if (hi - lo > EPS) out.shared.push({ from, to });
    else if (hi - lo > -EPS) out.points.push(from); // collinear, touching end to end
  } else if (dist <= CLOSE + EPS && hi - lo > EPS) {
    out.close.push({ from, to, distance: round(dist) });
  }
}

/* Metrics for a map.json object. Routes whose stations are missing are skipped. */
export function layoutMetrics(map) {
  const routes = [];
  for (const [id, waypoints] of Object.entries(map.routes || {})) {
    const ends = id.split("-");
    const [a, b] = ends.map((code) => map.stations[code]);
    if (!a || !b || !Array.isArray(waypoints)) continue;
    routes.push({ id, ends, points: [[a.x, a.y], ...waypoints, [b.x, b.y]] });
  }
  const crossings = [], shared = [], close = [];
  for (let i = 0; i < routes.length; i++) {
    for (let j = i + 1; j < routes.length; j++) {
      const A = routes[i], B = routes[j];
      const out = { points: [], shared: [], close: [] };
      for (let k = 1; k < A.points.length; k++) {
        for (let l = 1; l < B.points.length; l++) compareSegments(A.points[k - 1], A.points[k], B.points[l - 1], B.points[l], out);
      }
      // Two routes leaving the same station meet there by design; that is not a crossing.
      const station = new Set(A.ends.filter((c) => B.ends.includes(c)).map((c) => pointKey([map.stations[c].x, map.stations[c].y])));
      const onShared = (key) => out.shared.some(({ from, to }) => [from, to].some((p) => pointKey(p) === key));
      for (const key of new Set(out.points.map(pointKey))) {
        if (!station.has(key) && !onShared(key)) crossings.push({ a: A.id, b: B.id, at: key.split(",").map(Number) });
      }
      for (const s of out.shared) shared.push({ a: A.id, b: B.id, from: s.from.map(round), to: s.to.map(round) });
      for (const c of out.close) close.push({ a: A.id, b: B.id, from: c.from.map(round), to: c.to.map(round), distance: c.distance });
    }
  }
  return { crossings, shared, close };
}
