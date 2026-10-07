import raw from './experience.json';

// Content lives in experience.json (editable through the CMS); this file only adds types.

/** A project within one employer (use when you did several engagements at the same company). */
export interface ProjectExperience {
  /** Optional project name; the location is shown when omitted. */
  name?: string;
  period: string;
  location?: string;
  bullets: string[];
  tech: string[];
}

export interface Experience {
  role: string;
  company: string;
  /** Overall period at the company. */
  period: string;
  location?: string;
  bullets: string[];
  tech: string[];
  /** Optional per-project breakdown, most recent first. */
  projects?: ProjectExperience[];
}

// The CMS can leave empty list items behind; drop them so pages never render blank bullets or chips.
const clean = (items: string[] | undefined) => (items ?? []).filter((s) => s.trim() !== '');

export const experience: Experience[] = (raw as Experience[]).map((job) => ({
  ...job,
  bullets: clean(job.bullets),
  tech: clean(job.tech),
  projects: (job.projects ?? []).map((p) => ({ ...p, bullets: clean(p.bullets), tech: clean(p.tech) })),
}));
