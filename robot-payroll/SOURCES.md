# Sources

Every default that isn't labelled illustrative on the page, every outside fact the prose quotes, and what each one supports. Checked on **2026-10-15**.

**How these were checked.** The build environment could not open bls.gov, eia.gov or ifr.org directly (DNS was blocked, on the build and again on the 2026-10-15 review), so the figures below were confirmed through web-search extracts of those pages and of sites that republish them, and cross-checked against each other where possible. On the review pass: the ECEC figures ($46.15 total, $32.36 wages, $13.79 benefits, private industry, December 2025) were read back verbatim from the BLS release text; the EIA 2024 industrial price (8.13¢/kWh, U.S. total) from EIA's sales-revenue-price Table 4; and the OEWS May 2025 mean for 53-7062 as the annual mean $42,260 ÷ 2,080 h = $20.32 (republishers such as O*NET show the median, $19.35, not the mean). Before relying on a figure, open the primary link and re-read it; the page and `js/core.js` (`DEFAULTS`, `META`) are where to change it.

## Wages and benefits (the picker's payslip)

- **Wage, $20.32 an hour** — U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics (OEWS), **May 2025**, SOC 53-7062 *Laborers and Freight, Stock, and Material Movers, Hand*, national **mean** hourly wage. Mean annual wage $42,260 (= $20.32 × 2,080); employment about 2,950,280; median $19.35 an hour ($40,240 a year). Pages: [OEWS 53-7062](https://www.bls.gov/oes/current/oes537062.htm), [Occupational Employment and Wages news release](https://www.bls.gov/news.release/ocwage.htm). Earlier vintages for comparison: May 2022 mean $18.03; May 2024 annual mean $41,420. The mean is used rather than the median because a cost model wants the average dollar paid; the median is about 5% lower.
- **Benefits load, 42.6% of wages** — BLS, **Employer Costs for Employee Compensation (ECEC), December 2025** (released 20 March 2026), private industry workers: total compensation $46.15 per hour worked, of which wages and salaries $32.36 (70.1%) and benefits $13.79 (29.9%). 13.79 ÷ 32.36 = 0.426. [ECEC release](https://www.bls.gov/news.release/ecec.htm), [archived December 2025 release](https://www.bls.gov/news.release/archives/ecec_03202026.htm). This is the all-private-industry figure; the occupation-specific benefit load for transportation and material moving workers is in the release's Table 4 and was not read, so the page labels the 42.6% as an average and leaves the slider free.

## Electricity

- **8.13¢ per kWh** — U.S. Energy Information Administration, *Electric Power Annual* (data for 2024), average price of electricity to ultimate customers, **industrial** sector, U.S. total. [EIA Electric Power Annual](https://www.eia.gov/electricity/annual/). For context: EIA's Electric Power Monthly shows the industrial average at 8.44¢ in November 2025; warehouses on commercial tariffs pay more. At a 1 kW average draw (illustrative) power is under a tenth of a cent a pick either way.

## Robot prices (anchors only, not defaults)

The default robot price ($150,000) is **illustrative**. Public list prices are quoted only to bound it, and are for different products:

- **Hello Robot Stretch 3, $24,950** — a mobile manipulator sold for research, education and development, with charger and gamepad teleop; announced February 2024. [hello-robot.com/purchase](https://www.hello-robot.com/purchase).
- **Boston Dynamics Spot, $74,500** — base price of the Spot Explorer kit when it went on general commercial sale in **June 2020** (Boston Globe, 16 June 2020; IEEE Spectrum; The Robot Report). A 2020 price, quoted as history.

No warehouse picking-robot company publishes a per-unit price or its operating metrics, and none is used here.

## Industry context (prose only)

- **IFR World Robotics 2025, industrial robots** — 542,076 industrial robots installed in 2024; operational stock 4,663,698 (+9%). [IFR press release](https://ifr.org/ifr-press-releases/news/global-robot-demand-in-factories-doubles-over-10-years).
- **IFR World Robotics 2025, service robots** — almost 200,000 professional service robots sold in 2024 (+9%); transportation and logistics the largest class at 102,900 units (+14%); the Robot-as-a-Service fleet grew 31% (42% in transportation). [IFR press release](https://ifr.org/ifr-press-releases/news/service-robots-see-global-growth-boom). Cited for "RaaS is a real and growing way to buy", not for any number in the model.

## Methods

- **Learning curve (analogy for the toy in step 3)** — T. P. Wright, "Factors Affecting the Cost of Airplanes", *Journal of the Aeronautical Sciences* 3(4):122–128, February 1936. Commonly summarised as an **80% curve**: about 20% fewer labour-hours per doubling of cumulative output (e.g. the CIA reading-room monograph *Theory and Applications of the Learning Curve*; GAO's cost-estimating guide). The original paper was not opened. Wright's curve is about airframe labour; applying a per-doubling rate to robot interventions is **this lab's assumption**, labelled as a toy. Its exponent: log₂(0.8) = −0.322.
- **DAgger** — S. Ross, G. Gordon & J. A. Bagnell, *A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning*, AISTATS 2011, [arXiv:1011.0686](https://arxiv.org/abs/1011.0686): the expert labels the states the learner actually visits, and the labels are aggregated into training. Mentioned in one line, as the reason interventions are valuable data.
- **Erlang C and the M/M/c queue** — A. K. Erlang, "Solution of some problems in the theory of probabilities of significance in automatic telephone exchanges" (1917); any queueing text (e.g. Gross, Shortle, Thompson & Harris, *Fundamentals of Queueing Theory*) for P(wait) = C(c, A), Wq = C(c, A)/(cμ − λ), and the finite-source ("machine-repair") birth–death model used as the cross-check. Erlang B recursion B(k) = A·B(k−1)/(k + A·B(k−1)); C = cB/(c − A(1 − B)). Table check: B(10 lines, 5 erlangs) = 0.0184.
- **Exact Poisson interval** — F. Garwood, "Fiducial limits for the Poisson distribution", *Biometrika* 28 (1936): the two-sided 95% interval for a count k. Table checks: k = 0 → [0, 3.689]; k = 5 → [1.6235, 11.6683].
- **Capital recovery factor, NPV, IRR, payback** — standard capital-budgeting definitions (any corporate-finance text).

## What is not sourced, on purpose

Every robot operating number — price, integration, life, maintenance, software, power draw, uptime, cycle time, first-time success, interventions per hour, minutes per intervention — plus the human's picks per hour and accuracy, rework minutes, the remote operator's wage, the operator-occupancy target and cap, the discount rate, the RaaS fee, and the margins in step 6. These are **illustrative assumptions**, each with an "illustrative" chip on its slider. The three companies on the review board (PickPal, Armada, HandyBot) are fictional.
