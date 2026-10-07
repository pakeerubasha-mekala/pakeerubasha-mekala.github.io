export interface Education {
  degree: string;
  field: string;
  institution: string;
  period: string;
  grade?: string;
}

export const education: Education[] = [
  {
    degree: 'Bachelor of Technology (B.Tech.)',
    field: 'Electrical, Electronic and Communications Engineering',
    institution: 'G. Pulla Reddy Engineering College',
    period: '2013 - 2016',
  },
];
