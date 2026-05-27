# Agent guide for this repo

## Stack

- **Bun** (runtime, package manager, script runner) — use `bunx` not `npx`
- **SvelteKit 5** with `adapter-static` — static site, no server
- **GitHub Pages** — deployed via `.github/workflows/deploy.yml`

## Commands

| Action | Command |
|---|---|
| Dev server | `bun run dev` |
| Build | `bun run build` (outputs to `build/`) |
| Preview build | `bun run preview` |
| Typecheck | `bun run check` |
| Format | `bun run format` (prettier) |
| Lint | `bun run lint` (prettier --check) |

## Key config

- `paths.base = '/CuratedNewsletterAutomatingWebsite'` in `svelte.config.js` — required because GitHub Pages hosts at a subpath. All internal links must use SvelteKit's `{@link}` or `goto()` (which respect base); do NOT hardcode asset paths.
- All routes must export `export const prerender = true` (set globally in `src/routes/+layout.ts`).
- Build output `build/` is in `.gitignore` — the deploy workflow uploads it directly.
- Prettier: tabs, single quotes, no trailing commas, `prettier-plugin-svelte` for `.svelte` files.

## Deployment

Push to `main` → GitHub Actions builds and deploys automatically. Site at:
`https://automating-curated-newsletter.github.io/CuratedNewsletterAutomatingWebsite/`

Running `bun run build` locally is the fastest way to verify deployability.
