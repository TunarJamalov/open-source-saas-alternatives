# Catalog website

Static site for the catalog, deployed on Vercel from the `site/` directory of this repository.

- `src/data/projects.json`: the catalog content (projects, statuses, planned and not-planned entries).
- `src/data/github-cache.json`: stars, contributors, releases and last commits fetched from the GitHub API. Committed so a build never depends on API limits.
- `scripts/fetch-github.mjs`: refreshes the cache. Uses `GITHUB_TOKEN` when set; without network access it keeps the committed cache.
- `scripts/build.mjs`: generates `dist/` with one page per project, `feed.json`, `sitemap.xml` and `robots.txt`.
- `public/`: stylesheet and favicon copied as-is.

```sh
cd site
npm run build          # refresh GitHub data (if possible) and build
npm run build:offline  # build from the committed cache only
npm run preview        # serve dist/ on http://localhost:4173
```

No dependencies, no framework. Node.js 22 or newer.

## Deploying on Vercel

Import the repository on Vercel, set **Root Directory** to `site`, and keep the detected settings (`npm run build`, output `dist`). Add a `GITHUB_TOKEN` environment variable (a fine-grained token with public repository read access) so every deploy refreshes stars and contributors; without it the committed cache is used.

A GitHub Actions workflow refreshes the cache weekly and commits it, which triggers a new deploy.

## Adding a project

Add an entry to `src/data/projects.json` and a repository name to the list it builds from; the page, feed and sitemap are generated. Follow the rules in [CONTRIBUTING.md](../CONTRIBUTING.md).
