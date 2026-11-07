import React from 'react';
import { SensorReading } from '../types';
import {
  Thermometer,
  Droplets,
  Ruler,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Cpu,
  Sparkles,
  PowerOff
} from 'lucide-react';

interface SensorDashboardProps {
  sensors: SensorReading | null;
  loading: boolean;
  onRefresh: (disconnected?: boolean) => void;
  simulateDisconnected: boolean;
  onToggleDisconnected: () => void;
}

export const SensorDashboard: React.FC<SensorDashboardProps> = ({
  sensors,
  loading,
  onRefresh,
  simulateDisconnected,
  onToggleDisconnected,
}) => {
  const isDisconnected = simulateDisconnected || sensors?.data_mode === 'unavailable' || !sensors?.fresh;

  const formattedTime = sensors?.received_at_utc
    ? new Date(sensors.received_at_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Waiting...';

  return (
    <div className="bg-white rounded-2xl border border-cream-300/80 shadow-sm overflow-hidden transition-all">
      {/* Top Banner / Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-forest-900 to-forest-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-lime-bright" />
            <h2 className="text-lg font-bold tracking-tight">Environmental Sensor Telemetry</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-900/80 text-purple-200 border border-purple-400/40">
              <Sparkles className="w-2.5 h-2.5 mr-1 text-purple-300" />
              Simulated Data
            </span>
          </div>
          <p className="text-xs text-emerald-200/80 mt-0.5">
            Target Hardware: Adafruit METRO 328 (SHT30 I²C & RCWL-1601 Ultrasonic over USB-Serial)
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Disconnect Toggle for Testing */}
          <button
            onClick={onToggleDisconnected}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition ${
              simulateDisconnected
                ? 'bg-amber-600 text-white border-amber-500 hover:bg-amber-700'
                : 'bg-forest-800 text-slate-200 border-forest-700 hover:bg-forest-700'
            }`}
            title="Simulate hardware unplugged / disconnected state"
          >
            <PowerOff className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{simulateDisconnected ? 'Reconnect' : 'Simulate Offline'}</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={() => onRefresh(simulateDisconnected)}
            disabled={loading}
            className="p-1.5 rounded-lg bg-forest-800 hover:bg-forest-700 text-white border border-forest-700 transition disabled:opacity-50"
            title="Fetch latest reading"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Prominent Simulated Data Disclaimer */}
      <div className="bg-purple-50/70 border-b border-purple-100 px-4 py-2.5 flex items-start space-x-2.5 text-xs text-purple-900">
        <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">MOCK DEMONSTRATION MODE:</span> Readings below are generated from calibrated laboratory baseline models matching SHT30 & RCWL-1601 specifications. They will be replaced by the USB-Serial bridge when physical hardware is plugged into the laptop.
        </div>
      </div>

      {/* Disconnected Warning Alert */}
      {isDisconnected && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center space-x-2 text-xs font-medium text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Sensor hardware disconnected or simulated offline. Live telemetry is unavailable.</span>
        </div>
      )}

      {/* Sensor Metric Cards Grid */}
      <div className="p-4 sm:p-5 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Air Temperature */}
        <div className="p-4 rounded-xl bg-cream-50/80 border border-cream-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Air Temp (SHT30)</span>
            <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {isDisconnected || sensors?.air_temperature_c === null ? (
                <span className="text-slate-400 font-normal text-lg">--</span>
              ) : (
                <>
                  {sensors?.air_temperature_c}
                  <span className="text-base font-normal text-slate-500 ml-1">°C</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isDisconnected ? 'Unavailable' : 'Ambient Microclimate'}
            </p>
          </div>
        </div>

        {/* Air Relative Humidity */}
        <div className="p-4 rounded-xl bg-cream-50/80 border border-cream-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Air RH (SHT30)</span>
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {isDisconnected || sensors?.air_relative_humidity_pct === null ? (
                <span className="text-slate-400 font-normal text-lg">--</span>
              ) : (
                <>
                  {sensors?.air_relative_humidity_pct}
                  <span className="text-base font-normal text-slate-500 ml-1">%</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isDisconnected ? 'Unavailable' : 'Not root-zone moisture'}
            </p>
          </div>
        </div>

        {/* Ultrasonic Distance */}
        <div className="p-4 rounded-xl bg-cream-50/80 border border-cream-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Range (RCWL)</span>
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
              <Ruler className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {isDisconnected || sensors?.ultrasonic_distance_cm === null ? (
                <span className="text-slate-400 font-normal text-lg">--</span>
              ) : (
                <>
                  {sensors?.ultrasonic_distance_cm}
                  <span className="text-base font-normal text-slate-500 ml-1">cm</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isDisconnected ? 'Unavailable' : 'Sensor to plant surface'}
            </p>
          </div>
        </div>

        {/* Canopy Height Proxy */}
        <div className="p-4 rounded-xl bg-cream-50/80 border border-cream-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Canopy Height</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {isDisconnected || sensors?.canopy_height_proxy_cm === null ? (
                <span className="text-slate-400 font-normal text-lg">--</span>
              ) : (
                <>
                  {sensors?.canopy_height_proxy_cm}
                  <span className="text-base font-normal text-slate-500 ml-1">cm</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isDisconnected ? 'Unavailable' : 'Estimated height proxy'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer / Status bar */}
      <div className="px-4 py-2.5 bg-cream-100/60 border-t border-cream-200/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center space-x-2">
          <span className={`inline-block w-2 h-2 rounded-full ${isDisconnected ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
          <span>Status: <strong className="text-slate-700">{isDisconnected ? 'Disconnected / Stale' : 'Active (Simulated Profile)'}</strong></span>
        </div>
        <div>
          Last Polled: <span className="font-mono text-slate-700">{formattedTime}</span>
        </div>
      </div>
    </div>
  );
};
