import type { Faculty, Club, Student, MatchResult } from './types';

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

const SHORT_TERMS = new Set(['ux', 'ui', 'ai', 'ml', 'vr', 'ar', 'xr', 'cs', 'ee', 'db']);

function words(s: string): string[] {
  return normalize(s).split(' ').filter(w => w.length > 2 || SHORT_TERMS.has(w));
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
  const normInterests = normalize(interests);
  const interestWords = words(interests);
  const required = Math.max(1, Math.ceil(interestWords.length * 0.6));
  return clubs
    .map(c => {
      const clubText = normalize(c.name + ' ' + c.description + ' ' + c.tags.join(' '));
      // Bonus if the whole phrase (or a multi-word chunk) appears verbatim
      const phraseBonus = normInterests.length > 3 && clubText.includes(normInterests) ? 3 : 0;
      const matchedWords = interestWords.filter(w => clubText.includes(w));
      const score = matchedWords.length + phraseBonus;
      return { item: c, score, matchedOn: matchedWords };
    })
    .filter(r => r.matchedOn.length >= required)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

export function matchStudents(
  interests: string,
  students: Student[]
): MatchResult<Student>[] {
  return students
    .map(s => {
      const matchedOn = s.researchInterests.filter(tag => tagMatchesInterests(tag, interests));
      return { item: s, score: matchedOn.length, matchedOn };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}
