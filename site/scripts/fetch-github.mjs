/**
 * Refreshes src/data/github-cache.json from the GitHub API.
 * Runs at build time when a token is available; otherwise the committed cache is used,
 * so a deploy never fails because of API limits.
 */
import { readFile, writeFile } from 'node:fs/promises';

const dataFile = new URL('../src/data/projects.json', import.meta.url);
const cacheFile = new URL('../src/data/github-cache.json', import.meta.url);
const data = JSON.parse(await readFile(dataFile, 'utf8'));
const token = process.env.GITHUB_TOKEN;
const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'open-source-saas-alternatives-site',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function gh(path) {
  const response = await fetch(`https://api.github.com/${path}`, { headers });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}

async function repoData(name) {
  const [repo, contributors, release, commits] = await Promise.all([
    gh(`repos/${data.owner}/${name}`),
    gh(`repos/${data.owner}/${name}/contributors?per_page=50`),
    gh(`repos/${data.owner}/${name}/releases/latest`),
    gh(`repos/${data.owner}/${name}/commits?per_page=1`),
  ]);
  if (!repo) throw new Error(`Repository ${name} not found`);
  return {
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    license: repo.license?.spdx_id ?? null,
    pushedAt: repo.pushed_at,
    createdAt: repo.created_at,
    description: repo.description,
    topics: repo.topics ?? [],
    language: repo.language,
    contributors: (contributors ?? []).map((c) => ({ login: c.login, contributions: c.contributions, avatar: c.avatar_url, url: c.html_url })),
    release: release ? { tag: release.tag_name, publishedAt: release.published_at, url: release.html_url } : null,
    lastCommit: commits?.[0]
      ? { sha: commits[0].sha.slice(0, 7), date: commits[0].commit.committer.date, message: commits[0].commit.message.split('\n')[0] }
      : null,
  };
}

const names = [...data.projects.map((p) => p.repo), data.catalogRepo];
try {
  const repos = {};
  for (const name of names) repos[name] = await repoData(name);
  await writeFile(cacheFile, JSON.stringify({ fetchedAt: new Date().toISOString(), repos }, null, 2) + '\n');
  console.log(`GitHub data refreshed for ${names.length} repositories`);
} catch (error) {
  console.warn(`GitHub refresh skipped, using the committed cache: ${error.message}`);
}
