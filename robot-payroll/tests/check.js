/* Robot Payroll — checks. `node tests/check.js` verifies the arithmetic against hand-computed cases, checks the
   model's directions, holds every number quoted on the page to the model, and prints what ACCEPTANCE.md lists.
   No dependencies. Exits non-zero if a check fails. */
"use strict";
var fs = require("fs"), path = require("path");
var RP = require("../js/core.js");
var fails = 0, t0 = Date.now();
function ok(cond, what) { if (!cond) { fails++; console.log("  ✗ " + what); } else console.log("  ✓ " + what); }
function near(a, b, tol) { return Math.abs(a - b) <= (tol == null ? 1e-9 : tol); }
function f(n, d) { return Number(n).toFixed(d == null ? 2 : d); }
function head(s) { console.log("\n" + s); }
var P = RP.books();

head("Money (hand-computed cases)");
ok(near(RP.crf(0.10, 5), 0.10 / (1 - Math.pow(1.1, -5))) && near(RP.crf(0.10, 5), 0.2637974808, 1e-9), "capital recovery factor at 10%, 5 years = 0.263797");
ok(near(RP.crf(0, 5), 0.2), "at 0% it is straight-line: 1/5");
ok(near(RP.npv(0.10, [-100, 60, 60]), -100 + 60 / 1.1 + 60 / 1.21), "NPV of −100, 60, 60 at 10% = " + f(RP.npv(0.10, [-100, 60, 60]), 4));
var x = (-60 + Math.sqrt(3600 + 24000)) / 120;   // 60x² + 60x − 100 = 0, x = 1/(1 + r)
ok(near(RP.irr([-100, 60, 60]), 1 / x - 1, 1e-9), "IRR of −100, 60, 60 = " + f((1 / x - 1) * 100, 4) + "% (quadratic, by hand)");
ok(near(RP.irr([-100, 110]), 0.10, 1e-9), "IRR of −100, 110 = 10%");
ok(near(RP.irr([-1000, 0, 0, 0, 1464.1]), 0.10, 1e-9), "IRR of −1000, 0, 0, 0, 1464.1 = 10%");
ok(RP.irr([100, 50]) === null, "IRR is undefined when no cash goes out");
ok(near(RP.payback([-100, 60, 60]), 1 + 40 / 60), "payback of −100, 60, 60 = 1.667 years");
ok(RP.payback([-100, 10, 10]) === null, "payback that never comes is reported as never");
ok(near(RP.npv(RP.irr([-100, 30, 40, 50]), [-100, 30, 40, 50]), 0, 1e-7), "NPV at the IRR is zero");

