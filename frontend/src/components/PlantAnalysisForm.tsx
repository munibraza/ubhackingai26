import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  X,
  Sparkles,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  Leaf,
  Droplet
} from 'lucide-react';

interface PlantAnalysisFormProps {
  onSubmit: (formData: FormData) => void;
  loading: boolean;
  error: string | null;
}

export const PlantAnalysisForm: React.FC<PlantAnalysisFormProps> = ({ onSubmit, loading, error }) => {
  // Form fields
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [crop] = useState('tomato');
  const [variety, setVariety] = useState('');
  const [harvestGoal, setHarvestGoal] = useState<'eat_now' | 'store_transport'>('eat_now');
  const [soilCondition, setSoilCondition] = useState<'dry_at_5cm' | 'moist' | 'wet' | 'unknown'>('dry_at_5cm');
  const [leafSymptoms, setLeafSymptoms] = useState<'none' | 'yellowing' | 'browning_spots' | 'wilting'>('none');
  const [demoScenario, setDemoScenario] = useState<string>('red'); // default to red so first run demonstrates complete path

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // File handling
  const handleFile = (file: File) => {
    setFileError(null);
    if (!file.type.startsWith('image/') && !file.name.toLowerCase().match(/\.(jpg|jpeg|png|heic|webp)$/)) {
      setFileError('Invalid format. Please select a JPEG, PNG, or HEIC photo.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setFileError('File size exceeds 15 MB limit.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    if (selectedFile) {
      data.append('image', selectedFile);
    }
    data.append('crop', crop);
    if (variety.trim()) {
      data.append('variety', variety.trim());
    }
    data.append('harvest_goal', harvestGoal);
    data.append('soil_condition', soilCondition);
    data.append('leaf_symptoms', leafSymptoms);
    if (demoScenario) {
      data.append('demo_scenario', demoScenario);
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-cream-300/80 shadow-sm p-4 sm:p-6 transition-all">
      {/* Title */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">Plant Analysis & Observation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit visual context and manual soil checks to evaluate crop recommendations.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-100 text-forest-800 border border-forest-200">
          Tomato Pilot
        </span>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div>
            <span className="font-bold">Error:</span> {error}
          </div>
        </div>
      )}

      {/* 1. Photo Capture / Upload Section */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          1. Plant / Fruit Photograph (iPhone Camera or File)
        </label>

        {imagePreview ? (
          <div className="relative rounded-2xl overflow-hidden border-2 border-forest-600 bg-slate-900 shadow-md">
            <img
              src={imagePreview}
              alt="Uploaded plant preview"
              className="w-full h-52 sm:h-64 object-contain bg-slate-950/60"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white flex items-center justify-between">
              <div className="text-xs">
                <p className="font-semibold truncate max-w-[200px] sm:max-w-xs">{selectedFile?.name}</p>
                <p className="text-[10px] text-slate-300">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ''} • Ready for analysis
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium flex items-center space-x-1 transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Hidden inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInputChange}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleInputChange}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Camera Button (Mobile prioritized) */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="p-4 rounded-xl border-2 border-dashed border-forest-700/40 bg-forest-50/50 hover:bg-forest-50 hover:border-forest-600 text-forest-900 flex flex-col items-center justify-center text-center transition group shadow-sm"
              >
                <div className="p-3 rounded-full bg-forest-100 text-forest-800 mb-2 group-hover:scale-105 transition">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold">Use iPhone Camera</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Capture live plant or fruit photo</span>
              </button>

              {/* Upload File / Gallery Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-xl border-2 border-dashed border-cream-300 bg-cream-50/50 hover:bg-cream-100 hover:border-cream-400 text-slate-700 flex flex-col items-center justify-center text-center transition group shadow-sm"
              >
                <div className="p-3 rounded-full bg-cream-200 text-slate-700 mb-2 group-hover:scale-105 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold">Upload from Gallery / Files</span>
                <span className="text-[11px] text-slate-500 mt-0.5">JPEG, PNG, HEIC up to 15 MB</span>
              </button>
            </div>

            {fileError && (
              <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{fileError}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* 2. DEMO SCENARIO SELECTOR (CRITICAL HACKATHON CAPABILITY) */}
      <div className="mb-6 p-4 rounded-2xl bg-purple-50/70 border-2 border-purple-200/90 shadow-sm">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-700" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-950">
              Demo Ripeness Scenario (Vision Model Simulator)
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">
            Rule Simulator
          </span>
        </div>
        <p className="text-xs text-purple-900/80 mb-3">
          Since the computer vision model is not connected yet, select a maturity state below to evaluate the deterministic agronomic rules. <span className="font-semibold underline">The system does not claim to infer this from the image.</span>
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'red', label: 'Red Tomato', sub: 'Likely Ripe', color: 'border-red-400 bg-red-50 text-red-900' },
            { id: 'turning', label: 'Turning Tomato', sub: 'Breaker Stage', color: 'border-amber-400 bg-amber-50 text-amber-900' },
            { id: 'green', label: 'Green Tomato', sub: 'Immature Stage', color: 'border-emerald-400 bg-emerald-50 text-emerald-900' },
            { id: 'uncertain', label: 'Uncertain / Unknown', sub: 'Occluded / Blurry', color: 'border-slate-300 bg-slate-100 text-slate-800' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setDemoScenario(item.id)}
              className={`p-2.5 rounded-xl border text-left transition relative flex flex-col justify-between ${
                demoScenario === item.id
                  ? `${item.color} ring-2 ring-purple-600 shadow-sm font-bold`
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div>
                <span className="block text-xs font-bold">{item.label}</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">{item.sub}</span>
              </div>
              {demoScenario === item.id && (
                <div className="self-end mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Crop Details & Context Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
        {/* Variety / Cultivar */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Tomato Variety / Cultivar <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={variety}
            onChange={(e) => setVariety(e.target.value)}
            placeholder="e.g. Roma, Beefsteak, Cherry, Early Girl"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs"
          />
        </div>

        {/* Harvest Goal */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Harvest Objective
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setHarvestGoal('eat_now')}
              className={`py-2 px-3 rounded-xl border text-center transition ${
                harvestGoal === 'eat_now'
                  ? 'bg-forest-900 text-white font-bold border-forest-900 shadow-sm'
                  : 'bg-cream-50 border-cream-300 text-slate-700 hover:bg-cream-100'
              }`}
            >
              Eat Fresh Today
            </button>
            <button
              type="button"
              onClick={() => setHarvestGoal('store_transport')}
              className={`py-2 px-3 rounded-xl border text-center transition ${
                harvestGoal === 'store_transport'
                  ? 'bg-forest-900 text-white font-bold border-forest-900 shadow-sm'
                  : 'bg-cream-50 border-cream-300 text-slate-700 hover:bg-cream-100'
              }`}
            >
              Store or Transport
            </button>
          </div>
        </div>
      </div>

      {/* 4. Manual Soil Moisture Check (University of Minnesota Extension Protocol) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Droplet className="w-4 h-4 text-sky-600" />
            <span>2. Tactile Root-Zone Soil Check (5 cm Depth)</span>
          </label>
          <span className="text-[10px] text-slate-500">UMN Extension Procedure</span>
        </div>
        <p className="text-xs text-slate-500 mb-2.5">
          Insert finger or trowel 5–10 cm into root-zone soil. Air relative humidity does not reflect root moisture.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { id: 'dry_at_5cm', label: 'Dry at 5 cm', desc: 'No moisture felt' },
            { id: 'moist', label: 'Moist / Damp', desc: 'Slightly cool, holds shape' },
            { id: 'wet', label: 'Wet / Saturated', desc: 'Waterlogged, muddy' },
            { id: 'unknown', label: 'Unknown', desc: 'Not checked' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSoilCondition(item.id as any)}
              className={`p-2.5 rounded-xl border text-left transition ${
                soilCondition === item.id
                  ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500 text-sky-950 font-bold shadow-sm'
                  : 'bg-cream-50/60 border-cream-300 text-slate-700 hover:bg-cream-100'
              }`}
            >
              <div className="font-bold text-xs">{item.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Visible Leaf Symptoms (Penn State Extension Differential) */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
          <Leaf className="w-4 h-4 text-emerald-600" />
          <span>3. Foliage / Leaf Observations (Optional Stress Check)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { id: 'none', label: 'No Symptoms', desc: 'Healthy green leaves' },
            { id: 'yellowing', label: 'Yellowing', desc: 'Foliar chlorosis' },
            { id: 'browning_spots', label: 'Brown Spots', desc: 'Necrotic lesions' },
            { id: 'wilting', label: 'Wilting', desc: 'Loss of leaf turgor' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLeafSymptoms(item.id as any)}
              className={`p-2.5 rounded-xl border text-left transition ${
                leafSymptoms === item.id
                  ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600 text-emerald-950 font-bold shadow-sm'
                  : 'bg-cream-50/60 border-cream-300 text-slate-700 hover:bg-cream-100'
              }`}
            >
              <div className="font-bold text-xs">{item.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-6 rounded-xl bg-forest-900 hover:bg-forest-800 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base tracking-wide flex items-center justify-center space-x-2 transition shadow-md disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Evaluating Agronomic Rules...</span>
          </>
        ) : (
          <>
            <span>Analyze Plant & Generate Advisories</span>
            <ChevronRight className="w-4 h-4 text-lime-bright" />
          </>
        )}
      </button>
    </form>
  );
};
