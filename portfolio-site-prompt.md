# Build prompt: engineering portfolio site

Paste everything below the line into Claude Code in an empty directory. Fill in the
`[BRACKETED]` values first — they take two minutes and they change the output a lot.

Build it in phases. Don't paste the whole thing and walk away; stop at each checkpoint,
look at the site, and correct course.

---

## Context

I'm a sophomore engineering student at Texas A&M (`[major, e.g. electrical
engineering]`), targeting internships in `[e.g. defense, aerospace, RF]`. I need a
portfolio site that works as an extension of my resume: a recruiter or hiring engineer
lands on it, sees my project write-ups, and can find relevant work in under thirty
seconds. Reading is the point. It is not a design showcase, not a personal brand site,
and nothing on it should feel like a startup landing page.

My details:
- Name: `[NAME]`
- Expected graduation: `[MONTH YEAR]`
- Focus areas: `[e.g. RF design, embedded firmware, PCB design]`
- GitHub username: `[USERNAME]`
- Repo name: `[USERNAME].github.io]` or `[portfolio]`
- Links to include: GitHub, LinkedIn, email, resume PDF
- Eventual custom domain: `[example.com]` (not registered yet — build so it's a
  one-file change later)

**Scale matters here.** I'm launching with two to four write-ups, mostly coursework
and student org projects, and I'll add a few per semester over the next three years.
Design for both ends of that:

- The site must not look broken or empty with three posts. No filter bar that filters
  nothing, no "featured" section that duplicates the only three items on the page, no
  empty-state text apologizing for a lack of content. If a piece of UI only makes
  sense at 20 posts, hide it until there are 20 posts.
- Nothing should need rearchitecting at 40 posts either. That's what the schema and
  the taxonomy are for.
- Treat `coursework` and student-org projects as first-class content types, not a
  lesser category. A well-written lab write-up beats a vague internship bullet, and
  it's what I actually have.
- `status: in-progress` is normal for me, not an exception. Show it plainly — a dated
  post about a build in flight is evidence I'm working, not an unfinished draft.

Write every project write-up as if the reader is a working engineer skimming on their
phone between meetings.

## Reference site

https://www.davisryan.tech/ is close to the tone I want. It's a Squarespace site, so
don't copy its implementation — take the restraint. What I like:

- Three nav items and nothing else. Mine should be **Home, Projects, Resume**, in
  that order, plus a search affordance.
- Project cards are a photo, a title, and a link. No summary paragraphs competing
  for attention on the index.
- Project pages open with one hardware photo and a title, then get straight to text.
- Write-ups are organized around named themes with a photo each, not a wall of prose.
  I want that structure available to me as an MDX component, not hardcoded.

What I don't want to repeat — these are real defects on that site, don't reproduce
them:

- Headings that break mid-word ("Perseveranc / e.") because a fixed-width container
  fights a long word. Set sensible heading widths and don't hyphenate.
- A horizontal card carousel that clips cards at the viewport edge and cuts off
  titles. Use a plain responsive grid instead. No carousels anywhere.
- Image collages where the pieces have mismatched aspect ratios and heights.
- Trailing separators in subtitles ("Liquid Engine Testing | 110+ Test Stand Hours |").
  Build the metadata strip from an array and join it properly so an empty field can't
  leave a dangling separator.
- Placeholder junk left in production (that site has an image whose alt text is
  literal keyboard mash). Alt text is required by the schema and CI fails without it.
- Every heading ending in a period. Mine shouldn't.
- A dead `/cart` link from the platform. Nothing on my site should exist that I
  didn't put there.

## Stack

Use these unless you have a concrete reason not to — if you do, tell me before you
start, don't silently substitute.

- **Astro 7** (static output, `output: 'static'`), TypeScript, Node 22+
- **Content collections** with the glob loader and a Zod schema for all write-ups
- **MDX** enabled, so I can drop a component into a post when I need to
- **Tailwind CSS v4** for styling
- **Pagefind** for search (build-time index, runs entirely client-side, no backend)
- **Shiki** for code highlighting (built into Astro)
- **remark-math + rehype-katex** for equations
- **Mermaid** for block diagrams, rendered at build time (no client JS)
- **GitHub Actions → GitHub Pages** for deploy

Hard constraint: the site stays fully static with zero server dependencies and no
paid services. It must be portable to Cloudflare Pages, Netlify, or Vercel by
changing a config file and a DNS record. Do not introduce an SSR adapter, a
database, or a hosted search service.

## Content model

This is the most important part of the build. Get the schema right first.

Content lives in `src/content/projects/`, one Markdown file per project, plus
`src/content/notes/` for shorter technical notes. Define the schema in
`src/content.config.ts` and make the build **fail loudly** on a bad frontmatter
field — I'd rather catch a typo at build time than find a broken page later.

```yaml
---
title: "X-Band Phased Array Beamformer"
summary: "8-element passive array with a 5-bit digital phase shifter, measured
          against a simulated pattern in an anechoic chamber."
