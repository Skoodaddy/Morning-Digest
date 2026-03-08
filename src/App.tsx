import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { generateDigest } from './services/geminiService';
import { DigestData } from './types';
import WeatherWidget from './components/WeatherWidget';
import MealsSection from './components/MealsSection';
import CalendarEvents from './components/CalendarEvents';
import FamilyReminders from './components/FamilyReminders';
import TechUpdates from './components/TechUpdates';
import WorldNews from './components/WorldNews';
import LocalEvents from './components/LocalEvents';
import SchoolEvents from './components/SchoolEvents';
import QuoteCard from './components/QuoteCard';
import TodoList from './components/TodoList';
import VoiceAssistant from './components/VoiceAssistant';
import SettingsModal, { SectionConfig } from './components/SettingsModal';
import { Loader2, Settings, RefreshCw } from 'lucide-react';

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'weather', visible: true, title: 'Weather' },
  { id: 'meals', visible: true, title: 'Dinner Ideas' },
  { id: 'calendar', visible: true, title: 'Today\'s Schedule' },
  { id: 'family', visible: true, title: 'Family & Romance' },
  { id: 'todo', visible: true, title: 'To-Do List' },
  { id: 'techUpdates', visible: true, title: 'Tech Updates' },
  { id: 'worldEvents', visible: true, title: 'World News' },
  { id: 'localEvents', visible: true, title: 'Local Events' },
  { id: 'schoolEvents', visible: true, title: 'School Events' },
  { id: 'quote', visible: true, title: 'Quote of the Day' },
];

export default function App() {
  const [digest, setDigest] = useState<DigestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);

  useEffect(() => {
    const saved = localStorage.getItem('morning-digest-sections');
    if (saved) {
      try {
        setSections(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse sections');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('morning-digest-sections', JSON.stringify(sections));
  }, [sections]);

  const fetchDigest = async () => {
    setLoading(true);
    const data = await generateDigest();
    if (data) {
      setDigest(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDigest();
    
    // Request notification permission for the service worker
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  const renderSection = (id: string) => {
    if (!digest && id !== 'todo' && id !== 'calendar') return null;

    switch (id) {
      case 'weather': return digest?.weather ? <WeatherWidget key={id} weather={digest.weather} /> : null;
      case 'meals': return digest?.meals ? <MealsSection key={id} meals={digest.meals} /> : null;
      case 'calendar': return <CalendarEvents key={id} />;
      case 'family': return digest?.family ? <FamilyReminders key={id} family={digest.family} /> : null;
      case 'todo': return <TodoList key={id} />;
      case 'techUpdates': return digest?.techUpdates ? <TechUpdates key={id} updates={digest.techUpdates} /> : null;
      case 'worldEvents': return digest?.worldEvents ? <WorldNews key={id} news={digest.worldEvents} /> : null;
      case 'localEvents': return digest?.localEvents ? <LocalEvents key={id} events={digest.localEvents} /> : null;
      case 'schoolEvents': return digest?.schoolEvents ? <SchoolEvents key={id} events={digest.schoolEvents} /> : null;
      case 'quote': return digest?.quote ? <QuoteCard key={id} quote={digest.quote} /> : null;
      default: return null;
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder'}>
      <div className="min-h-screen bg-[#1c1b1f] text-zinc-100 font-sans selection:bg-indigo-500/30">
        <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif tracking-tight text-white mb-1">Morning Digest</h1>
            <p className="text-zinc-500 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={fetchDigest} 
              disabled={loading}
              className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors border border-white/5"
            >
              <RefreshCw className={`w-5 h-5 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setShowSettings(true)} 
              className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors border border-white/5"
            >
              <Settings className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </header>

        {showSettings && (
          <SettingsModal 
            sections={sections} 
            setSections={setSections} 
            onClose={() => setShowSettings(false)} 
          />
        )}

        {loading && !digest ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-zinc-500">Compiling your morning digest...</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            {sections.filter(s => s.visible).map(s => renderSection(s.id))}
          </div>
        )}
        </div>
        <VoiceAssistant />
      </div>
    </GoogleOAuthProvider>
  );
}
