import raw from './offerings.json';

// Content lives in offerings.json (editable through the CMS); this file only adds types.
export interface Offering {
  title: string;
  text: string;
  /** Optional link, e.g. to a case study. */
  href?: string;
  linkLabel?: string;
}

export const offerings: Offering[] = raw as Offering[];
