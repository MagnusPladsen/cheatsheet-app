import { useState, useCallback } from "react";

const STORAGE_KEY = "cheatsheet_github_repo";

export interface GitHubRepo {
  owner: string;
  repo: string;
}

const DEFAULT_REPO: GitHubRepo = { owner: "MagnusPladsen", repo: "dotfiles" };

function parseRepoInput(input: string): GitHubRepo | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Handle full GitHub URLs: https://github.com/owner/repo
  const urlMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s]+)\/([^/\s#?]+)/
  );
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, "") };
  }

  // Handle owner/repo format
  const slashMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (slashMatch) {
    return { owner: slashMatch[1], repo: slashMatch[2].replace(/\.git$/, "") };
  }

  return null;
}

function loadRepo(): GitHubRepo {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_REPO;
    const parsed = JSON.parse(raw);
    if (parsed.owner && parsed.repo) return parsed;
  } catch {}
  return DEFAULT_REPO;
}

export function useGitHubRepo() {
  const [repo, setRepoState] = useState<GitHubRepo>(loadRepo);
  const isDefault =
    repo.owner === DEFAULT_REPO.owner && repo.repo === DEFAULT_REPO.repo;

  const setRepo = useCallback((input: string): boolean => {
    const parsed = parseRepoInput(input);
    if (!parsed) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    setRepoState(parsed);
    return true;
  }, []);

  const resetRepo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRepoState(DEFAULT_REPO);
  }, []);

  return { repo, setRepo, resetRepo, isDefault };
}
