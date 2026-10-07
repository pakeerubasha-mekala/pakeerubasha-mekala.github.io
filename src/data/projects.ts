import raw from './projects.json';

// Content lives in projects.json (editable through the CMS); this file only adds types.
// The Projects section is hidden while the list is empty.
export interface Project {
  name: string;
  description: string;
  tech: string[];
  links?: { label: string; href: string }[];
}

export const projects: Project[] = raw as Project[];
