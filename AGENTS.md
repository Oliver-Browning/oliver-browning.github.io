# Engineering portfolio site

Static Astro site for an engineering student's project write-ups. Built
phase-gated against `portfolio-site-prompt.md` at the repo root — read that
file for the full spec and design intent; this file tracks what's actually
been built and the conventions to keep consistent as it grows.

## Status

Phases 1 (scaffold + content model), 2 (design pass), 3
(taxonomy/filtering), and 4 (search phase 1) are done. Deploy, Obsidian
wiring, extras, and search phase 2 (semantic search) are not started yet.

## Stack

- Astro 7, `output: 'static'`, TypeScript strict, Node 22+
- Content collections (glob loader) with a Zod schema in `src/content.config.ts`
- MDX enabled (`@astrojs/mdx`) — pin to a version whose peer range matches the
  installed Astro version; `@astrojs/mdx` majors track Astro majors loosely,
  they are not 1:1, so check `npm view @astrojs/mdx@<version> peerDependencies`
  before bumping either package.
- Tailwind CSS v4 via `@tailwindcss/vite` (the Vite plugin, not a PostCSS
  config or `@astrojs/tailwind` — that integration is v3-era). Wired into
  `astro.config.mjs`'s `vite.plugins`. In practice, most components use
  hand-written scoped `<style>` blocks reading the CSS custom-property
  tokens rather than Tailwind utility classes — the design is specific
  enough (technical-memo type scale, CSS-border metadata dividers) that
  utilities didn't buy much; Tailwind is there for anyone who wants it for
  new components.
- Fonts are self-hosted via `@fontsource/source-serif-4` and
  `@fontsource/ibm-plex-mono` (imported per-weight in `Layout.astro`), not
  loaded from Google Fonts — no external request at runtime, works offline,
  nothing to break if a CDN is unreachable.
- `@astrojs/check` + `@types/node` as devDependencies — `pnpm run check`
  type-checks the whole project, including `content.config.ts`.
- pnpm as package manager (`pnpm-workspace.yaml` holds `onlyBuiltDependencies`
  for `esbuild` — pnpm's newer build-approval gate needs it there, not in
  `package.json`)
- `pagefind` (search, see below), `tsx` (runs the `.ts` maintenance scripts
  in `scripts/` outside of Astro/Vite), `gray-matter` (frontmatter parsing
  for `scripts/check-synonyms.ts`) as devDependencies.

Not yet added: remark-math/rehype-katex, Mermaid, semantic search (search
phase 2). These come in the extras and search phase 2 work.

## Content model

Two collections, same schema (`writeupSchema` in `src/content.config.ts`):
- `src/content/projects/` — the main write-ups
- `src/content/notes/` — shorter technical notes

Both accept `.md` and `.mdx`. `type` (one of `project | note | teardown |
coursework`) is the semantic label a post carries, independent of which
collection/directory it lives in — a `teardown` can live under `notes/`.

