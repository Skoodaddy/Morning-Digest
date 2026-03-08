import React from 'react';
import { Weather } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Cloud, Sun, CloudRain, CloudLightning, CloudSnow, Droplets, Wind, Navigation } from 'lucide-react';

interface WeatherWidgetProps {
  weather: Weather;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather }) => {
  const getWeatherIcon = (condition: string, className: string = "w-16 h-16") => {
    const cond = condition.toLowerCase();
    if (cond.includes('rain')) return <CloudRain className={`${className} text-blue-300`} />;
    if (cond.includes('storm') || cond.includes('lightning')) return <CloudLightning className={`${className} text-yellow-300`} />;
    if (cond.includes('snow')) return <CloudSnow className={`${className} text-white`} />;
    if (cond.includes('cloud')) return <Cloud className={`${className} text-gray-300`} />;
    return <Sun className={`${className} text-yellow-400`} />;
  };

  const getBackgroundGradient = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('rain')) return 'from-blue-900 via-slate-800 to-zinc-900';
    if (cond.includes('storm')) return 'from-slate-900 via-purple-900 to-zinc-900';
    if (cond.includes('snow')) return 'from-slate-700 via-slate-800 to-zinc-900';
    if (cond.includes('cloud')) return 'from-slate-800 via-zinc-800 to-zinc-900';
    return 'from-sky-800 via-blue-900 to-zinc-900'; // Sunny/Clear
  };

  return (
    <div className={`rounded-[2.5rem] p-6 shadow-2xl mb-6 relative overflow-hidden bg-gradient-to-br ${getBackgroundGradient(weather.condition)}`}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10 pointer-events-none">
        {getWeatherIcon(weather.condition, "w-64 h-64")}
      </div>
      
      <div className="relative z-10 flex justify-between items-start mb-8">
        <div>
          <a href="https://www.google.com/search?q=weather" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity block">
            <h2 className="text-7xl font-light text-white tracking-tighter">{weather.currentTemperature}°</h2>
          </a>
          <p className="text-white/80 text-xl mt-2 font-medium capitalize">{weather.condition}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10 shadow-inner">
          {getWeatherIcon(weather.condition, "w-12 h-12")}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
        <div className="bg-black/20 backdrop-blur-md rounded-3xl p-4 border border-white/5 flex items-center">
          <Droplets className="w-5 h-5 text-blue-300 mr-3" />
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wider font-medium">Precipitation</p>
            <p className="text-lg text-white font-medium">{weather.precipitationProbability}%</p>
          </div>
        </div>
        <div className="bg-black/20 backdrop-blur-md rounded-3xl p-4 border border-white/5 flex items-center">
          <Wind className="w-5 h-5 text-gray-300 mr-3" />
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wider font-medium">Wind</p>
            <p className="text-lg text-white font-medium">8 mph</p>
          </div>
        </div>
      </div>

      <div className="bg-black/20 backdrop-blur-md rounded-3xl p-5 border border-white/5 relative z-10">
        <h3 className="text-xs font-medium text-white/60 mb-4 uppercase tracking-wider flex items-center">
          <Navigation className="w-3 h-3 mr-2" /> Hourly Forecast
        </h3>
        <div className="flex overflow-x-auto pb-2 space-x-6 scrollbar-hide">
          {weather.hourlyForecast.map((forecast, idx) => (
            <div key={idx} className="flex flex-col items-center min-w-[3rem]">
              <span className="text-sm text-white/80 mb-3 font-medium">{forecast.time}</span>
              <div className="bg-white/10 p-2 rounded-full mb-3 shadow-inner">
                {getWeatherIcon(weather.condition, "w-6 h-6")}
              </div>
              <span className="text-lg text-white font-medium">{forecast.temperature}°</span>
              <span className="text-xs text-blue-300 mt-1 font-medium">{forecast.precipitationProbability}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeatherWidget;