head("Queueing (known values)");
ok(near(RP.erlangC(1, 0.5), 0.5), "Erlang C, one server: P(wait) = ρ (0.5 at A = 0.5)");
ok(near(RP.erlangC(2, 1), 1 / 3), "Erlang C, c = 2, A = 1: 1/3");
ok(near(RP.erlangC(3, 2), 4 / 9), "Erlang C, c = 3, A = 2: 4/9 (by hand: 4 ÷ (1 + 2 + 2 + 4))");
ok(near(RP.erlangB(10, 5), 0.018385, 5e-6), "Erlang B, 10 lines, 5 erlangs: " + f(RP.erlangB(10, 5), 6) + " (tables: 0.0184)");
(function () {
  function fact(n) { var s = 1; for (var i = 2; i <= n; i++) s *= i; return s; }
  function brute(c, A) { var s = 0; for (var k = 0; k < c; k++) s += Math.pow(A, k) / fact(k); var t = Math.pow(A, c) / fact(c) * c / (c - A); return t / (s + t); }
  var worst = 0;
  for (var c = 1; c <= 15; c++) for (var A = 0.1; A < c; A += 0.37) worst = Math.max(worst, Math.abs(RP.erlangC(c, A) - brute(c, A)));
  ok(worst < 1e-10, "Erlang C by recursion = the textbook factorial formula on 15 × many cases (worst gap " + worst.toExponential(1) + ")");
})();
ok(near(RP.mmc(1, 2, 1).Wq, 0.5), "M/M/1, λ = 1, μ = 2: Wq = ρ/(μ − λ) = 0.5 h");
ok(near(RP.mmc(2, 2, 2).Wq, 1 / 6), "M/M/2, λ = 2, μ = 2: Wq = (1/3)/(4 − 2) = 1/6 h");
ok(!RP.mmc(5, 2, 2).stable, "M/M/c with ρ ≥ 1 is flagged unstable");
ok(near(RP.machineRepair(2, 1, 1, 1).Wq, 0.5), "finite population, 2 robots, 1 operator, λ = μ = 1: Wq = 0.5 (by hand: Lq 2/5 ÷ arrivals 4/5)");
ok(near(RP.machineRepair(1, 1, 3, 2).Wq, 0), "one robot never queues");
(function () {
  var big = RP.clone(P, { uptime: 1 }), R = 400, c = 40, q = RP.fleetQueue(big, R, c), m = RP.machineRepair(R, c, big.lambda, 60 / big.handleMin);
  ok(Math.abs(q.WqMin / 60 - m.Wq) < 0.5 * m.Wq + 1e-4, "big fleet (400 robots, 40 operators): Erlang C fixed point and the exact model agree within a factor of 1.5 (" + f(q.WqMin * 60, 1) + " s vs " + f(m.Wq * 3600, 1) + " s)");
})();

head("Counting (known values)");
var ci0 = RP.poissonCI(0), ci5 = RP.poissonCI(5);
ok(near(ci0[1], -Math.log(0.025), 1e-6) && ci0[0] === 0, "Poisson 95% interval for 0 events: [0, 3.689]");
ok(near(ci5[0], 1.6235, 1e-3) && near(ci5[1], 11.6683, 1e-3), "Poisson 95% interval for 5 events: [" + f(ci5[0], 4) + ", " + f(ci5[1], 4) + "] (tables: 1.6235, 11.6683)");
ok(near(RP.binomAtLeast(20, 20, 0.95), Math.pow(0.95, 20)), "all 20 of 20 up at 95% = 0.95^20 = " + f(Math.pow(0.95, 20), 4));
ok(near(RP.binomAtLeast(21, 20, 0.95), Math.pow(0.95, 21) + 21 * 0.05 * Math.pow(0.95, 20)), "at least 20 of 21 up, by hand");

head("The payslips at the books' defaults, by hand");
(function () {
  var hourly = 20.32 * 1.426, rw = 1 / 60 * hourly, hc = (hourly + 300 * 0.005 * rw) / (300 * 0.995);
  ok(near(RP.human(P).costPerPick, hc), "picker: (" + f(hourly) + " + 1.5 misses × " + f(rw, 4) + ") ÷ 298.5 = " + f(hc * 100, 3) + "¢");
  var Hs = 2 * 8 * 250, k = 0.1 / (1 - Math.pow(1.1, -5)), run = 1 / (1 + 2 * 2 / 60), att = 0.95 * run * 360, good = att * 0.97;
  var cost = 200000 * k / Hs + 0.08 * 150000 / Hs + 6000 / Hs + 1 * 0.0813 + 25 * 1.426 / (0.75 / (2 * 2 / 60)) + att * 0.03 * rw;
  ok(near(RP.robot(P).costPerPick, cost / good), "robot: $" + f(cost) + " an hour ÷ " + f(good, 1) + " good picks = " + f(cost / good * 100, 3) + "¢");
  var a = RP.annual(P), d = RP.deal(P);
  ok(near(d.flows[1], 20 * a.saving) && near(d.flows[0], -20 * 200000), "fleet cash flows: −$4.0M, then 20 × the robot-year saving");
  ok(near(d.npv, -4e6 + 20 * a.saving * (1 - Math.pow(1.1, -5)) / 0.1, 1e-3), "fleet NPV = −4.0M + saving × annuity factor 3.7908");
})();

