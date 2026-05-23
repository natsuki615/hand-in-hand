'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CONNECTION_TYPES = [
  { 
    id: 'research', 
    label: 'Research opportunities', 
    description: 'Work in a faculty lab',
    shapePath: 'M63.0989 5.13669C39.0989 10.5663 15.4845 22.5055 7.21681 34.6367C-1.05086 46.7679 -2.40111 64.82 7.21681 75.5528C27.6669 98.3734 118.94 99.0016 144.099 94.1367C175.599 88.0457 194.599 83.1367 217.956 64.82C245.719 43.048 231.525 14.9361 194.599 5.1367C168.629 -1.75516 87.0989 -0.292896 63.0989 5.13669Z'
  },
  { id: 'mentorship', 
    label: 'Mentorship', 
    description: 'Guidance from faculty or senior students',
    shapePath: 'M75.1814 1.04449C36.7962 3.00365 19.3386 14.1055 15.4079 19.4116C4.15806 28.9353 -11.5918 60.1571 15.4079 74.8508C42.4076 89.5445 97.7382 93.8508 122 93.8508C143.687 94.6671 187.271 91.5036 218.5 74.8508C249.729 58.1979 218.5 19.4117 180 9.35076C153.942 2.54126 113.566 -0.914665 75.1814 1.04449Z'
  },
  { 
    id: 'projects', 
    label: 'Project collaboration', 
    description: 'Find teammates or advisors for projects',
    shapePath: 'M88.2271 1.89945C49.5368 7.07183 27.7271 10.8994 6.49941 38.2664C-4.77295 52.7988 1.58767 72.323 11.2307 80.3754C31.0033 96.8867 65.5792 105.399 92.7271 105.399C133.997 105.399 172.711 103.986 205.727 86.3995C238.743 68.8134 247.084 39.1978 211.128 20.594C182.727 5.89944 125.801 -3.12374 88.2271 1.89945Z'
  },
  { 
    id: 'clubs', 
    label: 'Clubs & organizations', 
    description: 'Join student orgs and activities',
    shapePath: 'M75.8898 1.76753C56.0326 4.41119 25.9671 9.2151 10.1833 27.2675C-5.60043 45.32 0.500222 69.8296 10.1833 77.8821C44.8898 106.744 104.629 110.768 131.89 110.768C170.741 110.768 207.89 104.268 227.89 77.8821C244.188 56.3805 235.586 30.4053 208.39 18.7675C182.116 7.52406 113.62 -3.25563 75.8898 1.76753Z'
  },
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

      <div className="max-w-5xl mx-auto px-6 pt-10 pb-6">
        <h1 className="text-4xl text-[#0A3323] mb-3 font-[family-name:var(--font-galindo)]">
          Find your people at CMU
        </h1>
        <p className="text-lg text-gray-500">
          Tell us what you&apos;re interested in. We&apos;ll match you with faculty, labs, and student organizations.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-10">
        <form onSubmit={handleSubmit} className="bg-[#A2BE6C] rounded-2xl p-8">
          <div className="flex gap-6 mb-6">

            {/* left: text input */}
            <div className="flex-1 flex flex-col">
              <label className="block text-base font-semibold text-[#0A3323] mb-2">
                What are you interested in?
              </label>
              <textarea
                value={interests}
                onChange={e => setInterests(e.target.value)}
                placeholder="e.g. machine learning, robotics, climate change, social impact, design, entrepreneurship..."
                className="flex-1 min-h-84 border border-[#F7F4D5] rounded-xl px-4 py-3 text-[#F7F4D5] placeholder-[#F7F4D5] focus:outline-none focus:ring-2 focus:ring-[#105666] focus:border-transparent resize-none"
              />
            </div>

            {/* right: connection type cards */}
            <div className="w-90 flex flex-col">
              <label className="block text-base font-semibold text-[#0A3323] mb-2">
                What are you looking for?{' '}
                <span className="font-normal text-sm text-[#F7F4D5]">select all that apply</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  selectedTypes.length === CONNECTION_TYPES.length
                    ? setSelectedTypes([])
                    : setSelectedTypes(CONNECTION_TYPES.map(t => t.id))
                }
                className="text-xs text-[#0A3323]/60 hover:text-[#0A3323] transition-colors mb-2 text-left"
              >
                {selectedTypes.length === CONNECTION_TYPES.length ? 'Deselect all' : 'Select all'}
              </button>
              <div className="grid grid-cols-2 gap-3 content-start">
                {CONNECTION_TYPES.map(type => {
                  const selected = selectedTypes.includes(type.id);
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => toggleType(type.id)}
                      className={`text-left px-5 py-4 rounded-xl transition-colors duration-200 ${selected ? 'bg-[#105666]' : 'bg-[#F7F4D5]'}`}
                    >
                      <div className={`text-sm font-semibold ${selected ? 'text-[#eba69b]' : 'text-gray-800'}`}>
                        {type.label}
                      </div>
                      <div className={`text-xs mt-1 ${selected ? 'text-[#eba69b]/70' : 'text-gray-400'}`}>{type.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={!interests.trim()}
            className="w-full bg-[#F7F4D5] text-[#0A3323] py-3 px-6 rounded-xl font-semibold text-base hover:bg-[#105666] hover:text-[#eba69b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Find connections
          </button>
        </form>
      </div>
    </main>
  );
}