date: 2026-03-14          # required, ISO
updated: 2026-05-02       # optional
type: project             # project | note | teardown | coursework
domains: [rf, antennas]   # broad buckets, drive the filter UI
tech: [HFSS, Altium, Python, VNA]   # tools, languages, instruments
skills:                   # resume-mappable phrases
  - S-parameter measurement
  - link budget analysis
  - antenna pattern characterization
keywords:                 # invisible search aliases — see Search below
  - X band
  - 8-12 GHz
  - beam steering
  - AESA
status: complete          # complete | in-progress | archived
featured: true
hero: ./images/array-hero.jpg   # optional, colocated
repo: https://github.com/...    # optional
draft: false
---
```

Rules:
- `summary` is required and is what shows on the home page and in link previews.
  Enforce a sensible max length so cards stay uniform.
- `draft: true` posts build in dev and are excluded from production.
- Images live next to the Markdown file and go through Astro's image optimization.
- Taxonomy values are validated against a controlled list in `src/data/taxonomy.ts`
  so I can't create `rf` and `RF` and `radio-frequency` as three separate tags.
  When I add a genuinely new tag, the build should tell me to register it.

## Pages

Nav is exactly three links — Home, Projects, Resume — in that order, plus a search
icon and a dark-mode toggle on the right. `/about` and the tag archives are reachable
by link, not by nav. If a fourth nav item ever seems necessary, tell me why instead of
adding it.

- `/` — short intro (three sentences, no hero graphic, no tagline), then a
  reverse-chronological list of projects with filter controls above it. Filters are
  client-side, driven by `type` and `domains`, and reflected in the URL query string
  so a filtered view is linkable. No pagination until there are 20+ posts.
- `/projects/[slug]` — the write-up. Title, date, a compact metadata strip, body,
  and prev/next links.
- `/search` — full search page. A search input in the header opens it too.
- `/skills` — an index that maps each `skills` entry to the projects that
  demonstrate it. This is the page I'd send a hiring manager. Group by domain.
- `/about` — bio, education, links, embedded resume link.
- `/resume` — HTML version of the resume plus a link to the PDF at `/resume.pdf`.
  Include expected graduation date and relevant coursework, since that's load-bearing
  information for an internship reader in a way it wouldn't be later.
- `/tags/[tag]` and `/tech/[tool]` — generated archive pages, good for SEO and for
  linking directly from a job application.
- `/404`.

## Search

Two phases. Build phase 1 completely and confirm it works before touching phase 2.

**Phase 1 — Pagefind plus query expansion.**

Standard Pagefind setup: `astro build && pagefind --site dist`, `data-pagefind-body`
on the article content, `data-pagefind-ignore` on nav and footer. Index the
`keywords`, `skills`, and `tech` frontmatter as Pagefind filters and as searchable
weighted metadata, even though `keywords` is never rendered visibly.

On top of that, add a domain synonym layer in `src/data/synonyms.ts`: a map from a
query term to related terms, applied to the query before it hits Pagefind, with the
expansion shown to the user ("also searching: beam steering, 8–12 GHz") so it's never
mysterious. Seed it with RF and electronics vocabulary:

```ts
// radar bands → frequency ranges and typical applications
"x band": ["8 GHz", "12 GHz", "radar", "phased array", "satcom", "8-12 GHz"],
"ka band": ["26 GHz", "40 GHz", "millimeter wave", "mmwave", "point to point"],
"s band": ["2 GHz", "4 GHz", "weather radar", "surveillance"],
// concept clusters
"beamforming": ["phased array", "AESA", "beam steering", "phase shifter"],
"link budget": ["path loss", "Friis", "EIRP", "noise figure", "G/T"],
"fpga": ["VHDL", "Verilog", "Vivado", "Quartus", "RTL"],
```

RF is just the example I had handy. The real goal is a general engineering concept
graph — mechanical, thermal, controls, embedded, power, manufacturing, test — where
related terms find each other in both directions. Don't try to build that now. Build
the mechanism, seed it with 30-50 entries across my actual domains, make the format
obvious enough that adding an entry takes ten seconds, and leave it to grow as I
write posts.

Two design notes for the synonym file:
- Relations should be **bidirectional by default**. If "beamforming" expands to
  "phased array", then searching "phased array" should reach "beamforming" posts.
  Derive the reverse edges at build time; don't make me type each pair twice.
- Support one level of transitive expansion, capped, so "X band" → "radar" →
  "pulse compression" works without the whole graph collapsing into one blob. Make
  the cap a constant I can tune.

Add a `pnpm run synonyms:check` script that flags synonym terms appearing in no post
(dead weight) and frontmatter keywords appearing in no synonym entry (missed
connections).

Ranking: title match > `keywords`/`skills` match > body match. Show the matched
project's summary and the highlighted snippet in results.

**Phase 2 — semantic search, only after phase 1 ships.**

Generate embeddings at build time with Transformers.js running locally in Node
(`all-MiniLM-L6-v2` or a current equivalent — check what's recommended before you
pick). No API key, no cost, runs in CI. Write the vectors to a static JSON file.
In the browser, lazy-load the model **only when the user opts in** (a "smarter
search" toggle, or automatically when keyword search returns nothing), embed the
query, and rank by cosine similarity.

Be honest with me about the tradeoff before implementing: the model is tens of
megabytes on first load. It must never block or slow the default search path. If
after building it you think it isn't worth the complexity for a site with 15
projects, say so — the synonym layer may already cover the "X-band → phased array"
case well enough.

## Obsidian workflow

I write in Obsidian and want posts to reach the site without ceremony.

Set up `src/content/projects/` as an Obsidian vault (or a folder inside one) and
handle the friction points:
- Configure and document the Obsidian settings that matter: use Markdown links not
  wikilinks, set the attachment folder to the post's colocated images folder, turn
  on Properties for frontmatter editing.
- Add a remark plugin that converts `[[wikilinks]]` to real links anyway, so a
  stray one doesn't break the build.
- Put a project template in the vault's template folder matching the schema exactly.
- Document the push path in the README: Obsidian Git plugin auto-commits and pushes
  on a timer, GitHub Actions builds and deploys. Give me the exact plugin settings.
- `pnpm run new "Post Title"` should scaffold a correctly-structured post.

## Deployment

- GitHub Actions workflow: install, build, run Pagefind, deploy to GitHub Pages.
- Set `site` and `base` in `astro.config.mjs` correctly for a project-pages URL, and
  leave a comment showing exactly what to change for a custom domain at the root.
- Include a `CNAME` file, commented out or documented, and put custom domain DNS
  setup in the README (both apex and www).
- CI should fail on a broken internal link and on a schema violation.
- Add a `MIGRATION.md` covering the exact steps to move to Cloudflare Pages or
  Netlify later, including what changes and what doesn't.

## Design direction

Quiet, dense, and legible. Think a well-typeset technical memo, not a portfolio
template. My whole edge here is that the writing is good and easy to find.

- One typeface family, two at most, chosen deliberately. Set a real type scale.
  Body text under 80 characters per line.
- Headings in sentence case, no trailing periods, and never allowed to break mid-word.
- Restrained palette. Ink on paper, one accent used for links and nothing else.

**Accent: Texas A&M maroon.** Start from `#500000` and build a single ramp:

