export interface Publication {
  title: string;
  venue: string;
  date: string;
  summary: string;
  links?: { label: string; href: string }[];
}

// TODO: add publications if any; the section is hidden while this is empty.
export const publications: Publication[] = [];
