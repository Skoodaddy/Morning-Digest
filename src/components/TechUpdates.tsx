import React from 'react';
import { TechUpdate } from '../types';
import { Cpu } from 'lucide-react';

const TechUpdates: React.FC<{ updates: TechUpdate[] }> = ({ updates }) => {
  if (!updates || updates.length === 0) return null;

  return (
    <div className="bg-zinc-900 rounded-3xl p-6 shadow-lg border border-white/5 mb-6">
      <div className="flex items-center mb-4">
        <Cpu className="w-6 h-6 text-emerald-400 mr-3" />
        <h2 className="text-xl font-medium text-white">Tech Updates</h2>
      </div>
      <div className="space-y-4">
        {updates.map((update, idx) => (
          <a key={idx} href={update.url} target="_blank" rel="noopener noreferrer" className="flex items-start p-4 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-white/5">
            {update.thumbnailUrl && (
              <img src={update.thumbnailUrl} alt="Thumbnail" className="w-16 h-16 object-cover rounded-xl mr-4 flex-shrink-0" referrerPolicy="no-referrer" />
            )}
            <div>
              <h3 className="text-zinc-200 font-medium line-clamp-2">{update.headline}</h3>
              <span className="text-xs text-emerald-400 mt-2 inline-block">Read more →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default TechUpdates;
