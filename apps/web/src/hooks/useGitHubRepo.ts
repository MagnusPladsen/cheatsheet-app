import { useState, useCallback } from "react";

const STORAGE_KEY = "cheatsheet_github_repos";
// Migration: old single-repo key
const LEGACY_KEY = "cheatsheet_github_repo";

export interface GitHubRepo {
  owner: string;
  repo: string;
}

export function parseRepoInput(input: string): GitHubRepo | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s]+)\/([^/\s#?]+)/
  );
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, "") };
  }

  const slashMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (slashMatch) {
    return { owner: slashMatch[1], repo: slashMatch[2].replace(/\.git$/, "") };
  }

  return null;
}

function repoKey(r: GitHubRepo): string {
  return `${r.owner}/${r.repo}`;
}

function dedupe(repos: GitHubRepo[]): GitHubRepo[] {
  const seen = new Set<string>();
  return repos.filter((r) => {
    const k = repoKey(r);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function loadRepos(): GitHubRepo[] {
  try {
    // Try new multi-repo key
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // Migrate from legacy single-repo key
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (parsed.owner && parsed.repo) {
        const repos = [parsed];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(repos));
        localStorage.removeItem(LEGACY_KEY);
        return repos;
      }
    }
  } catch {}
  return [];
}

function saveRepos(repos: GitHubRepo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(repos));
}

export function useGitHubRepos() {
  const [repos, setReposState] = useState<GitHubRepo[]>(loadRepos);

  const addRepo = useCallback((input: string): boolean => {
    const parsed = parseRepoInput(input);
    if (!parsed) return false;
    setReposState((prev) => {
      const next = dedupe([...prev, parsed]);
      saveRepos(next);
      return next;
    });
    return true;
  }, []);

  const removeRepo = useCallback((index: number) => {
    setReposState((prev) => {
      const next = prev.filter((_, i) => i !== index);
      saveRepos(next);
      return next;
    });
  }, []);

  const clearRepos = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setReposState([]);
  }, []);

  return { repos, addRepo, removeRepo, clearRepos };
}
