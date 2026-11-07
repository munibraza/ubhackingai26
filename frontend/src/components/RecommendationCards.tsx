import React from 'react';
import { RecommendationCardData, AnalysisResponse } from '../types';
import { EvidenceBadge } from './EvidenceBadge';
import {
  Scissors,
  Droplet,
  FlaskConical,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface RecommendationCardsProps {
  analysis: AnalysisResponse;
}

export const RecommendationCards: React.FC<RecommendationCardsProps> = ({ analysis }) => {
  const { harvest, watering, fertilizer, scientific_summary, visual_observations } = analysis;

  const renderCard = (
    data: RecommendationCardData,
    icon: React.ReactNode,
    accentBorder: string,
    accentBg: string
  ) => {
    return (
      <div className={`rounded-2xl border ${accentBorder} bg-white shadow-sm overflow-hidden flex flex-col justify-between transition-all`}>
        <div>
          {/* Card Header */}
          <div className={`p-4 sm:p-5 ${accentBg} border-b ${accentBorder} flex items-start justify-between`}>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-white shadow-sm text-slate-800">
                {icon}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                  {data.category} Advisory
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  {data.title}
                </h3>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-4 text-xs">
            {/* Primary Recommendation */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Recommendation
              </span>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed bg-cream-50/70 p-3 rounded-xl border border-cream-200">
                {data.recommendation}
              </p>
            </div>

            {/* Evidence Checklist */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Traceable Evidence
              </span>
              <ul className="space-y-2">
                {data.evidence.map((item, idx) => (
                  <li key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">{item.label}</span>
                      <EvidenceBadge type={item.type} />
                    </div>
                    <span className="text-slate-600 text-[11px]">{item.detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Scientific Limitations & Uncertainty */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center space-x-1 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Limitations & Uncertainty</span>
              </span>
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-1">
                {data.limitations.map((limit, idx) => (
                  <p key={idx} className="flex items-start text-[11px] leading-snug">
                    <span className="text-amber-500 mr-1.5">•</span>
                    <span>{limit}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Immediate Next Action */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 flex items-center space-x-1 mb-1">
                <ArrowRight className="w-3.5 h-3.5 text-forest-700" />
                <span>Immediate Next Action</span>
              </span>
              <p className="p-2.5 rounded-xl bg-forest-50 border border-forest-200 text-forest-950 font-medium text-[11px]">
                {data.next_action}
              </p>
            </div>
          </div>
        </div>

        {/* Card Footer: Agricultural Citations */}
        <div className="p-3.5 bg-cream-100/70 border-t border-cream-200 text-[11px] text-slate-600">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Extension Reference
          </span>
          {data.references && data.references.length > 0 ? (
            <div className="space-y-1">
              {data.references.map((ref) => (
                <a
                  key={ref.id}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between font-semibold text-forest-800 hover:text-forest-950 hover:underline"
                >
                  <span className="truncate max-w-[240px] sm:max-w-xs">{ref.title} ({ref.organization})</span>
                  <ExternalLink className="w-3 h-3 ml-1 shrink-0" />
                </a>
              ))}
            </div>
          ) : (
            <span className="text-slate-400">Standard agronomic rule base</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Visual Observation Verification Banner */}
      <div className="p-4 rounded-2xl bg-white border border-cream-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${visual_observations.ai_provider === 'gemini-2.5-flash' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-700'}`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">Visual Stage Evaluation:</span>
              <span className={`font-extrabold text-sm ${visual_observations.ai_provider === 'gemini-2.5-flash' ? 'text-emerald-800' : 'text-purple-800'}`}>
                {visual_observations.stage_label}
              </span>
              {visual_observations.detected_plant && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Identified: {visual_observations.detected_plant}
                </span>
              )}
              {visual_observations.detected_leaf_color && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-300">
                  Foliage: {visual_observations.detected_leaf_color}
                </span>
              )}
            </div>
            {visual_observations.leaf_condition_summary && (
              <p className="text-xs text-emerald-950 font-medium mt-1 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200/60">
                🌿 <strong>Automated Leaf Health:</strong> {visual_observations.leaf_condition_summary}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-1">{visual_observations.observation_notes}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          {visual_observations.ai_provider === 'gemini-2.5-flash' ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              Gemini Multimodal AI
            </span>
          ) : (
            <EvidenceBadge type={visual_observations.is_simulated ? 'SIMULATED' : 'OBSERVED'} />
          )}
        </div>
      </div>

      {/* Multimodal Telemetry Fusion Card (When Gemini synthesized Image + Sensors + Weather) */}
      {visual_observations.ai_multimodal_synthesis && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/80 border border-emerald-200/90 shadow-sm text-xs text-slate-700">
          <div className="flex items-center space-x-2 mb-2 font-bold text-emerald-950 uppercase tracking-wider text-[11px]">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Gemini Multimodal Telemetry Synthesis (Image + Sensors + Weather)</span>
          </div>
          <p className="leading-relaxed text-slate-800 text-xs sm:text-sm font-medium">
            {visual_observations.ai_multimodal_synthesis}
          </p>
        </div>
      )}

      {/* The Three Core Recommendation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {renderCard(
          harvest,
          <Scissors className="w-5 h-5 text-red-600" />,
          'border-red-200',
          'bg-gradient-to-r from-red-50 to-orange-50'
        )}

        {renderCard(
          watering,
          <Droplet className="w-5 h-5 text-sky-600" />,
          'border-sky-200',
          'bg-gradient-to-r from-sky-50 to-blue-50'
        )}

        {renderCard(
          fertilizer,
          <FlaskConical className="w-5 h-5 text-emerald-600" />,
          'border-emerald-200',
          'bg-gradient-to-r from-emerald-50 to-teal-50'
        )}
      </div>

      {/* Scientific Transparency Statement */}
      <div className="p-4 sm:p-5 rounded-2xl bg-cream-100/90 border border-cream-300 shadow-inner text-xs text-slate-700">
        <div className="flex items-center space-x-2 mb-2 font-bold text-forest-950 uppercase tracking-wider text-[11px]">
          <ShieldAlert className="w-4 h-4 text-forest-700" />
          <span>Scientific Guardrails & Evidence Traceability Summary</span>
        </div>
        <p className="leading-relaxed mb-2 text-slate-600">
          {scientific_summary}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-cream-200/80 text-[11px] text-slate-500">
          <span>Key Guardrails:</span>
          <span className="px-2 py-0.5 rounded bg-white border border-cream-300 text-slate-700 font-medium">
            Air RH ≠ Soil Moisture
          </span>
          <span className="px-2 py-0.5 rounded bg-white border border-cream-300 text-slate-700 font-medium">
            No N-P-K Prescription Without Soil Test
          </span>
          <span className="px-2 py-0.5 rounded bg-white border border-cream-300 text-slate-700 font-medium">
            Maturity Depends on Cultivar & Firmness
          </span>
        </div>
      </div>
    </div>
  );
};
