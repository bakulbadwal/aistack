# Product

## Platform

web

## Stack

Static HTML/CSS/JS, no build step, no dependencies. Hosted on GitHub Pages (https://aistacked.netlify.app/robot-payroll/). Must also work opened straight from the file.

## Users

Primary: the author, an MBA (UVA Darden '27) working as an applied-AI operator-builder across physical AI, venture and private equity, and AI-native services, who needs to answer "does this robot deployment pay?" in an operating review or an investment committee and to read a robotics startup's deck critically. Secondary: operators (COOs, site leads) weighing a pilot; investors and founders in robotics who want a shared, editable cost model; MBA classmates.

## Product purpose

Answer one question with arithmetic anyone can audit: **when does a robot actually beat a human shift, and what has to be true?**

1. **Cost per good task**, not per hour: wage plus benefits for the human; capital charge, upkeep, power, operator share and rework for the robot; divided by good picks, which is where uptime, cycle time and success live; and utilisation, which spreads the robot's fixed costs.
2. **Autonomy is a rate**: interventions per hour × minutes per intervention set the operator ratio, and the last few percent of autonomy decide the economics.
3. **The data flywheel**, as a transparent toy: interventions become training data, and calls fall per doubling of fleet hours.
4. **The deal**: payback, NPV, IRR, buy vs RaaS, a tornado, break-even wage.
5. **The fleet**: operators as servers in a queue (Erlang C), pooling, spares.
6. **Value capture**: who gets the saving, the robot's price ceiling, and a diligence checklist.

Success: after about 60 minutes, the reader can price a deployment per good task, explain why "99% autonomous" and "one operator per eleven robots" describe the same robot, say why a 1:10 ratio means different waits at 10 and 100 robots, find the flaw in each of the three review-board decks, and list the six metrics to ask a robotics startup for, with the hours behind each.

## Positioning

Vendor ROI calculators show one robot, no interventions and a payback number; analyst notes show market sizes. Neither lets you change the assumptions and watch cost per task, operator ratio, queueing and value capture move together. This lab is the editable, sourced, tested middle: an operator's and an investor's model, not a vendor's.

It does not overlap its siblings: Inference Kitchen (GPU serving economics) and Compute Deal Desk (compute and power deals) are about compute; Wet Paint and the other robot-learning labs are about how robots learn. This one is about the business of deploying them.

## Operating context

Used at a laptop in study or deal-prep sessions, and on a phone when shared. Steps are done in order (0–6, review board, field test) but people jump between them. The books (all assumptions) persist in localStorage with progress; a banner shows what's been changed and resets it. Everything is analytic, so every control updates instantly.

## Constraints

- Every number comes from `js/core.js`. Numbers quoted in prose are marked and `node tests/check.js` holds them to the model; numbers written into the review-board text are checked too. `ACCEPTANCE.md` is the test printout.
- Defaults are either cited (BLS, EIA; see `SOURCES.md`, dated) or labelled illustrative on the slider. No company's private numbers; the decks are fictional.
- The honesty card (exact / sourced / illustrative / teaching model) must remain, on the page and in the README.
- The Depot is the vocabulary: picker = a human shift, picker robot = the robot, payroll clerk = the cost model, a pick = one task, call for help = an intervention, remote desk = teleoperation, lesson book = training data, ledger = the deal, spares cage = fleet reserve, pie = the saving.

## Brand commitments

- Name: **Robot Payroll**. A sibling of Inference Kitchen, Compute Deal Desk and Wet Paint: same design system, a warehouse-and-payroll-office palette and a ledger-green masthead.
- Must not look like "every AI tool" (dark ground, neon accent, glowing cards) or like a corporate SaaS dashboard, which is the obvious trap for a finance model.
