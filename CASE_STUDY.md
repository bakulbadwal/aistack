# Case Study — The AI Stack Field Atlas
### A product-thinking write-up (not a README). To run it, see [README](./README.md); this is the *why*.

An interactive map of the AI industry — silicon to application layer — built to teach *fluency fast*: where value accrues, where margin gets squeezed, and how a dollar actually flows through the stack. Live at [aistacked.netlify.app](https://aistacked.netlify.app/).

---

## The problem I was solving

Everyone in and around tech is suddenly expected to have an opinion on "the AI stack," but the available material is either (a) breathless layer-by-layer explainers that don't tell you where the *money* is, or (b) dense analyst reports priced for institutions. There was no fast, free, *interactive* way to build genuine fluency — to understand not just what each layer does, but who has pricing power, who gets commoditized, and how capital actually moves through it.

## Who it's for

Operators, investors, and builders who need to reason about the AI industry credibly — and, honestly, me: I built it to force my own fluency, because you don't really understand a system until you have to structure and defend every claim in it. Secondary user: anyone learning the space who retains concepts better by *exploring a map* than reading prose.

## The core product insight

**Teach the economics, not the taxonomy.** Most "AI stack" content lists the layers. The insight here is that fluency comes from understanding *value flow* — so every layer carries a margins/moats/chokepoints breakdown ("who's eating whom"), and the centerpiece is **three "follow-the-dollar" traces** (a Cursor request, a frontier training run, an enterprise contract) that walk a literal dollar through the stack. You don't learn where value accrues by being told; you learn it by watching the dollar move.

## Key product decisions & tradeoffs

| Decision | Why | Tradeoff accepted |
|---|---|---|
| **Tag every claim `fact` / `reported` / `thesis`** | In a fast-moving space full of hype, the most valuable thing a map can do is be explicit about what's *measured* vs. *argued*. Intellectual honesty as a product feature. | More work per claim; some tiles look less authoritative. Correct — trust comes from showing the seams, not hiding them. |
| **Data/view split (`data.json` vs. render code)** | Everything that goes stale (valuations, new companies, deals) lives in one JSON file, so a script — or a scheduled agent — can refresh the whole map without touching the rendering logic. | Upfront structure. It's the prerequisite for the map ever self-updating, which is the roadmap. |
| **Add an "Operator's Bench" (tools, not just content)** | A map you *read* is a lesson; a map that also computes *your* AI bill and helps you decide prompt-vs-RAG-vs-fine-tune-vs-agent is a *tool* you return to. | Scope creep risk. Worth it — it turns a teaching artifact into something with repeat utility. |
| **Quiz mode that tests concepts, not recall** | The goal is fluency, so the check has to be "can you reason about the economics," not "can you name the layer." | Harder to author. It's the difference between teaching and quizzing. |
| **Single-file vanilla stack, no build** | Runs anywhere, forever, with nothing to install — matches "teach fluency fast" (zero friction to open). | No framework niceties. Right call for a durable public reference. |

## How I'd measure success

**North-star:** *did a user get more fluent?* — measured most directly by quiz performance (and improvement on retry), which is the closest proxy for "the map taught something."

**Supporting metrics:** return visits (a reference people come back to > a page they read once); Operator's Bench tool usage (the calculators are the utility hook); time-on-map and trace completion (are the follow-the-dollar walks actually engaging, or do people bounce?).

**Honest gap:** it's a public static site with no telemetry today — a deliberate simplicity choice. Before optimizing, I'd add lightweight opt-in analytics to see which layers confuse people and which traces land.

## What's next (roadmap)

1. **Self-refreshing content** — the data/view split already makes this possible; wiring a scheduled agent to rewrite `data.json` (new deals, valuations, companies) turns a snapshot into a living map. *(This is the applied-AI angle: the map is the product, an agent is the maintenance layer.)*
2. **Deeper per-layer economics** — unit-cost curves and pricing-power trends, not just static breakdowns.
3. **Personalization in the Bench** — plug in your real usage and get a tailored build-vs-buy recommendation.

## Why this write-up exists

Of everything in my portfolio, this is the one that most directly demonstrates *fluency in the industry an AI PM would be building in* — structuring the whole stack, reasoning about where value accrues, and being honest about what's fact vs. thesis. This document is the product-thinking layer: the problem, the user, the decisions, the metrics, the roadmap. If you're reading it as a hiring signal, that's the point.

---

*Tech: vanilla HTML/CSS/JS, data/view split, deployed on Netlify (auto-deploy on push). Part of a broader portfolio at [github.com/bakulbadwal](https://github.com/bakulbadwal).*
