# Engineering portfolio — Oliver Browning

A static Astro site for project write-ups. See `CLAUDE.md` for architecture,
the content schema, and how to add a post.

## Commands

| Command         | Action                                      |
| :--------------- | :------------------------------------------ |
| `pnpm install`   | Install dependencies                        |
| `pnpm dev`       | Local dev server at `localhost:4321`        |
| `pnpm build`     | Build the production site to `./dist/`      |
| `pnpm preview`   | Preview the production build locally        |
| `pnpm run check` | Type-check the whole project                |

## Status

Phases 1 (scaffold + content model) and 2 (design pass) are complete: Astro
7 in static mode, a Zod-validated content schema for `projects` and `notes`,
three sample write-ups (marked as samples — replace or delete them), and a
full light/dark design system (Texas A&#38;M maroon accent, Source Serif 4 +
IBM Plex Mono, responsive layout, print stylesheet). `/resume` and `/about`
have placeholder content — replace it with the real thing.

Taxonomy/filtering, search, deployment, and Obsidian wiring come in later
phases; this README will grow alongside them.
