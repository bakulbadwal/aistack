/* Robot Payroll — the model. Pure functions, no DOM. Every number the page shows comes from here.
   UMD: window.RP in the browser, module.exports under node (tests/check.js).

   The Depot pays a human picker per hour worked and a robot per scheduled hour, and both are judged on the
   same thing: what one GOOD pick costs. Units: dollars, hours, picks. Interventions are counted per hour the
   robot is actually running; handling times are in minutes. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.RP = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ---------------- the books: every assumption, with where it comes from ----------------
     src: "bls" (BLS OEWS), "ecec" (BLS Employer Costs for Employee Compensation), "eia" (EIA electricity
     prices), "illus" (an illustrative assumption: adjust it), "toy" (a teaching model, not a measurement). */
  var DEFAULTS = {
    wage: 20.32, burden: 0.426, humanRate: 300, humanSuccess: 0.995, reworkMin: 1.0,
    shifts: 2, shiftHours: 8, days: 250,
    capex: 150000, integration: 50000, life: 5, rate: 0.10, maintPct: 0.08, software: 6000, kW: 1.0, power: 0.0813,
    uptime: 0.95, cycle: 10, success: 0.97,
    lambda: 2, handleMin: 2, opMode: "workload", opRatio: 10, opWage: 25, occTarget: 0.75, opCap: 50,
    fleet: 20, raasFee: 5000,
    learnDrop: 0.20, hours0: 200000, vendorHoursYr: 400000, lambdaFloor: 0.1,
    cogsPct: 0.60, svcMargin: 0.50, intMargin: 0.25
  };
  var META = {
    wage: { label: "Picker's wage", unit: "$/h", min: 10, max: 45, step: 0.01, src: "bls", note: "BLS OEWS May 2025, SOC 53-7062 (hand laborers and material movers), national mean" },
    burden: { label: "Benefits on top of wages", unit: "×wage", min: 0, max: 0.8, step: 0.001, src: "ecec", note: "BLS ECEC Dec 2025, private industry: benefits $13.79 on wages $32.36 per hour worked" },
    humanRate: { label: "Human picks per hour", unit: "picks/h", min: 60, max: 600, step: 10, src: "illus", note: "a goods-to-person station; site-specific" },
    humanSuccess: { label: "Human picks right first time", unit: "share", min: 0.95, max: 1, step: 0.001, src: "illus" },
    reworkMin: { label: "Rework per failed pick", unit: "min of a picker", min: 0, max: 5, step: 0.1, src: "illus" },
    shifts: { label: "Shifts a day", unit: "shifts", min: 1, max: 3, step: 1, src: "illus" },
    shiftHours: { label: "Hours a shift", unit: "h", min: 6, max: 12, step: 1, src: "illus" },
    days: { label: "Operating days a year", unit: "days", min: 200, max: 365, step: 1, src: "illus" },
    capex: { label: "Robot price (arm, base, gripper, vision)", unit: "$", min: 20000, max: 400000, step: 1000, src: "illus", note: "listed anchors: $24,950 (Stretch 3) to $74,500 (Spot, 2020); a warehouse picking cell costs more" },
    integration: { label: "Integration, one-off", unit: "$/robot", min: 0, max: 200000, step: 1000, src: "illus" },
    life: { label: "Useful life", unit: "years", min: 2, max: 10, step: 1, src: "illus" },
    rate: { label: "Discount rate (cost of money)", unit: "per year", min: 0, max: 0.25, step: 0.005, src: "illus" },
    maintPct: { label: "Maintenance a year", unit: "×price", min: 0, max: 0.25, step: 0.005, src: "illus" },
    software: { label: "Software and support a year", unit: "$/robot", min: 0, max: 40000, step: 500, src: "illus" },
    kW: { label: "Average power draw", unit: "kW", min: 0.1, max: 5, step: 0.1, src: "illus" },
    power: { label: "Electricity price", unit: "$/kWh", min: 0.03, max: 0.40, step: 0.0001, src: "eia", note: "EIA, US average industrial price, 2024: 8.13¢/kWh" },
    uptime: { label: "Uptime (available share of scheduled hours)", unit: "share", min: 0.5, max: 1, step: 0.005, src: "illus" },
    cycle: { label: "Cycle time per pick attempt", unit: "s", min: 3, max: 40, step: 0.5, src: "illus" },
    success: { label: "Robot picks right first time", unit: "share", min: 0.7, max: 1, step: 0.001, src: "illus" },
    lambda: { label: "Interventions per running hour", unit: "/h", min: 0.01, max: 30, step: 0.01, src: "illus" },
    handleMin: { label: "Operator time per intervention", unit: "min", min: 0.25, max: 15, step: 0.25, src: "illus" },
    opMode: { label: "Operator ratio", unit: "", src: "illus" },
    opRatio: { label: "Robots per operator (if fixed)", unit: "robots", min: 1, max: 100, step: 1, src: "illus" },
    opWage: { label: "Remote operator's wage", unit: "$/h", min: 10, max: 60, step: 0.25, src: "illus" },
    occTarget: { label: "How busy an operator may be", unit: "share", min: 0.3, max: 0.95, step: 0.05, src: "illus" },
    opCap: { label: "Most robots one person can watch", unit: "robots", min: 5, max: 200, step: 1, src: "illus" },
    fleet: { label: "Robots in the fleet", unit: "robots", min: 1, max: 200, step: 1, src: "illus" },
    raasFee: { label: "RaaS fee", unit: "$/robot-month", min: 500, max: 15000, step: 100, src: "illus" },
    learnDrop: { label: "Interventions fall per doubling of fleet hours", unit: "share", min: 0, max: 0.5, step: 0.01, src: "toy", note: "Wright's 80% learning curve (1936) as an analogy" },
    hours0: { label: "Vendor's fleet hours so far", unit: "h", min: 10000, max: 5000000, step: 10000, src: "toy" },
    vendorHoursYr: { label: "Vendor's fleet hours a year", unit: "h/yr", min: 0, max: 20000000, step: 10000, src: "toy" },
    lambdaFloor: { label: "Floor on interventions", unit: "/h", min: 0, max: 2, step: 0.01, src: "toy" },
    cogsPct: { label: "Robot maker's hardware cost", unit: "×price", min: 0.2, max: 1, step: 0.01, src: "illus" },
    svcMargin: { label: "Margin on maintenance and software", unit: "share", min: 0, max: 0.9, step: 0.01, src: "illus" },
    intMargin: { label: "Integrator's margin", unit: "share", min: 0, max: 0.6, step: 0.01, src: "illus" }
  };
  function books(over) { var p = {}, k; for (k in DEFAULTS) p[k] = DEFAULTS[k]; if (over) for (k in over) p[k] = over[k]; return p; }
  function clone(p, over) { return books(Object.assign({}, p, over || {})); }

  /* ---------------- money ---------------- */
  // Capital recovery factor: the level yearly payment that repays 1 over n years at rate r. At r = 0 it is 1/n
  // (straight-line depreciation); above 0 it also pays for the money tied up.
  function crf(r, n) { return r === 0 ? 1 / n : r / (1 - Math.pow(1 + r, -n)); }
  function npv(rate, flows) { var s = 0; for (var t = 0; t < flows.length; t++) s += flows[t] / Math.pow(1 + rate, t); return s; }
  // Internal rate of return by bisection; null when the flows never change sign in [−99%, 1000%].
  function irr(flows) {
    var lo = -0.99, hi = 10, flo = npv(lo, flows), fhi = npv(hi, flows);
    if (!(flo * fhi < 0)) return null;
    for (var i = 0; i < 200; i++) { var mid = (lo + hi) / 2, fm = npv(mid, flows); if (fm * flo > 0) { lo = mid; flo = fm; } else hi = mid; }
    return (lo + hi) / 2;
  }
  // Simple payback in years: when the undiscounted running total first reaches zero, flows spread evenly within a year.
  function payback(flows) {
    var cum = flows[0];
    if (cum >= 0) return 0;
    for (var t = 1; t < flows.length; t++) {
      if (cum + flows[t] >= 0) return t - 1 + (-cum) / flows[t];
      cum += flows[t];
    }
    return null;
  }

  /* ---------------- one human, one robot ---------------- */
  function hourly(p) { return p.wage * (1 + p.burden); }                 // a picker's cost per hour worked
  function reworkCost(p) { return p.reworkMin / 60 * hourly(p); }         // one failed pick put right by a picker
  function schedHours(p) { return p.shifts * p.shiftHours * p.days; }     // robot hours paid for a year
  function human(p) {
    var h = hourly(p), good = p.humanRate * p.humanSuccess, fails = p.humanRate * (1 - p.humanSuccess), rw = fails * reworkCost(p);
    return { hourly: h, good: good, fails: fails, rework: rw, total: h + rw, costPerPick: (h + rw) / good };
  }
  // Robots per remote operator. "workload": as many as keep one operator busy occTarget of the time
  // (each robot asks for lambda × handleMin/60 of an operator-hour per running hour), capped at opCap.
  function opsRatio(p, lam) {
    lam = lam == null ? p.lambda : lam;
    if (p.opMode === "fixed") return p.opRatio;
    if (p.opMode === "none") return Infinity;          // nobody budgeted for (the pitch-deck mistake)
    var load = lam * p.handleMin / 60;
    return load <= 0 ? p.opCap : Math.min(p.opCap, p.occTarget / load);
  }
  function occupancy(p, lam, ratio) { lam = lam == null ? p.lambda : lam; ratio = ratio == null ? opsRatio(p, lam) : ratio; return ratio * lam * p.handleMin / 60; }
  // The robot's payslip, per scheduled hour. o: { lambda, waitMin (queueing delay per intervention), ratio, raas }.
  function robot(p, o) {
    o = o || {};
    var Hs = schedHours(p), lam = o.lambda == null ? p.lambda : o.lambda, ratio = o.ratio == null ? opsRatio(p, lam) : o.ratio, wait = o.waitMin || 0;
    var run = 1 / (1 + lam * (p.handleMin + wait) / 60);     // share of available time actually picking
    var perRun = 3600 / p.cycle, attempts = p.uptime * run * perRun, good = attempts * p.success, fails = attempts * (1 - p.success);
    var k = crf(p.rate, p.life), lines;
    if (o.raas) lines = { capital: p.integration * k / Hs, raas: p.raasFee * 12 / Hs, maint: 0, software: 0 };
    else lines = { capital: (p.capex + p.integration) * k / Hs, raas: 0, maint: p.maintPct * p.capex / Hs, software: p.software / Hs };
    lines.power = p.kW * p.power;
    lines.operators = p.opWage * (1 + p.burden) / ratio;
    lines.rework = fails * reworkCost(p);
    var total = lines.capital + lines.raas + lines.maint + lines.software + lines.power + lines.operators + lines.rework;
    return { lines: lines, total: total, run: run, attempts: attempts, good: good, fails: fails, ratio: ratio, lambda: lam,
      costPerPick: total / good, autonomy: 1 - lam / perRun, mtbiMin: 60 / lam, schedHours: Hs, occ: occupancy(p, lam, ratio), opex: total - lines.capital };
  }
  function compare(p, o) {
    var h = human(p), r = robot(p, o);
    return { h: h, r: r, saving: h.costPerPick - r.costPerPick, savingPct: 1 - r.costPerPick / h.costPerPick };
  }
  // Cost per pick of the robot as autonomy changes (operator ratio follows p.opMode).
  function costAtLambda(p, lam) { return robot(p, { lambda: lam }).costPerPick; }
  function lambdaFromAutonomy(p, a) { return (1 - a) * 3600 / p.cycle; }

  /* ---------------- the learning curve (a transparent toy) ----------------
     Interventions per hour fall by learnDrop each time the vendor's cumulative fleet hours double,
     starting from lambda at hours0 and never below lambdaFloor: lambda(H) = lambda0 · (H/H0)^log2(1 − drop). */
  function lambdaAtHours(p, H) {
    if (H <= p.hours0 || p.learnDrop <= 0) return p.lambda;
    return Math.max(p.lambdaFloor, p.lambda * Math.pow(H / p.hours0, Math.log(1 - p.learnDrop) / Math.LN2));
  }
  function lambdaAtYear(p, t) { return lambdaAtHours(p, p.hours0 + p.vendorHoursYr * t); }
  function doublings(p, t) { return Math.log((p.hours0 + p.vendorHoursYr * t) / p.hours0) / Math.LN2; }
  // First month at which the robot's cost per pick is at or below the human's, scanning up to `months`.
  function crossoverMonth(p, months) {
    var hc = human(p).costPerPick;
    for (var m = 0; m <= (months || 120); m++) if (costAtLambda(p, lambdaAtYear(p, m / 12)) <= hc) return m;
    return null;
  }

  /* ---------------- a fleet deployment ---------------- */
  // One robot's year: the human labour it replaces (the same good picks, at the human's cost per pick) minus what
  // it costs to run, before capital. o: { lambda, raas }.
  function annual(p, o) {
    o = o || {};
    var h = human(p), r = robot(p, o), Hs = r.schedHours, picks = r.good * Hs;
    var humanCost = h.costPerPick * picks, opex = r.opex * Hs;
    return { picks: picks, humanCost: humanCost, opex: opex, saving: humanCost - opex, fte: picks / (h.good * p.shiftHours * p.days) };
  }
  // Yearly cash flows for the fleet: year 0 the outlay, then savings. o: { mode: "buy" | "raas", learning, years }.
  function cashflows(p, o) {
    o = o || {};
    var N = o.years || p.life, R = p.fleet, raas = o.mode === "raas", flows = [-R * (raas ? p.integration : p.capex + p.integration)];
    for (var y = 1; y <= N; y++) {
      var lam = o.learning ? lambdaAtYear(p, y - 0.5) : p.lambda;
      flows.push(R * annual(p, { lambda: lam, raas: raas }).saving);
    }
    return flows;
  }
  function deal(p, o) {
    var f = cashflows(p, o);
    return { flows: f, npv: npv(p.rate, f), irr: irr(f), payback: payback(f) };
  }
  // Find x in [lo, hi] where fn(x) crosses zero (fn monotone); null if it doesn't.
  function solve(fn, lo, hi) {
    var flo = fn(lo), fhi = fn(hi);
    if (flo === 0) return lo; if (fhi === 0) return hi;
    if (!(flo * fhi < 0)) return null;
    for (var i = 0; i < 200; i++) { var m = (lo + hi) / 2, fm = fn(m); if (fm * flo > 0) { lo = m; flo = fm; } else hi = m; }
    return (lo + hi) / 2;
  }
  // The picker's wage at which robot and human cost the same per pick (rework is valued at this wage too).
  function breakEvenWage(p) { return solve(function (w) { return compare(clone(p, { wage: w })).saving; }, 0, 300); }
  function breakEvenWageNPV(p, o) { return solve(function (w) { return deal(clone(p, { wage: w }), o).npv; }, 0, 300); }
  // Tornado: NPV of the fleet (buy) with each assumption at its low and high value, the rest at the books.
  var TORNADO = [
    ["wage", 0.8, 1.2, "rel"], ["uptime", 0.90, 0.98, "abs"], ["cycle", 1.2, 0.8, "rel"], ["success", 0.94, 0.99, "abs"],
    ["lambda", 4, 1, "abs"], ["handleMin", 3, 1, "abs"], ["capex", 1.25, 0.75, "rel"], ["integration", 1.5, 0.5, "rel"],
    ["shifts", 1, 3, "abs"], ["life", 3, 7, "abs"], ["rate", 0.14, 0.06, "abs"], ["opWage", 1.2, 0.8, "rel"], ["maintPct", 0.12, 0.04, "abs"]
  ];
  function tornado(p, o) {
    var base = deal(p, o).npv;
    return TORNADO.map(function (t) {
      var lo = t[3] === "rel" ? p[t[0]] * t[1] : t[1], hi = t[3] === "rel" ? p[t[0]] * t[2] : t[2], pl = {}, ph = {};
      pl[t[0]] = lo; ph[t[0]] = hi;
      var a = deal(clone(p, pl), o).npv, b = deal(clone(p, ph), o).npv;
      return { key: t[0], lo: lo, hi: hi, npvLo: a, npvHi: b, swing: Math.abs(b - a), base: base };
    }).sort(function (x, y) { return y.swing - x.swing; });
  }

  /* ---------------- queueing: robots waiting for a busy operator ----------------
     Erlang C: the chance an arriving call waits in an M/M/c queue with offered load A = λ/μ erlangs on c servers.
     Computed from Erlang B by the stable recursion B(0) = 1, B(k) = A·B(k−1) / (k + A·B(k−1)). */
  function erlangB(c, A) { var B = 1; for (var k = 1; k <= c; k++) B = A * B / (k + A * B); return B; }
  function erlangC(c, A) { if (A >= c) return 1; var B = erlangB(c, A); return c * B / (c - A * (1 - B)); }
  // M/M/c: arrivals lam per hour, service rate mu per hour per server. Wq in hours.
  function mmc(lam, mu, c) {
    var A = lam / mu, rho = A / c;
    if (rho >= 1) return { A: A, rho: rho, pWait: 1, Wq: Infinity, Lq: Infinity, stable: false };
    var pw = erlangC(c, A), Wq = pw / (c * mu - lam);
    return { A: A, rho: rho, pWait: pw, Wq: Wq, Lq: lam * Wq, stable: true };
  }
  // A fleet of R robots sharing c operators. Each available robot calls at lambda per RUNNING hour, so the call
  // rate depends on how long robots sit waiting: Λ = R·U·λ·run, run = 1/(1 + λ(τ + Wq)). Solved as a fixed
  // point by bisection on Wq (more waiting → fewer calls → less waiting, so there is exactly one).
  function fleetQueue(p, R, c, lam) {
    lam = lam == null ? p.lambda : lam;
    var mu = 60 / p.handleMin;
    function arrivals(wqH) { return R * p.uptime * lam / (1 + lam * (p.handleMin / 60 + wqH)); }
    function f(wqH) { var q = mmc(arrivals(wqH), mu, c); return (q.stable ? q.Wq : 1e9) - wqH; }
    var lo = 0, hi = 1;
    while (f(hi) > 0 && hi < 1e6) hi *= 2;
    for (var i = 0; i < 200; i++) { var m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; }
    var wq = (lo + hi) / 2, L = arrivals(wq), q = mmc(L, mu, c);
    var r = robot(p, { lambda: lam, waitMin: wq * 60, ratio: R / c });
    return { R: R, c: c, arrivals: L, A: L / mu, rho: L / mu / c, pWait: q.pWait, WqMin: wq * 60, robot: r, costPerPick: r.costPerPick,
      idleShare: lam * wq / (1 + lam * (p.handleMin / 60 + wq)) };
  }
  // The exact finite-population model (the "machine-repair" queue): R robots, each running robot calls at lam,
  // c operators each finishing at mu. Birth–death chain on n = robots waiting or being helped. Wq in hours.
  function machineRepair(R, c, lam, mu) {
    var pr = [1], s = 1;
    for (var n = 1; n <= R; n++) { pr[n] = pr[n - 1] * (R - n + 1) * lam / (Math.min(n, c) * mu); s += pr[n]; }
    var Lq = 0, arr = 0, L = 0;
    for (n = 0; n <= R; n++) { var q = pr[n] / s; L += n * q; Lq += Math.max(0, n - c) * q; arr += (R - n) * lam * q; }
    return { L: L, Lq: Lq, arrivals: arr, Wq: Lq / arr };
  }
  // The fewest operators that make the fleet's cost per pick lowest (searching c = 1 … R).
  function bestOperators(p, R, lam) {
    var best = null;
    for (var c = 1; c <= R; c++) { var f = fleetQueue(p, R, c, lam); if (!best || f.costPerPick < best.costPerPick - 1e-12) best = f; }
    return best;
  }
  // Spares: the fewest extra robots S so that, with each robot up independently with probability U, at least R of
  // R + S are up with probability ≥ target. Binomial tail, in logs.
  function lnFact(n) { var s = 0; for (var i = 2; i <= n; i++) s += Math.log(i); return s; }
  function binomAtLeast(n, k, u) {
    var s = 0;
    for (var j = k; j <= n; j++) s += Math.exp(lnFact(n) - lnFact(j) - lnFact(n - j) + j * Math.log(u) + (n - j) * Math.log(1 - u));
    return Math.min(1, s);
  }
  function spares(R, U, target) { for (var S = 0; S <= R + 50; S++) if (binomAtLeast(R + S, R, U) >= target) return { S: S, prob: binomAtLeast(R + S, R, U), prob0: binomAtLeast(R, R, U) }; return null; }

  /* ---------------- evidence: how sure is an MTBI claim? ----------------
     Exact (Garwood) 95% interval for a Poisson count k seen in H hours, by bisection on the Poisson CDF. */
  function poissonCdf(k, mu) {   // P(X ≤ k)
    if (mu <= 0) return 1;
    var term = Math.exp(-mu), s = term;
    if (term === 0) { var lt = -mu, ls = -Infinity; for (var j = 0; j <= k; j++) { if (j) lt += Math.log(mu / j); ls = Math.max(ls, lt) + Math.log(1 + Math.exp(-Math.abs(ls - lt))); } return Math.min(1, Math.exp(ls)); }
    for (var i = 1; i <= k; i++) { term *= mu / i; s += term; }
    return Math.min(1, s);
  }
  function poissonCI(k, conf) {
    var a = (1 - (conf || 0.95)) / 2, hi = Math.max(10, 4 * k + 10);
    var upper = solve(function (m) { return poissonCdf(k, m) - a; }, 0, hi);
    var lower = k === 0 ? 0 : solve(function (m) { return (1 - poissonCdf(k - 1, m)) - a; }, 0, hi);
    return [lower, upper];
  }
  // A claimed MTBI (hours) backed by H robot-hours: the count k = H/MTBI, and the 95% range of the MTBI.
  function mtbiRange(mtbiH, H) {
    var k = Math.round(H / mtbiH), ci = poissonCI(k);
    return { k: k, lo: ci[1] > 0 ? H / ci[1] : Infinity, hi: ci[0] > 0 ? H / ci[0] : Infinity };
  }

  /* ---------------- who gets the saving (one robot-year, illustrative split) ---------------- */
  function valueSplit(p) {
    var a = annual(p), r = robot(p), Hs = r.schedHours, L = p.life;
    var hwDep = p.capex / L, intDep = p.integration / L, finance = (p.capex + p.integration) * (crf(p.rate, p.life) - 1 / L);
    var svc = (p.maintPct * p.capex + p.software);
    var parts = {
      makerCost: hwDep * p.cogsPct + svc * (1 - p.svcMargin),
      makerProfit: hwDep * (1 - p.cogsPct) + svc * p.svcMargin,
      integratorCost: intDep * (1 - p.intMargin),
      integratorProfit: intDep * p.intMargin,
      finance: finance,
      operators: r.lines.operators * Hs,
      power: r.lines.power * Hs,
      rework: r.lines.rework * Hs
    };
    var spent = 0; for (var k in parts) spent += parts[k];
    parts.customer = a.humanCost - spent;
    // the highest robot price at which the customer still breaks even on cost per pick
    var dPerDollar = crf(p.rate, p.life) + p.maintPct;
    return { payroll: a.humanCost, parts: parts, priceCeiling: p.capex + parts.customer / dPerDollar, fte: a.fte };
  }

  /* ---------------- the diligence checklist ---------------- */
  function diligence(p, claim) {
    // claim: { mtbiH, hoursH, ratio, autonomyPct }
    var lam = 1 / claim.mtbiH, rng = mtbiRange(claim.mtbiH, claim.hoursH);
    var supportable = Math.min(p.opCap, p.occTarget / (lam * p.handleMin / 60));
    var occ = claim.ratio * lam * p.handleMin / 60;
    var q = clone(p, { lambda: lam, opMode: "fixed", opRatio: Math.min(claim.ratio, supportable) });
    var c = compare(q), bw = breakEvenWage(q);
    var callsPerHourAtClaim = (1 - claim.autonomyPct / 100) * 3600 / p.cycle;
    return { lambda: lam, range: rng, supportable: supportable, occ: occ, cmp: c, breakEvenWage: bw, callsAtClaim: callsPerHourAtClaim,
      items: [
        { k: "evidence", ok: rng.hi / rng.lo < 2, text: "MTBI " + claim.mtbiH + " h from " + claim.hoursH + " robot-hours = " + rng.k + " interventions; 95% range " + rng.lo.toFixed(1) + "–" + (isFinite(rng.hi) ? rng.hi.toFixed(1) : "∞") + " h" },
        { k: "ratio", ok: occ <= p.occTarget + 1e-9, text: "1 operator per " + claim.ratio + " robots keeps the operator " + Math.round(occ * 100) + "% busy; at " + Math.round(p.occTarget * 100) + "% the most is " + supportable.toFixed(1) },
        { k: "autonomy", ok: Math.max(callsPerHourAtClaim / lam, lam / callsPerHourAtClaim) <= 1.5, text: claim.autonomyPct + "% autonomy per pick at " + p.cycle + " s a pick is " + callsPerHourAtClaim.toFixed(2) + " calls a robot-hour, a call every " + (1 / callsPerHourAtClaim).toFixed(1) + " h; the MTBI claim says every " + claim.mtbiH + " h" },
        { k: "uptime", ok: p.uptime >= 0.95, text: "uptime " + Math.round(p.uptime * 1000) / 10 + "% of scheduled hours" },
        { k: "success", ok: p.success >= 0.98, text: "first-time success " + Math.round(p.success * 1000) / 10 + "%: rework is " + (c.r.lines.rework / c.r.total * 100).toFixed(0) + "% of the robot's cost" },
        { k: "parity", ok: c.saving > 0, text: "cost per good pick: robot " + (c.r.costPerPick * 100).toFixed(2) + "¢ vs human " + (c.h.costPerPick * 100).toFixed(2) + "¢ at " + p.shifts + " shift" + (p.shifts > 1 ? "s" : "") }
      ] };
  }


  /* ---------------- the review board's three pitch decks (fictional companies) ----------------
     Each deck's sheet is the books with its own overrides; one line of it is wrong. run(deck, fix) re-runs the
     sheet with a candidate fix and returns the deck's headline number. */
  var DECKS = {
    A: { name: "PickPal", sheet: { capex: 100000, integration: 25000, shifts: 3, days: 360, lambda: 8, handleMin: 2.5, opMode: "none" },
      fixes: { ops: { opMode: "workload" }, rate: { rate: 0.14 }, life: { life: 3 } }, right: "ops" },
    B: { name: "Armada", sheet: { cycle: 8, lambda: 4.5, handleMin: 2, opMode: "fixed", opRatio: 50 },
      fixes: { workload: { opMode: "workload" }, uptime: { uptime: 0.99 }, cycle: { cycle: 4 } }, right: "workload" },
    C: { name: "HandyBot", sheet: { capex: 50000, integration: 10000, cycle: 30, uptime: 0.85, success: 0.95, lambda: 1.5 },
      fixes: { perpick: { _perPick: true }, power: { _power: true }, life: { life: 7 } }, right: "perpick" }
  };
  function deckRun(id, fix) {
    var d = DECKS[id], over = Object.assign({}, d.sheet, fix ? d.fixes[fix] : {}), perPick = over._perPick, addPower = over._power;
    delete over._perPick; delete over._power;
    var p = books(over), c = compare(p);
    if (id === "A") { var pb = deal(p).payback; return { value: pb == null ? Infinity : pb * 12, p: p, c: c, npv: deal(p).npv }; }
    if (id === "B") return { value: c.r.costPerPick * 100, p: p, c: c, occ: occupancy(p) };
    // C: the deck prices the robot per scheduled hour (leaving out the power line) against a picker's hour.
    var perHour = (c.r.total - (addPower ? 0 : c.r.lines.power)) / c.h.hourly;
    return { value: perPick ? c.r.costPerPick / c.h.costPerPick * 100 : perHour * 100, p: p, c: c };
  }

  /* ---------------- the field test: answers at the books' defaults ---------------- */
  function fieldTest() {
    var P = books(), c = compare(P);
    return [
      { q: "What does one hour of a picker's work cost the Depot, wage plus benefits, in dollars?", hint: "step 0", ans: c.h.hourly, tol: 0.02 },
      { q: "At the books' defaults, the robot's cost per good pick, in cents?", hint: "step 1", ans: c.r.costPerPick * 100, tol: 0.02 },
      { q: "The same robot on one shift a day: cost per good pick, in cents?", hint: "step 1", ans: compare(clone(P, { shifts: 1 })).r.costPerPick * 100, tol: 0.02 },
      { q: "At 2 calls an hour and 2 minutes a call, how many robots can one operator look after at 75% busy?", hint: "step 2", ans: c.r.ratio, tol: 0.05 },
      { q: "At 95% autonomy per pick attempt, the robot's cost per good pick, in cents?", hint: "step 2, one decimal", ans: robot(P, { lambda: lambdaFromAutonomy(P, 0.95) }).costPerPick * 100, tol: 0.1 },
      { q: "On the toy learning curve, interventions per hour after 3 years?", hint: "step 3, two decimals", ans: lambdaAtYear(P, 3), tol: 0.01 },
      { q: "A fleet of 20, bought: simple payback, in months?", hint: "step 4", ans: deal(P).payback * 12, tol: 1 },
      { q: "The picker's wage below which the robot no longer beats the human per pick, in dollars an hour?", hint: "step 4", ans: breakEvenWage(P), tol: 0.05 },
      { q: "20 robots sharing 2 operators: the average wait before a stuck robot gets help, in seconds (Erlang C)?", hint: "step 5", ans: fleetQueue(P, 20, 2).WqMin * 60, tol: 2 },
      { q: "How many spare robots so that 20 are working with at least 95% probability?", hint: "step 5", ans: spares(20, P.uptime, 0.95).S, tol: 0 }
    ];
  }

  /* ---------------- numbers the page quotes (tests/check.js holds the page to these) ---------------- */
  function f(n, d) { return Number(n).toLocaleString("en-US", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function usdM(v) { return (v < 0 ? "−" : "") + "$" + f(Math.abs(v) / 1e6, 2) + "M"; }
  function quotes() {
    var P = books(), c = compare(P), h = c.h, r = c.r, out = {};
    var P1 = clone(P, { shifts: 1 }), P3 = clone(P, { shifts: 3 }), c1 = compare(P1), c3 = compare(P3);
    out.wage = "$" + f(P.wage, 2); out.burden = f(P.burden * 100, 1) + "%"; out.hourly = "$" + f(h.hourly, 2);
    out.hCents = f(h.costPerPick * 100, 2) + "¢"; out.rCents = f(r.costPerPick * 100, 2) + "¢"; out.savePct = f(c.savingPct * 100, 0) + "%";
    out.r1Cents = f(c1.r.costPerPick * 100, 2) + "¢"; out.r3Cents = f(c3.r.costPerPick * 100, 2) + "¢";
    out.rHour = "$" + f(r.total, 2); out.capHour = "$" + f(r.lines.capital, 2); out.powerHour = f(r.lines.power * 100, 0) + "¢";
    out.reworkHour = "$" + f(r.lines.rework, 2); out.opsHour = "$" + f(r.lines.operators, 2); out.good = f(r.good, 0); out.hGood = f(h.good, 1);
    out.autonomy = f(r.autonomy * 100, 2) + "%"; out.ratio = f(r.ratio, 2); out.runPct = f(r.run * 100, 1) + "%";
    var rows = [0.95, 0.99, 0.999, 0.9999].map(function (a) { return robot(P, { lambda: lambdaFromAutonomy(P, a) }); });
    out.a95ratio = f(rows[0].ratio, 2); out.a95cents = f(rows[0].costPerPick * 100, 1) + "¢"; out.a99cents = f(rows[1].costPerPick * 100, 2) + "¢";
    out.a999cents = f(rows[2].costPerPick * 100, 2) + "¢"; out.a9999cents = f(rows[3].costPerPick * 100, 2) + "¢"; out.a999ratio = f(rows[2].ratio, 1);
    var l3 = lambdaAtYear(P, 3); out.lam3 = f(l3, 2); out.dbl3 = f(doublings(P, 3), 2);
    var Pw = clone(P, { lambda: 6 }); out.cross6 = String(crossoverMonth(Pw, 120));
    var d = deal(P), dr = deal(P, { mode: "raas" });
    out.payback = f(d.payback * 12, 0); out.npv = usdM(d.npv); out.irr = f(d.irr * 100, 1) + "%";
    out.npvRaas = usdM(dr.npv); out.bew = "$" + f(breakEvenWage(P), 2); out.bewNpv = "$" + f(breakEvenWageNPV(P), 2);
    var dl = deal(P, { learning: true }); out.npvLearn = usdM(dl.npv);
    var t = tornado(P); out.tornadoTop = META[t[0].key].label;
    var q1 = fleetQueue(P, 20, 1), q2 = fleetQueue(P, 20, 2), q3 = fleetQueue(P, 20, 3);
    out.q2wait = f(q2.WqMin * 60, 0); out.q2pw = f(q2.pWait * 100, 0) + "%"; out.q1wait = f(q1.WqMin, 1); out.q3wait = f(q3.WqMin * 60, 0);
    var s10 = fleetQueue(P, 10, 1), s100 = fleetQueue(P, 100, 10); out.s10wait = f(s10.WqMin * 60, 0); out.s100wait = f(s100.WqMin * 60, 0);
    var b = bestOperators(P, 20); out.bestC = String(b.c);
    var sp = spares(20, P.uptime, 0.95); out.spares = String(sp.S); out.allUp = f(sp.prob0 * 100, 0) + "%";
    var v = valueSplit(P); out.payroll = "$" + f(v.payroll, 0); out.custShare = f(v.parts.customer / v.payroll * 100, 0) + "%";
    out.ceiling = "$" + f(v.priceCeiling, 0); out.makerProfit = "$" + f(v.parts.makerProfit, 0);
    var ci = mtbiRange(8, 120); out.ciLo = f(ci.lo, 1); out.ciHi = f(ci.hi, 1); out.ciK = String(ci.k);
    var a0 = deckRun("A"), a1 = deckRun("A", "ops"), b0 = deckRun("B"), b1 = deckRun("B", "workload"), c0 = deckRun("C"), c1 = deckRun("C", "perpick");
    out.aClaim = f(a0.value, 0); out.aHonest = f(a1.value, 0); out.aNpv = usdM(a1.npv); out.aRatio = f(a1.c.r.ratio, 2);
    out.bClaim = f(b0.value, 2) + "¢"; out.bHonest = f(b1.value, 2) + "¢"; out.bOcc = f(b0.occ * 100, 0) + "%"; out.bRatio = f(b1.c.r.ratio, 0);
    out.cHour = "$" + f(c0.c.r.total - c0.c.r.lines.power, 2); out.cClaim = f(c0.value, 0) + "%"; out.cHonest = f(c1.value, 0) + "%";
    out.cCents = f(c1.c.r.costPerPick * 100, 2) + "¢"; out.cGood = f(c1.c.r.good, 0);
    return out;
  }

  return {
    DEFAULTS: DEFAULTS, META: META, books: books, clone: clone,
    crf: crf, npv: npv, irr: irr, payback: payback, solve: solve,
    hourly: hourly, reworkCost: reworkCost, schedHours: schedHours, human: human, robot: robot, compare: compare,
    opsRatio: opsRatio, occupancy: occupancy, costAtLambda: costAtLambda, lambdaFromAutonomy: lambdaFromAutonomy,
    lambdaAtHours: lambdaAtHours, lambdaAtYear: lambdaAtYear, doublings: doublings, crossoverMonth: crossoverMonth,
    annual: annual, cashflows: cashflows, deal: deal, breakEvenWage: breakEvenWage, breakEvenWageNPV: breakEvenWageNPV, tornado: tornado, TORNADO: TORNADO,
    erlangB: erlangB, erlangC: erlangC, mmc: mmc, fleetQueue: fleetQueue, machineRepair: machineRepair, bestOperators: bestOperators,
    binomAtLeast: binomAtLeast, spares: spares, poissonCdf: poissonCdf, poissonCI: poissonCI, mtbiRange: mtbiRange,
    valueSplit: valueSplit, diligence: diligence, quotes: quotes, DECKS: DECKS, deckRun: deckRun, fieldTest: fieldTest
  };
});