```
--maroon-900: #500000   /* light-mode links, active nav, rules */
--maroon-800: #6E1A1A
--maroon-600: #9E4646
--maroon-400: #C47878
--maroon-300: #E09A9A   /* dark-mode links and active nav */
--maroon-050: #F4EAEA   /* light-mode tag pill background */
--maroon-950: #3A1E1E   /* dark-mode tag pill background */
```

`#500000` is dark enough that it doesn't read as a link on its own, so links get a
persistent underline, not color alone. The accent appears on links, the active nav
item, tag pills, and horizontal rules — nowhere else. No maroon buttons, no maroon
headings, no maroon backgrounds larger than a tag pill. If you find yourself reaching
for it a fifth time, stop.

Give me one alternate palette proposal alongside the maroon one so I can compare
before committing — something with a more legible link color, on the theory that
school colors aren't obligatory.

**Dark mode is a first-class requirement, not a filter over the light theme.**
Respect `prefers-color-scheme` on first visit, provide a toggle, persist the choice,
and set it before first paint so there's no flash. Both modes get the same care:
check contrast on body text, muted metadata, code blocks, tag pills, and images with
white backgrounds (schematics and CAD renders will glare in dark mode — handle that,
probably with a subtle surface behind them rather than inverting).
- Motion only in response to my clicks. No scroll reveals, no card hover lifts.
- Mobile-first. Recruiters open links on phones.
- A print stylesheet, so a project page prints cleanly to PDF.

