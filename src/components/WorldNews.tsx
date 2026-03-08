import React from 'react';
import { WorldEvent } from '../types';
import { Globe } from 'lucide-react';

const WorldNews: React.FC<{ news: WorldEvent[] }> = ({ news }) => {
  if (!news || news.length === 0) return null;

  return (
    <div className="bg-zinc-900 rounded-3xl p-6 shadow-lg border border-white/5 mb-6">
      <div className="flex items-center mb-4">
        <Globe className="w-6 h-6 text-blue-400 mr-3" />
        <h2 className="text-xl font-medium text-white">World News</h2>
      </div>
      <div className="space-y-4">
        {news.map((item, idx) => (
          <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-start p-4 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-white/5">
            {item.thumbnailUrl && (
              <img src={item.thumbnailUrl} alt="Thumbnail" className="w-20 h-20 object-cover rounded-xl mr-4" referrerPolicy="no-referrer" />
            )}
            <div>
              <h3 className="text-zinc-200 font-medium line-clamp-3">{item.headline}</h3>
              <span className="text-xs text-blue-400 mt-2 inline-block">Read article →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default WorldNews;
