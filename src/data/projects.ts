export interface Project {
  name: string;
  description: string;
  tech: string[];
  links?: { label: string; href: string }[];
}

// TODO: add your own projects; the section is hidden while this is empty.
export const projects: Project[] = [];
