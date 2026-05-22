import type { Faculty, Club, MatchResult } from './types';

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function words(s: string): string[] {
  return normalize(s).split(' ').filter(w => w.length > 2);
}

function tagMatchesInterests(tag: string, interestText: string): boolean {
  const normTag = normalize(tag);
  const normInterests = normalize(interestText);
  if (normInterests.includes(normTag)) return true;
  const tagWords = words(tag);
  const interestWords = words(interestText);
  return tagWords.some(w => interestWords.includes(w));
}

export function matchFaculty(
  interests: string,
  connectionTypes: string[],
  faculty: Faculty[]
): MatchResult<Faculty>[] {
  const facultyTypes = connectionTypes.filter(t => t !== 'clubs');
  return faculty
    .filter(f =>
      facultyTypes.length === 0 ||
      f.openTo.some(t => facultyTypes.includes(t))
    )
    .map(f => {
      const matchedOn = f.researchAreas.filter(tag => tagMatchesInterests(tag, interests));
      return { item: f, score: matchedOn.length, matchedOn };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

export function matchClubs(
  interests: string,
  clubs: Club[]
): MatchResult<Club>[] {
  return clubs
    .map(c => {
      const matchedOn = c.tags.filter(tag => tagMatchesInterests(tag, interests));
      return { item: c, score: matchedOn.length, matchedOn };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}
