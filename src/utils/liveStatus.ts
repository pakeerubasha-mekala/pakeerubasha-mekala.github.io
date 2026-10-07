// Live data from the public GitHub API (no token; browser only). Results are cached for 5 minutes.
export interface DeployInfo {
  state: 'success' | 'failure' | 'running' | 'unknown';
  ago: string;
  sha: string;
}

export interface CommitInfo {
  sha: string;
  message: string;
  ago: string;
}

const TTL_MS = 5 * 60 * 1000;

async function gh<T>(path: string): Promise<T | null> {
  const key = `gh:${path}`;
  try {
    const cached = sessionStorage.getItem(key);
    if (cached) {
      const { t, data } = JSON.parse(cached) as { t: number; data: T };
      if (Date.now() - t < TTL_MS) return data;
    }
  } catch {}
  try {
    const res = await fetch(`https://api.github.com${path}`, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) return null;
    const data = (await res.json()) as T;
    try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), data })); } catch {}
    return data;
  } catch {
    return null;
  }
}

export function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export async function getDeploy(repo: string): Promise<DeployInfo | null> {
  const data = await gh<{ workflow_runs: { status: string; conclusion: string | null; updated_at: string; head_sha: string }[] }>(
    `/repos/${repo}/actions/runs?per_page=1&status=completed`
  );
  const run = data?.workflow_runs?.[0];
  if (!run) return null;
  return {
    state: run.conclusion === 'success' ? 'success' : run.conclusion ? 'failure' : 'unknown',
    ago: timeAgo(run.updated_at),
    sha: run.head_sha.slice(0, 7),
  };
}

export async function getCommits(repo: string, n = 5): Promise<CommitInfo[] | null> {
  const data = await gh<{ sha: string; commit: { message: string; author: { date: string } } }[]>(
    `/repos/${repo}/commits?per_page=${n}`
  );
  if (!data) return null;
  return data.map((c) => ({
    sha: c.sha.slice(0, 7),
    message: c.commit.message.split('\n')[0],
    ago: timeAgo(c.commit.author.date),
  }));
}

export interface RunInfo {
  id: number;
  state: 'success' | 'failure' | 'running' | 'cancelled';
  message: string;
  sha: string;
  seconds: number;
  startedAt: string;
  url: string;
}

interface RawRun {
  id: number;
  status: string;
  conclusion: string | null;
  head_sha: string;
  head_commit: { message: string } | null;
  run_started_at: string;
  updated_at: string;
  html_url: string;
}

export async function getRuns(repo: string, n = 30): Promise<RunInfo[] | null> {
  const data = await gh<{ workflow_runs: RawRun[] }>(`/repos/${repo}/actions/runs?per_page=${n}`);
  if (!data) return null;
  return data.workflow_runs.map((r) => ({
    id: r.id,
    state:
      r.status !== 'completed' ? 'running' : r.conclusion === 'success' ? 'success' : r.conclusion === 'cancelled' ? 'cancelled' : 'failure',
    message: (r.head_commit?.message ?? '').split('\n')[0],
    sha: r.head_sha.slice(0, 7),
    seconds: Math.max(0, Math.round((new Date(r.updated_at).getTime() - new Date(r.run_started_at).getTime()) / 1000)),
    startedAt: r.run_started_at,
    url: r.html_url,
  }));
}

/** Commit timestamps (newest first, up to 100) for the activity chart. */
export async function getCommitDates(repo: string): Promise<string[] | null> {
  const data = await gh<{ commit: { author: { date: string } } }[]>(`/repos/${repo}/commits?per_page=100`);
  return data ? data.map((c) => c.commit.author.date) : null;
}
