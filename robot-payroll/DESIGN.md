# Design: Robot Payroll

Robot Payroll uses the design system recorded in [Inference Kitchen's DESIGN.md](https://github.com/bakulbadwal/inference-kitchen/blob/master/DESIGN.md): a Busytown cross-section spread, flat gouache fields on warm paper, one warm-brown outline, and every object wearing a hand-lettered label. Buttons are painted signs, readouts are price tags on a nail, predictions are sticky notes, takeaways are chalked on a wood-framed board, and the glossary is a menu board. The type is Grandstander for signboards, Patrick Hand for labels and Andika for body text. The stylesheet and the step framework (nav, predictions, glossary tips, say-it-out-loud, segmented controls, review board, field test) come from Wet Paint.

This file records only what the Depot changes.

## Palette additions

| Token | Hex | Use |
|---|---|---|
| ledger / ledger-d | `#2C6E58` / `#1F5141` | the masthead signboard, scene title boards, the ledger's binding; the footer. Replaces the kitchen's brick and Main Street's road-works orange |
| human | `#246A9C` (sky-d) | anything that is the picker: the human payslip heading, the human line on every chart |
| robot | `#8A6300` (yellow-d) on `#F4C430` fills | anything that is the robot: its payslip, its line on every chart, the "you are here" dot |
| ops | `#5E4A94` (lilac-d) | the remote operator: the operator share on charts, RaaS in the cash chart |
| line colours on the robot's payslip | capital `#E0A91E`, upkeep `#DDBB8A`, power `#9CCBEA`, operators `#B8A3DC`, rework `#E8907A` | fixed across the stacked bar and the value split |
| source chips | BLS `#D7ECF8`, EIA `#E2F1D6`, illustrative `#F6E7C8`, toy `#EADFF6` | the chip under every assumption slider |

Human is always blue and the robot always yellow-brown, on every chart and slip. Green means the robot wins, brick red that it loses; neither is used for anything else in data.

## New objects

- **The payslip** (`.slip`): a paper slip with a dotted perforation along the top, a sign-lettered heading (blue for the picker, brown for the robot), line items with dotted leaders, a ruled total and the cost per good pick in large sign figures. The robot's slip is on a faint butter paper.
- **Source chips** (`.src`): a small hand-lettered tag under every slider saying where its default comes from (BLS, BLS ECEC, EIA, illustrative, toy model), with the citation as a note.
- **The books** (step 1): every assumption grouped on cream boards in a masonry of columns, each with its slider and chip. A yellow banner under the nav lists anything changed from the defaults, with a reset.
- **Charts** (canvas): line charts on sheet paper with a small paper legend in the top-right corner, a log axis for MTBI, a signed cash chart for the ledger, a tornado (pessimistic end pink, optimistic end green, the books' NPV a solid line, NPV 0 dashed brick), and stacked bars for where a pick's cost and a robot-year's payroll go.
- **The diligence checklist** (step 6): check rows with a green tick or a rose "!" and the reason, and a blue brief listing what to ask for, copyable as text.
- **Pitch decks** (review board): each case is a card with the claim and the deck's sheet in a blue brief, a "run the deck's own sheet" sign, radio boards for the fix and the diagnosis, and graded check rows.

## Scenes

Eight hand-built SVG scenes, 960 × 400, one per step plus the review board, assembled in `js/art.js` from a drawn cast and the Depot in cutaway (a sawtooth factory roof, brick end walls, an upper floor and a picking floor):

- **the picker robot**: a wheeled mobile manipulator, school-bus-yellow base, steel mast, a screen face (happy, worried, asleep, dizzy), one arm with a suction cup and a status light that goes red when it calls for help;
- **the picker**: in a high-visibility vest and blue cap, at the conveyor;
- **the payroll clerk**: in a green eyeshade at a desk with a big ledger, pigeonholes of pay envelopes and a punch clock;
- **the remote operator**: in a headset at a row of screens, one flashing HELP;
- totes, a roller conveyor, racks, a charger post with a lightning bolt, a rework bin, a loading dock, a brass balance, an hourglass, coin stacks, a bank safe, a little grey tornado, BUY and RENT doors, a lesson book and a flywheel, a spares cage, a pie, and three easels.

Each scene labels its objects with their business meaning ("the payroll clerk = the cost model", "an intervention = a call for help"). The robot is a generic picker, not any company's product; the companies on the review board are fictional.
