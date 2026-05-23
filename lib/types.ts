export interface Faculty {
  id: string;
  name: string;
  title: string;
  department: string;
  school: string;
  researchAreas: string[];
  openTo: Array<'research' | 'mentorship' | 'projects'>;
  bio: string;
  email: string;
  url: string;
}

export interface Club {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  website?: string;
  contactEmail?: string;
}

export interface Student {
  id: string;
  name: string;
  level: 'phd' | 'masters';
  program: string;
  department: string;
  school: string;
  researchInterests: string[];
  bio: string;
  email: string;
  url: string;
}

export interface MatchResult<T> {
  item: T;
  score: number;
  matchedOn: string[];
}
