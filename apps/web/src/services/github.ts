import { getCached, setCache } from "./cache.ts";

const GITHUB_API_BASE = "https://api.github.com";

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
): Promise<string> {
  const cacheKey = `${owner}/${repo}/${path}`;
  const cached = getCached<string>(cacheKey);
  if (cached !== null) return cached;

  // Try raw.githubusercontent with common default branches
  for (const branch of ["main", "master"]) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    const res = await fetch(url);
    if (res.ok) {
      const content = await res.text();
      setCache(cacheKey, content);
      return content;
    }
  }

  // Fallback to API (uses repo's actual default branch)
  const apiUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;
  const apiRes = await fetch(apiUrl, {
    headers: { Accept: "application/vnd.github.v3.raw" },
  });
  if (!apiRes.ok) throw new Error(`Failed to fetch ${path}: ${apiRes.status}`);
  const content = await apiRes.text();
  setCache(cacheKey, content);
  return content;
}

export async function fetchAllFiles(
  owner: string,
  repo: string,
  paths: string[],
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const fetches = paths.map(async (path) => {
    try {
      const content = await fetchFileContent(owner, repo, path);
      results.set(path, content);
    } catch (err) {
      console.warn(`Failed to fetch ${path}:`, err);
    }
  });
  await Promise.all(fetches);
  return results;
}
