import { GITHUB_API_BASE } from "../constants";
import { getCached, setCache } from "./cache";

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  branch = "main"
): Promise<string> {
  const cacheKey = `${owner}/${repo}/${path}`;
  const cached = getCached<string>(cacheKey);
  if (cached !== null) return cached;

  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  const res = await fetch(url);

  if (!res.ok) {
    const apiUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;
    const apiRes = await fetch(apiUrl, {
      headers: { Accept: "application/vnd.github.v3.raw" },
    });
    if (!apiRes.ok) throw new Error(`Failed to fetch ${path}: ${apiRes.status}`);
    const content = await apiRes.text();
    setCache(cacheKey, content);
    return content;
  }

  const content = await res.text();
  setCache(cacheKey, content);
  return content;
}

export async function fetchAllFiles(
  files: { path: string; repoOwner: string; repoName: string; branch?: string }[]
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const fetches = files.map(async (f) => {
    try {
      const content = await fetchFileContent(f.repoOwner, f.repoName, f.path, f.branch);
      results.set(f.path, content);
    } catch (err) {
      console.warn(`Failed to fetch ${f.path}:`, err);
    }
  });
  await Promise.all(fetches);
  return results;
}