head("Directions (monotonicity)");
(function () {
  function dec(arr) { for (var i = 1; i < arr.length; i++) if (!(arr[i] < arr[i - 1] + 1e-12)) return false; return true; }
  function inc(arr) { for (var i = 1; i < arr.length; i++) if (!(arr[i] > arr[i - 1] - 1e-12)) return false; return true; }
  var lams = [30, 10, 6, 3, 2, 1, 0.5, 0.2, 0.05, 0.01];
  ok(dec(lams.map(function (l) { return RP.costAtLambda(P, l); })), "cost per pick falls as MTBI rises (λ 30 → 0.01 an hour)");
  ok(dec(lams.map(function (l) { return RP.costAtLambda(RP.clone(P, { opMode: "fixed" }), l); })), "… also with a fixed operator ratio");
  ok(dec([1, 2, 3].map(function (s) { return RP.robot(RP.clone(P, { shifts: s })).costPerPick; })), "more shifts, cheaper picks");
  ok(dec([0.8, 0.9, 0.95, 0.99].map(function (u) { return RP.robot(RP.clone(P, { uptime: u })).costPerPick; })), "more uptime, cheaper picks");
  ok(dec([0.9, 0.95, 0.97, 0.99].map(function (u) { return RP.robot(RP.clone(P, { success: u })).costPerPick; })), "higher success, cheaper picks");
  ok(inc([50000, 100000, 150000, 250000].map(function (c) { return RP.robot(RP.clone(P, { capex: c })).costPerPick; })), "dearer robot, dearer picks");
  ok(inc([12, 16, 20, 28].map(function (w) { return RP.deal(RP.clone(P, { wage: w })).npv; })), "higher wages, higher NPV");
  ok(inc([0.5, 1, 2, 4, 6].map(function (A) { return RP.erlangC(8, A); })), "Erlang C rises with load");
  ok(dec([3, 4, 6, 9].map(function (c) { return RP.erlangC(c, 2.5); })), "Erlang C falls with more servers");
  ok(dec([1, 2, 3, 4, 5].map(function (c) { return RP.fleetQueue(P, 20, c).WqMin; })), "more operators, shorter waits");
  var lt = []; for (var m = 0; m <= 120; m += 6) lt.push(RP.lambdaAtYear(P, m / 12));
  ok(lt.every(function (v, i) { return i === 0 || v <= lt[i - 1] + 1e-12; }) && lt.every(function (v) { return v >= P.lambdaFloor - 1e-12; }), "the learning curve never rises and never goes below its floor");
  ok(inc([100000, 150000, 200000].map(function (c) { return RP.breakEvenWage(RP.clone(P, { capex: c })); })), "dearer robot, higher break-even wage");
})();

head("Break-evens");
(function () {
  var w = RP.breakEvenWage(P), wn = RP.breakEvenWageNPV(P);
  ok(Math.abs(RP.compare(RP.clone(P, { wage: w })).saving) < 1e-9, "at the break-even wage $" + f(w) + " the robot and the picker cost the same per pick");
  ok(Math.abs(RP.deal(RP.clone(P, { wage: wn })).npv) < 1e-3, "at $" + f(wn) + " the fleet's NPV is zero");
  ok(near(w, wn, 1e-6), "the two agree (the capital line is the annuity that repays the robot)");
})();

head("The review board's decks");
["A", "B", "C"].forEach(function (id) {
  var d = RP.DECKS[id], claim = RP.deckRun(id), honest = RP.deckRun(id, d.right);
  console.log("  deck " + id + " (" + d.name + "): as pitched " + f(claim.value, 2) + " → honest " + f(honest.value, 2));
  Object.keys(d.fixes).forEach(function (k) { if (k === d.right) return; var r = RP.deckRun(id, k); ok(Math.abs(r.value - honest.value) > 0.05 * Math.abs(honest.value), "  deck " + id + ": the wrong fix “" + k + "” does not reach the honest number (" + f(r.value, 2) + ")"); });
});
ok(Math.round(RP.deckRun("A").value) === 9, "deck A as pitched: payback 9 months");

