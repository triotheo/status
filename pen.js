/* THE PEN — ported verbatim from scripts/owner_dashboard.py (itself a port of the Learn app's
   drawnChrome / CoinChrome at the same seeds), the CALM pen of #1851 included. Edit there, re-extract here; never by hand. */

var SVG_STYLE = "position:absolute;inset:0;width:100%;height:100%;overflow:visible";

function mulberry(seed) { var s = seed >>> 0; return function () { return (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }; }

/* ── THE CALM PEN (#1851, the house-wide calm sweep; the owner, 2026-11-17: "yes apply these changes to dashboards as
   well"). Learn's pick, ported number for number from drawnChrome.ts and doodleGlyphs.tsx: a card's runs on the pill's
   hand (CALM_HAND), every corner ±0.33 at r16, every pill on the calm stadium, every coin's ring at RING_AMP and every
   fill in its line's own path. webapp/learn-doodle/scripts/check_pen_parity.mjs runs this block beside Learn's own
   functions, byte for byte, and fails a number that differs. Keep it plain ES5 with no dollar sign (string.Template). ── */
var CALM_PILL = 0.28, PILL_AMP = 0.8, SKETCH_AMP = 1.3, SKETCH_AMP_2 = 1.2, CALM_GAP = 8;
var CALM_HAND = { card: CALM_PILL, card2: CALM_PILL, corner: 0.33, pill: CALM_PILL };
var SKETCH_PASS = { w1: 2.6, w2: 2.2, opacity: 0.6, slip: [1.3, 1.1] };
var PILL_PASS = { w1: 2.2, w2: 2, opacity: 0.55, slip: [1.6, 1.4] };
var RING_AMP = (0.28 * 26) / 13.5;
function ringAmp(r) { return (RING_AMP * r) / 26; }
function calmPillAmp(r) { return Math.min(PILL_AMP, (CALM_PILL * r) / 13.5); }
function calmCornerAmp(r) { return CALM_HAND.corner * Math.pow(Math.max(0, Math.min(1, r / 16)), 1.5); }
function isPillBox(h, radius) { return radius >= h / 2 - 1; }
function runSegs(L, least, gap) {
  return Math.max(gap === undefined ? least : Math.max(1, Math.min(least, Math.floor(L / gap))), Math.round(L / 22));
}
function jitterRect(w, h, r, seed, amp, cornerAmp, gap) {
  if (amp === undefined) amp = 2.2;
  var rnd = mulberry(seed), pts = [], corner = [];
  var seg = function (x1, y1, x2, y2, n) { for (var i = 0; i < n; i++) { var t = i / n; pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]); corner.push(i === 0); } };
  var arc = function (cx, cy, a0, a1, n) { for (var i = 0; i < n; i++) { var a = a0 + (a1 - a0) * (i / n); pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); corner.push(true); } };
  var nTop = runSegs(w - 2 * r, 6, gap), nSide = runSegs(h - 2 * r, 3, gap);
  seg(r, 0, w - r, 0, nTop); arc(w - r, r, -Math.PI / 2, 0, 3);
  seg(w, r, w, h - r, nSide); arc(w - r, h - r, 0, Math.PI / 2, 3);
  seg(w - r, h, r, h, nTop); arc(r, h - r, Math.PI / 2, Math.PI, 3);
  seg(0, h - r, 0, r, nSide); arc(r, r, Math.PI, 1.5 * Math.PI, 3);
  var j = pts.map(function (p, i) { var a = cornerAmp !== undefined && corner[i] ? cornerAmp : amp; return [p[0] + (rnd() - 0.5) * 2 * a, p[1] + (rnd() - 0.5) * 2 * a]; });
  var d = "M " + j[0][0].toFixed(1) + " " + j[0][1].toFixed(1);
  for (var i = 1; i < j.length; i++) {
    var px = j[i - 1][0], py = j[i - 1][1], x = j[i][0], y = j[i][1];
    d += " Q " + px.toFixed(1) + " " + py.toFixed(1) + " " + ((px + x) / 2).toFixed(1) + " " + ((py + y) / 2).toFixed(1);
  }
  return d + " Z";
}
function calmAmp(w, h, r, amp, gap) {
  var sTop = (w - 2 * r) / runSegs(w - 2 * r, 6, gap), sSide = (h - 2 * r) / runSegs(h - 2 * r, 3, gap);
  return amp * Math.max(0, Math.min(1, Math.min(sTop, sSide) / 22));
}
function runAmp(w, h, rr, own, pick) { return Math.min(own, calmAmp(w, h, rr, pick, CALM_GAP)); }
function calmRunAmp(w, h, rr, which) { return which === "card" ? runAmp(w, h, rr, SKETCH_AMP, CALM_HAND.card) : runAmp(w, h, rr, SKETCH_AMP_2, CALM_HAND.card2); }
function calmSketchPaths(w, h, radius, seed) {
  if (isPillBox(h, radius)) { var a = calmPillAmp(h / 2); return [calmStadium(w, h, seed, a), calmStadium(w, h, seed + 7, a)]; }
  var rr = Math.min(radius, h / 2 - 1), ca = calmCornerAmp(rr);
  return [jitterRect(w, h, rr, seed, calmRunAmp(w, h, rr, "card"), Math.min(SKETCH_AMP, ca), CALM_GAP),
          jitterRect(w, h, rr, seed + 7, calmRunAmp(w, h, rr, "card2"), Math.min(SKETCH_AMP_2, ca), CALM_GAP)];
}
function calmInkPath(w, h, radius, seed, amp) {
  var rr = Math.min(radius, h / 2 - 1);
  if (isPillBox(h, radius)) return calmStadium(w, h, seed, Math.min(amp, calmPillAmp(h / 2)));
  return jitterRect(w, h, rr, seed, runAmp(w, h, rr, amp, CALM_HAND.card), Math.min(amp, calmCornerAmp(rr)), CALM_GAP);
}
function arcSteps(r) { return r >= 12 ? 3 : r >= 6 ? 2 : 1; }
function calmStadiumPts(w, h, cap) {
  var r = Math.min(cap !== undefined && cap < h / 2 ? cap : h / 2, w / 2);
  var k = arcSteps(r), step = Math.PI / 2 / k, m = 2 * r * Math.sin(step / 2), pts = [];
  var run = function (x0, y0, x1, y1, most) {
    var L = Math.hypot(x1 - x0, y1 - y0);
    if (L < m) { pts.push([(x0 + x1) / 2, (y0 + y1) / 2]); return; }
    var n = Math.max(1, Math.min(most, Math.floor(L / m)));
    for (var i = 0; i <= n; i++) pts.push([x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n]);
  };
  var arc = function (cx, cy, a0) { for (var i = 1; i < k; i++) { var a = a0 + step * i; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  var side = function (L) { return Math.max(1, Math.round(L / 22)); };
  run(r, 0, w - r, 0, 2); arc(w - r, r, -Math.PI / 2);
  run(w, r, w, h - r, side(h - 2 * r)); arc(w - r, h - r, 0);
  run(w - r, h, r, h, 2); arc(r, h - r, Math.PI / 2);
  run(0, h - r, 0, r, side(h - 2 * r)); arc(r, r, Math.PI);
  return pts;
}
function loopPath(pts, seed, amp) {
  var rnd = mulberry(seed);
  var j = pts.map(function (p) { return [p[0] + (rnd() - 0.5) * 2 * amp, p[1] + (rnd() - 0.5) * 2 * amp]; });
  var n = j.length, f = function (v) { return v.toFixed(1); };
  var d = "M " + f((j[n - 1][0] + j[0][0]) / 2) + " " + f((j[n - 1][1] + j[0][1]) / 2);
  for (var i = 0; i < n; i++) { var p = j[i], q = j[(i + 1) % n]; d += " Q " + f(p[0]) + " " + f(p[1]) + " " + f((p[0] + q[0]) / 2) + " " + f((p[1] + q[1]) / 2); }
  return d + " Z";
}
function calmStadium(w, h, seed, amp, cap) {
  if (!(w > 0 && h > 0)) return "";
  return loopPath(calmStadiumPts(w, h, cap), seed, amp);
}
function drawnStadium(w, h, seed, cap) {
  return calmStadium(w, h, seed, calmPillAmp(Math.min(cap !== undefined && cap < h / 2 ? cap : h / 2, w / 2)), cap);
}
/* THE CARET, one drawing in four directions (#1851, round 3 — the owner's w4: "fix the icon for the back caret to be a
   little bit more stable, similar to how we do the down caret"): Learn's doodleGlyphs `caretPath` and `CARET_PEN`, the
   fold chevron's five points turned about the 24-unit box's centre; check_pen_parity.mjs runs it beside Learn's */
var CARET_DOWN_PTS = [[5.2, 8.6], [8.6, 12], [12, 15.2], [15.4, 12], [18.8, 8.6]];
var CARET_PEN = 3;
function caretPath(dir) {
  dir = dir || "down";
  var f = function (v) { return String(+v.toFixed(2)); };
  return "M" + CARET_DOWN_PTS.map(function (p) {
    var dx = p[0] - 12, dy = p[1] - 12;
    var r = dir === "left" ? [-dy, dx] : dir === "right" ? [dy, -dx] : dir === "up" ? [-dx, -dy] : [dx, dy];
    return f(r[0] + 12) + " " + f(r[1] + 12);
  }).join(" ");
}
/* ── end of the calm pen ── */

function jitterCircle(r, box, seed, amp) {
  if (amp === undefined) amp = 2;
  var rnd = mulberry(seed), n = Math.max(12, Math.round((2 * Math.PI * r) / 10)), c = box / 2, pts = [];
  for (var i = 0; i < n; i++) { var a = (2 * Math.PI * i) / n, rr = r + (rnd() - 0.5) * 2 * amp; pts.push([c + rr * Math.cos(a), c + rr * Math.sin(a)]); }
  var mx = (pts[n - 1][0] + pts[0][0]) / 2, my = (pts[n - 1][1] + pts[0][1]) / 2;
  var d = "M " + mx.toFixed(1) + " " + my.toFixed(1);
  for (var k = 0; k < n; k++) {
    var p = pts[k], q = pts[(k + 1) % n];
    d += " Q " + p[0].toFixed(1) + " " + p[1].toFixed(1) + " " + ((p[0] + q[0]) / 2).toFixed(1) + " " + ((p[1] + q[1]) / 2).toFixed(1);
  }
  return d + " Z";
}

function wobblePath(pts, seed, amp, close) {
  if (amp === undefined) amp = 0.7;
  var rnd = mulberry(seed);
  var j = pts.map(function (p) { return [p[0] + (rnd() - 0.5) * 2 * amp, p[1] + (rnd() - 0.5) * 2 * amp]; });
  var d = "M " + j[0][0].toFixed(1) + " " + j[0][1].toFixed(1);
  for (var i = 1; i < j.length; i++) {
    var px = j[i - 1][0], py = j[i - 1][1], x = j[i][0], y = j[i][1];
    d += " Q " + px.toFixed(1) + " " + py.toFixed(1) + " " + ((px + x) / 2).toFixed(1) + " " + ((py + y) / 2).toFixed(1);
  }
  var l = j[j.length - 1];
  d += " L " + l[0].toFixed(1) + " " + l[1].toFixed(1);
  return d + (close ? " Z" : "");
}

function arcPts(cx, cy, rx, ry, a0, a1, n) {
  var out = [];
  for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * (i / n); out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
  return out;
}

function once(el, render, bind) {
  if (el.redraw) { el.redraw(); return; }
  el.redraw = render;
  render();
  if (window.ResizeObserver) new ResizeObserver(render).observe(el);
  if (bind) bind();
}

function sketch(el) {
  var wrap = el.querySelector(".btn-svg"), seed = +el.dataset.seed, radius = +(el.dataset.radius || 16);
  var ink = el.dataset.ink || "var(--border-strong)";
  once(el, function () {
    var w = el.offsetWidth, h = el.offsetHeight; if (!w || !h) return;
    var pp = calmSketchPaths(w, h, radius, seed), P = SKETCH_PASS;
    wrap.innerHTML = '<svg viewBox="-6 -6 ' + (w + 12) + ' ' + (h + 12) + '" aria-hidden="true" style="' + SVG_STYLE + '">'
      + '<path d="' + pp[0] + '" fill="none" stroke="' + ink + '" stroke-width="' + P.w1 + '" stroke-linecap="round" stroke-linejoin="round"/>'
      + '<path d="' + pp[1] + '" fill="none" stroke="' + ink + '" stroke-width="' + P.w2 + '" stroke-linecap="round" stroke-linejoin="round" opacity="' + P.opacity + '" transform="translate(' + P.slip[0] + ' ' + P.slip[1] + ')"/>'
      + '</svg>';
  });
}

function tube(el) {
  var seed = +el.dataset.seed, yarn = el.dataset.yarn, pct = +el.dataset.pct, H = 20;
  var ring = "color-mix(in srgb, " + yarn + " 80%, #000000)";
  once(el, function () {
    var w = el.offsetWidth; if (!w) return;
    var svg = '<svg viewBox="-4 -4 ' + (w + 8) + ' ' + (H + 8) + '" aria-hidden="true">'
      + '<path d="' + drawnStadium(w, H, seed) + '" fill="var(--coin-ghost)"/>'
      + '<path d="' + drawnStadium(w, H, seed) + '" fill="none" stroke="var(--nav-border)" stroke-width="' + PILL_PASS.w1 + '" stroke-linecap="round"/>'
      + '<path d="' + drawnStadium(w, H, seed + 7) + '" fill="none" stroke="var(--nav-border)" stroke-width="' + PILL_PASS.w2 + '" stroke-linecap="round" opacity="' + PILL_PASS.opacity + '" transform="translate(' + PILL_PASS.slip[0] + ' ' + PILL_PASS.slip[1] + ')"/>';
    if (pct > 0) {
      var fw = Math.max(H, Math.round((pct / 100) * w));
      svg += '<path d="' + drawnStadium(fw, H, seed + 1) + '" fill="' + yarn + '" stroke="' + ring + '" stroke-width="' + PILL_PASS.w2 + '" stroke-linecap="round"/>';
    }
    el.innerHTML = svg + '</svg>';
  });
}
