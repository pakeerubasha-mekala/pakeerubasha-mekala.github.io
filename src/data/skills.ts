import raw from './skills.json';

// Content lives in skills.json (editable through the CMS); this file only adds types.
export interface SkillGroup {
  label: string;
  items: string[];
}

export const skills: SkillGroup[] = (raw as SkillGroup[]).map((g) => ({
  ...g,
  items: g.items.filter((s) => s.trim() !== ''),
}));
