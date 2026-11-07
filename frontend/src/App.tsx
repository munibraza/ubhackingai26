import React, { useState, useEffect, useRef } from 'react';
import {
  SensorReading,
  WeatherSummary,
  AnalysisResponse,
} from './types';
import {
  fetchLatestSensors,
  fetchWeather,
  submitPlantAnalysis,
} from './services/api';
import { Navbar } from './components/Navbar';
import { SensorDashboard } from './components/SensorDashboard';
import { WeatherCard } from './components/WeatherCard';
import { PlantAnalysisForm } from './components/PlantAnalysisForm';
import { RecommendationCards } from './components/RecommendationCards';
import { KnowledgeModal } from './components/KnowledgeModal';
import {
  Sprout,
  ArrowDown,
  ShieldCheck,
  Cpu,
  Leaf
} from 'lucide-react';

export const App: React.FC = () => {
  // Sensor State
  const [sensors, setSensors] = useState<SensorReading | null>(null);
  const [sensorsLoading, setSensorsLoading] = useState(false);
  const [simulateDisconnected, setSimulateDisconnected] = useState(false);

  // Weather State
  const [weather, setWeather] = useState<WeatherSummary | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Analysis State
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Modal State
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  const analysisFormRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    loadSensors(false);
    loadWeather();
  }, []);

  const loadSensors = async (disconnected: boolean = false) => {
    setSensorsLoading(true);
    try {
      const data = await fetchLatestSensors(disconnected);
      setSensors(data);
    } catch (err: any) {
      console.error('Failed to load sensors:', err);
    } finally {
      setSensorsLoading(false);
    }
  };

  const handleToggleDisconnected = () => {
    const nextState = !simulateDisconnected;
    setSimulateDisconnected(nextState);
    loadSensors(nextState);
  };

  const loadWeather = async (lat?: number, lon?: number, name?: string) => {
    setWeatherLoading(true);
    try {
      const data = await fetchWeather(lat, lon, name);
      setWeather(data);
    } catch (err: any) {
      console.error('Failed to load weather:', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleAnalysisSubmit = async (formData: FormData) => {
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const response = await submitPlantAnalysis(formData);
      setAnalysis(response);

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setAnalysisError(err.message || 'An error occurred during agronomic analysis.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const scrollToAnalysis = () => {
    analysisFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col font-sans">
      <Navbar
        onOpenKnowledge={() => setIsKnowledgeOpen(true)}
        dataMode={sensors?.data_mode || 'simulated'}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* A. Hero & Overview Dashboard */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white p-6 sm:p-10 shadow-xl border border-forest-800">
          {/* Subtle background decorative shapes */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-lime-bright/10 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-forest-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl">
            {/* Pill */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-800/80 border border-forest-700 text-lime-200 mb-4 shadow-sm">
              <Leaf className="w-3.5 h-3.5 text-lime-bright" />
              <span>Pilot Crop: Tomato (Solanum lycopersicum)</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white mb-3">
              Multimodal Decision-Support for Small Growers
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed mb-6 font-normal">
              FolLand AI fuses mobile camera images, ambient microclimate sensors (SHT30 & RCWL-1601), and local weather forecasts with peer-reviewed university extension guidance to deliver evidence-backed harvest, watering, and fertilization recommendations.
            </p>

            {/* Quick Actions & Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={scrollToAnalysis}
                className="px-5 py-3 rounded-xl bg-lime-bright hover:bg-lime-400 active:scale-[0.98] text-forest-950 font-extrabold text-xs sm:text-sm tracking-wide flex items-center space-x-2 transition shadow-lg shadow-lime-bright/20"
              >
                <span>Analyze Tomato Plant</span>
                <ArrowDown className="w-4 h-4 text-forest-950" />
              </button>

              <button
                onClick={() => setIsKnowledgeOpen(true)}
                className="px-4 py-3 rounded-xl bg-forest-900/90 hover:bg-forest-800 text-white font-bold text-xs sm:text-sm border border-forest-700/80 transition flex items-center space-x-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-lime-bright" />
                <span>Evidence & Limitations</span>
              </button>
            </div>
          </div>
        </section>

        {/* B. Sensor Telemetry & Regional Weather Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-forest-700" />
              <span>Live Telemetry & Environmental Context</span>
            </h2>
          </div>

          <div className="space-y-4">
            <SensorDashboard
              sensors={sensors}
              loading={sensorsLoading}
              onRefresh={loadSensors}
              simulateDisconnected={simulateDisconnected}
              onToggleDisconnected={handleToggleDisconnected}
            />

            <WeatherCard
              weather={weather}
              loading={weatherLoading}
              onUpdateLocation={loadWeather}
            />
          </div>
        </section>

        {/* C. Plant Analysis Input Form */}
        <section ref={analysisFormRef} className="pt-2">
          <PlantAnalysisForm
            onSubmit={handleAnalysisSubmit}
            loading={analysisLoading}
            error={analysisError}
          />
        </section>

        {/* D. Analysis Results Section */}
        {analysis && (
          <section ref={resultsRef} className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Agronomic Analysis & Recommendations
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ID: <span className="font-mono text-slate-700 font-semibold">{analysis.analysis_id}</span> • Evaluated against University of Minnesota & Penn State Extension criteria.
                </p>
              </div>
            </div>

            <RecommendationCards analysis={analysis} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-forest-950 text-slate-400 py-8 border-t border-forest-900 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Sprout className="w-4 h-4 text-lime-bright" />
            <span className="font-bold text-white">FolLand AI</span>
            <span>— UB Hacking Smart Agriculture Prototype</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400 text-[11px]">
            <span>Initial Crop: Tomato</span>
            <span>•</span>
            <button
              onClick={() => setIsKnowledgeOpen(true)}
              className="text-emerald-300 hover:underline"
            >
              Scientific References
            </button>
            <span>•</span>
            <span>Open-Meteo CC BY 4.0</span>
          </div>
        </div>
      </footer>

      {/* Extension Knowledge Modal */}
      <KnowledgeModal
        isOpen={isKnowledgeOpen}
        onClose={() => setIsKnowledgeOpen(false)}
      />
    </div>
  );
};
export default App;
