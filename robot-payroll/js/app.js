/* Robot Payroll — UI. Every number shown is computed by window.RP (core.js) from the books (the assumptions on
   the page); nothing is hard-coded except the cited facts quoted in the prose, which tests/check.js holds to the model. */
(function () {
  "use strict";
  var RP = window.RP, GL = window.RP_GLOSSARY || {}, IC = window.RP_ICONS || {}, ART = window.RP_ART || {}, META = RP.META;
  var $ = function (id) { return document.getElementById(id); };
  var qa = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------------- formatting ---------------- */
  function fmt(n, d) { return Number(n).toLocaleString("en-US", { maximumFractionDigits: d == null ? 0 : d, minimumFractionDigits: d == null ? 0 : d }); }
  function usd(n, d) { return (n < 0 ? "−" : "") + "$" + fmt(Math.abs(n), d == null ? 0 : d); }
  function usdM(n) { return (n < 0 ? "−" : "") + "$" + fmt(Math.abs(n) / 1e6, 2) + "M"; }
  function cents(v, d) { return fmt(v * 100, d == null ? 2 : d) + "¢"; }
  function pct(p, d) { return fmt(p * 100, d == null ? 0 : d) + "%"; }
  function secs(h) { var s = h * 3600; return !isFinite(s) ? "∞" : s < 90 ? fmt(s, 0) + " s" : s < 5400 ? fmt(s / 60, 1) + " min" : fmt(s / 3600, 1) + " h"; }
  function months(m) { return m == null || !isFinite(m) ? "never" : fmt(m, 0) + " months"; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  var FMT = {
    wage: function (v) { return usd(v, 2) + " /h"; }, opWage: function (v) { return usd(v, 2) + " /h"; },
    burden: function (v) { return "+" + pct(v, 1); }, humanRate: function (v) { return fmt(v) + " /h"; },
    humanSuccess: function (v) { return pct(v, 1); }, success: function (v) { return pct(v, 1); }, uptime: function (v) { return pct(v, 1); },
    reworkMin: function (v) { return fmt(v, 1) + " min"; }, shifts: function (v, p) { return v + (v > 1 ? " shifts" : " shift") + " · " + fmt(v * p.shiftHours * p.days) + " h/yr"; },
    shiftHours: function (v) { return v + " h"; }, days: function (v) { return v + " days"; },
    capex: function (v) { return usd(v); }, integration: function (v) { return usd(v); }, software: function (v) { return usd(v) + " /yr"; },
    life: function (v) { return v + " years"; }, rate: function (v) { return pct(v, 1); }, maintPct: function (v) { return pct(v, 1) + " of price /yr"; },
    kW: function (v) { return fmt(v, 1) + " kW"; }, power: function (v) { return fmt(v * 100, 2) + "¢ /kWh"; }, cycle: function (v) { return fmt(v, 1) + " s"; },
    lambda: function (v) { return fmt(v, 2) + " /h (" + secs(1 / v) + ")"; }, handleMin: function (v) { return fmt(v, 2) + " min"; },
    opRatio: function (v) { return v + " robots"; }, occTarget: function (v) { return pct(v); }, opCap: function (v) { return v + " robots"; },
    fleet: function (v) { return v + " robots"; }, raasFee: function (v) { return usd(v) + " /month"; }, learnDrop: function (v) { return pct(v) + " per doubling"; },
    hours0: function (v) { return fmt(v) + " h"; }, vendorHoursYr: function (v) { return fmt(v) + " h/yr"; }, lambdaFloor: function (v) { return fmt(v, 2) + " /h"; },
    cogsPct: function (v) { return pct(v) + " of price"; }, svcMargin: function (v) { return pct(v); }, intMargin: function (v) { return pct(v); }
  };
  var SRC = { bls: ["BLS", "bls"], ecec: ["BLS ECEC", "bls"], eia: ["EIA", "eia"], illus: ["illustrative", "illus"], toy: ["toy model", "toy"] };

  /* ---------------- state: the books, and progress ---------------- */
  var KEY = "robot-payroll-v1";
  var store = { predicts: {}, touched: {}, said: {}, cap: {}, ft: {}, books: {} };
  try { var saved = JSON.parse(localStorage.getItem(KEY) || "null"); if (saved) store = Object.assign(store, saved); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }
  var S = RP.books(store.books);
  function setBook(k, v) {
    S[k] = v;
    if (v === RP.DEFAULTS[k]) delete store.books[k]; else store.books[k] = v;
    save(); syncSliders(k); refresh();
  }

  /* ---------------- colours (match css tokens) ---------------- */
  var COL = { human: "#246A9C", robot: "#8A6300", robotF: "#F4C430", ops: "#5E4A94", bad: "#A5321F", good: "#3B7422", ink: "#3A2418", line: "#4A2E1E", soft: "#6E5040",
    sheet: "#FFFDF6", rule: "#E7DCC4", sky: "#9CCBEA", lilac: "#B8A3DC", sand: "#DDBB8A", grass: "#5FA03C", brick: "#C8452F", steel: "#B9BDC2", wood: "#B8793F", note: "#FFF1A8", cream: "#FFF6DC" };
  var LINES = [["capital", "capital", "#E0A91E"], ["upkeep", "upkeep", "#DDBB8A"], ["power", "power", "#9CCBEA"], ["operators", "operators", "#B8A3DC"], ["rework", "rework", "#E8907A"]];

  /* ---------------- nav ---------------- */
  var NAV_ICON = { s0: "envelope", s1: "slip", s2: "headset", s3: "flywheel", s4: "coins", s5: "fleet", s6: "pie", cap: "star", ft: "pencil" };
  var sections = qa("section");
  function buildNav() {
    var nav = $("nav"); nav.innerHTML = "";
    sections.forEach(function (s) {
      var b = document.createElement("button"); b.type = "button"; b.dataset.for = s.id;
      b.innerHTML = '<span class="ic" aria-hidden="true">' + (IC[NAV_ICON[s.id]] || "") + "</span>" + s.dataset.n + " · " + s.dataset.title + (store.said[s.id] ? '<span class="chk">✓</span>' : "");
      b.onclick = function () { show(s.id); };
      nav.appendChild(b);
    });
  }
  function current() { var c = sections.filter(function (s) { return s.classList.contains("on"); })[0]; return c ? c.id : "s0"; }
  function show(id, anchor) {
    sections.forEach(function (s) { s.classList.toggle("on", s.id === id); });
    qa("#nav button").forEach(function (b) { b.classList.toggle("on", b.dataset.for === id); });
    if (location.hash !== "#/" + id) history.replaceState(null, "", "#/" + id);
    if (anchor && $(anchor)) setTimeout(function () { $(anchor).scrollIntoView(); }, 0); else window.scrollTo(0, 0);
    setTimeout(refresh, 0);
  }
  function markNav() { var cur = current(); qa("#nav button").forEach(function (b) { b.classList.toggle("on", b.dataset.for === cur); }); }

  /* ---------------- predictions & say-it ---------------- */
  function touch(sec) { if (!sec) return; store.touched[sec] = (store.touched[sec] || 0) + 1; save(); checkSay(sec); }
  function checkSay(sec) {
    var el = $(sec); if (!el) return;
    var say = el.querySelector(".say"); if (!say) return;
    var allAnswered = qa(".predict", el).every(function (p) { return store.predicts[p.dataset.p] != null; });
    if (allAnswered && (store.touched[sec] || 0) > 0) {
      say.classList.add("open");
      if (!store.said[sec]) { store.said[sec] = true; save(); buildNav(); markNav(); }
    }
  }
  function initPredicts() {
    qa(".predict").forEach(function (p) {
      var key = p.dataset.p, btns = qa(".opts button", p), sec = p.closest("section").id;
      function reveal(idx) {
        btns.forEach(function (b, i) { b.disabled = true; if (b.hasAttribute("data-right")) b.classList.add("right"); else if (i === idx) b.classList.add("wrong"); });
        p.classList.add("done");
      }
      btns.forEach(function (b, i) { b.type = "button"; b.onclick = function () { store.predicts[key] = i; save(); reveal(i); checkSay(sec); }; });
      if (store.predicts[key] != null) reveal(store.predicts[key]);
    });
  }

  /* ---------------- glossary tips ---------------- */
  function bindTip(el) {
    var g = GL[el.dataset.g]; if (!g) return;
    el.setAttribute("tabindex", "0"); el.setAttribute("role", "button");
    var tip = $("tip");
    function place() {
      tip.innerHTML = "<b>" + g[0] + "</b>" + g[1] + '<span class="kt">At the Depot: ' + g[2] + "</span>";
      tip.style.display = "block";
      var r = el.getBoundingClientRect(), tw = Math.min(320, window.innerWidth - 24);
      tip.style.width = tw + "px";
      var left = Math.max(12, Math.min(window.innerWidth - tw - 12, r.left + r.width / 2 - tw / 2));
      var top = r.bottom + 8; if (top + tip.offsetHeight > window.innerHeight - 8) top = Math.max(8, r.top - tip.offsetHeight - 8);
      tip.style.left = left + "px"; tip.style.top = top + "px";
    }
    el.addEventListener("mouseenter", place); el.addEventListener("focus", place);
    el.addEventListener("mouseleave", function () { tip.style.display = "none"; });
    el.addEventListener("blur", function () { tip.style.display = "none"; });
    el.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); if (tip.style.display === "block") tip.style.display = "none"; else place(); });
  }
  document.addEventListener("click", function () { $("tip").style.display = "none"; });
  window.addEventListener("scroll", function () { $("tip").style.display = "none"; }, { passive: true });

  /* ---------------- sliders bound to the books ---------------- */
  function srcChip(k) { var m = META[k], s = SRC[m.src] || SRC.illus; return '<span class="src ' + s[1] + '"' + (m.note ? ' title="' + esc(m.note) + '"' : "") + ">" + s[0] + "</span>"; }
  function buildSlider(el, k) {
    var m = META[k]; el.dataset.k = k; el.classList.add("sl");
    el.innerHTML = '<div class="sl-h"><span>' + m.label + " " + srcChip(k) + '</span><b class="val"></b></div><input type="range" min="' + m.min + '" max="' + m.max + '" step="' + m.step + '" aria-label="' + esc(m.label) + '">' + (m.note ? '<div class="note">' + esc(m.note) + "</div>" : "");
    var inp = el.querySelector("input");
    inp.value = S[k]; el.querySelector(".val").textContent = FMT[k] ? FMT[k](S[k], S) : S[k];
    inp.addEventListener("input", function () { setBook(k, +inp.value); touch(el.closest("section") && el.closest("section").id); });
  }
  function syncSliders(k) {
    qa('.sl[data-k="' + k + '"]').forEach(function (el) { var inp = el.querySelector("input"); if (inp && +inp.value !== S[k]) inp.value = S[k]; var v = el.querySelector(".val"); if (v) v.textContent = FMT[k](S[k], S); });
    if (k === "shiftHours" || k === "days") syncSliders("shifts");
    if (k === "lambda") syncMtbi();
  }
  var GROUPS = [["The picker", ["wage", "burden", "humanRate", "humanSuccess", "reworkMin"]], ["Hours", ["shifts", "shiftHours", "days"]],
    ["The robot", ["capex", "integration", "life", "maintPct", "software", "kW", "power", "uptime", "cycle", "success"]],
    ["Calls for help", ["lambda", "handleMin", "opRatio", "opWage", "occTarget", "opCap"]], ["Money and the fleet", ["rate", "fleet", "raasFee"]],
    ["The learning curve (toy)", ["learnDrop", "hours0", "vendorHoursYr", "lambdaFloor"]], ["Who gets the saving", ["cogsPct", "svcMargin", "intMargin"]]];
  function buildBooks() {
    $("booksbox").innerHTML = GROUPS.map(function (g) { return '<div class="bgroup"><div class="bgh">' + g[0] + "</div>" + g[1].map(function (k) { return '<div class="bk" data-bk="' + k + '"></div>'; }).join("") + "</div>"; }).join("");
    qa("[data-bk]").forEach(function (el) { buildSlider(el, el.dataset.bk); });
    $("booksReset").onclick = resetBooks;
  }
  function resetBooks() {
    store.books = {}; save(); S = RP.books();
    Object.keys(META).forEach(function (k) { if (k !== "opMode") syncSliders(k); });
    syncMtbi(); buildModeSeg(); refresh();
  }
  function renderChanged() {
    var ks = Object.keys(store.books).filter(function (k) { return META[k]; });
    var el = $("changed");
    if (!ks.length) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = "<b>You've changed the books:</b> " + ks.map(function (k) { return META[k].label.toLowerCase() + " " + (k === "opMode" ? S[k] : FMT[k](S[k], S)); }).join(" · ") + '. The numbers in the prose are at the defaults. <button class="ghost" type="button" id="chgReset">Reset</button> <a href="#/s1" id="chgBooks">See the books</a>';
    $("chgReset").onclick = resetBooks;
    $("chgBooks").onclick = function (e) { e.preventDefault(); show("s1", "books"); };
  }

  /* ---------------- small widgets ---------------- */
  function seg(el, opts, val, onChange) {
    el.innerHTML = "";
    opts.forEach(function (o) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = o.label;
      if (o.v === val) b.classList.add("on");
      b.onclick = function () { qa("button", el).forEach(function (x) { x.classList.toggle("on", x === b); }); onChange(o.v); };
      el.appendChild(b);
    });
  }
  function payslipHTML(title, rows, cls) {
    return '<div class="slip ' + (cls || "") + '"><div class="slip-h">' + title + "</div>" + rows.map(function (r) {
      return '<div class="slip-r' + (r[2] ? " " + r[2] : "") + '"><span>' + r[0] + "</span><i></i><b>" + r[1] + "</b></div>";
    }).join("") + "</div>";
  }

  /* ---------------- canvas basics ---------------- */
  function prep(cv) {
    var dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth || 600, h = cv.clientHeight || Math.round(w / 2.2);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    var g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    g.fillStyle = COL.sheet; g.fillRect(0, 0, w, h);
    return { g: g, W: w, H: h };
  }
  var HAND = "'Patrick Hand', 'Comic Sans MS', sans-serif", SIGN = "'Grandstander', 'Patrick Hand', sans-serif";
  // The smallest "nice" axis top at or above v that splits into four nice steps.
  function niceMax(v) { if (!(v > 0)) return 1; var st = v / 4, e = Math.pow(10, Math.floor(Math.log10(st))), m = st / e; var steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]; for (var i = 0; i < steps.length; i++) if (m <= steps[i] + 1e-9) return 4 * steps[i] * e; return 40 * e; }
  // A line chart. o: { x: {min, max, log, ticks, fmt, label}, y: {max, fmt, label}, y2: {...}, series: [{xs, ys, col, width, dash, axis}], marks, hlines, vlines }
  function chart(id, o) {
    var cv = $(id); if (!cv || !cv.offsetParent) return;
    var c = prep(cv), g = c.g, W = c.W, H = c.H, narrow = W < 460, pad = { l: narrow ? 40 : 52, r: o.y2 ? (narrow ? 38 : 48) : 14, t: narrow && o.y.label ? 26 : 14, b: 38 };
    var X = o.x.log ? function (v) { return pad.l + (Math.log(v) - Math.log(o.x.min)) / (Math.log(o.x.max) - Math.log(o.x.min)) * (W - pad.l - pad.r); } : function (v) { return pad.l + (v - o.x.min) / (o.x.max - o.x.min) * (W - pad.l - pad.r); };
    var Y = function (v, ax) { var m = ax === 2 ? o.y2.max : o.y.max; return H - pad.b - Math.max(0, Math.min(1.04, v / m)) * (H - pad.t - pad.b); };
    g.font = "13px " + HAND; g.lineWidth = 1;
    var any = o.series.some(function (s) { return s.ys.some(function (v) { return v != null && isFinite(v); }); });
    if (!any) { g.fillStyle = COL.soft; g.textAlign = "center"; g.font = "16px " + HAND; g.fillText("nothing to plot at these settings", W / 2, H / 2); return; }
    for (var j = 0; j <= 4; j++) {
      var yv = o.y.max * j / 4, yy = Y(yv); g.strokeStyle = COL.rule; g.beginPath(); g.moveTo(pad.l, yy); g.lineTo(W - pad.r, yy); g.stroke();
      g.fillStyle = COL.soft; g.textAlign = "right"; g.fillText(o.y.fmt(yv), pad.l - 5, yy + 4);
      if (o.y2) { g.textAlign = "left"; g.fillStyle = COL.bad; g.fillText(o.y2.fmt(o.y2.max * j / 4), W - pad.r + 5, yy + 4); }
    }
    g.fillStyle = COL.soft; g.textAlign = "center";
    var ticks = o.x.ticks, last = -1e9;
    ticks.forEach(function (v, i) { var px = X(v); if (px - last < (narrow ? 38 : 44)) return; last = px; g.textAlign = i === ticks.length - 1 && px > W - pad.r - 24 ? "right" : i === 0 ? "left" : "center"; g.fillText(o.x.fmt(v), g.textAlign === "right" ? px + 4 : g.textAlign === "left" ? px - 4 : px, H - pad.b + 16); g.textAlign = "center"; g.strokeStyle = COL.rule; g.beginPath(); g.moveTo(px, H - pad.b); g.lineTo(px, H - pad.b + 4); g.stroke(); });
    // axis lines: a firm baseline and a left rule, like a ruled ledger
    g.strokeStyle = COL.line; g.lineWidth = 1.5; g.beginPath(); g.moveTo(pad.l, pad.t - 2); g.lineTo(pad.l, H - pad.b); g.lineTo(W - pad.r, H - pad.b); g.stroke();
    if (o.y2) { g.strokeStyle = COL.bad; g.beginPath(); g.moveTo(W - pad.r, pad.t - 2); g.lineTo(W - pad.r, H - pad.b); g.stroke(); }
    g.fillStyle = COL.soft; g.textAlign = "center"; g.lineWidth = 1;
    if (o.x.label) g.fillText(o.x.label, (pad.l + W - pad.r) / 2, H - 4);
    if (o.y.label && !narrow) { g.save(); g.translate(11, (pad.t + H - pad.b) / 2); g.rotate(-Math.PI / 2); g.fillText(o.y.label, 0, 0); g.restore(); }
    if (o.y.label && narrow) { g.textAlign = "left"; g.fillText(o.y.label + (o.y2 && o.y2.label ? " · right: " + o.y2.label : ""), pad.l, pad.t - 9); g.textAlign = "center"; }
    if (o.y2 && o.y2.label) { g.save(); g.fillStyle = COL.bad; g.translate(W - 6, (pad.t + H - pad.b) / 2); g.rotate(Math.PI / 2); g.fillText(o.y2.label, 0, 0); g.restore(); }
    (o.vlines || []).forEach(function (v) { g.strokeStyle = v.col || COL.good; g.setLineDash([4, 4]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(X(v.x), pad.t); g.lineTo(X(v.x), H - pad.b); g.stroke(); g.setLineDash([]); if (v.label) { g.fillStyle = v.col || COL.good; g.textAlign = X(v.x) > W * 0.7 ? "right" : "left"; g.fillText(v.label, X(v.x) + (X(v.x) > W * 0.7 ? -4 : 4), pad.t + 11); } });
    g.save(); g.beginPath(); g.rect(pad.l, pad.t - 2, W - pad.l - pad.r, H - pad.b - pad.t + 4); g.clip();
    var Yc = Y; Y = function (v, ax) { var m = ax === 2 ? o.y2.max : o.y.max; return H - pad.b - Math.min(3, v / m) * (H - pad.t - pad.b); };
    o.series.forEach(function (s) {
      g.strokeStyle = s.col; g.lineWidth = s.width || 2.5; g.setLineDash(s.dash || []); g.beginPath(); var st = false;
      s.ys.forEach(function (v, i) { if (v == null || !isFinite(v)) { st = false; return; } var px = X(s.xs[i]), py = Y(v, s.axis); if (st) g.lineTo(px, py); else { g.moveTo(px, py); st = true; } });
      g.stroke(); g.setLineDash([]);
    });
    g.restore(); Y = Yc;
    (o.marks || []).forEach(function (m) {
      var px = X(m.x), py = Y(m.y, m.axis); g.fillStyle = m.col; g.strokeStyle = COL.line; g.lineWidth = 1.5; g.beginPath(); g.arc(px, py, 5, 0, 7); g.fill(); g.stroke();
      if (m.label) { g.font = "14px " + HAND; var tw2 = g.measureText(m.label).width, lx = Math.min(W - pad.r - tw2 - 4, Math.max(pad.l + 2, px + 8)), ly = py - 10 < pad.t + 10 ? py + 20 : py - 10; g.fillStyle = "rgba(255,253,246,.9)"; g.fillRect(lx - 3, ly - 13, tw2 + 6, 17); g.fillStyle = COL.ink; g.textAlign = "left"; g.fillText(m.label, lx, ly); g.font = "13px " + HAND; }
    });
    legendTag(g, o.series.filter(function (s) { return s.name; }), W - pad.r - 6, pad.t + 4, o.legendLeft ? pad.l + 8 : null);
  }
  // A legend drawn as a paper tag hung in a corner: tag paper, a string hole, one line per series.
  function legendTag(g, items, right, top, left) {
    if (!items.length) return;
    g.font = "13px " + HAND; var lw = 0; items.forEach(function (s) { lw = Math.max(lw, g.measureText(s.name).width); });
    var w = lw + 44, h = items.length * 17 + 10, bx = left != null ? left : right - w, by = top;
    g.save(); g.fillStyle = "rgba(74,46,30,.18)"; g.fillRect(bx + 2, by + 3, w, h);
    g.fillStyle = COL.sheet; g.strokeStyle = COL.line; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(bx + 8, by); g.lineTo(bx + w, by); g.lineTo(bx + w, by + h); g.lineTo(bx + 8, by + h); g.lineTo(bx, by + h / 2); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = COL.paper || "#FBF7EC"; g.beginPath(); g.arc(bx + 8, by + h / 2, 2.5, 0, 7); g.fill(); g.stroke();
    var ly = by + 7; g.textAlign = "left";
    items.forEach(function (s) {
      if (s.swatch) { g.fillStyle = s.col; g.fillRect(bx + 15, ly + 1, 14, 10); g.strokeStyle = COL.line; g.lineWidth = 1; g.strokeRect(bx + 15, ly + 1, 14, 10); }
      else { g.strokeStyle = s.col; g.lineWidth = s.width || 2.5; g.setLineDash(s.dash || []); g.beginPath(); g.moveTo(bx + 14, ly + 6); g.lineTo(bx + 32, ly + 6); g.stroke(); g.setLineDash([]); }
      g.fillStyle = COL.ink; g.fillText(s.name, bx + 38, ly + 10); ly += 17;
    });
    g.restore();
  }
  // Horizontal stacked bars: rows = [{label, parts: [{v, col, name}]}]; shared scale.
  function stacked(id, rows, o) {
    var cv = $(id); if (!cv || !cv.offsetParent) return;
    var c = prep(cv), g = c.g, W = c.W, H = c.H, padL = o.padL || 70, padR = 16, top = 12, bot = (o.axis ? 30 : 8) + (o.legend ? 22 : 0), bh = Math.min(64, (H - top - bot) / rows.length - 14);
    var max = o.max || Math.max.apply(null, rows.map(function (r) { return r.parts.reduce(function (a, p) { return a + Math.max(0, p.v); }, 0); }));
    if (!(max > 0)) { g.fillStyle = COL.soft; g.textAlign = "center"; g.font = "16px " + HAND; g.fillText("nothing to plot at these settings", W / 2, H / 2); return; }
    var X = function (v) { return padL + v / max * (W - padL - padR); };
    g.font = "14px " + HAND;
    rows.forEach(function (r, i) {
      var y = top + i * (bh + 14), x = 0;
      g.fillStyle = COL.ink; g.textAlign = "right"; g.fillText(r.label, padL - 8, y + bh / 2 + 5);
      r.parts.forEach(function (p) {
        if (p.v <= 0) return;
        var x0 = X(x), x1 = X(x + p.v); g.fillStyle = p.col; g.fillRect(x0, y, x1 - x0, bh); g.strokeStyle = COL.line; g.lineWidth = 1.5; g.strokeRect(x0, y, x1 - x0, bh);
        if (p.name && x1 - x0 > g.measureText(p.name).width + 8) { g.fillStyle = COL.ink; g.textAlign = "center"; g.fillText(p.name, (x0 + x1) / 2, y + bh / 2 + 5); }
        x += p.v;
      });
      if (r.total) { g.fillStyle = COL.ink; g.textAlign = "left"; g.font = "700 14px " + SIGN; var tx = X(x) + 6; if (tx + g.measureText(r.total).width > W) { tx = X(x) - g.measureText(r.total).width - 6; g.fillStyle = COL.sheet; } g.fillText(r.total, tx, y + bh / 2 + 5); g.font = "14px " + HAND; }
    });
    var ay = H - (o.legend ? 22 : 0);
    if (o.axis) { g.strokeStyle = COL.line; g.lineWidth = 1.5; g.beginPath(); g.moveTo(X(0), ay - 24); g.lineTo(X(max), ay - 24); g.stroke(); g.fillStyle = COL.soft; g.textAlign = "center"; g.font = "13px " + HAND; for (var j = 0; j <= 4; j++) { var v = max * j / 4; g.strokeStyle = COL.line; g.lineWidth = 1; g.beginPath(); g.moveTo(X(v), ay - 24); g.lineTo(X(v), ay - 20); g.stroke(); g.fillText(o.axis(v), X(v), ay - 8); } }
    if (o.legend) {   // a row of swatches along the bottom
      g.font = "13px " + HAND; var x = padL, yy = H - 9;
      o.legend.forEach(function (l) { g.fillStyle = l[1]; g.fillRect(x, yy - 10, 14, 11); g.strokeStyle = COL.line; g.lineWidth = 1; g.strokeRect(x, yy - 10, 14, 11); g.fillStyle = COL.ink; g.textAlign = "left"; g.fillText(l[0], x + 18, yy); x += 18 + g.measureText(l[0]).width + 14; });
    }
  }

  /* ================= STEP 0 ================= */
  function renderS0() {
    var h = RP.human(S);
    $("s0slip").innerHTML = payslipHTML("PICKER · PER HOUR WORKED", [["wage", usd(S.wage, 2)], ["benefits", usd(S.wage * S.burden, 2)], ["rework of misses", usd(h.rework, 2)], ["the hour costs", usd(h.total, 2), "tot"], ["good picks in it", fmt(h.good, 1)], ["per good pick", cents(h.costPerPick), "tot big"]], "human");
    $("s0h").textContent = usd(h.hourly, 2); $("s0cpp").textContent = cents(h.costPerPick); $("s0yr").textContent = usd(h.hourly * 2000);
  }

  /* ================= STEP 1 ================= */
  function robotRows(r, title) {
    var L = r.lines;
    return [["capital", usd(L.capital + (L.raas || 0), 2)], ["maintenance + software", usd(L.maint + L.software, 2)], ["power", usd(L.power, 2)], ["operators (1 per " + fmt(r.ratio, r.ratio < 10 ? 2 : 1) + ")", usd(L.operators, 2)], ["rework of misses", usd(L.rework, 2)],
      ["the hour costs", usd(r.total, 2), "tot"], ["good picks in it", fmt(r.good, 0)], ["per good pick", cents(r.costPerPick), "tot big"]];
  }
  function renderS1() {
    var c = RP.compare(S), h = c.h, r = c.r;
    $("s1hslip").innerHTML = payslipHTML("PICKER · PER HOUR", [["wage + benefits", usd(h.hourly, 2)], ["rework of misses", usd(h.rework, 2)], ["the hour costs", usd(h.total, 2), "tot"], ["good picks in it", fmt(h.good, 1)], ["per good pick", cents(h.costPerPick), "tot big"]], "human");
    $("s1rslip").innerHTML = payslipHTML("ROBOT · PER SCHEDULED HOUR", robotRows(r), "robot");
    $("s1r").textContent = cents(r.costPerPick); $("s1h").textContent = cents(h.costPerPick);
    var win = c.saving > 0;
    $("s1s").textContent = pct(Math.abs(c.savingPct), 0); $("s1s").className = "v " + (win ? "good" : "bad"); $("s1sl").textContent = win ? "robot saves, per pick" : "robot costs more, per pick";
    var L = r.lines, g = r.good;
    stacked("s1bar", [
      { label: "robot", parts: [{ v: L.capital / g, col: LINES[0][2], name: "capital" }, { v: (L.maint + L.software) / g, col: LINES[1][2], name: "upkeep" }, { v: L.power / g, col: LINES[2][2] }, { v: L.operators / g, col: LINES[3][2], name: "ops" }, { v: L.rework / g, col: LINES[4][2], name: "rework" }], total: cents(r.costPerPick) },
      { label: "picker", parts: [{ v: h.hourly / h.good, col: COL.sky, name: "wage + benefits" }, { v: h.rework / h.good, col: LINES[4][2] }], total: cents(h.costPerPick) }
    ], { max: niceMax(Math.max(r.costPerPick, h.costPerPick) * 1.12), axis: function (v) { return cents(v, 1); }, legend: LINES.map(function (l) { return [l[1], l[2]]; }).concat([["wage + benefits", COL.sky]]) });
    // utilisation curve
    var xs = [], ys = [];
    for (var hrs = 500; hrs <= 8760; hrs += 50) { xs.push(hrs); var q = RP.clone(S, { shifts: 1, shiftHours: 1, days: hrs }); ys.push(RP.robot(q).costPerPick * 100); }
    var hc = h.costPerPick * 100, ymax = niceMax(Math.max(hc * 2, RP.robot(RP.clone(S, { shifts: 1 })).costPerPick * 115));
    var marks = [1, 2, 3].map(function (k) { var hh = k * S.shiftHours * S.days; return { x: hh, y: RP.robot(RP.clone(S, { shifts: k })).costPerPick * 100, col: k === S.shifts ? COL.robotF : COL.sheet, label: k + (k > 1 ? " shifts" : " shift") }; });
    chart("s1util", { x: { min: 500, max: 8760, ticks: [500, 2000, 4000, 6000, 8760], fmt: function (v) { return fmt(v) + " h"; }, label: "hours the robot is scheduled a year" }, y: { max: ymax, fmt: function (v) { return fmt(v, 0) + "¢"; }, label: "per good pick" },
      series: [{ xs: xs, ys: ys, col: COL.robot, name: "robot" }, { xs: [500, 8760], ys: [hc, hc], col: COL.human, dash: [6, 4], name: "picker" }], marks: marks });
  }

  /* ================= STEP 2 ================= */
  var MT_MAX = 6000;   // minutes: a call every 100 hours
  function mtbiToPos(min) { return Math.round(1000 * Math.log(min) / Math.log(MT_MAX)); }
  function posToMtbi(p) { return Math.exp(p / 1000 * Math.log(MT_MAX)); }
  function syncMtbi() { if ($("s2m")) { $("s2m").value = mtbiToPos(60 / S.lambda); $("s2mv").textContent = secs(1 / S.lambda); } }
  function buildModeSeg() {
    seg($("s2mode"), [{ v: "workload", label: "set by the workload" }, { v: "fixed", label: "fixed by contract" }], S.opMode, function (v) { setBook("opMode", v); touch("s2"); });
    $("s2fixed").style.display = S.opMode === "fixed" ? "" : "none";
  }
  function renderS2() {
    $("s2fixed").style.display = S.opMode === "fixed" ? "" : "none";
    var c = RP.compare(S), r = c.r;
    $("s2lam").textContent = fmt(S.lambda, 2); $("s2aut").textContent = pct(r.autonomy, 2); $("s2rat").textContent = fmt(r.ratio, r.ratio < 10 ? 2 : 1);
    $("s2occ").textContent = pct(r.occ, 0); $("s2occ").className = "v " + (r.occ > 1 ? "bad" : r.occ > 0.85 ? "warn" : "");
    $("s2ops").textContent = cents(r.lines.operators / r.good); $("s2cpp").textContent = cents(r.costPerPick); $("s2cpp").className = "v " + (c.saving > 0 ? "good" : "bad");
    var xs = [], tot = [], ops = [];
    for (var p = 0; p <= 1000; p += 10) { var m = posToMtbi(p), q = RP.robot(S, { lambda: 60 / m }); xs.push(m); tot.push(q.costPerPick * 100); ops.push(q.lines.operators / q.good * 100); }
    var hc = c.h.costPerPick * 100;
    chart("s2chart", { x: { min: 1, max: MT_MAX, log: true, ticks: [1, 6, 30, 120, 600, 6000], fmt: function (v) { return v < 60 ? fmt(v) + " min" : fmt(v / 60) + " h"; }, label: "minutes between calls (MTBI), log scale" },
      y: { max: niceMax(Math.max(hc * 2.4, r.costPerPick * 140)), fmt: function (v) { return fmt(v, 0) + "¢"; }, label: "per good pick" },
      series: [{ xs: xs, ys: tot, col: COL.robot, name: "robot, all lines" }, { xs: xs, ys: ops, col: COL.ops, name: "operator share", width: 2 }, { xs: [1, MT_MAX], ys: [hc, hc], col: COL.human, dash: [6, 4], name: "picker" }],
      marks: [{ x: 60 / S.lambda, y: r.costPerPick * 100, col: COL.robotF, label: "you: " + cents(r.costPerPick) }] });
    var A = [0.95, 0.98, 0.99, 0.995, 0.999, 0.9999];
    $("s2tab").innerHTML = "<tr><th>autonomy per attempt</th><th>calls / running hour</th><th>every</th><th>robots per operator</th><th>per good pick</th></tr>" + A.map(function (a) {
      var lam = RP.lambdaFromAutonomy(S, a), q = RP.robot(S, { lambda: lam }), win = q.costPerPick < c.h.costPerPick;
      return "<tr><td>" + fmt(a * 100, a > 0.999 ? 2 : 1) + "%</td><td>" + fmt(lam, 2) + "</td><td>" + secs(1 / lam) + "</td><td>" + fmt(q.ratio, q.ratio < 10 ? 2 : 1) + '</td><td class="n" style="color:' + (win ? COL.good : COL.bad) + '">' + cents(q.costPerPick) + "</td></tr>";
    }).join("") + '<tr><td colspan="5" class="muted">picker: ' + cents(c.h.costPerPick) + " · at " + fmt(S.cycle, 1) + " s a pick, " + fmt(3600 / S.cycle, 0) + " attempts a running hour</td></tr>";
  }

  /* ================= STEP 3 ================= */
  function renderS3() {
    var hc = RP.human(S).costPerPick * 100, xs = [], lam = [], cpp = [];
    for (var m = 0; m <= 60; m++) { var l = RP.lambdaAtYear(S, m / 12); xs.push(m); lam.push(l); cpp.push(RP.costAtLambda(S, l) * 100); }
    $("s3l1").textContent = fmt(RP.lambdaAtYear(S, 1), 2); $("s3l3").textContent = fmt(RP.lambdaAtYear(S, 3), 2); $("s3l5").textContent = fmt(RP.lambdaAtYear(S, 5), 2);
    var x = RP.crossoverMonth(S, 120);
    $("s3x").textContent = x == null ? "not in 10 years" : x === 0 ? "day one" : "month " + x; $("s3x").className = "v " + (x == null ? "bad" : "good");
    var ymax = niceMax(Math.max(hc * 1.6, Math.min(cpp[0], hc * 3)));
    chart("s3chart", { x: { min: 0, max: 60, ticks: [0, 12, 24, 36, 48, 60], fmt: function (v) { return "yr " + v / 12; }, label: "years from now" },
      y: { max: ymax, fmt: function (v) { return fmt(v, 0) + "¢"; }, label: "per good pick" }, y2: { max: niceMax(lam[0] * 1.1), fmt: function (v) { return fmt(v, 1); }, label: "calls per running hour" },
      series: [{ xs: xs, ys: cpp, col: COL.robot, name: "robot, per good pick" }, { xs: [0, 60], ys: [hc, hc], col: COL.human, dash: [6, 4], name: "picker" }, { xs: xs, ys: lam, col: COL.bad, axis: 2, width: 2, dash: [2, 3], name: "calls an hour (right scale)" }],
      vlines: x != null && x > 0 && x <= 60 ? [{ x: x, label: "robot cheaper from month " + x }] : [] });
  }

  /* ================= STEP 4 ================= */
  var learnOn = false;
  function renderS4() {
    var o = { learning: learnOn }, b = RP.deal(S, o), r = RP.deal(S, { mode: "raas", learning: learnOn });
    function row(name, d) { return "<tr><td>" + name + "</td><td>" + usdM(-d.flows[0]) + "</td><td>" + usdM(d.flows[1]) + '</td><td class="n">' + (d.payback == null ? "never" : fmt(d.payback * 12, 0) + " mo") + '</td><td class="n" style="color:' + (d.npv >= 0 ? COL.good : COL.bad) + '">' + usdM(d.npv) + "</td><td>" + (d.irr == null ? "–" : pct(d.irr, 1)) + "</td></tr>"; }
    $("s4tab").innerHTML = "<tr><th>" + S.fleet + " robots, " + S.life + " years</th><th>cash out, year 0</th><th>saving, year 1</th><th>payback</th><th>NPV at " + pct(S.rate, 1) + "</th><th>IRR</th></tr>" + row("buy", b) + row("rent (RaaS)", r);
    var bw = RP.breakEvenWage(S), bn = RP.breakEvenWageNPV(S, o);
    $("s4bew").textContent = bw == null ? "–" : usd(bw, 2) + " /h"; $("s4bewn").textContent = bn == null ? "–" : usd(bn, 2) + " /h";
    var a = RP.annual(S), k = RP.crf(S.rate, S.life);
    $("s4math").innerHTML = '<div class="eq">NPV = −' + usdM(-b.flows[0]) + " + Σ saving_t ÷ (1 + " + fmt(S.rate, 3) + ")^t</div>" +
      '<div class="eqn">a robot-year: <b>' + fmt(a.picks) + "</b> good picks, which would cost <b>" + usd(a.humanCost) + "</b> of picker time (about " + fmt(a.fte, 2) + " people on one shift); running the robot (everything but capital) costs <b>" + usd(a.opex) + "</b>; saving <b>" + usd(a.saving) + "</b> a robot, ×" + S.fleet + ".</div>" +
      '<div class="eqn">why the two break-even wages agree: the capital line on the payslip is (price + integration) × ' + fmt(k, 4) + " a year, the level payment that repays it at " + pct(S.rate, 1) + " over " + S.life + " years. So zero saving per pick ⇔ NPV = 0" + (learnOn ? " (with learning on, later years differ, so they can part)" : "") + ".</div>";
    var ys = [], yr = [], cb = 0, cr = 0, xs = [];
    b.flows.forEach(function (f, i) { cb += f; cr += r.flows[i]; xs.push(i); ys.push(cb / 1e6); yr.push(cr / 1e6); });
    var lo = Math.min.apply(null, ys.concat(yr)), hi = Math.max.apply(null, ys.concat(yr)), off = -Math.min(0, lo), span = niceMax(hi + off);
    chartSigned("s4cash", xs, [{ ys: ys, col: COL.robot, name: "buy: running total" }, { ys: yr, col: COL.ops, name: "rent (RaaS): running total" }], lo, hi);
    tornadoChart();
  }
  function chartSigned(id, xs, series, lo, hi) {
    var cv = $(id); if (!cv || !cv.offsetParent) return;
    var c = prep(cv), g = c.g, W = c.W, H = c.H, pad = { l: 58, r: 14, t: 14, b: 34 }, top = niceMax(Math.max(hi, 0.001)), bot = -niceMax(Math.max(-lo, 0.001));
    var X = function (i) { return pad.l + i / (xs.length - 1) * (W - pad.l - pad.r); }, Y = function (v) { return pad.t + (top - v) / (top - bot) * (H - pad.t - pad.b); };
    g.font = "13px " + HAND; g.textAlign = "right";
    [bot, bot / 2, 0, top / 2, top].forEach(function (v) { g.strokeStyle = v === 0 ? COL.line : COL.rule; g.lineWidth = v === 0 ? 1.5 : 1; g.beginPath(); g.moveTo(pad.l, Y(v)); g.lineTo(W - pad.r, Y(v)); g.stroke(); g.fillStyle = COL.soft; g.fillText(usdM(v * 1e6), pad.l - 5, Y(v) + 4); });
    g.strokeStyle = COL.line; g.lineWidth = 1.5; g.beginPath(); g.moveTo(pad.l, pad.t - 2); g.lineTo(pad.l, H - pad.b); g.lineTo(W - pad.r, H - pad.b); g.stroke();
    g.fillStyle = COL.soft; g.textAlign = "center"; xs.forEach(function (x, i) { g.fillText("yr " + x, X(i), H - pad.b + 16); });
    g.fillText("running total of cash, the fleet (undiscounted)", (pad.l + W) / 2, H - 3);
    series.forEach(function (s) { g.strokeStyle = s.col; g.lineWidth = 2.5; g.beginPath(); s.ys.forEach(function (v, i) { if (i) g.lineTo(X(i), Y(v)); else g.moveTo(X(i), Y(v)); }); g.stroke(); s.ys.forEach(function (v, i) { g.fillStyle = s.col; g.strokeStyle = COL.line; g.lineWidth = 1.2; g.beginPath(); g.arc(X(i), Y(v), 4, 0, 7); g.fill(); g.stroke(); }); });
    legendTag(g, series, W - pad.r - 6, H - pad.b - (series.length * 17 + 10) - 8);   // bottom-right: the lines climb away from it
  }
  function tornadoChart() {
    var cv = $("s4torn"); if (!cv || !cv.offsetParent) return;
    var t = RP.tornado(S, { learning: learnOn }), c = prep(cv), g = c.g, W = c.W, H = c.H, narrow = W < 520, padR = 14, top = 26, bh = (H - top - 26) / t.length;
    var labs = t.map(function (r) { return (SHORT[r.key] || META[r.key].label.split(" (")[0]) + " " + shortVal(r.key, r.lo) + "→" + shortVal(r.key, r.hi); });
    g.font = (narrow ? 11.5 : 13) + "px " + HAND; var padL = Math.min(W * 0.5, 10 + Math.max.apply(null, labs.map(function (l) { return g.measureText(l).width; })));
    var all = []; t.forEach(function (r) { all.push(r.npvLo, r.npvHi); }); var lo = Math.min.apply(null, all.concat([t[0].base])), hi = Math.max.apply(null, all.concat([t[0].base]));
    var X = function (v) { return padL + (v - lo) / (hi - lo || 1) * (W - padL - padR); };
    g.font = (narrow ? 11.5 : 13) + "px " + HAND;
    t.forEach(function (r, i) { if (i % 2) { g.fillStyle = "rgba(231,220,196,.35)"; g.fillRect(6, top + i * bh - 3, W - 12, bh); } });
    g.strokeStyle = COL.line; g.lineWidth = 1.5; g.beginPath(); g.moveTo(X(t[0].base), top - 6); g.lineTo(X(t[0].base), H - 22); g.stroke();
    g.font = "700 13px " + SIGN; g.fillStyle = COL.ink; g.textAlign = "center"; g.fillText("the books: NPV " + usdM(t[0].base), X(t[0].base), 14); g.font = (narrow ? 11.5 : 13) + "px " + HAND;
    var st = niceMax(hi - lo) / 4; g.fillStyle = COL.soft; g.textAlign = "center";
    for (var v = Math.ceil(lo / st) * st; v <= hi + 1e-6; v += st) { g.strokeStyle = COL.rule; g.lineWidth = 1; g.beginPath(); g.moveTo(X(v), H - 22); g.lineTo(X(v), H - 17); g.stroke(); if (Math.abs(v) > st / 2) g.fillText(usdM(v), X(v), H - 5); }
    if (lo < 0 && hi > 0) { g.strokeStyle = COL.bad; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(X(0), top - 6); g.lineTo(X(0), H - 22); g.stroke(); g.setLineDash([]); g.fillStyle = COL.bad; g.fillText("NPV 0", X(0), H - 5); }
    t.forEach(function (r, i) {
      var y = top + i * bh, h = Math.max(6, bh - 6);
      [[r.npvLo, r.lo, "#F4B7A7"], [r.npvHi, r.hi, "#BFE3A6"]].forEach(function (e) {
        var x0 = X(Math.min(e[0], r.base)), x1 = X(Math.max(e[0], r.base)); g.fillStyle = e[2]; g.fillRect(x0, y, x1 - x0, h); g.strokeStyle = COL.line; g.lineWidth = 1; g.strokeRect(x0, y, x1 - x0, h);
      });
      g.fillStyle = i === 0 ? COL.ink : COL.soft; g.textAlign = "right";
      g.fillText(labs[i], padL - 6, y + h / 2 + 4);
      if (!narrow) {   // the NPV at each end of the bar, outside it
        g.fillStyle = COL.soft; g.font = "11.5px " + HAND;
        var xl = X(Math.min(r.npvLo, r.npvHi)), xr = X(Math.max(r.npvLo, r.npvHi)), tl = usdM(Math.min(r.npvLo, r.npvHi)), tr = usdM(Math.max(r.npvLo, r.npvHi));
        function knock(x0, w) { g.fillStyle = "rgba(255,253,246,.85)"; g.fillRect(x0, y + h / 2 - 7, w, 15); g.fillStyle = COL.soft; }   // paper behind the label, over the NPV 0 rule
        if (xl - padL > g.measureText(tl).width + 8) { knock(xl - 6 - g.measureText(tl).width, g.measureText(tl).width + 4); g.textAlign = "right"; g.fillText(tl, xl - 4, y + h / 2 + 4); }
        if (W - padR - xr > g.measureText(tr).width + 8) { knock(xr + 2, g.measureText(tr).width + 4); g.textAlign = "left"; g.fillText(tr, xr + 4, y + h / 2 + 4); }
        g.font = "13px " + HAND;
      }
    });
  }
  var SHORT = { cycle: "Cycle time", success: "First-time success", lambda: "Calls an hour", handleMin: "Minutes a call", maintPct: "Maintenance a year", opWage: "Operator's wage", wage: "Picker's wage", capex: "Robot price", integration: "Integration", shifts: "Shifts a day", life: "Useful life", rate: "Discount rate", uptime: "Uptime" };
  function shortVal(k, v) {
    if (["uptime", "success", "rate", "maintPct"].indexOf(k) >= 0) return fmt(v * 100, 0) + "%";
    if (k === "capex" || k === "integration") return "$" + fmt(v / 1000) + "k";
    if (k === "wage" || k === "opWage") return "$" + fmt(v, 0);
    if (k === "cycle") return fmt(v, 0) + "s";
    if (k === "handleMin") return fmt(v, 0) + "m";
    return fmt(v, v < 10 && v % 1 ? 1 : 0);
  }

  /* ================= STEP 5 ================= */
  var F = { R: 20, c: 2, target: 0.95 };
  function renderS5() {
    $("s5R").value = F.R; $("s5c").max = Math.min(20, F.R); if (F.c > F.R) F.c = F.R; $("s5c").value = F.c; $("s5Rv").textContent = F.R + " robots"; $("s5cv").textContent = F.c + (F.c > 1 ? " operators" : " operator");
    var q = RP.fleetQueue(S, F.R, F.c), mr = RP.machineRepair(F.R, F.c, S.lambda * S.uptime, 60 / S.handleMin), hc = RP.human(S).costPerPick;
    $("s5A").textContent = fmt(q.A, 2); $("s5rho").textContent = pct(q.rho, 0); $("s5pw").textContent = pct(q.pWait, 0);
    $("s5wq").textContent = secs(q.WqMin / 60); $("s5idle").textContent = pct(q.idleShare, 1); $("s5cpp").textContent = cents(q.costPerPick); $("s5cpp").className = "v " + (q.costPerPick < hc ? "good" : "bad");
    var cs = [], ys = [], cmax = Math.min(F.R, 12);
    for (var c = 1; c <= cmax; c++) { cs.push(c); ys.push(RP.fleetQueue(S, F.R, c).costPerPick * 100); }
    var best = RP.bestOperators(S, F.R);
    chart("s5chart", { x: { min: 1, max: Math.max(2, cmax), ticks: cs, fmt: function (v) { return String(v); }, label: "operators sharing " + F.R + " robots" },
      y: { max: niceMax(Math.max(hc * 160, Math.min(ys[0], hc * 300))), fmt: function (v) { return fmt(v, 0) + "¢"; }, label: "per good pick" },
      series: [{ xs: cs, ys: ys, col: COL.robot, name: "robot, with queueing" }, { xs: [1, Math.max(2, cmax)], ys: [hc * 100, hc * 100], col: COL.human, dash: [6, 4], name: "picker" }],
      marks: [{ x: F.c, y: q.costPerPick * 100, col: COL.robotF, label: "you" }, { x: best.c, y: best.costPerPick * 100, col: COL.grass, label: "cheapest: " + best.c }].filter(function (m, i, a) { return i === 0 || m.x !== a[0].x; }) });
    $("s5cap").innerHTML = "Erlang C with the call rate solved together with the wait. Cross-check, the exact finite-population (machine-repair) model: " + secs(mr.Wq) + " average wait against Erlang C's " + secs(q.WqMin / 60) + ". Erlang C assumes endless callers, so it overstates waits for small fleets.";
    $("s5pool").innerHTML = "<tr><th>robots</th><th>operators</th><th>calls that wait</th><th>average wait</th><th>per good pick</th></tr>" + [10, 20, 50, 100].map(function (R) {
      var cc = Math.max(1, Math.round(R / 10)), z = RP.fleetQueue(S, R, cc);
      return "<tr><td>" + R + "</td><td>" + cc + "</td><td>" + pct(z.pWait, 0) + '</td><td class="n">' + secs(z.WqMin / 60) + "</td><td>" + cents(z.costPerPick) + "</td></tr>";
    }).join("") + '<tr><td colspan="5" class="muted">one operator per ten robots throughout; calls ' + fmt(S.lambda, 2) + " an hour, " + fmt(S.handleMin, 2) + " min each</td></tr>";
    $("s5t").value = F.target; $("s5tv").textContent = pct(F.target, 1);
    var sp = RP.spares(F.R, S.uptime, F.target);
    $("s5p0").textContent = sp ? pct(sp.prob0, 0) : "–"; $("s5S").textContent = sp ? String(sp.S) : "–";
    $("s5Sx").textContent = sp ? usd(sp.S * S.capex) + " (" + pct(sp.S / F.R, 0) + ")" : "–";
  }

  /* ================= STEP 6 ================= */
  var SPLIT = [["customer", "the Depot keeps", "#9BCB7E"], ["makerProfit", "robot maker: gross profit", "#E0A91E"], ["makerCost", "robot maker: cost of goods and service", "#F2D58A"], ["integratorProfit", "integrator: profit", "#B8793F"], ["integratorCost", "integrator: cost", "#DDBB8A"], ["finance", "cost of money (interest)", "#B9BDC2"], ["operators", "remote operators", "#B8A3DC"], ["rework", "rework labour", "#E8907A"], ["power", "electricity", "#9CCBEA"]];
  var D = { mtbi: 8, hours: 120, ratio: 30, aut: 99.9 };
  function renderS6() {
    var v = RP.valueSplit(S), tot = v.payroll;
    stacked("s6pie", [{ label: "payroll", parts: SPLIT.map(function (s) { return { v: Math.max(0, v.parts[s[0]]), col: s[2], name: ({ customer: "the Depot", makerProfit: "maker profit", makerCost: "maker cost", integratorCost: "integrator", finance: "interest", operators: "ops", rework: "rework", power: "power" })[s[0]] || "" }; }), total: "" }], { max: Math.max(tot, tot - Math.min(0, v.parts.customer)), padL: 64 });
    $("s6tab").innerHTML = "<tr><th>slice</th><th>a robot-year</th><th>share</th></tr>" + SPLIT.map(function (s) {
      var x = v.parts[s[0]];
      return '<tr><td><span class="swatch" style="background:' + s[2] + '"></span>' + s[1] + '</td><td class="n"' + (x < 0 ? ' style="color:' + COL.bad + '"' : "") + ">" + usd(x) + "</td><td>" + pct(x / tot, 0) + "</td></tr>";
    }).join("");
    $("s6pay").textContent = usd(tot); $("s6cust").textContent = usd(v.parts.customer); $("s6custl").textContent = "the Depot keeps (" + pct(v.parts.customer / tot, 0) + ")"; $("s6cust").className = "v " + (v.parts.customer >= 0 ? "good" : "bad");
    $("s6ceil").textContent = usd(v.priceCeiling);
    renderDiligence();
  }
  var dText = "";
  function renderDiligence() {
    $("d1").value = D.mtbi; $("d2").value = D.hours; $("d3").value = D.ratio; $("d4").value = D.aut;
    $("d1v").textContent = fmt(D.mtbi, 1) + " h"; $("d2v").textContent = fmt(D.hours) + " h"; $("d3v").textContent = D.ratio + " robots"; $("d4v").textContent = fmt(D.aut, 2) + "%";
    var r = RP.diligence(S, { mtbiH: D.mtbi, hoursH: D.hours, ratio: D.ratio, autonomyPct: D.aut });
    var names = { evidence: "Evidence behind the MTBI", ratio: "Operator ratio vs the calls", autonomy: "Autonomy % agrees with the MTBI", uptime: "Uptime", success: "Success rate", parity: "Beats the picker per pick" };
    $("dlist").innerHTML = r.items.map(function (it) { return '<div class="check ' + (it.ok ? "pass" : "no") + '"><span class="ic">' + (it.ok ? "✓" : "!") + "</span><div>" + names[it.k] + '<div class="why">' + esc(it.text) + "</div></div></div>"; }).join("");
    var ask = ["Interventions by site and by month, with hours: not a fleet average", "The written definition of an intervention (who counts, what's excluded)", "Minutes of operator time per intervention, and the staffing roster",
      "Uptime against scheduled hours, not calendar hours", "Success rate first time, with retries and rework counted", "Deployment hours by customer and cohort, to see the learning curve", "Shifts a day at each customer site"];
    $("dask").innerHTML = "<b>Ask for:</b><ul>" + ask.map(function (a) { return "<li>" + a + "</li>"; }).join("") + "</ul>";
    dText = "Robot diligence checklist (Robot Payroll)\n" + r.items.map(function (it) { return (it.ok ? "[ok] " : "[!!] ") + names[it.k] + ": " + it.text; }).join("\n") + "\nAsk for:\n" + ask.map(function (a) { return "- " + a; }).join("\n");
  }

  /* ================= REVIEW BOARD ================= */
  var CASES = [
    { id: "A", title: "Deck A · PickPal: “payback in 9 months”", unit: "months",
      brief: "<b>The claim:</b> “Our picker pays for itself in 9 months. Fully autonomous.” <b>Their sheet:</b> robot $100,000, integration $25,000, three shifts, 360 days a year, the books' numbers for the rest. <b>Their pilot appendix:</b> 8 interventions per robot-hour, 2.5 minutes each. There is no line for remote operators.",
      show: function (r) { return "payback " + months(r.value) + " · NPV " + usdM(r.npv) + (r.c.r.lines.operators > 0 ? " · 1 operator per " + fmt(r.c.r.ratio, 2) + " robots" : " · no operators"); },
      fixes: [["rate", "Discount at 14% instead of 10%"], ["ops", "Add the remote operators the pilot's own log implies"], ["life", "Depreciate over 3 years, not 5"]],
      causes: [["It prices a “fully autonomous” robot whose own pilot calls for help 8 times an hour, and pays nobody to answer", true], ["Its discount rate is too low", false], ["Its depreciation life is too long", false]],
      why: { ops: "At 8 calls × 2.5 minutes, one operator keeps up with 2.25 robots: the honest payback is about 50 months and NPV turns negative.", rate: "Payback doesn't discount: the number doesn't move.", life: "Depreciation is an accounting entry; before tax, cash payback doesn't move. (After tax, faster depreciation helps a little; it doesn't pay the operators.)" } },
    { id: "B", title: "Deck B · Armada: “one operator runs 50 robots”", unit: "¢",
      brief: "<b>The claim:</b> “99% autonomous. One operator runs 50 robots, so remote ops cost almost nothing: 6.6¢ a pick.” <b>Their sheet:</b> an 8-second cycle (450 attempts a running hour), 4.5 interventions an hour (that's what 1% of 450 is), 2 minutes each, 50 robots per operator.",
      show: function (r) { return "cost per pick " + cents(r.value / 100) + " · 1 operator per " + fmt(r.c.r.ratio, 1) + " robots · operator " + pct(r.c.r.occ, 0) + " busy"; },
      fixes: [["uptime", "Credit the 99% uptime from the brochure"], ["cycle", "Use the 4-second cycle from the demo video"], ["workload", "Set the operator ratio from the calls (75% busy)"]],
      causes: [["Its uptime is understated", false], ["99% autonomy at 450 picks an hour is 4.5 calls a robot-hour: 50 robots need 7.5 operators' worth of time", true], ["Its cycle time is too slow", false]],
      why: { workload: "4.5 calls × 2 min is 9 operator-minutes a robot-hour: 5 robots per operator at 75% busy. Still cheaper than the picker, but by far less than the deck says.", uptime: "That makes the number better, not more honest: the operator is still 750% busy.", cycle: "Faster picks dilute the cost per pick, but the operator is still impossibly busy." } },
    { id: "C", title: "Deck C · HandyBot: “$11 an hour vs $29 a picker”", unit: "% of a picker",
      brief: "<b>The claim:</b> “Our robot costs $11.18 an hour all-in. A picker costs $28.98. Swap them and save 61%.” <b>Their sheet:</b> robot $50,000, integration $10,000, a 30-second cycle, 85% uptime, 95% first-time success, 1.5 calls an hour; the books' numbers for the rest.",
      show: function (r, fix) { return "robot costs " + fmt(r.value, 0) + "% of a picker, " + (fix === "perpick" ? "per good pick (" + cents(r.c.r.costPerPick) + " vs " + cents(r.c.h.costPerPick) + ")" : "per hour"); },
      fixes: [["power", "Add the electricity the sheet left off"], ["life", "Use a 7-year life"], ["perpick", "Compare cost per good pick, not per hour"]],
      causes: [["It forgot the power bill", false], ["Its robot's life is too short", false], ["It compares an hour of a robot that makes 92 good picks with an hour of a picker who makes 298.5", true]],
      why: { perpick: "92 good picks an hour against 298.5: per pick the robot costs 23% more than the picker.", power: "Power is 8¢ an hour: the comparison barely moves.", life: "A longer life lowers the hourly cost a little; it's still the wrong comparison." } }
  ];
  function initCap() {
    $("capcases").innerHTML = CASES.map(function (c) {
      return '<div class="card case" style="margin-top:14px"><h3>' + c.title + '</h3><div class="brief">' + c.brief + '</div>' +
        '<div class="btnrow"><button class="ghost" type="button" id="c' + c.id + 'run">Run the deck’s own sheet</button><span class="verdict" id="c' + c.id + 'v"></span></div>' +
        '<div class="lbl">The fix</div><div class="reason">' + c.fixes.map(function (f, i) { return '<label><input type="radio" name="c' + c.id + 'fix" value="' + i + '"><span>' + esc(f[1]) + "</span></label>"; }).join("") + "</div>" +
        '<div class="lbl">What the deck got wrong</div><div class="reason">' + c.causes.map(function (f, i) { return '<label><input type="radio" name="c' + c.id + 'cause" value="' + i + '"><span>' + esc(f[0]) + "</span></label>"; }).join("") + "</div>" +
        '<div class="btnrow"><button class="act" type="button" id="c' + c.id + 'go">Re-run with the fix</button></div><div class="checks" id="c' + c.id + 'ch"></div></div>';
    }).join("");
    function grade() { var n = CASES.filter(function (c) { return store.cap[c.id]; }).length; $("capstars").textContent = "★".repeat(n) + "☆".repeat(3 - n); $("capverdict").innerHTML = n === 3 ? "<b>Three for three.</b> You can sit on the investment committee." : n ? "<b>" + n + " of 3</b> decks diagnosed." : ""; if (n === 3 && !store.said.cap) { store.said.cap = true; save(); buildNav(); markNav(); } }
    CASES.forEach(function (c) {
      $("c" + c.id + "run").onclick = function () { var r = RP.deckRun(c.id); $("c" + c.id + "v").innerHTML = "as pitched: " + c.show(r); };
      $("c" + c.id + "go").onclick = function () {
        var fi = document.querySelector('input[name="c' + c.id + 'fix"]:checked'), ci = document.querySelector('input[name="c' + c.id + 'cause"]:checked');
        if (!fi || !ci) { $("c" + c.id + "ch").innerHTML = '<div class="callout co-w">Pick a fix and a diagnosis first.</div>'; return; }
        var fix = c.fixes[+fi.value][0], cause = c.causes[+ci.value], r0 = RP.deckRun(c.id), r = RP.deckRun(c.id, fix), honest = RP.deckRun(c.id, RP.DECKS[c.id].right);
        var okRun = Math.abs(r.value - honest.value) <= Math.abs(honest.value) * 0.005 + 1e-9 || (!isFinite(r.value) && !isFinite(honest.value));
        var rows = [{ ok: okRun, label: "the re-run gives the honest number", why: "as pitched: " + c.show(r0) + " → re-run: " + c.show(r, fix) },
          { ok: !!cause[1], label: "the diagnosis", why: cause[1] ? "yes" : "that's not what the re-run shows" }];
        var pass = rows.every(function (x) { return x.ok; });
        $("c" + c.id + "ch").innerHTML = rows.map(function (x) { return '<div class="check ' + (x.ok ? "pass" : "no") + '"><span class="ic">' + (x.ok ? "✓" : "✗") + "</span><div>" + x.label + '<div class="why">' + x.why + "</div></div></div>"; }).join("") +
          '<div class="callout ' + (pass ? "co-g" : "co-r") + '"><b>' + (pass ? "Diagnosed." : "Not yet.") + "</b> " + esc(c.why[fix]) + "</div>";
        store.cap[c.id] = store.cap[c.id] || pass; save(); grade(); touch("cap");
      };
    });
    grade();
  }

  /* ================= FIELD TEST ================= */
  function initFT() {
    var FT = RP.fieldTest();
    $("ftqs").innerHTML = FT.map(function (f, i) { return '<div class="fq"><div class="fqt"><b>' + (i + 1) + ".</b> " + f.q + ' <span class="muted">(' + f.hint + ')</span></div><div class="row"><input type="number" id="ft' + i + '" step="any" value="' + (store.ft[i] != null ? esc(store.ft[i]) : "") + '" aria-label="Answer ' + (i + 1) + '"><span class="res" id="ftr' + i + '"></span></div></div>'; }).join("");
    $("ftgo").onclick = function () {
      var score = 0;
      FT.forEach(function (f, i) { var raw = $("ft" + i).value, v = parseFloat(raw), ok = raw !== "" && !isNaN(v) && Math.abs(v - f.ans) <= f.tol + 1e-9; store.ft[i] = raw; if (ok) score++; $("ftr" + i).innerHTML = ok ? '<span class="ok">✓</span>' : '<span class="bad">✗</span>'; });
      save();
      $("ftscore").innerHTML = "<b>" + score + " / " + FT.length + "</b>" + (score === FT.length ? " · you can read a robotics deck." : "");
      if (score >= 8 && !store.said.ft) { store.said.ft = true; save(); buildNav(); markNav(); }
    };
    $("reset").onclick = function () { try { localStorage.removeItem(KEY); } catch (e) {} history.replaceState(null, "", location.pathname); location.reload(); };
  }

  /* ---------------- wiring ---------------- */
  var RENDER = { s0: renderS0, s1: renderS1, s2: renderS2, s3: renderS3, s4: renderS4, s5: renderS5, s6: renderS6 };
  function refresh() { renderChanged(); var id = current(); if (RENDER[id]) { try { RENDER[id](); } catch (e) { if (window.console) console.warn(e); } } }
  function wire() {
    qa(".sl[data-k]").forEach(function (el) { buildSlider(el, el.dataset.k); });
    buildBooks();
    $("s2m").addEventListener("input", function () { var m = posToMtbi(+this.value); setBook("lambda", Math.round(6000 / m) / 100); touch("s2"); });
    syncMtbi(); buildModeSeg();
    $("s3young").onclick = function () { setBook("lambda", 6); touch("s3"); };
    $("s3back").onclick = function () { setBook("lambda", RP.DEFAULTS.lambda); touch("s3"); };
    $("s4learn").addEventListener("change", function () { learnOn = this.checked; refresh(); touch("s4"); });
    $("s5R").addEventListener("input", function () { F.R = +this.value; refresh(); touch("s5"); });
    $("s5c").addEventListener("input", function () { F.c = +this.value; refresh(); touch("s5"); });
    $("s5t").addEventListener("input", function () { F.target = +this.value; refresh(); touch("s5"); });
    $("s5best").onclick = function () { F.c = RP.bestOperators(S, F.R).c; refresh(); touch("s5"); };
    ["d1", "d2", "d3", "d4"].forEach(function (id, i) { $(id).addEventListener("input", function () { D[["mtbi", "hours", "ratio", "aut"][i]] = +this.value; renderDiligence(); touch("s6"); }); });
    $("dcopy").onclick = function () {
      var done = function () { $("dst").textContent = "copied"; };
      try { navigator.clipboard.writeText(dText).then(done, function () { $("dst").textContent = "select the list and copy it"; }); } catch (e) { $("dst").textContent = "select the list and copy it"; }
    };
    // touching a step's sliders counts as play; s0 and s1 sliders already call touch via buildSlider
  }
  function renderArt() { qa(".scene[data-art]").forEach(function (el) { var svg = ART[el.dataset.art]; if (svg && !el.firstChild) el.innerHTML = svg; }); }
  function buildNext() {
    sections.forEach(function (s, i) {
      var n = sections[i + 1]; if (!n) return;
      var row = document.createElement("div"); row.className = "nextrow";
      var b = document.createElement("button"); b.type = "button"; b.className = "act"; b.textContent = "Next: " + n.dataset.n + " · " + n.dataset.title + " →";
      b.onclick = function () { show(n.id); };
      row.appendChild(b); s.appendChild(row);
    });
  }
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
  renderArt();
  qa(".kmap .k[data-i]").forEach(function (el) { el.innerHTML = IC[el.dataset.i] || ""; });
  qa(".mast .mi").forEach(function (el) { el.innerHTML = IC.envelope || ""; });
  buildNav(); buildNext(); wire();
  initCap(); initFT();
  qa(".g").forEach(bindTip); initPredicts();
  sections.forEach(function (s) { checkSay(s.id); });
  function hashId() { var m = /^#\/?(s[0-6]|cap|ft)$/.exec(location.hash || ""); return m ? m[1] : null; }
  window.addEventListener("hashchange", function () { var id = hashId(); if (id && !$(id).classList.contains("on")) show(id); });
  show(hashId() || "s0");
  window.addEventListener("load", function () { setTimeout(function () { window.scrollTo(0, 0); refresh(); }, 0); });
  var rt = null; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(refresh, 80); });
  window.RPApp = { show: show, store: function () { return store; }, books: function () { return S; }, fleet: F };
})();
