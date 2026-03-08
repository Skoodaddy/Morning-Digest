import React from 'react';
import { Quote } from '../types';
import { Quote as QuoteIcon } from 'lucide-react';

const QuoteCard: React.FC<{ quote: Quote }> = ({ quote }) => {
  if (!quote) return null;

  return (
    <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-lg border border-white/5 mb-6 relative">
      {quote.imageUrl && (
        <div className="absolute inset-0 opacity-20">
          <img src={quote.imageUrl} alt={quote.character} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent" />
        </div>
      )}
      <div className="relative p-8 flex flex-col items-center text-center">
        <QuoteIcon className="w-10 h-10 text-zinc-600 mb-6" />
        <p className="text-2xl font-serif text-white italic mb-6 leading-relaxed">"{quote.text}"</p>
        <div className="inline-block bg-zinc-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
          <span className="text-sm font-medium text-zinc-300 uppercase tracking-widest">{quote.character}</span>
        </div>
      </div>
    </div>
  );
}

export default QuoteCard;
