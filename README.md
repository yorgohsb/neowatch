# ☄️ NEOWatch — Near-Earth Object Tracker

**Author:** Yorgo Hassabou
**Course:** Full Stack Development — Final Project 2026 (Lebanese University, Faculty of Engineering)
**Live URL:** _add your Vercel / Netlify / GitHub Pages link here_

NEOWatch is a space-themed website that tracks asteroids making close approaches to
Earth, using live data from NASA. You can browse the current week's close approaches,
search and filter them, inspect each asteroid's details, and explore a curated gallery
of famous asteroids and impact events.

## API used

**NASA NeoWs (Near-Earth Object Web Service)** — https://api.nasa.gov

- `GET /neo/rest/v1/feed` — close approaches for a date range (max 7 days).
- `GET /neo/rest/v1/neo/{id}` — full orbital details for one asteroid (detail modal).

Requires a free registered API key. The repo ships with `DEMO_KEY` so it runs
immediately, but `DEMO_KEY` is rate-limited — **replace it with your own key in
[`js/config.js`](js/config.js)** for the graded/live version.

## Features

- **Live Tracker** — fetches the close-approach feed for a chosen date window, then
  provides client-side **search** (by name), **filtering** (potentially hazardous only),
  **sorting** (distance / size / speed / danger index) and **pagination**.
- **Loading / error / empty states** — skeleton cards while loading, a retry button on
  errors (e.g. rate limit), and a friendly empty message.
- **Detail modal** — pulls extra orbital data on demand.
- **Notable Asteroids** — a curated gallery of 17 real asteroids/impact events (my own
  content), with search and category filtering.

## Custom UI requirement

> **Design a responsive card grid layout with hover effects.**

Implemented as the `.card-grid` / `.card-neo` components in
[`css/style.css`](css/style.css) (see the boxed comment marked
`CUSTOM UI REQUIREMENT`):

- The grid uses **CSS Grid** with `repeat(auto-fill, minmax(280px, 1fr))`, so columns
  reflow fluidly from 1 to 4+ across phone → desktop **with no media queries**.
- Each card is a **Flexbox** column. On hover/focus it **lifts and glows**, and slides
  open a hidden panel revealing an **animated "danger index" meter**. Hazardous
  asteroids get a distinct red treatment. Keyboard focus triggers the same effect
  (`:focus-within`) for accessibility.

The same card component is reused on the Home, Tracker and Notable pages.

## Tech

- Semantic **HTML5**, hand-written **CSS3**, **Bootstrap 5** (navbar, forms, modal, grid).
- **JavaScript ES6 classes / modules** — no jQuery:
  - `NeoApi` ([js/api.js](js/api.js)) — API wrapper.
  - `Asteroid` ([js/models.js](js/models.js)) — data model with computed getters.
  - `CardGrid` ([js/card-grid.js](js/card-grid.js)) — rendering + loading/error/empty states.
  - `TrackerPage` ([js/tracker.js](js/tracker.js)) — Live Tracker controller.
- Responsive, dark "space" theme with a CSS-only starfield.

## Running locally

This site uses ES6 modules, so it must be served over HTTP (opening the files via
`file://` will not work). The easiest options:

- **VS Code:** install the *Live Server* extension → right-click `index.html` → "Open with Live Server".
- **Python:** `python -m http.server` then open http://localhost:8000
- **Node:** `npx serve`

## Deployment

Deploy the `neowatch/` folder as a static site to **Netlify**, **Vercel**, or
**GitHub Pages**. No build step required.

## AI-use appendix

> _Required by the assignment. Fill in honestly and specifically — it must match your
> commit history. The notes below are starting points; replace the TODOs with your own._

**Tools used**

- **Claude (Claude Code)** — scaffolding the initial project structure, the `NeoApi`/
  `Asteroid`/`CardGrid` classes, and the card-grid + hover CSS.
- _TODO: add any other tool you used (ChatGPT, etc.) and what for._

**Sample prompts** (include 2–3 real ones you actually used)

1. _TODO: e.g. "Scaffold a static asteroid-tracker site using the NASA NeoWs API with ES6 classes and a responsive card grid with hover effects."_
2. _TODO_
3. _TODO_

**What the AI got wrong / what didn't work** (need at least 2 specific examples)

1. _TODO: e.g. a wrong API field name / a date-range bug / a CSS issue — describe how you
   noticed it and exactly how you fixed it._
2. _TODO_

## Credits

Data: [NASA Open APIs](https://api.nasa.gov). Asteroid facts summarised from NASA/JPL
public sources and rewritten in my own words.
