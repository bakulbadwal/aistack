# Acceptance

Everything `node tests/check.js` checks and prints. The arithmetic is checked against hand-computed cases and published values, the model's directions are checked, and every number the page quotes (the marked numbers in `index.html` and the figures written into the review board's text in `js/app.js`) is held to the model. The page computes the same numbers live from the same functions in `js/core.js`. Lines marked ✓ are the invariants the build must keep; the rest is the printout the page's prose is written from.

```

Money (hand-computed cases)
  ✓ capital recovery factor at 10%, 5 years = 0.263797
  ✓ at 0% it is straight-line: 1/5
  ✓ NPV of −100, 60, 60 at 10% = 4.1322
  ✓ IRR of −100, 60, 60 = 13.0662% (quadratic, by hand)
  ✓ IRR of −100, 110 = 10%
  ✓ IRR of −1000, 0, 0, 0, 1464.1 = 10%
  ✓ IRR is undefined when no cash goes out
  ✓ payback of −100, 60, 60 = 1.667 years
  ✓ payback that never comes is reported as never
  ✓ NPV at the IRR is zero

Queueing (known values)
  ✓ Erlang C, one server: P(wait) = ρ (0.5 at A = 0.5)
  ✓ Erlang C, c = 2, A = 1: 1/3
  ✓ Erlang C, c = 3, A = 2: 4/9 (by hand: 4 ÷ (1 + 2 + 2 + 4))
  ✓ Erlang B, 10 lines, 5 erlangs: 0.018385 (tables: 0.0184)
  ✓ Erlang C by recursion = the textbook factorial formula on 15 × many cases (worst gap 4.4e-16)
  ✓ M/M/1, λ = 1, μ = 2: Wq = ρ/(μ − λ) = 0.5 h
  ✓ M/M/2, λ = 2, μ = 2: Wq = (1/3)/(4 − 2) = 1/6 h
  ✓ M/M/c with ρ ≥ 1 is flagged unstable
  ✓ finite population, 2 robots, 1 operator, λ = μ = 1: Wq = 0.5 (by hand: Lq 2/5 ÷ arrivals 4/5)
  ✓ one robot never queues
  ✓ big fleet (400 robots, 40 operators): Erlang C fixed point and the exact model agree within a factor of 1.5 (0.0 s vs 0.0 s)

Counting (known values)
  ✓ Poisson 95% interval for 0 events: [0, 3.689]
  ✓ Poisson 95% interval for 5 events: [1.6235, 11.6683] (tables: 1.6235, 11.6683)
  ✓ all 20 of 20 up at 95% = 0.95^20 = 0.3585
  ✓ at least 20 of 21 up, by hand

The payslips at the books' defaults, by hand
  ✓ picker: (28.98 + 1.5 misses × 0.4829) ÷ 298.5 = 9.950¢
  ✓ robot: $25.59 an hour ÷ 311.0 good picks = 8.227¢
  ✓ fleet cash flows: −$4.0M, then 20 × the robot-year saving
  ✓ fleet NPV = −4.0M + saving × annuity factor 3.7908

Directions (monotonicity)
  ✓ cost per pick falls as MTBI rises (λ 30 → 0.01 an hour)
  ✓ … also with a fixed operator ratio
  ✓ more shifts, cheaper picks
  ✓ more uptime, cheaper picks
  ✓ higher success, cheaper picks
  ✓ dearer robot, dearer picks
  ✓ higher wages, higher NPV
  ✓ Erlang C rises with load
  ✓ Erlang C falls with more servers
  ✓ more operators, shorter waits
  ✓ the learning curve never rises and never goes below its floor
  ✓ dearer robot, higher break-even wage

Break-evens
  ✓ at the break-even wage $16.18 the robot and the picker cost the same per pick
  ✓ at $16.18 the fleet's NPV is zero
  ✓ the two agree (the capital line is the annuity that repays the robot)

The review board's decks
  deck A (PickPal): as pitched 8.98 → honest 49.69
  ✓   deck A: the wrong fix “rate” does not reach the honest number (8.98)
  ✓   deck A: the wrong fix “life” does not reach the honest number (8.98)
  deck B (Armada): as pitched 6.62 → honest 8.40
  ✓   deck B: the wrong fix “uptime” does not reach the honest number (6.41)
  ✓   deck B: the wrong fix “cycle” does not reach the honest number (4.06)
  deck C (HandyBot): as pitched 38.58 → honest 122.63
  ✓   deck C: the wrong fix “power” does not reach the honest number (38.86)
  ✓   deck C: the wrong fix “life” does not reach the honest number (35.56)
  ✓ deck A as pitched: payback 9 months

Every number quoted on the page
  ✓ 51 model numbers quoted in index.html all match the model
  ✓ “$13.79 on $32.36” (ECEC benefits ÷ wages = the burden default)
  ✓ “300 picks an hour and 99.5%” (human defaults)
  ✓ “over 2,000 hours instead of 4,000” (scheduled hours)
  ✓ “1 kW average draw and EIA's 2024 industrial price of 8.13¢/kWh” (power defaults)
  ✓ “2 × 2 = 4 operator-minutes per running hour, and 45 busy minutes an hour ÷ 4 = 11.25” (workload ratio)
  ✓ “attempts 360 picks a running hour, so every point of autonomy below 100% is 3.6 calls an hour” (autonomy to calls)
  ✓ “200,000 hours becomes 600,000 in the first year” (learning-curve hours)
  ✓ “a quarter of the cash up front” (RaaS outlay ÷ buy outlay)
  ✓ “only 20% under the national mean” (break-even wage vs mean)
  ✓ “each operator busy about 60% of the time” (operator occupancy, 20 robots, 2 operators)
  ✓ “all up only about a third of the time” (P(all 20 up) ≈ 1/3)
  ✓ “NPV more than triples” (three shifts' NPV > 3 × the books')
  ✓ “turn the NPV negative” (3-year life)
  ✓ “One shift and the deal loses money” (one-shift NPV)
  ✓ “About a third more” (learning adds about a third)
  ✓ “about as much as the customer keeps” (maker profit ≈ customer saving)
  ✓ “8 interventions per robot-hour, 2.5 minutes each” (deck A sheet)
  ✓ “one operator keeps up with 2.25 robots: the honest payback is about 50 months” (deck A honest)
  ✓ “6.6¢ a pick” (deck B claim)
  ✓ “4.5 interventions an hour (that's what 1% of 450 is)” (deck B calls)
  ✓ “50 robots need 7.5 operators' worth of time” (deck B load)
  ✓ “5 robots per operator at 75% busy” (deck B honest ratio)
  ✓ “the operator is still 750% busy” (deck B occupancy)
  ✓ “costs $11.18 an hour all-in” (deck C hourly)
  ✓ “save 61%” (deck C claimed saving)
  ✓ “makes 92 good picks with an hour of a picker who makes 298.5” (deck C throughput)
  ✓ “the robot costs 23% more than the picker” (deck C honest)
  ✓ “Power is 8¢ an hour” (power line)

Step 0 · the human payslip
  wage $20.32 + benefits 42.6% = $28.98 an hour worked; rework $0.72; 298.5 good picks; 9.950¢ a good pick

Step 1 · the robot payslip (2 shifts, 4,000 h a year)
  capital    $13.190 an hour
  maint      $3.000 an hour
  software   $1.500 an hour
  power      $0.081 an hour
  operators  $3.169 an hour
  rework     $4.645 an hour
  total $25.585 · running 93.75% of available time · 311.01 good picks an hour · 8.227¢ a good pick
  1 shift(s): 13.915¢
  2 shift(s): 8.227¢
  3 shift(s): 6.331¢

Step 2 · autonomy
  95.00% per attempt: 18.000 calls/h, 1.25 robots per operator, 23.820¢
  98.00% per attempt: 7.200 calls/h, 3.12 robots per operator, 12.400¢
  99.00% per attempt: 3.600 calls/h, 6.25 robots per operator, 9.419¢
  99.50% per attempt: 1.800 calls/h, 12.50 robots per operator, 8.083¢
  99.90% per attempt: 0.360 calls/h, 50.00 robots per operator, 7.132¢
  99.99% per attempt: 0.036 calls/h, 50.00 robots per operator, 7.072¢

Step 3 · the toy learning curve
  year 0: 0.00 doublings, 2.000 calls/h, 8.227¢
  year 1: 1.58 doublings, 1.404 calls/h, 7.803¢
  year 2: 2.32 doublings, 1.191 calls/h, 7.655¢
  year 3: 2.81 doublings, 1.069 calls/h, 7.570¢
  year 4: 3.17 doublings, 0.986 calls/h, 7.513¢
  year 5: 3.46 doublings, 0.924 calls/h, 7.471¢
  starting at 6 calls an hour, the robot beats the picker from month 12

Step 4 · the fleet of 20
  buy: flows -4.000, 1.484, 1.484, 1.484, 1.484, 1.484 $M · payback 32.3 mo · NPV $1.625M · IRR 24.89%
  buy + learning: flows -4.000, 1.561, 1.624, 1.654, 1.674, 1.688 $M · payback 29.9 mo · NPV $2.195M · IRR 29.43%
  raas: flows -1.000, 0.644, 0.644, 0.644, 0.644, 0.644 $M · payback 18.6 mo · NPV $1.441M · IRR 57.82%
  raas + learning: flows -1.000, 0.721, 0.784, 0.814, 0.834, 0.848 $M · payback 16.3 mo · NPV $2.011M · IRR 71.66%
  break-even wage $16.179 (per pick) · $16.179 (NPV)
  tornado (NPV $M, pessimistic → optimistic):
    shifts      1.000 → 3.000: -1.87 → 5.12
    life        3.000 → 7.000: -0.31 → 3.22
    cycle       12.000 → 8.000: 0.30 → 3.62
    wage        16.256 → 24.384: 0.03 → 3.22
    success     0.940 → 0.990: -0.07 → 2.76
    lambda      4.000 → 1.000: 0.20 → 2.36
    capex       187500.000 → 112500.000: 0.65 → 2.60
    handleMin   3.000 → 1.000: 0.90 → 2.36
    rate        0.140 → 0.060: 1.09 → 2.25
    integration 75000.000 → 25000.000: 1.13 → 2.13
    maintPct    0.120 → 0.040: 1.17 → 2.08
    uptime      0.900 → 0.980: 1.21 → 1.88
    opWage      30.000 → 20.000: 1.43 → 1.82

Step 5 · the fleet queue (20 robots)
  1 operator(s): load 0.859 erlangs, busy 85.9%, P(wait) 85.9%, wait 733.2 s (exact finite-population 539.0 s), 10.182¢
  2 operator(s): load 1.152 erlangs, busy 57.6%, P(wait) 42.1%, wait 59.5 s (exact finite-population 45.1 s), 8.567¢
  3 operator(s): load 1.182 erlangs, busy 39.4%, P(wait) 13.6%, wait 9.0 s (exact finite-population 6.6 s), 8.962¢
  4 operator(s): load 1.187 erlangs, busy 29.7%, P(wait) 3.6%, wait 1.5 s (exact finite-population 1.0 s), 9.507¢
  5 operator(s): load 1.187 erlangs, busy 23.7%, P(wait) 0.8%, wait 0.2 s (exact finite-population 0.1 s), 10.075¢
  pooling, 10 robots / 1 operators: wait 147.5 s, 8.881¢
  pooling, 20 robots / 2 operators: wait 59.5 s, 8.567¢
  pooling, 50 robots / 5 operators: wait 13.1 s, 8.401¢
  pooling, 100 robots / 10 operators: wait 2.8 s, 8.364¢
  spares for 95%: 3 (all 20 up without spares: 35.8%; with: 97.4%)

Step 6 · one robot-year, split
  payroll replaced $123780 (2.08 one-shift pickers)
    makerCost        $27000 (21.8%)
    makerProfit      $21000 (17.0%)
    integratorCost   $7500 (6.1%)
    integratorProfit $2500 (2.0%)
    finance          $12759 (10.3%)
    operators        $12676 (10.2%)
    power            $325 (0.3%)
    rework           $18581 (15.0%)
    customer         $21439 (17.3%)
  price ceiling $212360
  diligence, the page's default claim (MTBI 8 h from 120 h, 1:30, 99.9%):
    !! MTBI 8 h from 120 robot-hours = 15 interventions; 95% range 4.9–14.3 h
    ok 1 operator per 30 robots keeps the operator 13% busy; at 75% the most is 50.0
    !! 99.9% autonomy per pick at 10 s a pick is 0.36 calls a robot-hour, a call every 2.8 h; the MTBI claim says every 8 h
    ok uptime 95% of scheduled hours
    !! first-time success 97%: rework is 21% of the robot's cost
    ok cost per good pick: robot 7.23¢ vs human 9.95¢ at 2 shifts

Field test answers (books' defaults)
  1. 28.976 ± 0.02
  2. 8.227 ± 0.02
  3. 13.915 ± 0.02
  4. 11.250 ± 0.05
  5. 23.820 ± 0.1
  6. 1.069 ± 0.01
  7. 32.346 ± 1
  8. 16.179 ± 0.05
  9. 59.546 ± 2
  10. 3.000 ± 0

Quoted numbers
  wage $20.32 · burden 42.6% · hourly $28.98 · hCents 9.95¢ · rCents 8.23¢ · savePct 17% · r1Cents 13.91¢ · r3Cents 6.33¢ · rHour $25.59 · capHour $13.19 · powerHour 8¢ · reworkHour $4.65 · opsHour $3.17 · good 311 · hGood 298.5 · autonomy 99.44% · ratio 11.25 · runPct 93.8% · a95ratio 1.25 · a95cents 23.8¢ · a99cents 9.42¢ · a999cents 7.13¢ · a9999cents 7.07¢ · a999ratio 50.0 · lam3 1.07 · dbl3 2.81 · cross6 12 · payback 32 · npv $1.63M · irr 24.9% · npvRaas $1.44M · bew $16.18 · bewNpv $16.18 · npvLearn $2.20M · tornadoTop Shifts a day · q2wait 60 · q2pw 42% · q1wait 12.2 · q3wait 9 · s10wait 147 · s100wait 3 · bestC 2 · spares 3 · allUp 36% · payroll $123,780 · custShare 17% · ceiling $212,360 · makerProfit $21,000 · ciLo 4.9 · ciHi 14.3 · ciK 15 · aClaim 9 · aHonest 50 · aNpv −$0.21M · aRatio 2.25 · bClaim 6.62¢ · bHonest 8.40¢ · bOcc 750% · bRatio 5 · cHour $11.18 · cClaim 39% · cHonest 123% · cCents 12.20¢ · cGood 92

all checks passed · 0.3 s
```
