'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CONNECTION_TYPES = [
  { id: 'research', label: 'Research opportunities', description: 'Work in a faculty lab' },
  { id: 'mentorship', label: 'Mentorship', description: 'Guidance from faculty or senior students' },
  { id: 'projects', label: 'Project collaboration', description: 'Find teammates or advisors for projects' },
  { id: 'clubs', label: 'Clubs & organizations', description: 'Join student orgs and activities' },
];

export default function HomePage() {
  const router = useRouter();
  const [interests, setInterests] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const toggleType = (id: string) => {
    setSelectedTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interests.trim()) return;
    const params = new URLSearchParams({
      q: interests,
      types: selectedTypes.join(','),
    });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#F8F7F6]">
      <div className="bg-[#C41230] text-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
            <span className="text-[#C41230] font-bold text-sm">C</span>
          </div>
          <span className="font-semibold text-lg">CMU Connect</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-16 pb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Find your people at CMU
        </h1>
        <p className="text-lg text-gray-500">
          Tell us what you&apos;re interested in. We&apos;ll match you with faculty, labs, and student organizations.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-20">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What are you interested in?
            </label>
            <textarea
              value={interests}
              onChange={e => setInterests(e.target.value)}
              rows={3}
              placeholder="e.g. machine learning, robotics, climate change, social impact, UX design, entrepreneurship..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C41230] focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              What are you looking for?{' '}
              <span className="font-normal text-gray-400">select all that apply</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {CONNECTION_TYPES.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => toggleType(type.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    selectedTypes.includes(type.id)
                      ? 'border-[#C41230] bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`text-sm font-semibold ${selectedTypes.includes(type.id) ? 'text-[#C41230]' : 'text-gray-800'}`}>
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!interests.trim()}
            className="w-full bg-[#C41230] text-white py-3 px-6 rounded-xl font-semibold text-base hover:bg-[#a00f28] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Find connections
          </button>
        </form>
      </div>
    </main>
  );
}