/* ---------- every number quoted on the page ---------- */
head("Every number quoted on the page");
var Q = RP.quotes(), html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8"), app = fs.readFileSync(path.join(__dirname, "../js/app.js"), "utf8");
(function () {
  var re = /data-q="(\w+)">([^<]*)</g, m, n = 0, bad = [];
  while ((m = re.exec(html))) { n++; if (Q[m[1]] !== m[2]) bad.push(m[1] + ": page says " + m[2] + ", model says " + Q[m[1]]); }
  bad.forEach(function (b) { console.log("    " + b); });
  ok(n > 50 && bad.length === 0, n + " model numbers quoted in index.html all match the model");
})();
// numbers written into prose or into the review board's text, each checked against the model
var H = RP.human(P), R0 = RP.robot(P), A0 = RP.annual(P), sp = RP.spares(20, P.uptime, 0.95);
var PROSE = [
  [html, "$13.79 on $32.36", near(13.79 / 32.36, P.burden, 0.0005), "ECEC benefits ÷ wages = the burden default"],
  [html, "300 picks an hour and 99.5%", P.humanRate === 300 && P.humanSuccess === 0.995, "human defaults"],
  [html, "over 2,000 hours instead of 4,000", RP.schedHours(RP.clone(P, { shifts: 1 })) === 2000 && RP.schedHours(P) === 4000, "scheduled hours"],
  [html, "1 kW average draw and EIA's 2024 industrial price of 8.13¢/kWh", P.kW === 1 && P.power === 0.0813, "power defaults"],
  [html, "2 × 2 = 4 operator-minutes per running hour, and 45 busy minutes an hour ÷ 4 = 11.25", near(R0.ratio, 11.25), "workload ratio"],
  [html, "attempts 360 picks a running hour, so every point of autonomy below 100% is 3.6 calls an hour", near(3600 / P.cycle, 360) && near(RP.lambdaFromAutonomy(P, 0.99), 3.6), "autonomy to calls"],
  [html, "200,000 hours becomes 600,000 in the first year", P.hours0 + P.vendorHoursYr === 600000, "learning-curve hours"],
  [html, "a quarter of the cash up front", near(RP.deal(P, { mode: "raas" }).flows[0] / RP.deal(P).flows[0], 0.25), "RaaS outlay ÷ buy outlay"],
  [html, "only 20% under the national mean", Math.round((1 - RP.breakEvenWage(P) / P.wage) * 100) === 20, "break-even wage vs mean"],
  [html, "each operator busy about 60% of the time", Math.abs(RP.fleetQueue(P, 20, 2).rho - 0.6) < 0.03, "operator occupancy, 20 robots, 2 operators"],
  [html, "all up only about a third of the time", Math.abs(sp.prob0 - 1 / 3) < 0.04, "P(all 20 up) ≈ 1/3"],
  [html, "NPV more than triples", RP.tornado(P).filter(function (t) { return t.key === "shifts"; })[0].npvHi > 3 * RP.deal(P).npv, "three shifts' NPV > 3 × the books'"],
  [html, "turn the NPV negative", RP.deal(RP.clone(P, { life: 3 })).npv < 0, "3-year life"],
  [html, "One shift and the deal loses money", RP.deal(RP.clone(P, { shifts: 1 })).npv < 0, "one-shift NPV"],
  [html, "About a third more", Math.abs(RP.deal(P, { learning: true }).npv / RP.deal(P).npv - 1.35) < 0.08, "learning adds about a third"],
  [html, "about as much as the customer keeps", Math.abs(RP.valueSplit(P).parts.makerProfit / RP.valueSplit(P).parts.customer - 1) < 0.1, "maker profit ≈ customer saving"],
  [html, "Twenty robots share two operators", true, ""],
  [app, "8 interventions per robot-hour, 2.5 minutes each", RP.DECKS.A.sheet.lambda === 8 && RP.DECKS.A.sheet.handleMin === 2.5, "deck A sheet"],
  [app, "one operator keeps up with 2.25 robots: the honest payback is about 50 months", Q.aRatio === "2.25" && Q.aHonest === "50", "deck A honest"],
  [app, "6.6¢ a pick", Q.bClaim === "6.62¢", "deck B claim"],
  [app, "4.5 interventions an hour (that's what 1% of 450 is)", near(RP.DECKS.B.sheet.lambda, 0.01 * 3600 / RP.DECKS.B.sheet.cycle), "deck B calls"],
  [app, "50 robots need 7.5 operators' worth of time", near(50 * 4.5 * 2 / 60, 7.5), "deck B load"],
  [app, "5 robots per operator at 75% busy", Q.bRatio === "5", "deck B honest ratio"],
  [app, "the operator is still 750% busy", Q.bOcc === "750%", "deck B occupancy"],
  [app, "costs $11.18 an hour all-in", Q.cHour === "$11.18", "deck C hourly"],
  [app, "save 61%", Math.round((1 - RP.deckRun("C").value / 100) * 100) === 61, "deck C claimed saving"],
  [app, "makes 92 good picks with an hour of a picker who makes 298.5", Q.cGood === "92" && Q.hGood === "298.5", "deck C throughput"],
  [app, "the robot costs 23% more than the picker", Q.cHonest === "123%", "deck C honest"],
  [app, "Power is 8¢ an hour", Q.powerHour === "8¢", "power line"]
];
PROSE.forEach(function (p) { if (!p[3]) return; ok(p[0].indexOf(p[1]) >= 0 && p[2], "“" + p[1] + "” (" + p[3] + ")"); });

