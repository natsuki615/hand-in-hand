'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import facultyData from '@/data/faculty.json';
import clubsData from '@/data/clubs.json';
import phdData from '@/data/phd_students.json';
import mastersData from '@/data/masters_students.json';
import { matchFaculty, matchClubs, matchStudents } from '@/lib/matching';
import type { Faculty, Club, Student, MatchResult } from '@/lib/types';

const FILTERS = [
  { id: 'faculty',  label: 'Faculty' },
  { id: 'phd',     label: 'PhD Students' },
  { id: 'masters', label: 'Masters Students' },
  { id: 'clubs',   label: 'Clubs' },
] as const;

type FilterId = typeof FILTERS[number]['id'];

function FacultyCard({ item, matchedOn }: MatchResult<Faculty>) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-[#A2BE6C] rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-1 gap-2">
        <h3 className="font-semibold text-[#0A3323]">{item.name}</h3>
        <div className="flex flex-wrap gap-1 justify-end shrink-0">
          {item.openTo.map(t => (
            <span key={t} className="text-xs bg-[#F7F4D5] text-[#0A3323] px-2 py-0.5 rounded-full whitespace-nowrap">
              {t}
            </span>
          ))}
        </div>
      </div>
      <a href={`mailto:${item.email}`} className="text-sm text-[#105666] hover:underline font-medium block mb-1">
        {item.email}
      </a>
      <p className="text-xs text-[#0A3323]/60 mb-3">{item.title} · {item.department}</p>
      <p className={`text-sm text-[#0A3323] mb-1 ${expanded ? '' : 'line-clamp-2'}`}>{item.bio}</p>
      <button onClick={() => setExpanded(e => !e)} className="text-xs text-[#0A3323]/50 hover:text-[#0A3323] mb-3 transition-colors">
        {expanded ? 'Show less' : 'Show more'}
      </button>
      {matchedOn.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {matchedOn.map(tag => (
            <span key={tag} className="text-xs bg-[#F7F4D5] text-[#0A3323] px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      )}
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#105666] hover:underline font-medium">
        View profile
      </a>
    </div>
  );
}

function StudentCard({ item, matchedOn }: MatchResult<Student>) {
  return (
    <div className="bg-[#A2BE6C] rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-1 gap-2">
        <h3 className="font-semibold text-[#0A3323]">{item.name}</h3>
        <span className="text-xs bg-[#F7F4D5] text-[#0A3323] px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
          {item.level === 'phd' ? 'PhD' : 'Masters'}
        </span>
      </div>
      {item.email && (
        <a href={`mailto:${item.email}`} className="text-sm text-[#105666] hover:underline font-medium block mb-1">
          {item.email}
        </a>
      )}
      <p className="text-xs text-[#0A3323]/60 mb-3">{item.program} · {item.department}</p>
      {item.bio && <p className="text-sm text-[#0A3323] mb-3 line-clamp-2">{item.bio}</p>}
      {matchedOn.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {matchedOn.map(tag => (
            <span key={tag} className="text-xs bg-[#F7F4D5] text-[#0A3323] px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      )}
      {item.url && (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#105666] hover:underline font-medium">
          View profile
        </a>
      )}
    </div>
  );
}

function ClubCard({ item }: MatchResult<Club>) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-[#A2BE6C] rounded-xl p-5 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-[#0A3323] leading-snug mb-1">{item.name}</h3>
      <p className="text-xs text-[#0A3323]/60 mb-3">{item.category}</p>
      <p className={`text-sm text-[#0A3323] mb-1 ${expanded ? '' : 'line-clamp-3'}`}>{item.description}</p>
      {item.description && (
        <button onClick={() => setExpanded(e => !e)} className="text-xs text-[#0A3323]/50 hover:text-[#0A3323] mb-3 transition-colors">
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
      {item.website && (
        <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[#105666] hover:underline font-medium block">
          Visit website →
        </a>
      )}
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const types = searchParams.get('types')?.split(',').filter(Boolean) || [];

  const [activeFilters, setActiveFilters] = useState<FilterId[]>(['faculty', 'phd', 'masters', 'clubs']);

  const toggleFilter = (id: FilterId) => {
    setActiveFilters(prev =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(f => f !== id) : prev
        : [...prev, id]
    );
  };

  const show = (id: FilterId) => activeFilters.includes(id);

  const facultyMatches = show('faculty')
    ? matchFaculty(query, types, facultyData as Faculty[])
    : [];
  const phdMatches = show('phd')
    ? matchStudents(query, phdData as Student[])
    : [];
  const mastersMatches = show('masters')
    ? matchStudents(query, mastersData as Student[])
    : [];
  const clubMatches = show('clubs')
    ? matchClubs(query, clubsData as Club[])
    : [];

  const hasResults = facultyMatches.length > 0 || phdMatches.length > 0 || mastersMatches.length > 0 || clubMatches.length > 0;

  return (
    <main className="min-h-screen bg-[#F7F4D5]">
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox="0 0 1311 120"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-24"
          preserveAspectRatio="none"
        >
          <path d="M159.727 78.5C91.5759 68.935 31.2265 29.8333 1.22655 0.5H1309.23C1289.23 40.1 1234.73 54.5 1209.23 54.5C1171.73 54.5 1155.38 78.3651 1122.73 92.5C1061.5 119 1013.23 119 967.227 119C932.227 119 902.227 109.5 838.227 101.5C774.227 93.5 725.227 95.5 691.227 101.5C664.637 106.192 601.727 119 553.727 119C498.645 119 431.727 111.5 401.727 101.5C377.727 93.5 338.727 84.5 273.227 84.5C256.227 84.5 216.727 86.5 159.727 78.5Z" fill="#0A3323" stroke="#0A3323"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <button
          onClick={() => router.back()}
          className="text-sm text-[#0A3323]/40 hover:text-[#0A3323] mb-6 flex items-center gap-1 transition-colors"
        >
          Back
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0A3323]">
            Connections for &ldquo;<span className="text-[#839958]">{query}</span>&rdquo;
          </h1>
          {types.length > 0 && (
            <p className="text-[#0A3323]/50 text-sm mt-1">Looking for: {types.join(', ')}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => toggleFilter(f.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeFilters.includes(f.id)
                  ? 'bg-[#D3968C] text-[#105666] border-[#D3968C]'
                  : 'bg-[#F7F4D5] text-[#0A3323] border-[#A2BE6C] hover:border-[#105666]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {!hasResults && (
          <div className="bg-[#A2BE6C] rounded-2xl p-12 text-center">
            <p className="text-[#0A3323] text-lg font-medium">No matches found</p>
            <p className="text-[#0A3323]/60 text-sm mt-2">
              Try different keywords — e.g. &ldquo;machine learning&rdquo;, &ldquo;robotics&rdquo;, &ldquo;design&rdquo;, &ldquo;climate&rdquo;
            </p>
          </div>
        )}

        {facultyMatches.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-semibold text-[#0A3323]/50 uppercase tracking-wide mb-4">Faculty & Researchers</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {facultyMatches.map(match => <FacultyCard key={match.item.id} {...match} />)}
            </div>
          </section>
        )}

        {phdMatches.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-semibold text-[#0A3323]/50 uppercase tracking-wide mb-4">PhD Students</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {phdMatches.map(match => <StudentCard key={match.item.id} {...match} />)}
            </div>
          </section>
        )}

        {mastersMatches.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-semibold text-[#0A3323]/50 uppercase tracking-wide mb-4">Masters Students</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {mastersMatches.map(match => <StudentCard key={match.item.id} {...match} />)}
            </div>
          </section>
        )}

        {clubMatches.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-[#0A3323]/50 uppercase tracking-wide mb-4">Student Organizations</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {clubMatches.map(match => (
                <ClubCard key={match.item.id} {...match} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F7F6] flex items-center justify-center">
        <p className="text-gray-400">Finding connections...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
