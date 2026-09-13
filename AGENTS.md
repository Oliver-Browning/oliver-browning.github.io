# Engineering portfolio site

Static Astro site for an engineering student's project write-ups. Built
phase-gated against `portfolio-site-prompt.md` at the repo root — read that
file for the full spec and design intent; this file tracks what's actually
been built and the conventions to keep consistent as it grows.

## Status

Phases 1 (scaffold + content model) and 2 (design pass) are done. Phases 3+
(taxonomy/filtering UI, search, deploy, Obsidian wiring, extras) are not
started yet.

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

Not yet added: Pagefind, remark-math/rehype-katex, Mermaid. These come in
the search and extras phases.

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

## Known gotchas

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
