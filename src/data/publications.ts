import raw from './publications.json';

// Content lives in publications.json (editable through the CMS); this file only adds types.
// The Publications section is hidden while the list is empty.
export interface Publication {
  title: string;
  venue: string;
  date: string;
  summary: string;
  links?: { label: string; href: string }[];
}

export const publications: Publication[] = raw as Publication[];
