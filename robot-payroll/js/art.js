/* Robot Payroll — the pictures. Hand-built 960×400 SVG scenes of the Depot, a Busytown warehouse in cutaway with a
   payroll office upstairs that pays humans and robots side by side, assembled from a small drawn cast (the picker,
   the picker robot, the payroll clerk, the remote operator, totes, the charger, the spares cage), plus the nav and
   cast icons. Flat gouache fills, one warm-brown outline, every object labelled with a hairline pointer.
   Exposed as window.RP_ART (scenes) and window.RP_ICONS (icons). Primitives shared with Demos to Deployment. */
(function (root) {
  "use strict";
  var L = "#4A2E1E", PAPER = "#FBF7EC", SHEET = "#FFFDF6", YEL = "#F4C430", BRICK = "#C8452F", GRASS = "#5FA03C", SKY = "#9CCBEA",
      SAND = "#DDBB8A", LILAC = "#B8A3DC", STEEL = "#B9BDC2", WOOD = "#B8793F", NOTE = "#FFF1A8", CHALK = "#2F4A3A",
      BAD = "#A5321F", MAST = "#2C6E58", VEST = "#CFE03A", SILVER = "#E4E7EA", CREAM = "#FFF6DC", KERB = "#D6CFC2",
      SKIN = "#F1C9A5", SKIN2 = "#D9A27A", SKIN3 = "#9C6B4A", CORK = "#D2A877", BLUE = "#246A9C", TOTE = "#5B8FC0", GOLD = "#E0A91E", SCREEN = "#D8F0E0";
  var HAND = "'Patrick Hand', 'Comic Sans MS', sans-serif", SIGN = "'Grandstander', 'Patrick Hand', sans-serif";

  /* ---------- primitives (as in Demos to Deployment) ---------- */

  /* ---------- primitives ---------- */
  function n(v) { return Math.round(v * 10) / 10; }
  function cl(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function st(sw) { return sw === 0 ? "" : ' stroke="' + L + '" stroke-width="' + (sw || 2.5) + '"'; }
  function R(x, y, w, h, f, sw, rx, ex) { return '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + f + '"' + st(sw) + (ex || "") + "/>"; }
  function C(x, y, r, f, sw, ex) { return '<circle cx="' + n(x) + '" cy="' + n(y) + '" r="' + r + '" fill="' + f + '"' + st(sw === undefined ? 2 : sw) + (ex || "") + "/>"; }
  function E(x, y, rx, ry, f, sw, ex) { return '<ellipse cx="' + n(x) + '" cy="' + n(y) + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"' + st(sw === undefined ? 2 : sw) + (ex || "") + "/>"; }
  function P(d, f, sw, ex) { return '<path d="' + d + '" fill="' + (f || "none") + '"' + st(sw === undefined ? 2 : sw) + (ex || "") + "/>"; }
  function K(d, col, w, ex) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + w + '"' + (ex || "") + "/>"; }
  function G(tf, inner, ex) { return '<g transform="' + tf + '"' + (ex || "") + ">" + inner + "</g>"; }
  function rnd(seed) { var r = seed; return function () { r = (r * 9301 + 49297) % 233280; return r / 233280; }; }
  function ss(t) { t = cl(t, 0, 1); return t * t * (3 - 2 * t); }
  function txt(x, y, s, o) {
    o = o || {};
    return '<text x="' + n(x) + '" y="' + n(y) + '" font-family="' + (o.sign ? SIGN : HAND) + '" font-size="' + (o.size || 15) + '"' + (o.sign ? ' font-weight="800"' : "") +
      ' fill="' + (o.fill || L) + '"' + (o.anchor ? ' text-anchor="' + o.anchor + '"' : "") + (o.tf ? ' transform="' + o.tf + '"' : "") + (o.ls ? ' letter-spacing="' + o.ls + '"' : "") + ">" + s + "</text>";
  }
  // A painted signboard title: uppercase sign lettering in paper on a coloured board, with the 2px dark offset copy.
  function board(x, y, w, s, col) {
    return R(x, y, w, 36, col || MAST, 3, 6) + '<g font-family="' + SIGN + '" font-weight="800" font-size="21" letter-spacing="1" text-anchor="middle">' +
      '<text x="' + (x + w / 2 + 2) + '" y="' + (y + 27) + '" fill="' + L + '">' + s + '</text><text x="' + (x + w / 2) + '" y="' + (y + 25) + '" fill="' + PAPER + '">' + s + "</text></g>";
  }
  // A hand-lettered label (one or more lines) joined to its object by a hairline pointer; t = [x, y] of the object.
  // With plate, the lettering sits on a small paper tag so it reads on the asphalt.
  // Patrick Hand advance widths (per 100px) for ASCII 32–126, so a tag fits its lettering.
  var GW = [23,25,30,46,51,64,53,16,33,36,40,48,20,40,21,42,45,36,47,45,37,42,40,49,43,37,23,23,40,57,40,37,55,49,51,55,47,44,37,48,47,23,37,52,37,59,53,56,48,65,45,46,47,55,56,62,60,44,51,30,42,30,37,57,22,39,41,39,39,40,36,44,42,22,23,41,27,68,45,40,43,46,38,38,34,40,40,46,45,42,43,34,18,33,53];
  function tw(s, z) { var w = 0; s.replace(/&[a-z#0-9]+;/g, "x").split("").forEach(function (c) { w += GW[c.charCodeAt(0) - 32] || 64; }); return w * z / 100; }
  function label(x, y, lines, t, o) {
    o = o || {}; if (typeof lines === "string") lines = [lines];
    var z = o.size || 15, lh = Math.round(z * 1.22), an = o.anchor || "start", w = 0, s = "";
    lines.forEach(function (l) { w = Math.max(w, tw(l, z)); });
    var x0 = an === "middle" ? x - w / 2 : an === "end" ? x - w : x, pd = o.plate ? 7 : 3;
    var b = [x0 - pd, y - z * 0.8 - pd + 1, x0 + w + pd, y + (lines.length - 1) * lh + z * 0.25 + pd - 1];
    if (t) {
      var ax, ay;
      if (o.from) { ax = o.from[0]; ay = o.from[1]; }
      else if (t[1] > b[3]) { ax = cl(t[0], b[0] + 10, b[2] - 10); ay = b[3]; }
      else if (t[1] < b[1]) { ax = cl(t[0], b[0] + 10, b[2] - 10); ay = b[1]; }
      else { ax = t[0] < b[0] ? b[0] : b[2]; ay = cl(t[1], b[1] + 4, b[3] - 4); }
      s += K("M" + n(ax) + " " + n(ay) + " L" + t[0] + " " + t[1], L, 1.2) + C(t[0], t[1], 1.8, L, 0);
    }
    if (o.plate) s += R(b[0], b[1], b[2] - b[0], b[3] - b[1], SHEET, 1.6, 6, ' class="pl"');
    lines.forEach(function (l, i) { s += txt(x, y + i * lh, l, { size: z, anchor: an, fill: (o.fills && o.fills[i]) || o.fill }); });
    return s;
  }
  function note(x, y, w, h, lines, o) {   // a sticky note or index card
    o = o || {};
    var s = '<g transform="rotate(' + (o.rot || 0) + " " + (x + w / 2) + " " + (y + h / 2) + ')">' + R(x, y, w, h, o.fill || NOTE, 2, 3);
    if (o.tape) s += R(x + w / 2 - 16, y - 6, 32, 12, "rgba(156,203,234,.8)", 0, 0, ' stroke="rgba(74,46,30,.4)" stroke-width="1.2" transform="rotate(3 ' + (x + w / 2) + " " + y + ')"');
    lines.forEach(function (ln, i) { s += txt(x + 9, y + 20 + i * 18, ln, { size: o.size || 15, sign: i === 0 && o.head }); });
    return s + "</g>";
  }
  function bubble(x, y, w, h, tx, ty, o) {   // a speech bubble with a tail to (tx, ty), or a thought bubble trailing circles
    o = o || {};
    var s = R(x, y, w, h, SHEET, 2, 14), bx = cl(tx, x + 24, x + w - 24), by = ty > y + h ? y + h : y;
    if (o.thought) { for (var i = 1; i <= 3; i++) { var k = i / 4; s += C(bx + (tx - bx) * k, by + (ty - by) * k, 6 - i * 1.3, SHEET, 1.8); } }
    else s += P("M" + (bx - 9) + " " + (by + (ty > by ? -1.5 : 1.5)) + " L" + tx + " " + ty + " L" + (bx + 9) + " " + (by + (ty > by ? -1.5 : 1.5)), SHEET, 2);
    return s;
  }
  function cloud(x, y, sc) { return G("translate(" + x + " " + y + ") scale(" + (sc || 1) + ")", P("M-34 10 a14 14 0 0 1 6 -22 a18 18 0 0 1 32 -8 a14 14 0 0 1 24 10 a12 12 0 0 1 4 20 z", SHEET, 2)); }
  function tree(x, y, sc) {
    return G("translate(" + x + " " + y + ") scale(" + (sc || 1) + ")", R(-5, -40, 10, 40, WOOD, 2) + C(0, -62, 28, GRASS, 2.5) + C(-18, -48, 16, GRASS, 2) + C(16, -46, 15, GRASS, 2) + K("M-8 -70 q6 -6 12 -2", "#7DB85A", 3));
  }
  function lamp(x, y, h) { h = h || 96; return K("M" + x + " " + y + " V" + (y - h) + " h14", L, 4) + P("M" + (x + 6) + " " + (y - h) + " h18 l-3 9 h-12 z", "#4F6B5C", 2) + C(x + 15, y - h + 11, 3.5, NOTE, 1.5) + R(x - 6, y - 6, 12, 6, "#4F6B5C", 2, 1); }
  function bench(x, y) { return R(x, y - 18, 64, 7, WOOD, 2, 2) + R(x, y - 30, 64, 6, WOOD, 2, 2) + K("M" + (x + 8) + " " + (y - 11) + " v11 M" + (x + 56) + " " + (y - 11) + " v11", L, 3); }
  function hydrant(x, y) { return R(x - 7, y - 22, 14, 22, BRICK, 2, 3) + P("M" + (x - 8) + " " + (y - 22) + " a8 7 0 0 1 16 0 z", BRICK, 2) + R(x - 11, y - 16, 22, 5, BRICK, 1.5, 2); }
  /* ---------- the cast ---------- */
  // A rounded Busytown worker standing about 75 tall; (x, y) = feet centre. lh / rh = hand offsets from the hip.
  function person(x, y, o) {
    o = o || {};
    var sk = o.skin || SKIN, sh = o.shirt || SKY, pc = o.pants || "#59606A", hip = y - (o.sit ? 12 : 22), s = "", top = hip - 28, hy = top - 12;
    if (!o.noLegs) s += R(x - 10, hip, 8, y - hip, pc, 2, 3) + R(x + 2, hip, 8, y - hip, pc, 2, 3) + E(x - 7, y, 6, 3, L, 0) + E(x + 7, y, 6, 3, L, 0);
    s += R(x - 14, top, 28, 32, sh, 2, 9);
    if (o.vest) s += R(x - 14, top, 28, 32, VEST, 2, 9) + P("M" + (x - 7) + " " + top + " L" + x + " " + (top + 10) + " L" + (x + 7) + " " + top + " z", sh, 1.5) + R(x - 13.5, top + 14, 27, 4, SILVER, 1.2) + R(x - 13.5, top + 22, 27, 4, SILVER, 1.2);
    if (o.overalls) s += R(x - 9, top + 9, 18, 23, SHEET, 1.5, 3) + K("M" + (x - 8) + " " + (top + 10) + " L" + (x - 11) + " " + (top + 1) + " M" + (x + 8) + " " + (top + 10) + " L" + (x + 11) + " " + (top + 1), L, 1.5) + C(x - 3, top + 17, 1.8, YEL, 0) + C(x + 4, top + 24, 1.5, YEL, 0);
    var sy = top + 6, lh = [x + (o.lh ? o.lh[0] : -24), hip + (o.lh ? o.lh[1] : -10)], rh = [x + (o.rh ? o.rh[0] : 24), hip + (o.rh ? o.rh[1] : -10)];
    [[x - 13, lh], [x + 13, rh]].forEach(function (a) { var d = "M" + a[0] + " " + sy + " L" + n(a[1][0]) + " " + n(a[1][1]); s += K(d, L, 7) + K(d, sh, 3.5); });
    s += C(lh[0], lh[1], 4, sk, 1.5) + C(rh[0], rh[1], 4, sk, 1.5);
    s += C(x, hy, 13, sk, 2) + C(x - 4, hy - 1, 1.6, L, 0) + C(x + 4, hy - 1, 1.6, L, 0) + C(x - 8, hy + 3, 2.4, "#E79C86", 0, ' opacity=".6"') + C(x + 8, hy + 3, 2.4, "#E79C86", 0, ' opacity=".6"');
    var m = o.mouth;
    s += m === "o" ? E(x, hy + 6, 2.2, 2.8, L, 0) : m === "frown" ? K("M" + (x - 4) + " " + (hy + 7) + " q4 -3 8 0", L, 1.5) : m === "flat" ? K("M" + (x - 3) + " " + (hy + 6) + " h6", L, 1.5) : K("M" + (x - 4) + " " + (hy + 4) + " q4 3.5 8 0", L, 1.5);
    if (o.stache) s += P("M" + (x - 6) + " " + (hy + 4) + " q3 -3 6 0 q3 -3 6 0 q-6 3 -12 0 z", L, 0);
    if (o.hair) s += P("M" + (x - 13) + " " + (hy - 2) + " a13 13 0 0 1 26 0 v-2 a13 13 0 0 0 -26 0 z", o.hair, 1.5);
    var hc = o.hatCol || BRICK;
    if (o.hat === "cap") s += P("M" + (x - 13) + " " + (hy - 4) + " a13 13 0 0 1 26 0 z", hc, 2) + R(x + (o.capL ? -18 : -2), hy - 7, 20, 5, hc, 1.5, 2);
    if (o.hat === "visor") s += P("M" + (x - 14) + " " + (hy - 4) + " h28 l-4 -7 h-20 z", GRASS, 1.5) + K("M" + (x + 12) + " " + (hy - 1) + " l7 -9", YEL, 2.4);
    if (o.hat === "beret") s += E(x + 2, hy - 11, 13, 5, hc, 2);
    return s;
  }

  /* ---------- the cast ---------- */
  // The picker robot: a wheeled mobile manipulator, school-bus yellow base, steel mast, a screen face, one arm with a
  // suction cup, a status light on top. (x, y) = ground under its middle; faces right. About 135 tall at sc = 1.
  // o.face: happy | worried | asleep | flat | dizzy; o.light: colour; o.arm: reach | down | up | rest; o.item: true.
  function bot(x, y, sc, o) {
    o = o || {}; sc = sc || 1;
    var s = '<g transform="translate(' + n(x) + " " + n(y) + ") scale(" + (o.flip ? -sc : sc) + " " + sc + ')"' + (o.ghost ? ' opacity=".4"' : "") + ">";
    s += C(-24, -10, 10, "#3A2A20", 2) + C(-24, -10, 3.6, STEEL, 1.2) + C(24, -10, 10, "#3A2A20", 2) + C(24, -10, 3.6, STEEL, 1.2);
    s += R(-38, -34, 76, 24, YEL, 2.5, 8) + R(-38, -21, 76, 4, "#D9A514", 1.2) + R(-30, -30, 14, 6, SHEET, 1.2, 2) + C(26, -27, 2.2, o.batt || GRASS, 1);
    s += R(-9, -94, 18, 62, STEEL, 2.2, 4) + K("M-9 -64 h18 M-9 -50 h18", L, 1.2);
    var arm = o.arm || "reach", sh = [8, -82], el, wr;
    if (arm === "down") { el = [38, -88]; wr = [58, -44]; }
    else if (arm === "up") { el = [30, -112]; wr = [50, -140]; }
    else if (arm === "rest") { el = [26, -60]; wr = [40, -46]; }
    else { el = [40, -98]; wr = [64, -70]; }
    var ad = "M" + sh[0] + " " + sh[1] + " L" + el[0] + " " + el[1] + " L" + wr[0] + " " + wr[1];
    s += K(ad, L, 10) + K(ad, STEEL, 6) + C(sh[0], sh[1], 5, STEEL, 2) + C(el[0], el[1], 5, STEEL, 2);
    if (arm === "up") s += R(wr[0] - 6, wr[1] - 12, 12, 12, BRICK, 2, 3);
    else s += K("M" + wr[0] + " " + wr[1] + " v9", L, 4) + P("M" + (wr[0] - 8) + " " + (wr[1] + 14) + " h16 l-3 -5 h-10 z", "#3A2A20", 1.6);
    if (o.item) s += R(wr[0] - 10, wr[1] + 14, 20, 15, o.itemCol || SAND, 2, 2) + K("M" + (wr[0] - 10) + " " + (wr[1] + 20) + " h20", L, 1);
    s += R(-24, -128, 48, 36, "#5A4636", 2.2, 8) + R(-19, -123, 38, 26, SCREEN, 1.5, 5);
    var f = o.face;
    if (f === "worried") s += C(-8, -112, 2.4, L, 0) + C(8, -112, 2.4, L, 0) + K("M-12 -117 l6 -2 M12 -117 l-6 -2", L, 1.4) + E(0, -104, 2.4, 1.8, L, 0);
    else if (f === "asleep") s += K("M-11 -111 h6 M5 -111 h6", L, 1.8) + K("M-4 -104 h8", L, 1.4);
    else if (f === "flat") s += C(-8, -112, 2.4, L, 0) + C(8, -112, 2.4, L, 0) + K("M-5 -104 h10", L, 1.5);
    else if (f === "dizzy") s += K("M-11 -115 l5 5 m0 -5 l-5 5 M5 -115 l5 5 m0 -5 l-5 5", L, 1.6) + K("M-4 -103 q4 -3 8 0", L, 1.4);
    else s += C(-8, -112, 2.4, L, 0) + C(8, -112, 2.4, L, 0) + K("M-6 -106 q6 5 12 0", L, 1.5);
    s += K("M0 -128 v-6", L, 2.5) + C(0, -138, 5, o.light || GRASS, 1.8);
    if (o.light === BRICK) s += K("M-10 -146 l-4 -4 M10 -146 l4 -4 M0 -148 v-6", BRICK, 2);
    return s + (o.extra || "") + "</g>";
  }
  // A plastic tote, open at the top, with a few goods peeking out. (x, y) = top-left of the rim.
  function tote(x, y, w, h, o) {
    o = o || {}; w = w || 44; h = h || 22;
    var s = "";
    if (o.goods !== false) s += R(x + 6, y - 8, 12, 10, SAND, 1.5, 1) + R(x + 20, y - 11, 9, 13, BRICK, 1.5, 1) + C(x + w - 11, y - 4, 6, GRASS, 1.5);
    return s + P("M" + x + " " + y + " h" + w + " l-4 " + h + " h-" + (w - 8) + " z", o.col || TOTE, 2) + R(x - 2, y - 1, w + 4, 5, o.col || TOTE, 1.8, 2);
  }
  // A roller conveyor at waist height. (x, y) = left end of the belt top.
  function conveyor(x, y, w) {
    var s = R(x, y, w, 10, STEEL, 2, 3), d = "";
    for (var i = x + 10; i < x + w - 4; i += 16) d += "M" + i + " " + (y + 2) + " v6 ";
    s += K(d, L, 1.2);
    for (i = x + 16; i < x + w; i += Math.max(60, (w - 32) / 3)) s += K("M" + i + " " + (y + 10) + " v" + 36, L, 4);
    return s;
  }
  // A shelving rack with boxes. (x, y) = top-left; drawn pale so it recedes.
  function rack(x, y, w, h, seed) {
    var s = R(x, y, w, h, "#EADFC6", 2) , r = rnd(seed || 4), cols = [SAND, "#C9B07F", TOTE, "#E6C77A"];
    var shelves = Math.max(2, Math.round(h / 44));
    for (var i = 1; i <= shelves; i++) {
      var sy = y + i * h / shelves;
      s += K("M" + x + " " + sy + " h" + w, L, 2.2);
      for (var bx = x + 5; bx < x + w - 18; bx += 18 + r() * 8) { var bh = 12 + r() * 14; s += R(bx, sy - bh, 14 + r() * 4, bh, cols[Math.floor(r() * 4)], 1.4, 1); }
    }
    return s + K("M" + (x + 3) + " " + y + " v" + h + " M" + (x + w - 3) + " " + y + " v" + h, L, 3);
  }
  // A desk in side view; (x, y) = top-left of the desktop.
  function desk(x, y, w, h) { return R(x, y, w, 8, WOOD, 2.2, 2) + R(x + 6, y + 8, w - 12, (h || 40) - 8, "#C98E52", 2, 2) + K("M" + (x + w / 2) + " " + (y + 12) + " v" + ((h || 40) - 16), L, 1.2) + C(x + w / 4, y + 22, 2, L, 0) + C(x + 3 * w / 4, y + 22, 2, L, 0); }
  function ledger(x, y, w) { w = w || 70; return P("M" + x + " " + y + " q" + w / 4 + " -6 " + w / 2 + " 0 q" + w / 4 + " -6 " + w / 2 + " 0 v-4 q-" + w / 4 + " -6 -" + w / 2 + " 0 q-" + w / 4 + " -6 -" + w / 2 + " 0 z", SHEET, 1.8) + K("M" + (x + w / 2) + " " + y + " v-4", L, 1.2) + R(x - 3, y, w + 6, 4, "#2C6E58", 1.6, 1); }
  // Pigeonholes full of pay envelopes. (x, y) = top-left. Two rows labelled by the caller.
  function pigeonholes(x, y, cols, rows) {
    var cw = 20, ch = 24, s = R(x, y, cols * cw + 8, rows * ch + 8, WOOD, 2.5, 3);
    for (var i = 0; i < cols; i++) for (var j = 0; j < rows; j++) {
      var cx = x + 4 + i * cw, cy = y + 4 + j * ch;
      s += R(cx, cy, cw, ch, "#8C5A2E", 1.4) + R(cx + 3, cy + 7 + (i % 2) * 3, cw - 6, 13, j === 0 ? SHEET : NOTE, 1.2, 1);
    }
    return s;
  }
  // A punch clock with a card rack. (x, y) = top-left.
  function punchClock(x, y) {
    return R(x, y, 46, 58, "#7C8C99", 2.5, 6) + C(x + 23, y + 20, 13, SHEET, 2) + K("M" + (x + 23) + " " + (y + 20) + " v-9 M" + (x + 23) + " " + (y + 20) + " l7 3", L, 1.8) + R(x + 12, y + 40, 22, 8, "#3A2A20", 1.2, 1) +
      R(x + 54, y + 2, 22, 56, WOOD, 2, 2) + R(x + 58, y - 6, 6, 22, SHEET, 1.2, 1) + R(x + 66, y - 3, 6, 22, NOTE, 1.2, 1) + R(x + 58, y + 28, 6, 22, SHEET, 1.2, 1) + R(x + 66, y + 31, 6, 22, NOTE, 1.2, 1);
  }
  // A payslip: a paper slip with a perforated top, a heading and line items. lines = [[label, value], ...].
  function payslip(x, y, w, title, lines, o) {
    o = o || {};
    var lh = o.lh || 15, h = 30 + lines.length * lh + 8, s = '<g transform="rotate(' + (o.rot || 0) + " " + (x + w / 2) + " " + (y + h / 2) + ')">';
    s += R(x, y, w, h, o.fill || SHEET, 2, 2) + K("M" + (x + 4) + " " + (y + 7) + " h" + (w - 8), L, 1, ' stroke-dasharray="2 3"');
    s += txt(x + w / 2, y + 23, title, { size: o.ts || 12, sign: true, anchor: "middle", fill: o.tcol || L });
    lines.forEach(function (ln, i) {
      var yy = y + 40 + i * lh, last = i === lines.length - 1 && o.total;
      if (last) s += K("M" + (x + 6) + " " + (yy - lh + 4) + " h" + (w - 12), L, 1.4);
      s += txt(x + 7, yy, ln[0], { size: o.size || 12, fill: last ? L : "#6E5040" }) + txt(x + w - 7, yy, ln[1], { size: o.size || 12, anchor: "end", sign: last });
    });
    if (o.pin) s += C(x + w / 2, y + 3, 4, o.pin, 1.5);
    return s + "</g>";
  }
  // A monitor on a little stand. o.alert: red frame and HELP.
  function monitor(x, y, w, h, o) {
    o = o || {};
    var s = R(x + w / 2 - 4, y + h, 8, 8, "#5A4636", 1.5) + R(x + w / 2 - 14, y + h + 7, 28, 4, "#5A4636", 1.5, 1) + R(x, y, w, h, "#5A4636", 2.2, 5) + R(x + 4, y + 4, w - 8, h - 8, o.alert ? "#F7D6CE" : SCREEN, 1.4, 3);
    if (o.bot !== false) s += bot(x + w / 2 - 4, y + h - 6, (h - 10) / 150, { face: o.alert ? "worried" : "happy", light: o.alert ? BRICK : GRASS, arm: o.alert ? "up" : "reach" });
    if (o.alert) s += txt(x + w - 8, y + 16, "HELP", { size: 11, sign: true, anchor: "end", fill: BAD });
    return s;
  }
  // A headset drawn over a person's head; (x, y) = the person's feet.
  function headset(x, y) { var hy = y - 62; return K("M" + (x - 14) + " " + (hy - 2) + " a14 14 0 0 1 28 0", L, 3) + R(x - 17, hy - 6, 6, 11, "#3A2A20", 1.4, 2) + R(x + 11, hy - 6, 6, 11, "#3A2A20", 1.4, 2) + K("M" + (x + 15) + " " + (hy + 4) + " q2 9 -9 10", L, 2) + C(x + 5, hy + 14, 2.2, L, 0); }
  // A charger post with a lightning bolt and a cable. (x, y) = ground.
  function charger(x, y, cableTo) {
    var s = R(x - 14, y - 70, 28, 70, "#4F6B5C", 2.5, 5) + R(x - 9, y - 62, 18, 14, SCREEN, 1.5, 2) + P("M" + (x + 1) + " " + (y - 42) + " l-7 13 h6 l-3 11 l9 -15 h-6 l4 -9 z", YEL, 1.4);
    if (cableTo) s += K("M" + (x + 14) + " " + (y - 30) + " C" + (x + 40) + " " + (y - 10) + " " + (cableTo[0] - 30) + " " + (cableTo[1] + 20) + " " + cableTo[0] + " " + cableTo[1], "#3A2A20", 3);
    return s;
  }
  function coins(x, y, k, col) { var s = ""; for (var i = 0; i < k; i++) s += E(x, y - i * 6, 14, 4.5, col || GOLD, 1.6); return s; }
  function hourglass(x, y, frac) {
    frac = frac == null ? 0.4 : frac;
    return R(x - 18, y - 64, 36, 6, WOOD, 2, 2) + R(x - 18, y - 6, 36, 6, WOOD, 2, 2) + P("M" + (x - 13) + " " + (y - 58) + " h26 l-11 26 l11 26 h-26 l11 -26 z", "#EAF4FB", 2) +
      P("M" + (x - 13 + 9 * frac) + " " + (y - 58 + 20 * frac) + " h" + (26 - 18 * frac) + " l-" + (11 - 9 * frac) + " " + (26 - 20 * frac) + " z", SAND, 0) + P("M" + (x - 10) + " " + (y - 6) + " l10 -" + (8 + 14 * frac) + " l10 " + (8 + 14 * frac) + " z", SAND, 1.2);
  }
  function flywheel(x, y, r) {
    var s = C(x, y, r, "#8C9AA6", 3) + C(x, y, r - 10, CREAM, 2), d = "";
    for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3; d += "M" + n(x + Math.cos(a) * 8) + " " + n(y + Math.sin(a) * 8) + " L" + n(x + Math.cos(a) * (r - 10)) + " " + n(y + Math.sin(a) * (r - 10)) + " "; }
    s += K(d, L, 4) + C(x, y, 10, BRICK, 2);
    for (i = 0; i < 12; i++) { var b = i * Math.PI / 6 + 0.2; s += C(x + Math.cos(b) * (r - 5), y + Math.sin(b) * (r - 5), 1.8, L, 0); }
    return s;
  }
  function easel(x, y, w, h, title, lines, o) {
    o = o || {};
    var s = K("M" + (x + 14) + " " + (y + h) + " L" + (x + 4) + " " + (y + h + 64) + " M" + (x + w - 14) + " " + (y + h) + " L" + (x + w - 4) + " " + (y + h + 64) + " M" + (x + w / 2) + " " + (y + 10) + " L" + (x + w / 2) + " " + (y + h + 54), L, 4);
    s += R(x, y, w, h, SHEET, 2.5, 4) + R(x - 6, y + h - 2, w + 12, 7, WOOD, 2, 2);
    s += R(x + 8, y + 8, w - 16, 26, o.col || MAST, 1.8, 3) + txt(x + w / 2, y + 26, title, { size: 13, sign: true, anchor: "middle", fill: PAPER });
    lines.forEach(function (l, i) { s += txt(x + 12, y + 54 + i * 19, l, { size: 15 }); });
    if (o.chart) s += o.chart(x, y, w, h);
    return s;
  }
  function stamp(x, y, w, s, rot, col) { return G("rotate(" + (rot || -8) + " " + (x + w / 2) + " " + y + ")", R(x, y - 16, w, 24, "none", 0, 3, ' stroke="' + (col || BAD) + '" stroke-width="2.4"') + txt(x + w / 2, y + 1, s, { size: 13, sign: true, fill: col || BAD, anchor: "middle" })); }
  function boxes(x, y) { return R(x, y - 26, 30, 26, SAND, 2, 2) + R(x + 32, y - 22, 26, 22, "#C9B07F", 2, 2) + R(x + 12, y - 48, 28, 22, SAND, 2, 2) + K("M" + (x + 15) + " " + (y - 26) + " v-8 M" + (x + 26) + " " + (y - 48) + " v6", L, 1.2); }
  function pallet(x, y, w) { return R(x, y - 8, w, 8, WOOD, 2, 1) + K("M" + (x + 6) + " " + (y - 4) + " h" + (w - 12), L, 1); }

  /* ---------- the stage: the Depot in cutaway ---------- */
  // Building from x0 to x1, roof teeth on top at yr, upper floor yr+24 .. ys, slab ys .. ys+10, ground floor down to yg.
  function depot(x0, x1, yr, ys, yg, o) {
    o = o || {};
    var s = R(-5, yg, 970, 410 - yg, KERB, 2) + K("M-5 " + (yg + 14) + " H965", "#BFB6A6", 1.5);
    var teeth = "", tw = 60;
    for (var x = x0; x < x1 - 1; x += tw) teeth += "M" + x + " " + (yr + 24) + " L" + x + " " + yr + " L" + Math.min(x1, x + tw) + " " + (yr + 24) + " ";
    s += P(teeth, "#9FB0BC", 2.2);
    for (x = x0; x < x1 - 1; x += tw) s += R(x + 3, yr + 4, 8, 16, SKY, 1.2, 1);
    s += R(x0, yr + 24, x1 - x0, yg - yr - 24, CREAM, 0);
    if (o.wallpaper !== false) { var d = ""; for (x = x0 + 30; x < x1; x += 46) d += "M" + x + " " + (yr + 34) + " v" + (ys - yr - 44) + " "; s += K(d, "#F3E6C4", 6); }
    s += R(x0, ys, x1 - x0, 10, WOOD, 2.5) + K("M" + x0 + " " + (ys + 5) + " h" + (x1 - x0), "#9A622F", 1.2);
    s += R(x0, ys + 10, x1 - x0, yg - ys - 10, "#F6EEDC", 0) + K("M" + x0 + " " + (yg - 1) + " h" + (x1 - x0), L, 2);
    s += R(x0 - 12, yr + 22, 12, yg - yr - 22, BRICK, 2.5) + R(x1, yr + 22, 12, yg - yr - 22, BRICK, 2.5) + K("M" + x0 + " " + (yr + 24) + " H" + x1, L, 3);
    var bd = ""; for (var yy = yr + 34; yy < yg; yy += 12) bd += "M" + (x0 - 12) + " " + yy + " h12 M" + x1 + " " + yy + " h12 ";
    return s + K(bd, "#9E3524", 1.2);
  }
  function wall(x, y0, y1) { return R(x - 5, y0, 10, y1 - y0, "#E9DDBF", 2); }
  function window_(x, y, w, h) { return R(x, y, w, h, SKY, 2.5, 3) + K("M" + (x + w / 2) + " " + y + " v" + h + " M" + x + " " + (y + h / 2) + " h" + w, L, 1.6) + cloudlet(x + w * 0.3, y + h * 0.35); }
  function cloudlet(x, y) { return P("M" + (x - 8) + " " + (y + 3) + " a4 4 0 0 1 3 -6 a5 5 0 0 1 9 -2 a4 4 0 0 1 6 4 z", SHEET, 1); }
  function wrap(id, title, inner) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 400" width="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + title + '"><title>' + title + '</title><rect width="960" height="400" fill="#E5F2FA"/>' +
      '<g stroke-linejoin="round" stroke-linecap="round">' + inner + "</g></svg>";
  }
  function clerk(x, y, o) { o = o || {}; return person(x, y, Object.assign({ shirt: SHEET, hat: "visor", hair: L, skin: SKIN2, lh: [-22, -16], rh: [22, -16], stache: true }, o)); }
  function picker(x, y, o) { return person(x, y, Object.assign({ vest: true, shirt: SKY, hat: "cap", hatCol: BLUE }, o || {})); }
  function operator(x, y, o) { return person(x, y, Object.assign({ shirt: LILAC, skin: SKIN3, hair: L, lh: [24, -16], rh: [30, -14] }, o || {})) + headset(x, y); }

  /* ---------- scenes ---------- */
  var scenes = {};
  scenes.s0 = function () {
    var s = cloud(120, 40, 0.7) + cloud(860, 34, 0.7) + depot(24, 936, 44, 196, 366);
    // upstairs left: the payroll office
    s += pigeonholes(40, 92, 4, 3) + window_(388, 86, 70, 54) + clerk(186, 196) + desk(130, 156, 120) + ledger(152, 156, 76);
    s += payslip(268, 82, 104, "HUMAN · HOUR", [["wage", "$20.32"], ["benefits", "$8.66"], ["total", "$28.98"]], { rot: -2, total: true, pin: BRICK });
    s += wall(480, 68, 196);
    // upstairs right: the remote desk
    s += desk(612, 156, 300) + operator(586, 196) + monitor(628, 102, 70, 48) + monitor(712, 102, 70, 48, { alert: true }) + monitor(796, 102, 70, 48);
    s += window_(500, 86, 60, 50);
    // ground floor
    s += rack(36, 228, 180, 92, 3) + rack(480, 228, 120, 92, 5);
    s += picker(120, 366, { lh: [16, -32], rh: [36, -30] }) + bot(340, 366, 0.68, { item: true }) + conveyor(40, 318, 420) + tote(132, 318) + tote(362, 318) + tote(250, 318, 44, 22, { col: "#7FA9CF" });
    s += charger(560, 366, [624, 346]) + bot(650, 366, 0.68, { face: "asleep", light: YEL, arm: "rest", batt: YEL });
    s += R(750, 222, 170, 144, "#C9B98F", 2.5, 2) + K("M750 240 h170 M750 258 h170 M750 276 h170 M750 294 h170", "#A8966C", 2) + R(750, 300, 170, 66, "#5A4636", 2.5) + pallet(770, 366, 80) + boxes(776, 358) + txt(835, 238, "DOCK", { size: 14, sign: true, anchor: "middle" });
    s += board(330, 0, 300, "THE DEPOT", MAST);
    s += label(36, 188, "pay envelopes", [70, 172], { plate: true });
    s += label(300, 176, ["the payroll clerk", "= the cost model"], [232, 150], { plate: true });
    s += label(560, 80, "remote operator = teleoperation", [590, 128], { anchor: "middle", plate: true });
    s += label(796, 80, "one robot asks for help", [748, 102], { plate: true });
    s += label(60, 250, ["the picker: wage", "+ benefits, per hour"], [118, 300], { plate: true });
    s += label(232, 250, ["the picker robot", "= the robot"], [336, 284], { plate: true });
    s += label(430, 240, "a pick = one task", [384, 318], { plate: true, anchor: "middle" });
    s += label(524, 324, ["charger", "= power"], [546, 330], { plate: true, anchor: "end" });
    s += label(612, 240, ["uptime: not every", "hour is a picking hour"], [650, 290], { plate: true });
    return wrap("s0", "The Depot, a warehouse drawn in cutaway. Upstairs left, the payroll office: a clerk in a green eyeshade at a desk with a big ledger, pigeonholes full of pay envelopes, and a payslip for a human pinned to the wall: wage $20.32, benefits $8.66, total $28.98 an hour. Upstairs right, the remote desk: an operator in a headset watches three screens, and on one a robot raises its arm for help. Downstairs, a human picker in a high-visibility vest and a yellow picker robot with a suction-cup arm pick goods from totes on a conveyor; another robot sleeps on its charger; boxes wait at the loading dock.", s);
  };
  scenes.s1 = function () {
    var s = cloud(120, 40, 0.7) + cloud(860, 34, 0.7) + depot(24, 936, 44, 196, 366);
    s += payslip(40, 74, 150, "HUMAN · PER HOUR", [["wage", "$20.32"], ["benefits", "$8.66"], ["rework", "$0.72"], ["good picks", "298.5"], ["per pick", "9.95¢"]], { total: true, pin: BRICK, size: 13, lh: 16 });
    s += payslip(206, 68, 160, "ROBOT · PER HOUR", [["capital", "$13.19"], ["upkeep", "$4.50"], ["power", "$0.08"], ["operators", "$3.17"], ["rework", "$4.65"], ["per pick", "8.23¢"]], { total: true, pin: GOLD, size: 13, lh: 15, fill: "#FFF8E1" });
    // the scale: weighing the cost of one good pick
    s += K("M560 180 v-90 M488 100 L632 84", L, 4) + P("M548 186 h24 l-4 -10 h-16 z", WOOD, 2) + C(560, 92, 6, GOLD, 2);
    s += K("M488 100 l-22 44 M488 100 l22 44 M632 84 l-22 44 M632 84 l22 44", L, 1.4) + P("M462 144 h52 q-4 14 -26 14 q-22 0 -26 -14 z", STEEL, 2) + P("M606 128 h52 q-4 14 -26 14 q-22 0 -26 -14 z", STEEL, 2);
    s += coins(488, 140, 3) + coins(632, 124, 2) + txt(488, 174, "human 9.95¢", { size: 13, anchor: "middle" }) + txt(632, 158, "robot 8.23¢", { size: 13, anchor: "middle" });
    s += clerk(420, 196, { lh: [26, -40], rh: [-16, -14] }) + wall(700, 68, 196);
    s += punchClock(726, 92) + R(830, 84, 90, 68, SHEET, 2, 3) + txt(875, 104, "SHIFTS", { size: 12, sign: true, anchor: "middle" }) + C(852, 128, 11, YEL, 1.8) + P("M890 118 a11 11 0 1 0 6 18 a9 9 0 1 1 -6 -18 z", "#5E6B8C", 1.6) + K("M845 146 h14 M883 146 h14", L, 2);
    // ground floor: a slow, a failed and a good pick
    s += rack(36, 228, 160, 92, 7) + conveyor(40, 318, 470) + bot(250, 366, 0.68, { item: true, face: "happy" }) + tote(272, 318) + tote(130, 318);
    s += bot(420, 366, 0.68, { face: "worried", arm: "down" }) + R(448, 350, 18, 14, SAND, 2, 2) + K("M444 342 l-6 -6 M468 340 l6 -6", BAD, 2);
    s += R(560, 318, 70, 48, "#E26D4F", 2.5, 3) + txt(595, 338, "REWORK", { size: 11, sign: true, anchor: "middle", fill: PAPER }) + picker(660, 366, { lh: [-30, -18], rh: [-40, -24], mouth: "flat" });
    s += charger(770, 366, [826, 346]) + bot(852, 366, 0.68, { face: "asleep", arm: "rest", light: YEL, batt: YEL });
    s += board(330, 0, 300, "COST PER PICK", MAST);
    s += label(388, 66, "cost per GOOD pick: the only fair scale", [560, 82], { plate: true });
    s += label(726, 186, ["punch clock:", "hours paid for"], [748, 152], { plate: true });
    s += label(838, 176, "2 shifts", [875, 156], { plate: true });
    s += label(220, 236, ["cycle time:", "seconds a pick"], [256, 290], { plate: true, anchor: "middle" });
    s += label(410, 236, ["success rate:", "some picks miss"], [440, 300], { plate: true, anchor: "middle" });
    s += label(540, 248, ["a miss costs a", "minute of a picker"], [656, 296], { plate: true });
    s += label(800, 236, ["power: 8¢", "an hour"], [778, 300], { plate: true });
    return wrap("s1", "The payroll office has two payslips on the wall: the human's per hour (wage, benefits, rework, 298.5 good picks, 9.95 cents a pick) and the robot's per hour (capital $13.19, maintenance, software, power 8 cents, operators, rework $4.65, 8.23 cents a pick). A brass balance weighs the cost of one good pick for each. A punch clock and a shifts chart with a sun and a moon hang on the wall. Downstairs one robot makes a good pick, another drops a box, and a human picker sorts misses in a rework bin; a third robot charges.", s);
  };
  scenes.s2 = function () {
    var s = cloud(140, 40, 0.7) + cloud(820, 36, 0.7) + depot(24, 936, 44, 196, 366);
    s += desk(250, 156, 470) + operator(222, 196);
    [0, 1, 2, 3, 4].forEach(function (i) { s += monitor(268 + i * 88, 100, 76, 50, { alert: i === 2 }); });
    s += R(760, 80, 160, 104, SHEET, 2, 4) + txt(840, 100, "CALLS TODAY", { size: 12, sign: true, anchor: "middle" });
    for (var i = 0; i < 8; i++) s += K("M" + (778 + i * 16) + " 116 v26", L, 2.4) + (i % 5 === 4 ? K("M" + (770 + i * 16 - 56) + " 138 l60 -18", BAD, 2.4) : "");
    s += txt(840, 168, "2 an hour a robot", { size: 14, anchor: "middle" });
    s += window_(50, 86, 70, 52);
    // the floor: robots at work, one stuck with its light on
    s += rack(36, 228, 900, 60, 11) + conveyor(40, 318, 880);
    [110, 260, 560, 710, 860].forEach(function (x, i) { s += bot(x, 366, 0.68, { face: "happy", item: i % 2 === 0 }) + tote(x + 22, 318, 40, 20); });
    s += bot(410, 366, 0.68, { face: "worried", arm: "up", light: BRICK }) + K("M410 262 C420 230 300 210 262 156", BAD, 2, ' stroke-dasharray="5 4"');
    s += board(330, 0, 300, "THE REMOTE DESK", MAST);
    s += label(132, 116, ["the operator", "= teleoperation"], [212, 150], { plate: true });
    s += label(588, 82, "an intervention = a call for help", [456, 108], { plate: true });
    s += label(452, 252, ["stuck: not picking", "until someone helps"], [430, 280], { plate: true });
    s += label(612, 186, ["robots per operator", "= the operator ratio"], [560, 160], { plate: true, anchor: "middle" });
    s += label(760, 204, ["MTBI = minutes", "between calls"], [800, 178], { plate: true });
    return wrap("s2", "Upstairs, the remote desk: an operator in a headset faces five screens, each showing a robot at work; on the middle screen a robot raises its arm and the frame reads HELP. A tally board on the wall counts calls today: 2 an hour a robot. Downstairs a row of yellow picker robots picks from totes along a conveyor; one has stopped with its red light on and its arm up, a dashed line running from it up to the operator.", s);
  };
  scenes.s3 = function () {
    var s = cloud(120, 40, 0.7) + cloud(860, 34, 0.7) + depot(24, 936, 44, 196, 366);
    // upstairs: help calls become lessons
    s += desk(60, 156, 170) + operator(46, 196) + monitor(84, 102, 70, 48, { alert: true });
    s += R(270, 84, 120, 96, "#2C6E58", 2.5, 4) + R(280, 94, 100, 76, SHEET, 1.5, 2);
    for (var i = 0; i < 4; i++) s += K("M290 " + (110 + i * 16) + " h80", "#9CCBEA", 2);
    s += txt(330, 106, "LESSON BOOK", { size: 11, sign: true, anchor: "middle" }) + K("M154 128 C200 110 240 112 270 122", BAD, 2.4, ' stroke-dasharray="6 4"') + P("M266 116 l8 6 l-9 4 z", BAD, 0);
    s += flywheel(500, 128, 56) + K("M390 132 C420 132 430 132 444 130", L, 2.4) + P("M440 125 l8 5 l-8 5 z", L, 0);
    s += R(640, 78, 270, 112, SHEET, 2, 4) + K("M662 92 v80 h236", L, 2);
    var d = "M664 100"; for (var x = 0; x <= 230; x += 10) d += " L" + (664 + x) + " " + n(100 + 66 * (1 - Math.pow(0.8, x / 46)));
    s += K(d, BAD, 3) + txt(780, 104, "calls an hour", { size: 13 }) + txt(780, 186, "fleet hours, doubling →", { size: 13, anchor: "middle" });
    [0, 46, 92, 138, 184, 230].forEach(function (x) { s += K("M" + (664 + x) + " 172 v4", L, 1.5); });
    // downstairs: the fleet keeps working, more each year
    s += conveyor(40, 318, 880);
    [90, 230, 370, 510, 650, 790].forEach(function (x, i) { s += bot(x, 366, 0.68, { face: "happy", item: i % 2 === 1 }) + tote(x + 22, 318, 40, 20); });
    s += K("M546 158 C600 210 630 240 648 270", GRASS, 2.4, ' stroke-dasharray="6 4"') + P("M641 266 l9 9 l1 -11 z", GRASS, 0);
    s += R(840, 262, 80, 50, NOTE, 2, 3) + txt(850, 280, "v1 → v2", { size: 13 }) + txt(850, 298, "an update", { size: 13 });
    s += board(330, 0, 300, "THE FLYWHEEL", MAST);
    s += label(64, 84, "a call for help", [118, 110], { plate: true });
    s += label(56, 240, ["each fix is written down:", "training data (DAgger, HIL)"], [300, 180], { plate: true });
    s += label(330, 240, ["the flywheel: more robots,", "more hours, more lessons"], [470, 172], { plate: true });
    s += label(900, 232, ["a toy curve: 20% fewer", "calls per doubling"], [880, 150], { plate: true, anchor: "end" });
    return wrap("s3", "Upstairs, an operator helps a robot that has called for help, and a dashed arrow carries the fix into a green lesson book: training data. The lesson book turns a big flywheel. On the wall a chart shows calls an hour falling as fleet hours double. Downstairs six picker robots work along a conveyor, and a sticky note reads: v1 to v2, software update.", s);
  };
  scenes.s4 = function () {
    var s = cloud(120, 40, 0.7) + cloud(860, 34, 0.7) + depot(24, 936, 44, 196, 366);
    // upstairs: the counting house
    s += desk(60, 156, 220) + clerk(110, 196, { lh: [22, -18], rh: [40, -16] }) + ledger(150, 156, 90);
    s += hourglass(330, 196, 0.45);
    s += R(380, 80, 300, 108, SHEET, 2, 4) + K("M400 134 h264", L, 1.6);
    var stacks = [-6, 2, 3, 3, 3, 3], cum = -6;
    stacks.forEach(function (k, i) {
      var x = 418 + i * 46;
      if (k < 0) s += R(x - 14, 134, 28, 34, "#F4B7A7", 2, 2) + txt(x, 160, "−", { size: 18, sign: true, anchor: "middle" });
      else s += coins(x, 130, k * 2);
      s += txt(x, 182, "yr " + i, { size: 12, anchor: "middle" });
    });
    s += wall(700, 68, 196);
    s += R(720, 92, 90, 104, "#C98E52", 2.5, 3) + R(728, 100, 74, 40, SKY, 1.6, 2) + txt(765, 160, "BUY", { size: 15, sign: true, anchor: "middle" }) + C(796, 150, 3, L, 0);
    s += R(824, 92, 90, 104, LILAC, 2.5, 3) + R(832, 100, 74, 40, SKY, 1.6, 2) + txt(869, 156, "RENT", { size: 15, sign: true, anchor: "middle" }) + txt(869, 174, "(RaaS)", { size: 12, anchor: "middle" }) + C(900, 150, 3, L, 0);
    // downstairs: the fleet and the deal
    s += conveyor(40, 318, 420);
    [90, 220, 350].forEach(function (x) { s += bot(x, 366, 0.68, { face: "happy" }) + tote(x + 22, 318, 40, 20); });
    s += R(500, 250, 110, 112, "#8C9AA6", 2.5, 6) + C(555, 302, 32, "#C5CED6", 2.5) + C(555, 302, 6, L, 0) + K("M555 302 l20 -14", L, 3) + R(539, 258, 32, 10, "#5A4636", 1.5, 2) + txt(555, 352, "SAFE", { size: 11, sign: true, anchor: "middle", fill: PAPER });
    s += P("M700 362 l26 -86 l26 86 z", "#B7C7D6", 2) + K("M688 280 q38 -14 76 0 M696 302 q30 -10 60 0 M706 324 q20 -8 40 0 M714 346 q12 -5 24 0", L, 2) + txt(726, 266, "TORNADO", { size: 12, sign: true, anchor: "middle" });
    s += board(330, 0, 300, "THE LEDGER", MAST);
    s += label(46, 84, ["the clerk sums the", "years: NPV, IRR"], [180, 150], { plate: true });
    s += label(230, 236, ["payback: when the", "sand runs out"], [330, 172], { plate: true, anchor: "middle" });
    s += label(380, 236, ["year 0: the robots are", "paid for; then savings"], [430, 150], { plate: true });
    s += label(920, 236, ["buy, or rent", "by the month"], [869, 196], { plate: true, anchor: "end" });
    s += label(470, 384, "the discount rate: money in the safe isn't free", [540, 352], { plate: true, anchor: "middle" });
    s += label(790, 300, ["the tornado: which", "assumption matters most?"], [744, 310], { plate: true });
    return wrap("s4", "Upstairs, the counting house: a clerk sums the years in a ledger beside an hourglass for payback. A board shows year 0 as a pink hole, the robots paid for, then stacks of coins for years 1 to 5. Two doors on the right read BUY and RENT (RaaS). Downstairs four robots pick from a conveyor beside a bank safe for the discount rate and a little grey tornado labelled which assumption matters most.", s);
  };
  scenes.s5 = function () {
    var s = cloud(120, 40, 0.7) + cloud(860, 34, 0.7) + depot(24, 936, 44, 196, 366);
    s += desk(170, 156, 360) + operator(130, 196) + operator(560, 196, { flip: true, lh: [-24, -16], rh: [-30, -14] });
    [0, 1, 2, 3].forEach(function (i) { s += monitor(190 + i * 84, 102, 72, 48, { alert: i === 1 || i === 2 }); });
    s += R(620, 80, 120, 104, SHEET, 2, 4) + txt(680, 100, "WAITING", { size: 12, sign: true, anchor: "middle" });
    [0, 1, 2].forEach(function (i) { s += R(636 + i * 32, 116, 24, 30, "#F7D6CE", 1.6, 4) + C(648 + i * 32, 126, 4, BRICK, 1.2) + K("M" + (642 + i * 32) + " 138 h12", L, 1.4); });
    s += txt(680, 172, "Erlang C", { size: 14, anchor: "middle" });
    s += wall(760, 68, 196) + R(780, 82, 140, 110, "#B9BDC2", 2.5, 3);
    for (var i = 0; i < 8; i++) s += K("M" + (788 + i * 17) + " 82 v110", "#7C8C99", 2);
    s += K("M780 120 h140 M780 158 h140", "#7C8C99", 2) + bot(812, 190, 0.5, { face: "asleep", arm: "rest", light: STEEL }) + bot(854, 190, 0.5, { face: "asleep", arm: "rest", light: STEEL }) + bot(896, 190, 0.5, { face: "asleep", arm: "rest", light: STEEL });
    // downstairs: a big fleet, a queue of robots with their lights on
    s += conveyor(40, 318, 880);
    [80, 180, 280, 480, 580, 780, 880].forEach(function (x, i) { s += bot(x, 366, 0.64, { face: "happy", item: i % 3 === 0 }); });
    [380, 680].forEach(function (x) { s += bot(x, 366, 0.64, { face: "worried", arm: "up", light: BRICK }); });
    s += board(330, 0, 300, "THE FLEET", MAST);
    s += label(46, 86, ["shared", "operators"], [126, 128], { plate: true });
    s += label(560, 230, ["two robots stuck at once:", "one waits for a free operator"], [680, 270], { plate: true, anchor: "middle" });
    s += label(250, 230, "a waiting robot isn't picking", [380, 270], { plate: true });
    s += label(870, 230, ["spares cage:", "3 robots in reserve"], [850, 176], { plate: true, anchor: "middle" });
    s += label(680, 70, "the queue", [680, 82], { plate: true, anchor: "middle" });
    return wrap("s5", "Upstairs, two operators in headsets share four screens, and two of them flash HELP. A board labelled WAITING shows three robots in a queue, marked Erlang C. Behind a wall, a steel spares cage holds three sleeping robots in reserve. Downstairs a long fleet of picker robots works along a conveyor; two have their red lights on and arms up, waiting for help.", s);
  };
  scenes.s6 = function () {
    var s = cloud(120, 40, 0.7) + cloud(860, 34, 0.7) + depot(24, 936, 44, 196, 366);
    // upstairs: the pie, cut
    s += R(250, 150, 360, 10, WOOD, 2.5, 2) + K("M270 160 v36 M590 160 v36", L, 4);
    var cx = 430, cy = 132, rx = 130, ry = 34;
    s += E(cx, cy + 8, rx + 10, ry + 8, SHEET, 2) + E(cx, cy, rx, ry, "#E6B35E", 2.5) + E(cx, cy - 2, rx - 10, ry - 7, "#F2CD7E", 0);
    var cuts = [0.17, 0.33, 0.47, 0.6, 0.72, 0.84, 0.93];
    cuts.forEach(function (t) { var a = t * Math.PI * 2 - Math.PI / 2; s += K("M" + cx + " " + cy + " L" + n(cx + Math.cos(a) * rx) + " " + n(cy + Math.sin(a) * ry), "#9A622F", 2); });
    s += person(214, 196, { shirt: GRASS, hat: "cap", hatCol: GRASS, lh: [26, -18], rh: [40, -26], mouth: "o" }) + person(650, 196, { shirt: SHEET, skin: SKIN2, hair: L, lh: [-30, -18], rh: [-40, -24] }) + R(640, 150, 22, 30, SHEET, 1.5, 3);
    s += person(118, 196, { shirt: SAND, skin: SKIN3, hat: "cap", hatCol: YEL, lh: [-16, -6], rh: [20, -2] }) + R(124, 182, 28, 16, BRICK, 2, 2) + K("M130 182 v-6 h16 v6", L, 2);
    s += person(760, 196, { shirt: "#5E6B8C", hat: "beret", hatCol: "#3A2A20", lh: [-24, -30], rh: [20, -10] }) + C(728, 130, 12, "none", 3) + K("M736 139 l10 12", L, 4) + R(770, 150, 34, 40, NOTE, 1.8, 2) + K("M776 160 h20 M776 170 h20 M776 180 h14", L, 1.4);
    // downstairs: the warehouse owner with the payroll and the robots
    s += conveyor(40, 318, 540) + tote(140, 318) + tote(380, 318);
    [200, 440].forEach(function (x) { s += bot(x, 366, 0.68, { face: "happy", item: true }); });
    s += desk(640, 300, 140, 66) + person(820, 366, { shirt: BRICK, hair: L, skin: SKIN, lh: [-30, -26], rh: [-20, -10] }) + coins(680, 296, 4) + coins(724, 296, 6) + ledger(740, 300, 60);
    s += board(330, 0, 300, "WHO GETS THE SAVING", MAST);
    s += label(80, 80, ["the integrator", "(installs it)"], [126, 150], { plate: true });
    s += label(250, 84, ["the robot maker"], [220, 128], { plate: true });
    s += label(430, 234, "the payroll the robots replace, cut into slices", [430, 176], { plate: true, anchor: "middle" });
    s += label(650, 84, ["the customer", "keeps a slice"], [650, 126], { plate: true });
    s += label(880, 112, ["the investor's", "diligence", "checklist"], [804, 160], { plate: true, anchor: "end" });
    s += label(926, 236, ["the Depot's owner: the", "saving is what's left"], [826, 300], { plate: true, anchor: "end" });
    return wrap("s6", "Upstairs a big pie on a table stands for the payroll the robots replace, cut into slices. Around it the integrator with a toolbox, the robot maker, the customer and an investor with a magnifying glass and a diligence checklist each reach for a share. Downstairs two robots pick from totes while the Depot's owner counts the coins left over beside a ledger.", s);
  };
  scenes.cap = function () {
    var s = R(0, 0, 960, 400, CORK, 0), r = rnd(2), d = "";
    for (var i = 0; i < 120; i++) d += "M" + n(20 + r() * 920) + " " + n(50 + r() * 200) + " h2 ";
    s += K(d, "#B98D5B", 2) + R(0, 330, 960, 70, "#C9B98F", 2);
    s += easel(46, 66, 250, 168, "DECK A · PICKPAL", ["Payback in", "9 months!", "", "“fully autonomous”"], { col: BLUE, chart: function (x, y) { return hourglass(x + 196, y + 150, 0.1); } });
    s += easel(356, 66, 250, 168, "DECK B · ARMADA", ["One operator", "runs 50 robots", "", "“99% autonomous”"], { col: "#5E4A94", chart: function (x, y) { return bot(x + 196, y + 156, 0.42, { face: "happy" }); } });
    s += easel(666, 66, 250, 168, "DECK C · HANDYBOT", ["$11 an hour,", "vs $29 a picker", "", "“cheaper than a shift”"], { col: BAD, chart: function (x, y) { return coins(x + 200, y + 150, 4); } });
    s += person(180, 382, { shirt: "#5E6B8C", hat: "beret", hatCol: "#3A2A20", lh: [-26, -36], rh: [24, -12] }) + C(150, 316, 13, "none", 3) + K("M159 326 l10 12", L, 4);
    s += person(480, 382, { shirt: SHEET, hat: "visor", hair: L, skin: SKIN2, stache: true, lh: [-22, -18], rh: [26, -22] }) + R(500, 340, 34, 26, SHEET, 1.6, 2) + K("M506 350 h20 M506 358 h14", L, 1.2);
    s += person(790, 382, { shirt: LILAC, skin: SKIN3, hair: L, lh: [-24, -20], rh: [24, -20], mouth: "flat" }) + headset(790, 382);
    s += board(250, 6, 460, "INVESTOR REVIEW BOARD", MAST);
    s += label(46, 290, ["the investor:", "is it true?"], [160, 318], { plate: true });
    s += label(560, 296, ["the clerk", "runs the model"], [500, 340], { plate: true });
    s += label(940, 290, ["the operator:", "what the pilot logs say"], [806, 316], { plate: true, anchor: "end" });
    return wrap("cap", "A cork board holds three pitch decks on easels. Deck A, PickPal: payback in 9 months, fully autonomous. Deck B, Armada: one operator runs 50 robots, 99% autonomous. Deck C, HandyBot: $12 an hour against $29 for a picker, cheaper than a shift. In front stand an investor with a magnifying glass, the payroll clerk holding the model, and a remote operator in a headset who knows what the pilot logs say.", s);
  };

  /* ---------- icons: 64×64, flat fills, 3.5px line ---------- */
  var sk = ' stroke="' + L + '" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"';
  function ic(inner) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' + inner + "</svg>"; }
  function f(c) { return ' fill="' + c + '"' + sk; }
  function ln(c, w) { return ' fill="none" stroke="' + (c || L) + '" stroke-width="' + (w || 3.5) + '" stroke-linecap="round" stroke-linejoin="round"'; }
  var miniBot = '<circle cx="20" cy="54" r="6"' + f("#3A2A20") + '/><circle cx="44" cy="54" r="6"' + f("#3A2A20") + '/><rect x="8" y="38" width="48" height="14" rx="5"' + f(YEL) + '/><rect x="27" y="22" width="10" height="18"' + f(STEEL) + '/><rect x="16" y="6" width="32" height="20" rx="5"' + f("#5A4636") + '/><circle cx="26" cy="16" r="2.5" fill="' + L + '"/><circle cx="38" cy="16" r="2.5" fill="' + L + '"/><path d="M36 30 L52 24 L58 36"' + ln(L, 4) + "/>";
  var icons = {
    envelope: ic('<rect x="6" y="14" width="52" height="36" rx="3"' + f(NOTE) + '/><path d="M6 16 L32 36 L58 16"' + ln() + '/><circle cx="46" cy="42" r="7"' + f(GOLD) + "/>"),
    slip: ic('<rect x="12" y="4" width="40" height="56" rx="3"' + f(SHEET) + '/><path d="M18 18 h28 M18 28 h20 M18 38 h24"' + ln(L, 3) + '/><path d="M18 50 h28"' + ln(BAD, 4) + "/>"),
    headset: ic('<path d="M12 36 a20 20 0 0 1 40 0"' + ln(L, 5) + '/><rect x="6" y="32" width="12" height="18" rx="4"' + f("#5A4636") + '/><rect x="46" y="32" width="12" height="18" rx="4"' + f("#5A4636") + '/><path d="M50 50 q0 10 -14 10"' + ln(L, 3) + '/><circle cx="34" cy="60" r="3" fill="' + L + '"/>'),
    flywheel: ic('<circle cx="32" cy="32" r="26"' + f("#8C9AA6") + '/><circle cx="32" cy="32" r="18"' + f(CREAM) + '/><path d="M32 14 V50 M14 32 H50 M19 19 L45 45 M45 19 L19 45"' + ln(L, 3) + '/><circle cx="32" cy="32" r="6"' + f(BRICK) + "/>"),
    coins: ic('<ellipse cx="22" cy="50" rx="14" ry="5"' + f(GOLD) + '/><ellipse cx="22" cy="42" rx="14" ry="5"' + f(GOLD) + '/><ellipse cx="22" cy="34" rx="14" ry="5"' + f(GOLD) + '/><rect x="38" y="8" width="20" height="48" rx="2"' + f(SHEET) + '/><path d="M42 18 h12 M42 26 h12 M42 34 h8"' + ln(L, 2.5) + "/>"),
    fleet: ic('<g transform="translate(-6 6) scale(.6)">' + miniBot + '</g><g transform="translate(26 6) scale(.6)">' + miniBot + '</g><path d="M6 60 h52"' + ln() + '/><circle cx="32" cy="10" r="6"' + f(BRICK) + "/>"),
    pie: ic('<circle cx="32" cy="34" r="24"' + f("#E6B35E") + '/><path d="M32 34 L32 10 M32 34 L54 42 M32 34 L14 50"' + ln("#9A622F", 3) + '/><path d="M34 32 L34 8 A24 24 0 0 1 56 38 z"' + f(GRASS) + "/>"),
    star: ic('<path d="M32 6 l7.2 16 16.8 1.6 -12.8 11.5 3.7 16.5 -14.9 -8.8 -14.9 8.8 3.7 -16.5 -12.8 -11.5 16.8 -1.6z"' + f(YEL) + "/>"),
    pencil: ic('<path d="M10 54 l5 -16 27 -27 11 11 -27 27 z"' + f(YEL) + '/><path d="M37 16 l11 11 M10 54 l5 -16 11 11 z"' + ln() + '/><path d="M42 11 l6 -6 11 11 -6 6"' + f(BRICK) + "/>"),
    robot: ic(miniBot),
    picker: ic('<path d="M12 60 v-16 a20 14 0 0 1 40 0 v16 z"' + f(VEST) + '/><path d="M12 50 h40"' + ln(SILVER, 5) + '/><circle cx="32" cy="22" r="11"' + f(SKIN) + '/><path d="M21 19 a11 11 0 0 1 22 0 z"' + f(BLUE) + '/><path d="M40 16 h12"' + ln(L, 4) + "/>"),
    clerk: ic('<path d="M12 60 v-16 a20 14 0 0 1 40 0 v16 z"' + f(SHEET) + '/><circle cx="32" cy="24" r="11"' + f(SKIN2) + '/><path d="M18 18 h28 l-5 -8 h-18 z"' + f(GRASS) + '/><path d="M26 30 q6 -4 12 0"' + ln(L, 3) + "/>"),
    operator: ic('<path d="M12 60 v-16 a20 14 0 0 1 40 0 v16 z"' + f(LILAC) + '/><circle cx="32" cy="24" r="11"' + f(SKIN3) + '/><path d="M19 24 a13 13 0 0 1 26 0"' + ln(L, 4) + '/><rect x="15" y="22" width="7" height="10" rx="2"' + f("#3A2A20") + '/><rect x="42" y="22" width="7" height="10" rx="2"' + f("#3A2A20") + "/>"),
    tote: ic('<rect x="14" y="14" width="12" height="12"' + f(SAND) + '/><circle cx="40" cy="20" r="7"' + f(GRASS) + '/><path d="M6 26 h52 l-5 30 h-42 z"' + f(TOTE) + "/>"),
    help: ic('<circle cx="32" cy="32" r="24"' + f("#F7D6CE") + '/><path d="M32 18 v18"' + ln(BAD, 6) + '/><circle cx="32" cy="46" r="3.5" fill="' + BAD + '"/>'),
    plug: ic('<rect x="18" y="6" width="28" height="52" rx="6"' + f("#4F6B5C") + '/><path d="M34 16 l-10 18 h8 l-4 14 l12 -20 h-8 l5 -12 z"' + f(YEL) + "/>"),
    clock: ic('<rect x="10" y="4" width="44" height="56" rx="6"' + f("#7C8C99") + '/><circle cx="32" cy="26" r="14"' + f(SHEET) + '/><path d="M32 26 v-9 M32 26 l7 4"' + ln(L, 3) + '/><rect x="22" y="46" width="20" height="6"' + f("#3A2A20") + "/>"),
    queue: ic('<rect x="4" y="20" width="16" height="26" rx="3"' + f("#F7D6CE") + '/><rect x="24" y="20" width="16" height="26" rx="3"' + f("#F7D6CE") + '/><rect x="44" y="20" width="16" height="26" rx="3"' + f("#F7D6CE") + '/><circle cx="12" cy="28" r="3" fill="' + BRICK + '"/><circle cx="32" cy="28" r="3" fill="' + BRICK + '"/><circle cx="52" cy="28" r="3" fill="' + BRICK + '"/><path d="M4 54 h56"' + ln() + "/>"),
    ledger: ic('<path d="M6 46 q13 -6 26 0 q13 -6 26 0 v-30 q-13 -6 -26 0 q-13 -6 -26 0 z"' + f(SHEET) + '/><path d="M32 16 v30"' + ln() + '/><path d="M12 24 h14 M12 32 h14 M38 24 h14 M38 32 h10"' + ln(L, 2.5) + '/><rect x="4" y="46" width="56" height="8" rx="2"' + f("#2C6E58") + "/>"),
    spares: ic('<rect x="6" y="6" width="52" height="52" rx="3"' + f(STEEL) + '/><path d="M18 6 v52 M30 6 v52 M42 6 v52"' + ln("#7C8C99", 3) + '/><path d="M6 32 h52"' + ln("#7C8C99", 3) + "/>")
  };

  var out = {};
  Object.keys(scenes).forEach(function (k) { out[k] = scenes[k](); });
  root.RP_ART = out; root.RP_ICONS = icons;
})(typeof window !== "undefined" ? window : this);
