import React from 'react';
import { EvidenceType } from '../types';
import { Sparkles, User, CloudRain, AlertCircle, Eye } from 'lucide-react';

interface Props {
  type: EvidenceType;
  label?: string;
  className?: string;
}

export const EvidenceBadge: React.FC<Props> = ({ type, label, className = '' }) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'SIMULATED':
        return {
          icon: <Sparkles className="w-3 h-3 mr-1" />,
          text: label || 'SIMULATED',
          styles: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20',
        };
      case 'USER_REPORTED':
        return {
          icon: <User className="w-3 h-3 mr-1" />,
          text: label || 'USER REPORTED',
          styles: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
        };
      case 'WEATHER_FORECAST':
        return {
          icon: <CloudRain className="w-3 h-3 mr-1" />,
          text: label || 'WEATHER FORECAST',
          styles: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20',
        };
      case 'NOT_MEASURED':
        return {
          icon: <AlertCircle className="w-3 h-3 mr-1" />,
          text: label || 'NOT MEASURED',
          styles: 'bg-slate-100 text-slate-600 border-slate-300 ring-slate-500/20',
        };
      case 'OBSERVED':
        return {
          icon: <Eye className="w-3 h-3 mr-1" />,
          text: label || 'OBSERVED',
          styles: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
        };
      default:
        return {
          icon: null,
          text: label || type,
          styles: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  const { icon, text, styles } = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase border ring-1 ${styles} ${className}`}
    >
      {icon}
      {text}
    </span>
  );
};
