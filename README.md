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
| `pnpm run synonyms:check` | Lint the search synonym graph against content |

## Status

Phases 1–4 are complete: scaffold + content model, a full light/dark design
system (Texas A&M maroon accent, Source Serif 4 + IBM Plex Mono), taxonomy
pages (`/tags`, `/tech`, `/skills`) with client-side home-page filtering,
and search (Pagefind + a domain synonym layer at `/search`). `/resume` and
`/about` still have placeholder content — replace it with the real thing.

Search only works against a production build, not `pnpm dev` — run `pnpm
build && pnpm preview` to try it locally. See `CLAUDE.md` for why.

Deployment and Obsidian wiring come in later phases; this README will grow
alongside them.