/* ---------- the printout ACCEPTANCE.md lists ---------- */
head("Step 0 · the human payslip");
console.log("  wage $" + f(P.wage) + " + benefits " + f(P.burden * 100, 1) + "% = $" + f(H.hourly) + " an hour worked; rework $" + f(H.rework) + "; " + f(H.good, 1) + " good picks; " + f(H.costPerPick * 100, 3) + "¢ a good pick");
head("Step 1 · the robot payslip (2 shifts, 4,000 h a year)");
Object.keys(R0.lines).forEach(function (k) { if (R0.lines[k]) console.log("  " + (k + "          ").slice(0, 10) + " $" + f(R0.lines[k], 3) + " an hour"); });
console.log("  total $" + f(R0.total, 3) + " · running " + f(R0.run * 100, 2) + "% of available time · " + f(R0.good, 2) + " good picks an hour · " + f(R0.costPerPick * 100, 3) + "¢ a good pick");
[1, 2, 3].forEach(function (s) { console.log("  " + s + " shift(s): " + f(RP.robot(RP.clone(P, { shifts: s })).costPerPick * 100, 3) + "¢"); });
head("Step 2 · autonomy");
[0.95, 0.98, 0.99, 0.995, 0.999, 0.9999].forEach(function (a) { var q = RP.robot(P, { lambda: RP.lambdaFromAutonomy(P, a) }); console.log("  " + f(a * 100, 2) + "% per attempt: " + f(q.lambda, 3) + " calls/h, " + f(q.ratio, 2) + " robots per operator, " + f(q.costPerPick * 100, 3) + "¢"); });
head("Step 3 · the toy learning curve");
[0, 1, 2, 3, 4, 5].forEach(function (y) { console.log("  year " + y + ": " + f(RP.doublings(P, y), 2) + " doublings, " + f(RP.lambdaAtYear(P, y), 3) + " calls/h, " + f(RP.costAtLambda(P, RP.lambdaAtYear(P, y)) * 100, 3) + "¢"); });
console.log("  starting at 6 calls an hour, the robot beats the picker from month " + RP.crossoverMonth(RP.clone(P, { lambda: 6 }), 120));
head("Step 4 · the fleet of 20");
["buy", "raas"].forEach(function (mode) { [false, true].forEach(function (L) { var d = RP.deal(P, { mode: mode, learning: L }); console.log("  " + mode + (L ? " + learning" : "") + ": flows " + d.flows.map(function (v) { return f(v / 1e6, 3); }).join(", ") + " $M · payback " + (d.payback == null ? "never" : f(d.payback * 12, 1) + " mo") + " · NPV $" + f(d.npv / 1e6, 3) + "M · IRR " + (d.irr == null ? "–" : f(d.irr * 100, 2) + "%")); }); });
console.log("  break-even wage $" + f(RP.breakEvenWage(P), 3) + " (per pick) · $" + f(RP.breakEvenWageNPV(P), 3) + " (NPV)");
console.log("  tornado (NPV $M, pessimistic → optimistic):");
RP.tornado(P).forEach(function (t) { console.log("    " + (t.key + "            ").slice(0, 12) + f(t.lo, 3) + " → " + f(t.hi, 3) + ": " + f(t.npvLo / 1e6, 2) + " → " + f(t.npvHi / 1e6, 2)); });
head("Step 5 · the fleet queue (20 robots)");
for (var c = 1; c <= 5; c++) { var q = RP.fleetQueue(P, 20, c), m = RP.machineRepair(20, c, P.lambda * P.uptime, 60 / P.handleMin); console.log("  " + c + " operator(s): load " + f(q.A, 3) + " erlangs, busy " + f(q.rho * 100, 1) + "%, P(wait) " + f(q.pWait * 100, 1) + "%, wait " + f(q.WqMin * 60, 1) + " s (exact finite-population " + f(m.Wq * 3600, 1) + " s), " + f(q.costPerPick * 100, 3) + "¢"); }
[10, 20, 50, 100].forEach(function (R) { var q = RP.fleetQueue(P, R, R / 10); console.log("  pooling, " + R + " robots / " + R / 10 + " operators: wait " + f(q.WqMin * 60, 1) + " s, " + f(q.costPerPick * 100, 3) + "¢"); });
console.log("  spares for 95%: " + sp.S + " (all 20 up without spares: " + f(sp.prob0 * 100, 1) + "%; with: " + f(sp.prob * 100, 1) + "%)");
head("Step 6 · one robot-year, split");
var V = RP.valueSplit(P); console.log("  payroll replaced $" + f(V.payroll, 0) + " (" + f(V.fte, 2) + " one-shift pickers)");
Object.keys(V.parts).forEach(function (k) { console.log("    " + (k + "                ").slice(0, 17) + "$" + f(V.parts[k], 0) + " (" + f(V.parts[k] / V.payroll * 100, 1) + "%)"); });
console.log("  price ceiling $" + f(V.priceCeiling, 0));
var dl = RP.diligence(P, { mtbiH: 8, hoursH: 120, ratio: 30, autonomyPct: 99.9 });
console.log("  diligence, the page's default claim (MTBI 8 h from 120 h, 1:30, 99.9%):"); dl.items.forEach(function (it) { console.log("    " + (it.ok ? "ok " : "!! ") + it.text); });
head("Field test answers (books' defaults)");
RP.fieldTest().forEach(function (q, i) { console.log("  " + (i + 1) + ". " + f(q.ans, 3) + " ± " + q.tol); });
head("Quoted numbers");
console.log("  " + Object.keys(Q).map(function (k) { return k + " " + Q[k]; }).join(" · "));

console.log("\n" + (fails ? fails + " check(s) FAILED" : "all checks passed") + " · " + f((Date.now() - t0) / 1000, 1) + " s");
process.exit(fails ? 1 : 0);