**Controlled vocabulary:** `domains` and `tech` must come from the lists in
`src/data/taxonomy.ts`. This is deliberate — it's what stops `rf` / `RF` /
`radio-frequency` from coexisting as three tags. Using a value not in those
lists fails the build with the bad value and a pointer to register it there.
`skills` and `keywords` are intentionally free text (resume phrasing and
search aliases don't belong to a fixed vocabulary the way domains/tech do).

The schema uses `.strict()`, so an unrecognized frontmatter key also fails
the build loudly rather than being silently ignored — catches typos like
`domian:` immediately.

`summary` is capped at 220 characters so index cards stay uniform.

`hero` is an optional colocated image. If it's set, `heroAlt` becomes
required — a `.refine()` on the schema fails the build with "heroAlt is
required whenever hero is set" if you add a photo without alt text. This is
the direct fix for a defect on the reference site (`davisryan.tech`) that
had an image with keyboard-mash alt text in production.

### How to add a post

1. Copy an existing file in `src/content/projects/` (or `notes/`) as a
   starting point for frontmatter shape.
2. Fill in the frontmatter — see the schema in `src/content.config.ts` for
   the exact fields and `src/data/taxonomy.ts` for allowed `domains`/`tech`
   values. `pnpm build` will fail with a clear message if something's wrong.
3. Write the body in Markdown (or MDX if you need a component).
4. `draft: true` keeps a post out of production builds while still visible
   in `pnpm dev`.

(A `pnpm run new "Post Title"` scaffolding script and an Obsidian vault
template are planned for the Obsidian-wiring phase — not built yet.)

## Sample content

The three posts currently in `src/content/` (`x-band-phased-array-beamformer`,
`cubesat-power-board`, `sdr-front-end-teardown`) are placeholder samples with
a "Sample post" callout at the top of each — written to exercise the schema
and the listing page. Replace or delete them once real write-ups exist. They
also demonstrate the three `status` values and one `in-progress` post, which
is meant to show plainly on the index rather than look unfinished.

## Design system

All tokens live in `src/styles/global.css`. 6 semantic CSS custom properties
drive everything — `--bg`, `--text`, `--muted`, `--accent`, `--border`,
`--surface` — defined once on bare `:root` (light values), redefined under
`@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`,
and redefined again under `:root[data-theme="dark"]` so the manual toggle
wins either direction. No component should ever hardcode a hex value —
everything reads these variables, which is what makes swapping the whole
palette a single edit.

**Active palette: Maroon** (`#500000` light-mode accent / `#E09A9A` dark).
**Saved alternate: Blueprint** (`#1E4C7A` / `#8FC1E8`, a drafting-ink blue)
— its full token block is commented out directly below the active one in
`global.css`. To switch: swap which block is commented. Don't delete the
Blueprint block without asking first; it's there because the site owner
asked to keep it as an option.

Typography: two families only, per the site owner's explicit constraint.
**Source Serif 4** for headings and body (reads like a typeset lab report).
**IBM Plex Mono** for metadata, nav labels, tag pills, and code — literally
designed for technical documentation, which is doing double duty as the
"this is a memo, not a landing page" signal. Type scale is 6 steps,
`--text-xs` through `--text-2xl`, also in `global.css`. Body/article content
is capped at `--prose-width` (68ch); the outer page container is
`--content-width` (46rem).

**Metadata strip** (`src/components/MetadataStrip.astro`): takes an array
of `{ label, pill?, statusInProgress? }` items and renders each as its own
`<li>`. Dividers are a CSS `border-inline-start` on all but the first
child — there is no separator character anywhere, so there's no join logic
that could leave a dangling separator, and no risk of reintroducing a
middle-dot join (the reference site's readme explicitly called out both
defects). `domains`/`tech` render as pills (the one place besides links/nav
the accent color is allowed to appear, along with an `in-progress` status,
which gets a pill specifically so it "shows plainly" per the site owner's
requirement that in-progress work is normal, not something to hide).

**Nav routing decisions**, since the spec's Pages section doesn't define a
standalone `/projects` index: "Projects" links to `/#projects`, the anchor
around the index grid on the home page, rather than a separate route that
isn't specified anywhere. "Resume" links to a real (if placeholder-content)
`/resume` page — built now specifically so the nav has no dead link. The
header search icon is a non-interactive placeholder (`title` tooltip, no
`href`) until Search phase 1 actually builds `/search`; making it a live
link before that page exists would be exactly the kind of dead link the
spec's "don't leave things you didn't put there" rule is about.

**Dark mode**: `src/layouts/Layout.astro` has a blocking inline `<script>`
in `<head>` that sets `data-theme` on `<html>` *only* when `localStorage`
has an explicit stored choice — the no-choice case needs no JS at all,
since the `prefers-color-scheme` media query in `global.css` already
handles it at first paint. `src/components/ThemeToggle.astro` handles the
click and persists the choice. This split is what avoids both FOUC and
unnecessary JS.

**Images**: schematics/CAD renders drawn on a white background get a
`class="schematic"` on the `<img>` in Markdown/MDX to pick up a light
surface behind them in dark mode (`.prose img.schematic` in `global.css`),
instead of inverting the image.

Not built yet: the `<Theme>` MDX component (named-section: heading + image
+ paragraph), reading time, table of contents. These are in "Also build
these" in the spec, not tied to a specific numbered phase — planned for
the extras pass.

## Taxonomy pages and filtering

`src/components/EntryCard.astro` is the one place a post renders as a
grid entry — used by the home page and every `/tags/[tag]` and
`/tech/[tool]` archive page, so the thumbnail/no-thumbnail layout and the
metadata strip can't drift out of sync between them. It stamps
`data-type`/`data-domains` on its root element, which is what the home
page's filter script reads.

**Archive pages** (`src/pages/tags/[tag].astro`, `src/pages/tech/[tool].astro`):
`getStaticPaths` only generates a page for a taxonomy value that at least
one published post actually uses — filtered against `DOMAINS`/`TECH` from
`src/data/taxonomy.ts`. A tag with zero posts gets no route at all, so
every pill (`domains`/`tech` on `MetadataStrip`) can link to its archive
page unconditionally, knowing the target always exists. `tech` values can
contain spaces ("CST Studio"), so `src/utils/slug.ts` (`techSlug`) turns
them into URL segments — it's imported everywhere a `/tech/` link or the
`[tool]` route itself needs that mapping, so they can't drift apart.

**`/skills`** groups by domain, then by skill within that domain, linking
each skill to the post(s) whose `skills` array includes it. A post with
multiple domains shows the same skill under each of its domains — that's
intentional, not a dedup bug, since a hiring manager scanning by domain
should see everything relevant to that domain in one place.

**Home page filters** (`src/pages/index.astro`): computed facets (`type`,
`domain`) are client-side only — `getStaticPaths` can't help here since
the whole point is filtering without a page reload. A facet only renders
if it has more than one distinct value among published posts; the site
owner's spec explicitly says not to show a filter that "filters nothing,"
so a facet where every post shares the same value stays hidden rather
than being manually toggled off. State lives in `?type=a,b&domain=c` query
params (comma-separated, OR within a facet, AND across facets), synced via
`history.replaceState` — so a filtered view is a shareable link, and
clicking filters doesn't spam browser history. No pagination is
implemented (spec: not until 20+ posts).

## Search

Pagefind indexes the built site, not the dev server — `pnpm run build`
runs `astro build && pagefind --site dist`, and the index only exists
under `dist/pagefind/` afterward. **`astro dev` cannot search** (there's
nothing to query yet); to actually test search, run `pnpm build && pnpm
preview` and use that server. `/search` detects this and shows "Search
isn't available in dev mode" instead of silently doing nothing.

**Indexing scope**: `data-pagefind-body` is on the `<article>` wrapper in
`src/pages/projects/[id].astro` and `notes/[id].astro` only. Once *any*
element on the site has that attribute, Pagefind indexes *only* elements
with it, sitewide — so every other page (home, tags, skills, about, résumé)
is automatically excluded from search results without needing
`data-pagefind-ignore` there too. `data-pagefind-ignore` is still on the
header/footer, per the spec's explicit instruction, even though it's
redundant with the above — cheap insurance if the body-scoping ever
changes.

**Ranking**: title match > keywords/skills/tech match > body match, done
via `data-pagefind-weight` (10 on the `<h1>`, 5 on a `.visually-hidden`
block holding `keywords`/`skills`/`tech`, default ~1 on body prose) rather
than any custom scoring — Pagefind's own ranking handles the ordering once
the weights are set. `keywords` are real content only Pagefind sees: they
live in that same hidden block, weighted, never rendered to a reader.
`domains`/`skills`/`tech` also get `data-pagefind-filter` so they're
queryable as Pagefind filters, and `title`/`summary`/`date`/`status` get
`data-pagefind-meta` so `/search` can render a result without a second
fetch.

**Synonym expansion** (`src/data/synonyms.ts` + `src/utils/synonymGraph.ts`):
edges are written one-directional in the data file; `buildSynonymGraph()`
derives the reverse edge for every entry, and `expandQuery()` walks up to
`MAX_TRANSITIVE_HOPS` (1) further hops outward, capped so the graph can't
collapse into one blob as it grows. Both the `/search` page's client script
and `scripts/check-synonyms.ts` import this same module, so the graph logic
only exists once.

**Why `/search` runs one Pagefind search per term instead of one combined
query** — this was a real bug caught while testing, not a design up front:
Pagefind's `search()` ANDs every word within a single call. Concatenating
the original query with a dozen expansion terms into one string meant a
page had to contain *all* of them to match anything, so nothing ever did.
The fix (`src/pages/search.astro`) runs a separate `search()` call per term
— the original query at full weight, each expansion term at half weight —
and merges results by summing scores per result `id`, so a direct match on
what was actually typed still ranks above a match that only hit a synonym.
Keep this in mind before ever going back to a single combined query string.

**Also caught while testing**: the search page originally read `?q=` from
`Astro.url.searchParams` in the component frontmatter. That works in dev
(there's a server), but this site is fully static — the prerendered
`search/index.html` is fixed at build time and can't see a runtime query
string at all. The initial query has to be read client-side instead
(`new URLSearchParams(location.search)` in the `<script>`), which is what
it does now. Any future page that wants to react to a query param needs
the same client-side approach, not an `Astro.url` read in frontmatter.

Run `pnpm run synonyms:check` after adding posts or synonym entries — it
flags graph terms that appear in no post (dead weight, expected to be a
long list early on and shrink as content grows) and post `keywords` that
aren't connected to any synonym entry (a missed opportunity, worth adding).
It's informational only and always exits 0.

## Known gotchas

- **Never write `&amp;`/`&#38;` in a JS string or component prop** — only in
  raw template text. `<p>Texas A&#38;M</p>` renders correctly (the browser
  decodes the entity), but `title="... A&#38;M"` on a component, or
  `{ label: 'Texas A&#38;M' }` in an object literal, does not: that string
  is a literal JS value, not HTML, so it isn't decoded, and when Astro
  later interpolates it into markup its own escaping doubles up the `&`
  into `&amp;#38;`. This actually happened (the resume page's `description`
  prop and a `MetadataStrip` item both showed literal `&#38;` text on the
  rendered page). The fix that always works in both positions: just type a
  real `&` character — Astro's escaping handles turning it into `&amp;` in
  the final HTML wherever that's needed, so there's never a reason to
  hand-encode it yourself.
- **Dates and timezones:** frontmatter `date` is a bare `YYYY-MM-DD`, which
  `z.coerce.date()` parses as UTC midnight. Any `toLocaleDateString` call on
  it must pass `timeZone: 'UTC'`, or dates render one day early in timezones
  behind UTC. All current date-formatting call sites do this — keep it that
  way in new ones.
- **GitHub Pages `base`:** the repo is named `oliver-browning.github.io`,
  which GitHub treats as a special-cased "user site" repo served at the
  domain root — so `astro.config.mjs` sets `site` but no `base`. If the repo
  is ever renamed to a project-pages-style name, `base: '/<repo-name>'` needs
  to be added. Moving to a custom domain later is a one-line change to `site`
  (see the comment in `astro.config.mjs`; `MIGRATION.md` will cover the full
  provider-swap path once written in the deploy phase).

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and
`astro dev logs`.

## Astro documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
