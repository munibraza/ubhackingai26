import React from 'react';
import { Sprout, BookOpen, Cpu } from 'lucide-react';

interface NavbarProps {
  onOpenKnowledge: () => void;
  dataMode?: 'simulated' | 'live' | 'unavailable';
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenKnowledge, dataMode = 'simulated' }) => {
  return (
    <header className="sticky top-0 z-40 bg-forest-950 text-white border-b border-forest-900/60 shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-forest-800 flex items-center justify-center border border-forest-700 shadow-inner">
              <Sprout className="w-6 h-6 text-lime-bright" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  FolLand<span className="text-lime-bright">.ai</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-forest-800 text-lime-200 border border-forest-700">
                  MVP
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 hidden sm:block">
                Multimodal Decision-Support for Smart Agriculture
              </p>
            </div>
          </div>

          {/* Right Action & Status Pills */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Data Mode Indicator */}
            <div className="flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-forest-900 border border-forest-800 text-emerald-100">
              <span className="relative flex h-2 w-2 mr-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  dataMode === 'simulated' ? 'bg-purple-400' : dataMode === 'live' ? 'bg-emerald-400' : 'bg-red-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  dataMode === 'simulated' ? 'bg-purple-500' : dataMode === 'live' ? 'bg-emerald-500' : 'bg-red-500'
                }`}></span>
              </span>
              <span className="hidden sm:inline">Sensor Feed:</span>
              <span className="font-bold ml-1 uppercase text-[11px] text-purple-300">
                {dataMode}
              </span>
            </div>

            {/* Hardware badge */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs bg-forest-900 border border-forest-800 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-lime-bright" />
              <span>METRO 328</span>
            </div>

            {/* Agricultural Knowledge Button */}
            <button
              onClick={onOpenKnowledge}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-forest-800 hover:bg-forest-700 text-white border border-forest-700 transition shadow-sm"
              title="View Curated Extension Guidelines & Citations"
            >
              <BookOpen className="w-3.5 h-3.5 text-lime-bright" />
              <span className="hidden xs:inline">Sources</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
