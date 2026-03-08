import React, { useState, useEffect } from 'react';
import { Calendar, LogIn, RefreshCw } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

interface GoogleEvent {
  id: string;
  summary: string;
  htmlLink: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

const CalendarEvents: React.FC = () => {
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('google_calendar_token');
    if (savedToken) {
      setAccessToken(savedToken);
    }
  }, []);

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    onSuccess: (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
      localStorage.setItem('google_calendar_token', tokenResponse.access_token);
    },
    onError: () => console.error('Login Failed'),
  });

  const fetchEvents = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const now = new Date();
      const timeMin = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 2);
      const timeMax = new Date(tomorrow.setHours(0, 0, 0, 0)).toISOString();

      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (response.status === 401) {
        setAccessToken(null);
        localStorage.removeItem('google_calendar_token');
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      if (data.items) {
        setEvents(data.items);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [accessToken]);

  const formatTime = (dateObj: { dateTime?: string; date?: string }) => {
    if (dateObj.date) return 'All Day';
    if (dateObj.dateTime) {
      return new Date(dateObj.dateTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return '';
  };

  return (
    <div className="bg-zinc-900 rounded-3xl p-6 shadow-lg border border-white/5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Calendar className="w-6 h-6 text-indigo-400 mr-3" />
          <h2 className="text-xl font-medium text-white">Today's Schedule</h2>
        </div>
        {accessToken && (
          <button 
            onClick={fetchEvents}
            disabled={loading}
            className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-800"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {!accessToken ? (
        <div className="text-center py-6 bg-zinc-800/30 rounded-2xl border border-white/5 border-dashed">
          <Calendar className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm mb-4">Connect Google Calendar to see your schedule</p>
          <button
            onClick={() => login()}
            className="inline-flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Connect Calendar
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.length === 0 && !loading ? (
            <p className="text-zinc-500 text-sm text-center py-4">No events scheduled for today or tomorrow.</p>
          ) : (
            events.map((evt) => (
              <a key={evt.id} href={evt.htmlLink} target="_blank" rel="noopener noreferrer" className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0 hover:bg-zinc-800/50 p-2 rounded-xl transition-colors -mx-2">
                <span className="text-zinc-300 font-medium">{evt.summary || '(No title)'}</span>
                <span className="text-sm text-zinc-500 font-mono ml-4 flex-shrink-0">{formatTime(evt.start)}</span>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default CalendarEvents;
