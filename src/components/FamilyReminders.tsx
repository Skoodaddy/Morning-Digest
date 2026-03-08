import React, { useState } from 'react';
import { Family } from '../types';
import { Heart, Bell, RefreshCw } from 'lucide-react';
import { refreshFamilyEvents } from '../services/geminiService';

const FamilyReminders: React.FC<{ family: Family }> = ({ family }) => {
  const [events, setEvents] = useState(family?.romanticEvents || []);
  const [loading, setLoading] = useState(false);

  if (!family) return null;

  const handleRefresh = async () => {
    setLoading(true);
    const newEvents = await refreshFamilyEvents(events);
    if (newEvents && newEvents.length > 0) {
      setEvents(newEvents);
    }
    setLoading(false);
  };

  return (
    <div className="bg-zinc-900 rounded-3xl p-6 shadow-lg border border-white/5 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Heart className="w-6 h-6 text-rose-400 mr-3" />
          <h2 className="text-xl font-medium text-white">Family & Romance</h2>
        </div>
        <button 
          onClick={handleRefresh} 
          disabled={loading}
          className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-800"
          title="Find new romantic events"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {family.reminders && family.reminders.length > 0 && (
        <div className="mb-6 space-y-3">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">Reminders</h3>
          {family.reminders.map((reminder, idx) => (
            <div key={idx} className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-start">
              <Bell className="w-5 h-5 text-rose-400 mr-3 mt-0.5" />
              <div>
                <p className="text-rose-200 font-medium mb-1">{reminder.alert}</p>
                {reminder.flowerUrl && (
                  <a href={reminder.flowerUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-rose-400 hover:text-rose-300 underline">
                    Order Flowers
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {events && events.length > 0 && (
        <div className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">Upcoming Romantic Events</h3>
          <div className="space-y-4">
            {events.map((evt, idx) => (
              <a key={idx} href={evt.url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center border-b border-white/5 pb-3 last:border-0 last:pb-0 hover:bg-zinc-800/50 p-2 rounded-xl transition-colors -mx-2">
                {evt.thumbnailUrl && (
                  <img src={evt.thumbnailUrl} alt="Thumbnail" className="w-12 h-12 object-cover rounded-xl mr-4 flex-shrink-0" referrerPolicy="no-referrer" />
                )}
                <div className="flex-grow">
                  <p className="text-zinc-200 font-medium">{evt.name}</p>
                  <p className="text-xs text-zinc-500">{evt.location}</p>
                </div>
                <span className="text-sm text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full flex-shrink-0 ml-4">{evt.date}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FamilyReminders;
