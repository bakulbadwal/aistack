# Case Study: Robot Payroll
### A product-thinking write-up (not a README). For how to play it, see the [README](./README.md).

A hands-on lab for the business of deploying robots. It answers one question with arithmetic anyone can audit: **when does a robot actually beat a human shift, and what has to be true?**

---

## The problem

I spend my time between physical AI, venture and private equity, and AI-native services. In all three, the same question comes up, and it gets answered badly:

1. **Operators get a vendor ROI calculator.** One robot, a price, a "fully autonomous" assumption and a payback date. It leaves out the hours the robot is actually used, the picks it gets wrong, and the people who help it when it's stuck.
2. **Investors get a deck that says "99% autonomous".** That number is meaningless without a rate and a denominator, and the metrics that would make it meaningful (interventions per hour, minutes per intervention, operator ratio, uptime, and the hours behind each) are rarely shown together.

The gap: **nothing put cost per task, autonomy as a rate, operator queueing and value capture on one set of editable books**, with every default either cited or labelled as an assumption.

## Who it's for

Primary: me, preparing for operating reviews and investment committees where the answer has to survive a sharp question. Secondary: a COO weighing a pilot, an investor reading a robotics deck, a founder building their own unit-economics story, and MBA classmates who need the vocabulary.

## The core product insight

**Price the good task, and treat autonomy as a rate.** Two moves make most robot economics legible:

- Divide everything by *good* picks, not hours. Then utilisation, uptime, cycle time and success rate stop being footnotes. At two shifts the default robot costs 8.23¢ a pick against the picker's 9.95¢; at one shift it costs 13.91¢ and loses. Rework of missed picks costs the robot more than its remote operator does.
- Write autonomy as calls per hour × minutes per call. "99.44% autonomous" is 2 calls an hour, and one operator per 11.25 robots. The economics are made in the last few percent: 95% autonomy costs 23.8¢ a pick, 99.9% costs 7.13¢.

Everything after that (the learning curve, the deal, the queue, the split) reuses the same payslip.

## Key product decisions and the trade-offs I made

| Decision | Why | Trade-off I accepted |
|---|---|---|
| **Cited defaults where public data exists, labelled assumptions everywhere else** | A finance model that leaks invented numbers as facts does harm in a meeting. Wages (BLS OEWS), benefits (BLS ECEC) and power (EIA) are public; robot operating metrics are not. | Every robot number carries an "illustrative" chip. The lab teaches mechanics and sensitivities, not "the" answer. |
| **No real company's economics, fictional decks** | Robotics startups don't publish their intervention rates; guessing them would be wrong and unfair. | The review board is about patterns of error (missing operators, impossible ratios, per-hour comparisons), not named companies. |
| **One set of books shared by every step** | Change the wage once and the payslip, the deal, the queue and the split all move. That's how a real model behaves. | Prose numbers are at the defaults, so a banner says when you've changed the books, and the field test says to reset. |
| **The operator ratio follows the workload by default** | It's the single assumption decks get most wrong. Making it derived (occupancy ÷ λτ) rather than chosen is the lesson. | A "fixed by contract" toggle exists for real contracts that staff by ratio. |
| **Real queueing math, and its limits shown** | Erlang C is the standard tool and investors recognise it. Solving the call rate together with the wait keeps it honest. | Erlang C assumes endless callers; the page shows the exact finite-population figure beside it (45 s against 60 s for 20 robots). |
| **The learning curve as a labelled toy** | Every robotics pitch implies one; nobody publishes theirs. A Wright-style curve by analogy shows what the claim implies without pretending to measure it. | It's the least grounded part of the lab, and says so on the page. |
| **A test that holds the prose to the model** | Quoted numbers rot when a default changes. Marked numbers in the page and the review-board text are checked against `core.js` on every run. | Prose has to be written with marked spans; slightly more work per sentence. |

## How it was built

Model first, as pure functions with hand-computed tests (capital recovery, NPV/IRR, Erlang C against the factorial formula and tables, the exact Poisson interval, binomial spares), then the page on a sibling's framework, then the art, then a Playwright pass at 1200px and 375px that answers every prediction, moves every slider and runs every case with zero console errors, then an adversarial self-review of the model and the prose.

## How I'd measure success

**North star:** can a user diagnose all three review-board decks and score ≥ 8/10 on the field test, and then list the six diligence metrics, with "and the hours behind each", unprompted?

**What I'd instrument with a backend:** prediction accuracy per question (where intuition is weakest: I expect the operator-ratio and pooling questions), which assumptions people change in the books (a proxy for what they distrust), how often the diligence checklist is copied, and drop-off by step.

**What I don't measure today:** it's static and local-first, so there's no telemetry, deliberately for v1.

## What's next (roadmap)

1. **Bring your own site:** import a wage by metro area (BLS OEWS publishes them), shifts and pick rates, and get the break-even map.
2. **Ramp-up and after-tax cash flows:** a deployment curve in year one, depreciation tax shields, residual value.
3. **Uncertainty, not just sensitivity:** distributions on uptime, MTBI and success, and a payback range rather than a point.
4. **A second task:** the same books for a hospital-supply run or a bakery line, to show which assumptions travel and which don't.
5. **Real cohort data where it becomes public:** e.g. regulators' disengagement reports for autonomous vehicles, as a worked example of reading an intervention curve.
