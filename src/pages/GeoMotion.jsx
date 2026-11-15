import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ActivitySquare,
  Calendar,
  Layers,
  Sliders,
  Play,
  AlertCircle,
  Info,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../api';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import ChangeDetectionMap from '../components/ChangeDetectionMap';
import AnalysisSummary from '../components/AnalysisSummary';
import ObservationTimeline from '../components/ObservationTimeline';
import AIInsightsPanel from '../components/AIInsightsPanel';

export default function GeoMotion() {
  const [searchParams] = useSearchParams();
  const initialRegionId = searchParams.get('region') || 'geo_turkey';

  const [regions, setRegions] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState(initialRegionId);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [beforeDate, setBeforeDate] = useState('');
  const [afterDate, setAfterDate] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getRegions('deformation').then((res) => {
      let regionList = [...res];
      if (initialRegionId && initialRegionId.startsWith('custom_') && !regionList.find(r => r.id === initialRegionId)) {
        const parts = initialRegionId.split('_');
        const clat = parseFloat(parts[1]) || 20.0;
        const clon = parseFloat(parts[2]) || 78.0;
        regionList.unshift({
          id: initialRegionId,
          name: `Custom Location (${clat.toFixed(2)}°, ${clon.toFixed(2)}°)`,
          category: 'deformation',
          country: 'Custom Target Coordinates',
          lat: clat,
          lon: clon,
          zoom: 10,
          description: `User-selected coordinate at ${clat.toFixed(4)}°N, ${clon.toFixed(4)}°E.`,
          baseline_product: 'NISAR L-band GUNW Interferogram',
          available_dates: ['2026-05-01', '2026-06-15', '2026-08-01', '2026-09-20'],
          default_pair: ['2026-05-01', '2026-08-01'],
          polarizations: ['HH'],
        });
      }
      setRegions(regionList);
      const matched = regionList.find((r) => r.id === selectedRegionId) || regionList[0];
      if (matched) {
        setSelectedRegion(matched);
        setSelectedRegionId(matched.id);
        setBeforeDate(matched.default_pair[0]);
        setAfterDate(matched.default_pair[1]);
      }
    });
  }, []);

  const handleRegionChange = (newId) => {
    setSelectedRegionId(newId);
    const r = regions.find((x) => x.id === newId);
    if (r) {
      setSelectedRegion(r);
      setBeforeDate(r.default_pair[0]);
      setAfterDate(r.default_pair[1]);
      setAnalysis(null);
    }
  };

  const runAnalysis = () => {
    setLoading(true);
    setError(null);
    api.runDeformationAnalysis({
      region_id: selectedRegionId,
      module: 'deformation',
      before_date: beforeDate,
      after_date: afterDate,
      polarization: 'HH',
    })
      .then((res) => setAnalysis(res))
      .catch((err) => setError(err.message || 'Interferometric analysis failed.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedRegionId && beforeDate && afterDate) {
      runAnalysis();
    }
  }, [selectedRegionId, beforeDate, afterDate]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-space-900 via-space-850 to-space-900 border border-rose-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-rose-950 border border-rose-700/60 text-rose-400 shadow-glow-rose">
              <ActivitySquare className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">GeoMotion</h1>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                  Land Movement & Quakes
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Explore ground movement, monitor sinking land (subsidence), and visualize earthquake fault shifts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Guided 3-Step Controls */}
      <div className="p-5 rounded-2xl bg-space-850/90 border border-space-750 shadow-lg space-y-4">
        <span className="text-xs font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-rose-400" />
          <span>Choose Fault Zone and Dates to Compare</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-[11px] font-medium text-slate-300 block mb-1">
              1. Choose a Fault or Subsidence Zone:
            </label>
            <select
              value={selectedRegionId}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full bg-space-800 border border-space-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.country})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-300 block mb-1">
              2. First Date (Before Shift):
            </label>
            <select
              value={beforeDate}
              onChange={(e) => setBeforeDate(e.target.value)}
              className="w-full bg-space-800 border border-space-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
            >
              {selectedRegion?.available_dates?.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-300 block mb-1">
              3. Second Date (After Shift):
            </label>
            <select
              value={afterDate}
              onChange={(e) => setAfterDate(e.target.value)}
              className="w-full bg-space-800 border border-space-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
            >
              {selectedRegion?.available_dates?.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-space-950 font-bold text-xs flex items-center justify-center gap-2 shadow-glow-rose transition"
            >
              <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Measuring Shift...' : 'Run Satellite Analysis'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Simple Concept */}
      <div className="p-4 rounded-xl bg-space-900 border border-space-750 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
        <div className="leading-relaxed">
          <span className="text-rose-300 font-semibold">How Radar Measures Ground Movement: </span>
          Radar waves act like a giant cosmic tape measure. By comparing the exact timing of the wave reflection between two passes, the satellite can detect tiny surface shifts down to centimeters (red = land settled/sunk, blue = land rose).
        </div>
      </div>

      {/* Results */}
      {analysis && (
        <div className="space-y-6">
          <AnalysisSummary analysis={analysis} module="deformation" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BeforeAfterSlider
              beforeGrid={analysis.before_grid}
              afterGrid={analysis.after_grid}
              beforeDate={analysis.before_date}
              afterDate={analysis.after_date}
              unit="rad"
              module="deformation"
              polarization="HH"
              height={360}
            />

            <ChangeDetectionMap
              changeGrid={analysis.change_grid}
              classGrid={analysis.class_grid}
              legend={analysis.legend}
              categories={analysis.categories_breakdown}
              unit="cm LOS"
              module="deformation"
              title="Map Highlighting Ground Movement (Red: Sinking, Blue: Uplift)"
              height={360}
            />
          </div>

          <ObservationTimeline
            data={analysis.series}
            unit="cm"
            metricName="Cumulative Ground Movement"
            color="#ff5c77"
            title="Ground Movement Trend Across Observation Passes"
          />

          <AIInsightsPanel analysisId={analysis.id} analysisData={analysis} />
        </div>
      )}
    </div>
  );
}
