import React, { useState } from 'react';
import { WeatherSummary } from '../types';
import { CloudRain, MapPin, ExternalLink, Settings2, Check, AlertCircle } from 'lucide-react';

interface WeatherCardProps {
  weather: WeatherSummary | null;
  loading: boolean;
  onUpdateLocation: (lat: number, lon: number, name: string) => void;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, loading: _loading, onUpdateLocation }) => {
  const [showConfig, setShowConfig] = useState(false);
  const [latInput, setLatInput] = useState(weather?.latitude?.toString() || '42.8864');
  const [lonInput, setLonInput] = useState(weather?.longitude?.toString() || '-78.8784');
  const [nameInput, setNameInput] = useState(weather?.location_name || 'Buffalo, NY');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);
    if (!isNaN(lat) && !isNaN(lon)) {
      onUpdateLocation(lat, lon, nameInput);
      setShowConfig(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-cream-300/80 shadow-sm p-4 sm:p-5 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Regional Meteorological Forecast</h3>
            <div className="flex items-center text-xs text-slate-500 space-x-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-forest-700" />
              <span className="font-semibold text-slate-700">{weather?.location_name || 'Buffalo, NY (Demo Location)'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-cream-100 border border-cream-300/60 transition"
          title="Change location coordinates"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {/* Optional Location Config Form */}
      {showConfig && (
        <form onSubmit={handleApply} className="mb-4 p-3 rounded-xl bg-cream-50 border border-cream-200 text-xs">
          <div className="font-bold text-slate-700 mb-2">Configure Demonstration Location Coordinates</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
            <div>
              <label className="text-slate-500 block mb-1">Location Label</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-forest-600"
                placeholder="e.g. Ithaca, NY"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={lonInput}
                onChange={(e) => setLonInput(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-forest-600"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowConfig(false)}
              className="px-2.5 py-1 rounded-lg text-slate-600 hover:bg-slate-200/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded-lg bg-forest-800 text-white font-semibold hover:bg-forest-700 flex items-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Update Weather</span>
            </button>
          </div>
        </form>
      )}

      {/* Fallback Banner if Open-Meteo was unreachable */}
      {weather?.is_fallback && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Weather API unreachable; displaying certified offline fallback demonstration forecast.</span>
        </div>
      )}

      {/* Grid of Weather Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-cream-50/70 border border-cream-200">
          <span className="text-slate-500 block mb-1">Temperature</span>
          <span className="text-lg font-bold text-slate-800">
            {weather?.temperature_c !== null ? `${weather?.temperature_c}°C` : '--'}
          </span>
          <span className="block text-[10px] text-slate-400 mt-0.5">{weather?.weather_description || 'Open-Meteo'}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-cream-50/70 border border-cream-200">
          <span className="text-slate-500 block mb-1">Regional RH</span>
          <span className="text-lg font-bold text-slate-800">
            {weather?.relative_humidity_pct !== null ? `${weather?.relative_humidity_pct}%` : '--'}
          </span>
          <span className="block text-[10px] text-slate-400 mt-0.5">Modeled 2m altitude</span>
        </div>

        <div className="p-2.5 rounded-xl bg-cream-50/70 border border-cream-200">
          <span className="text-slate-500 block mb-1">Rain Past 24h</span>
          <span className="text-lg font-bold text-slate-800">
            {weather?.rain_last_24h_mm !== null ? `${weather?.rain_last_24h_mm} mm` : '--'}
          </span>
          <span className="block text-[10px] text-slate-400 mt-0.5">Observed precipitation</span>
        </div>

        <div className="p-2.5 rounded-xl bg-cream-50/70 border border-cream-200">
          <span className="text-slate-500 block mb-1">Rain Next 24h</span>
          <span className="text-lg font-bold text-slate-800">
            {weather?.rain_next_24h_mm !== null ? `${weather?.rain_next_24h_mm} mm` : '--'}
          </span>
          <span className="block text-[10px] text-slate-400 mt-0.5">Forecast precipitation</span>
        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="mt-3 pt-2.5 border-t border-cream-200 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center space-x-1">
          <span>Data source:</span>
          <strong className="text-slate-700">{weather?.source === 'open-meteo' ? 'Open-Meteo (CC BY 4.0)' : 'Simulated Weather'}</strong>
        </span>
        <a
          href="https://open-meteo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-forest-700 hover:text-forest-900 inline-flex items-center space-x-0.5"
        >
          <span>Attribution</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
