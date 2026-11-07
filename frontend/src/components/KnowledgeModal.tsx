import React from 'react';
import { X, BookOpen, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';

interface KnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeModal: React.FC<KnowledgeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sources = [
    {
      title: 'Growing tomatoes in home gardens',
      org: 'University of Minnesota Extension',
      url: 'https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-tomatoes',
      takeaways: 'Ripeness stage guidelines, temperature effects on color development (stalls above 30°C), and indoor ripening of mature-green tomatoes at breaker stage.',
    },
    {
      title: 'Watering the vegetable garden',
      org: 'University of Minnesota Extension',
      url: 'https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/watering-the-vegetable-garden',
      takeaways: 'Root-zone physical moisture checking protocol (5–10 cm depth). Critical scientific boundary: ambient air relative humidity is NOT soil moisture.',
    },
    {
      title: 'Diagnosing poor plant health',
      org: 'Penn State Extension',
      url: 'https://extension.psu.edu/diagnosing-poor-plant-health',
      takeaways: 'Differential foliar diagnosis: symptoms of yellowing and wilting heavily overlap between overwatering, root rot, fungal disease, temperature stress, and nitrogen starvation.',
    },
    {
      title: 'Diagnosing common problems in the vegetable garden',
      org: 'Penn State Extension',
      url: 'https://extension.psu.edu/diagnosing-common-problems-in-the-vegetable-garden',
      takeaways: 'Nutrient application caution: never prescribe synthetic N-P-K doses without calibrated soil assay; excess nitrogen inhibits fruit setting and causes blossom end rot.',
    },
    {
      title: 'Open-Meteo Weather Forecast API',
      org: 'Open-Meteo',
      url: 'https://open-meteo.com/en/docs',
      takeaways: 'Attributed meteorological precipitation and temperature forecasts used for environmental context (CC BY 4.0).',
    },
    {
      title: 'Adafruit METRO 328 & Sensors',
      org: 'Adafruit & Sensirion',
      url: 'https://www.adafruit.com/product/2488',
      takeaways: 'SHT30 ±0.2°C / ±2% RH microclimate sensor and RCWL-1601 ultrasonic distance finder connected via USB-Serial bridge.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-cream-300 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-forest-950 text-white flex items-center justify-between border-b border-forest-900">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-forest-800 text-lime-bright">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Curated Extension Knowledge & Scientific Guardrails</h2>
              <p className="text-xs text-emerald-200/80">Every recommendation is traceable to peer-reviewed agronomic research.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Core Differentiation Callout */}
          <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-forest-950 text-sm mb-1">Evidence Traceability vs. Black-Box Diagnosis</h3>
              <p className="text-slate-600 leading-relaxed">
                Unlike consumer plant apps that output confident labels without justification, <strong>FolLand AI</strong> strictly separates <em>measured observations</em>, <em>user reports</em>, and <em>unmeasured variables</em>. It actively refuses to invent nutrient doses or claim soil moisture from air humidity.
              </p>
            </div>
          </div>

          {/* Scientific Limitations Grid */}
          <div>
            <h3 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Rigorous Hackathon Scientific Limitations</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                <span className="font-bold text-slate-800 block mb-1">Air RH ≠ Soil Water</span>
                <span className="text-[11px] text-slate-500">Air humidity measures vapor pressure in the microclimate, not liquid matric potential in root pores.</span>
              </div>
              <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                <span className="font-bold text-slate-800 block mb-1">No Photo N-P-K</span>
                <span className="text-[11px] text-slate-500">Leaf photos cannot quantify elemental nitrogen or phosphorus. Foliar yellowing has multiple overlapping causes.</span>
              </div>
              <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                <span className="font-bold text-slate-800 block mb-1">Color vs Ripeness</span>
                <span className="text-[11px] text-slate-500">Green-when-ripe cultivars and mature-green fruit require variety awareness and tactile firmness verification.</span>
              </div>
            </div>
          </div>

          {/* Sources List */}
          <div>
            <h3 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
              Curated Agricultural Extension Sources
            </h3>
            <div className="space-y-2.5">
              {sources.map((src, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-cream-200 bg-white hover:border-forest-400 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{src.title}</span>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-forest-700 hover:text-forest-900 font-semibold flex items-center space-x-1 text-[11px]"
                    >
                      <span>Visit Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider block mb-1">
                    {src.org}
                  </span>
                  <p className="text-[11px] text-slate-600 leading-snug">{src.takeaways}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-cream-100 border-t border-cream-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs transition"
          >
            Close & Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
