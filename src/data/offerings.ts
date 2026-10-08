import raw from './offerings.json';

// Content lives in offerings.json (editable through the CMS); this file only adds types.
export interface Offering {
  title: string;
  text: string;
  /** Optional link, e.g. to a case study. */
  href?: string;
  linkLabel?: string;
  /** Decorative line icon: cloud, helm, pipeline or pulse. */
  icon?: 'cloud' | 'helm' | 'pipeline' | 'pulse' | 'git' | 'container' | 'shield' | 'scan' | 'deploy' | 'monitor' | 'server' | 'database';
}

export const offerings: Offering[] = raw as Offering[];
