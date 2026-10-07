import raw from './education.json';

// Content lives in education.json (editable through the CMS); this file only adds types.
export interface Education {
  degree: string;
  field: string;
  institution: string;
  period: string;
  grade?: string;
}

export const education: Education[] = raw as Education[];