Avoid these specifically — they are the current tells of a generated site and they'd
undercut the whole point:
- warm cream background with a terracotta accent
- ALL-CAPS tracked-out eyebrow labels above headings
- metadata strings joined with middle dots
- an arrow appended to every link
- every piece of content chopped into identical rounded cards with the same shadow
- a gradient anywhere

Before you write CSS, propose a short token system (4–6 named colors, the typefaces
and their roles, spacing scale, a layout sketch) and let me approve it.

## Also build these

- A `<Theme>` MDX component for the named-section pattern I liked on the reference
  site: a heading, one image, and a paragraph, laid out in a responsive row that
  degrades to a single column on mobile. Images in a row share a fixed aspect ratio
  so nothing looks ragged.
- A metadata strip component built from an array, so a missing field never leaves a
  dangling separator.
- RSS feed, sitemap, `robots.txt`
- Per-page OG images generated at build time from the title and summary
- Copy-to-clipboard on code blocks, with the language labeled
- Reading time and a table of contents on longer posts
- Lazy-loaded, responsive images with required alt text (fail the build if missing)
- A privacy-friendly analytics hook, left disabled, with a comment on how to enable
- Lighthouse budget in CI: 95+ on performance and accessibility, no exceptions
- **An export-control lint step.** I work adjacent to defense. Add a
  `pnpm run check:sensitive` script that greps posts for a configurable blocklist
  (ITAR, EAR, CUI, export controlled, specific program names I add) and refuses to
  build if it hits one without an explicit override in the frontmatter. This is a
  seatbelt, not legal advice, and the README should say so.

## Don't

- Don't add a CMS, a comment system, a newsletter signup, or social embeds.
- Don't add animation libraries, icon packs beyond a handful of inline SVGs, or a
  component library.
- Don't ship client JS for anything that can be done at build time.
- Don't write filler copy. Where you need placeholder content, write two or three
  realistic sample project posts in my domain with plausible technical detail, and
  mark them clearly as samples so I know what to delete.

## How to work

Phase-gated. Stop and show me the result at each checkpoint before continuing.

1. **Scaffold + content model.** Astro project, schema, three sample posts, a bare
   home page listing them. Checkpoint: `pnpm dev` runs, schema rejects a bad post.
2. **Design pass.** Propose two palettes (maroon and one alternate), get approval,
   then build the layout, project page, typography, and both color modes.
   Checkpoint: I look at it on desktop and phone, in light and dark.
3. **Taxonomy and filtering.** Filter UI, tag pages, skills index.
4. **Search phase 1.** Pagefind, synonym layer, search page and header input.
   Checkpoint: I search "X band" and get the phased array post.
5. **Deploy.** Actions workflow, GitHub Pages live, README written.
6. **Obsidian wiring.** Template, plugin config, documented push path.
7. **Extras.** RSS, OG images, math, Mermaid, print CSS, CI checks.
8. **Search phase 2.** Semantic layer, only if we still want it.

Write a `CLAUDE.md` as you go that captures the architecture, the content schema,
the conventions, and how to add a post — so future sessions pick up cleanly.

Ask me questions when a decision is actually mine to make. Don't ask permission for
implementation details.

Start with phase 1.
