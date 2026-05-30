# Statsify Rendering Components PRD

## Goal

Expand the Discord image JSX component library with reusable data-visualization and callout components that match existing Statsify cards: dense Minecraft-style profile images, strong stat hierarchy, compact tables, and progress-focused summaries.

## Initial Scope

- `Graph`: thin line/sparkline component for ratios, progression, or historical trend data. It should avoid legends and grid noise; commands provide nearby labels and context.
- `BarChart`: horizontal comparison bars for mode breakdowns, resource totals, and ranked stat groups.
- `Badge`: compact pill for rank tags, flags, personal bests, and small state labels.
- `StatDelta`: signed inline change chip for session, period, and mode-vs-overall comparisons.

## Implementation Direction

- Keep chart primitives low level in `@statsify/rendering` only when Canvas path access is required. The new `graph` intrinsic owns the line, optional area fill, dots, and reference line.
- Keep product-level components in `apps/discord-bot/src/components` so commands can compose them without knowing renderer internals.
- Prefer pure JSX/`box` composition for rectangular visuals. This keeps BarChart, Badge, and StatDelta theme-compatible without renderer changes.
- Use direct labels around charts instead of legends. For small Discord images, labels should be short and adjacent to the data.
- Use muted gray as the default chart color, with one accent per chart when a command needs emphasis.
- Sort horizontal bar charts by value by default. Commands can disable sorting when the natural order matters.

## Demo Direction

BedWars is the first demo surface because the public site already showcases BedWars profile cards and mode stats. The profile now includes:

- A mode wins BarChart across Solo, Doubles, 3s, 4s, and 4v4.
- A ratio Graph for WLR, FKDR, KDR, and BBLR.
- A StatDelta comparing selected-mode FKDR against overall FKDR.
- A Badge to mark the new visual block.

## Follow-Ups

- Add a true historical Graph to session commands once multi-point snapshots are available in command props.
- Add a RadialProgress intrinsic only if circular progress is needed for a specific card; do not add gauges for one-off ratios.
- Add render tests for graph geometry if chart components become shared outside the Discord bot.
