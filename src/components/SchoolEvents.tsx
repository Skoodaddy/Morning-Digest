import React from 'react';
import { SchoolEvent } from '../types';
import { GraduationCap } from 'lucide-react';

const SchoolEvents: React.FC<{ events: SchoolEvent[] }> = ({ events }) => {
  if (!events || events.length === 0) return null;

  return (
    <div className="bg-zinc-900 rounded-3xl p-6 shadow-lg border border-white/5 mb-6">
      <div className="flex items-center mb-4">
        <GraduationCap className="w-6 h-6 text-purple-400 mr-3" />
        <h2 className="text-xl font-medium text-white">School Events</h2>
      </div>
      <div className="space-y-4">
        {events.map((evt, idx) => (
          <a key={idx} href={evt.url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center border-b border-white/5 pb-3 last:border-0 last:pb-0 hover:bg-zinc-800/50 p-2 rounded-xl transition-colors -mx-2">
            {evt.thumbnailUrl && (
              <img src={evt.thumbnailUrl} alt="Thumbnail" className="w-12 h-12 object-cover rounded-xl mr-4 flex-shrink-0" referrerPolicy="no-referrer" />
            )}
            <span className="text-zinc-200 font-medium flex-grow">{evt.name}</span>
            <span className="text-sm text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full whitespace-nowrap ml-4 flex-shrink-0">{evt.date}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default SchoolEvents;
