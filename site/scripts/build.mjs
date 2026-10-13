/**
 * Static site generator for the catalog. No framework: reads projects.json and the GitHub
 * cache, writes dist/ with one page per project, a JSON feed and a sitemap.
 */
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const out = new URL('dist/', root);
const data = JSON.parse(await readFile(new URL('src/data/projects.json', root), 'utf8'));
const cache = JSON.parse(await readFile(new URL('src/data/github-cache.json', root), 'utf8'));
const builtAt = new Date();

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const repoUrl = (repo) => `https://github.com/${data.owner}/${repo}`;
const dateText = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'n/a');
const ago = (iso) => {
  if (!iso) return 'unknown';
  const days = Math.floor((builtAt - new Date(iso)) / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months < 12 ? `${months} month${months > 1 ? 's' : ''} ago` : `${Math.floor(months / 12)} year${months >= 24 ? 's' : ''} ago`;
};
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const gh = (project) => cache.repos[project.repo] ?? { stars: 0, contributors: [], release: null, lastCommit: null, topics: [] };

const icons = {
  github: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>',
  arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
};

const themeScript = `(function(){try{var q=new URLSearchParams(location.search).get('theme');var t=q==='light'||q==='dark'?q:localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`;
const toggleScript = `(function(){var b=document.getElementById('theme-toggle');if(!b)return;var r=document.documentElement;function cur(){var a=r.getAttribute('data-theme');if(a)return a;return window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}function paint(){var d=cur()==='dark';b.innerHTML=d?${JSON.stringify(icons.sun)}:${JSON.stringify(icons.moon)};b.setAttribute('aria-label',d?'Switch to light theme':'Switch to dark theme')}b.onclick=function(){var n=cur()==='dark'?'light':'dark';r.setAttribute('data-theme',n);try{localStorage.setItem('theme',n)}catch(e){}paint()};paint()})();`;

function layout({ title, description, path, body }) {
  const url = `${data.siteUrl}${path}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#f3f5f3" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#121614" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400&display=swap">
<link rel="stylesheet" href="/styles.css">
<script>${themeScript}</script>
</head>
<body>
<header class="site-header"><div class="wrap">
<a class="brand" href="/"><span class="brand-mark" aria-hidden="true"></span>Self-hosted alternatives</a>
<nav class="site-nav">
<a href="/#projects">Projects</a>
<a class="optional" href="/#how">How entries are judged</a>
<a href="${repoUrl(data.catalogRepo)}" rel="noopener">GitHub</a>
<button class="theme-toggle" id="theme-toggle" type="button" aria-label="Switch theme"></button>
</nav>
</div></header>
<main>${body}</main>
<footer class="site-footer"><div class="wrap">
<span>MIT licensed catalog. Each project is its own repository with its own license.</span>
<span><a href="${repoUrl(data.catalogRepo)}/blob/main/CONTRIBUTING.md" rel="noopener">Contribute</a> &nbsp;&middot;&nbsp; <a href="/feed.json">JSON feed</a> &nbsp;&middot;&nbsp; Data refreshed ${esc(dateText(cache.fetchedAt))}</span>
</div></footer>
<script>${toggleScript}</script>
</body>
</html>
`;
}

const statusBadge = (status) => `<span class="status ${esc(status)}">${esc(data.statuses[status]?.label ?? status)}</span>`;
const avatars = (contributors) =>
  `<span class="avatars" aria-label="${plural(contributors.length, 'contributor')}">${contributors
    .slice(0, 5)
    .map((c) => `<img src="${esc(c.avatar)}&s=56" alt="${esc(c.login)}" width="28" height="28" loading="lazy">`)
    .join('')}</span>`;

function projectRow(project) {
  const g = gh(project);
  return `<a class="project" href="/projects/${esc(project.slug)}/">
<div><div class="title"><h3>${esc(project.name)}</h3>${statusBadge(project.status)}</div><div class="alt">Alternative to ${esc(project.alternativeTo)}</div></div>
<p class="summary">${esc(project.summary)}</p>
<div class="meta">${avatars(g.contributors)}<span>${plural(g.contributors.length, 'contributor')}</span><span>${g.release ? esc(g.release.tag) : 'no release'}</span></div>
</a>`;
}

function homePage() {
  const ready = data.projects.filter((p) => p.status === 'ready').length;
  const ledger = data.projects
    .map((p) => `<div class="ledger-row"><div><div class="name">${esc(p.name)}</div><div class="alt">${esc(p.alternativeTo)}</div></div>${statusBadge(p.status)}</div>`)
    .join('');
  const body = `
<div class="wrap">
<div class="hero">
<div>
<h1>Self-hosted alternatives to paid SaaS.</h1>
<p class="lede">Small open-source tools that replace a subscription and run on one server. Every entry is a real repository with tests, releases and an honest list of limitations.</p>
<div class="hero-actions"><a class="btn primary" href="#projects">Browse projects ${icons.arrow}</a><a class="btn" href="${repoUrl(data.catalogRepo)}/blob/main/CONTRIBUTING.md" rel="noopener">${icons.github} Add a project</a></div>
</div>
<div class="ledger">${ledger}<div class="ledger-foot">${ready} of ${data.projects.length} ready to use today</div></div>
</div>
</div>

<section id="projects"><div class="wrap">
<div class="section-head"><h2>Projects</h2><p>Each one is a single Node.js process with a SQLite file, a dashboard, and a systemd unit or Docker image. Pick one, read its README, run it in ten minutes.</p></div>
<div class="projects">${data.projects.map(projectRow).join('')}</div>
</div></section>

<section id="how"><div class="wrap">
<div class="section-head"><h2>How entries are judged</h2><p>Status describes maturity honestly. It never implies that every feature of the original product exists here.</p></div>
<div class="legend">${Object.entries(data.statuses)
    .map(([key, s]) => `<div>${statusBadge(key)}<p>${esc(s.description)}</p></div>`)
    .join('')}</div>
</div></section>

<section><div class="wrap">
<div class="split">
<div class="card"><h3>What every project shares</h3><ul>
<li>TypeScript, Express and SQLite. No Redis, no Postgres, no queue, no account.</li>
<li>Password sign-in with optional TOTP two-factor authentication for the admin pages.</li>
<li>Lint, tests, build and a dependency audit in CI, Dependabot, tagged releases.</li>
<li>A SECURITY.md with a private reporting channel and a README that documents limitations.</li>
</ul></div>
<div class="card"><h3>Planned and not planned</h3>
${data.planned.map((p) => `<p><strong>${esc(p.name)}</strong> as an alternative to ${esc(p.alternativeTo)}. ${esc(p.note)}</p>`).join('')}
${data.notPlanned.map((n) => `<p style="margin-top:12px"><strong>No ${esc(n.alternativeTo)} alternative.</strong> ${esc(n.reason)} Use <a href="${esc(n.useInstead.url)}" rel="noopener">${esc(n.useInstead.name)}</a>.</p>`).join('')}
</div>
</div>
</div></section>`;
  return layout({
    title: 'Self-hosted, open-source alternatives to paid SaaS',
    description: `${data.projects.length} self-hosted tools that replace a subscription, each a single process with SQLite, tests and releases.`,
    path: '/',
    body,
  });
}

function projectPage(project) {
  const g = gh(project);
  const url = repoUrl(project.repo);
  const facts = [
    ['Status', statusBadge(project.status)],
    ['Maturity', esc(project.maturity)],
    ['Latest release', g.release ? `<a href="${esc(g.release.url)}" rel="noopener">${esc(g.release.tag)}</a>` : 'none yet'],
    ['Last commit', `${esc(ago(g.lastCommit?.date))}`],
    ['Stars', String(g.stars ?? 0)],
    ['License', esc(g.license ?? 'MIT')],
    ['Default port', String(project.port)],
  ]
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
    .join('');
  const contributors = g.contributors.length
    ? g.contributors
        .map((c) => `<a href="${esc(c.url)}" rel="noopener"><img src="${esc(c.avatar)}&s=72" alt="" width="36" height="36" loading="lazy"><span>${esc(c.login)}</span><span class="count">${plural(c.contributions, 'commit')}</span></a>`)
        .join('')
    : '<p class="muted">No contributor data yet.</p>';
  const body = `
<div class="wrap">
<div class="page-head">
<div>
<div class="crumbs"><a href="/">All projects</a> / ${esc(project.category)}</div>
<h1>${esc(project.name)}</h1>
<p class="tagline">A self-hosted alternative to ${esc(project.alternativeTo)}. ${esc(project.summary)}</p>
<div class="hero-actions"><a class="btn primary" href="${esc(url)}" rel="noopener">${icons.github} View on GitHub</a><a class="btn" href="${esc(url)}#readme" rel="noopener">Read the setup guide ${icons.arrow}</a></div>
</div>
<dl class="facts">${facts}</dl>
</div>
</div>

<section><div class="wrap"><div class="detail">
<div>
<div class="block"><h2>Why it exists</h2><p>${esc(project.problem)}</p></div>
<div class="block"><h2>What it does</h2><ul>${project.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>
<div class="block"><h2>Limitations</h2><ul>${project.limitations.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>
<div class="block"><h2>Run it</h2><pre><code>git clone ${esc(url)}.git
cd ${esc(project.repo)}
npm install
cp .env.example .env
npm run dev</code></pre><p class="muted" style="margin-top:10px">Then open <code>http://localhost:${project.port}/dashboard</code>. A Dockerfile and a systemd unit are in the repository.</p></div>
</div>
<aside class="aside">
<div class="block"><h3>Contributors</h3><div class="contrib">${contributors}</div></div>
<div class="block"><h3>Stack</h3><div class="chips">${project.stack.map((s) => `<span>${esc(s)}</span>`).join('')}</div></div>
${g.topics?.length ? `<div class="block"><h3>Topics</h3><div class="chips">${g.topics.map((t) => `<span>${esc(t)}</span>`).join('')}</div></div>` : ''}
<div class="block"><h3>Links</h3><ul><li><a href="${esc(url)}" rel="noopener">Repository</a></li><li><a href="${esc(url)}/releases" rel="noopener">Releases</a></li><li><a href="${esc(url)}/issues" rel="noopener">Issues</a></li><li><a href="${esc(url)}/blob/main/SECURITY.md" rel="noopener">Security policy</a></li></ul></div>
</aside>
</div></div></section>`;
  return layout({
    title: `${project.name}, a self-hosted ${project.alternativeTo} alternative`,
    description: project.summary,
    path: `/projects/${project.slug}/`,
    body,
  });
}

function notFoundPage() {
  return layout({
    title: 'Page not found',
    description: 'This page does not exist.',
    path: '/404',
    body: `<div class="wrap"><div class="page-head"><div><h1>Page not found</h1><p class="tagline">The address may be wrong, or the project was renamed.</p><div class="hero-actions"><a class="btn primary" href="/">Back to the catalog</a></div></div></div></div>`,
  });
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(new URL('public/', root), out, { recursive: true });
await writeFile(new URL('index.html', out), homePage());
await writeFile(new URL('404.html', out), notFoundPage());
for (const project of data.projects) {
  const dir = new URL(`projects/${project.slug}/`, out);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL('index.html', dir), projectPage(project));
}
await writeFile(
  new URL('feed.json', out),
  JSON.stringify(
    {
      generatedAt: builtAt.toISOString(),
      projects: data.projects.map((p) => {
        const g = gh(p);
        return { ...p, repository: repoUrl(p.repo), page: `${data.siteUrl}/projects/${p.slug}/`, stars: g.stars, release: g.release?.tag ?? null, contributors: g.contributors.map((c) => c.login) };
      }),
    },
    null,
    2
  )
);
await writeFile(
  new URL('sitemap.xml', out),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['/', ...data.projects.map((p) => `/projects/${p.slug}/`)]
    .map((p) => `  <url><loc>${data.siteUrl}${p}</loc></url>`)
    .join('\n')}\n</urlset>\n`
);
await writeFile(new URL('robots.txt', out), `User-agent: *\nAllow: /\nSitemap: ${data.siteUrl}/sitemap.xml\n`);
console.log(`Built ${data.projects.length + 2} pages into dist/`);
