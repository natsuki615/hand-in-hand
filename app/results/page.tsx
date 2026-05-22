'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import facultyData from '@/data/faculty.json';
import clubsData from '@/data/clubs.json';
import { matchFaculty, matchClubs } from '@/lib/matching';
import type { Faculty, Club, MatchResult } from '@/lib/types';

function FacultyCard({ item, matchedOn }: MatchResult<Faculty>) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-1 gap-2">
        <h3 className="font-semibold text-gray-900">{item.name}</h3>
        <div className="flex flex-wrap gap-1 justify-end shrink-0">
          {item.openTo.map(t => (
            <span
              key={t}
              className="text-xs bg-red-50 text-[#C41230] px-2 py-0.5 rounded-full border border-red-100 whitespace-nowrap"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <a
        href={`mailto:${item.email}`}
        className="text-sm text-[#C41230] hover:underline font-medium block mb-1"
      >
        {item.email}
      </a>
      <p className="text-xs text-gray-400 mb-3">
        {item.title} · {item.department}
      </p>
      <p className={`text-sm text-gray-600 mb-1 ${expanded ? '' : 'line-clamp-2'}`}>
        {item.bio}
      </p>
      <button
        onClick={() => setExpanded(e => !e)}
        className="text-xs text-gray-400 hover:text-gray-600 mb-3 transition-colors"
      >
        {expanded ? 'Show less' : 'Show more'}
      </button>
      {matchedOn.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {matchedOn.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-[#C41230] hover:underline font-medium"
      >
        View profile
      </a>
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const types = searchParams.get('types')?.split(',').filter(Boolean) || [];

  const showFaculty = types.length === 0 || types.some(t => ['research', 'mentorship', 'projects'].includes(t));
  const showClubs = types.length === 0 || types.includes('clubs');

  const facultyMatches = showFaculty
    ? matchFaculty(query, types, facultyData as Faculty[])
    : [];
  const clubMatches = showClubs
    ? matchClubs(query, clubsData as Club[])
    : [];

  const hasResults = facultyMatches.length > 0 || clubMatches.length > 0;

  return (
    <main className="min-h-screen bg-[#F8F7F6]">
      <div className="bg-[#C41230] text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
            <span className="text-[#C41230] font-bold text-sm">C</span>
          </div>
          <span className="font-semibold text-lg">CMU Connect</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-400 hover:text-gray-700 mb-6 flex items-center gap-1 transition-colors"
        >
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Connections for &ldquo;<span className="text-[#C41230]">{query}</span>&rdquo;
          </h1>
          {types.length > 0 && (
            <p className="text-gray-400 text-sm mt-1">
              Looking for: {types.join(', ')}
            </p>
          )}
        </div>

        {!hasResults && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg font-medium">No matches found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try different keywords — e.g. &ldquo;machine learning&rdquo;, &ldquo;robotics&rdquo;, &ldquo;design&rdquo;, &ldquo;climate&rdquo;
            </p>
          </div>
        )}

        {facultyMatches.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Faculty & Researchers
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {facultyMatches.map(match => (
                <FacultyCard key={match.item.id} {...match} />
              ))}
            </div>
          </section>
        )}

        {clubMatches.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Student Organizations
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {clubMatches.map(({ item, matchedOn }) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  {matchedOn.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {matchedOn.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.website && (
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#C41230] hover:underline font-medium"
                    >
                      Visit website →
                    </a>
                  )}
                </div>
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F7F6] flex items-center justify-center">
          <p className="text-gray-400">Finding connections...</p>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
