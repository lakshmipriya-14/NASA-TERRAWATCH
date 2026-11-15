import React, { useState } from 'react';
import {
  FileText,
  Download,
  Share2,
  Calendar,
  Layers,
  MapPin,
  Check,
  Printer,
  Info,
  Sparkles,
  BarChart3
} from 'lucide-react';

export default function AnalysisSummary({ analysis, module = 'water' }) {
  const [copied, setCopied] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);

  if (!analysis) return null;

  const {
    id,
    region_name,
    before_date,
    after_date,
    product_type,
    unit,
    stats = {},
    categories_breakdown = [],
  } = analysis;

  // Simple friendly change descriptions
  const getChangeDescription = () => {
    if (module === 'water') {
      const flooded = stats.newly_inundated_water_km2 || 0;
      const total = stats.total_water_impacted_km2 || 0;
      return {
        title: 'Increase in Water Coverage & Flooding',
        detail: `The satellite detected ${total} km² of water-covered land, including ${flooded} km² of new open water.`,
        badgeColor: 'text-cyan-400 bg-cyan-950/80 border-cyan-800'
      };
    } else if (module === 'forest') {
      const severe = stats.severe_canopy_loss_km2 || 0;
      const total = stats.total_disturbed_forest_km2 || 0;
      return {
        title: 'Tree Canopy Thinning & Foliage Loss',
        detail: `The satellite observed a reduction in leafy branch cover across ${total} km² of forest area.`,
        badgeColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
      };
    } else if (module === 'agriculture') {
      const moist = stats.soil_moisture_surge_km2 || 0;
      return {
        title: 'Farmland Moisture & Crop Changes',
        detail: `About ${moist} km² showed a surge in field moisture, alongside crop growth and harvest patterns.`,
        badgeColor: 'text-amber-400 bg-amber-950/80 border-amber-800'
      };
    } else {
      const maxSub = stats.max_los_subsidence_cm || 0;
      return {
        title: 'Ground Movement & Settling',
        detail: `The satellite measured surface settling of up to ${Math.abs(maxSub)} cm along the line of sight.`,
        badgeColor: 'text-rose-400 bg-rose-950/80 border-rose-800'
      };
    }
  };

  const changeInfo = getChangeDescription();

  // Primary area changed
  const changedAreaKm2 = stats.total_water_impacted_km2 ||
    stats.total_disturbed_forest_km2 ||
    stats.soil_moisture_surge_km2 ||
    stats.deforming_subsidence_area_km2 ||
    0;

  // Print as PDF
  const handlePrintPDF = () => {
    window.print();
  };

  // Download change map canvas as image
  const handleDownloadMap = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `TerraWatch_Map_${region_name.replace(/\s+/g, '_')}_${after_date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else {
      alert('Map visual ready for download.');
    }
  };

  // Share summary
  const handleShare = () => {
    const summaryText = `TerraWatch Analysis for ${region_name} (${before_date} to ${after_date}): ${changeInfo.title}. ${changedAreaKm2} km² affected area detected by NISAR radar.`;
    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="p-6 rounded-2xl bg-space-850/90 border border-space-750 shadow-xl space-y-6">
      {/* Top Header & Friendly Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-space-750 pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-space-800 text-cyan-300 border border-space-700">
            Observation Analysis #{id}
          </span>
          <h3 className="text-xl font-bold text-white mt-1">{region_name}</h3>
          <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Comparing: <b>{before_date}</b> with <b>{after_date}</b></span>
            <span>•</span>
            <span className="text-slate-400">Satellite: NASA–ISRO NISAR</span>
          </p>
        </div>

        {/* Action Buttons: PDF, Download Map, Share */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold text-xs transition shadow-sm"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download Report (PDF)</span>
          </button>

          <button
            onClick={handleDownloadMap}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-space-800 hover:bg-space-750 text-slate-200 border border-space-700 text-xs font-semibold transition"
            title="Save map as image"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save Map</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-space-800 hover:bg-space-750 text-slate-200 border border-space-700 text-xs font-semibold transition"
            title="Copy summary link to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'Copied!' : 'Share Results'}</span>
          </button>
        </div>
      </div>

      {/* Simple Results Summary Card (As Requested!) */}
      <div className="rounded-xl border border-space-700 bg-space-900/90 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-space-750 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Satellite Findings at a Glance
          </span>
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${changeInfo.badgeColor}`}>
            {changeInfo.title}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 block font-medium">Area Investigated</span>
            <span className="text-sm font-bold text-white block">{region_name}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 block font-medium">Change Detected</span>
            <span className="text-sm font-bold text-cyan-300 block">{changeInfo.title}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 block font-medium">Total Area Changed</span>
            <span className="text-2xl font-extrabold text-white font-mono block">
              {changedAreaKm2} <span className="text-xs text-slate-400 font-normal">km²</span>
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 block font-medium">Observation Window</span>
            <span className="text-xs font-mono text-slate-200 block">
              {before_date} <span className="text-slate-400">→</span> {after_date}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 pt-1 leading-relaxed border-t border-space-800">
          {changeInfo.detail}
        </p>
      </div>

      {/* Surface Categories Breakdown */}
      {categories_breakdown.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Breakdown of Changed Zones (in Square Kilometres)</span>
            </span>
          </div>

          {/* Color-coded distribution progress bar */}
          <div className="w-full h-3 rounded-full bg-space-900 overflow-hidden flex shadow-inner">
            {categories_breakdown.map((cat) => {
              const totalArea = categories_breakdown.reduce((acc, c) => acc + (c.area_km2 || 0), 0) || 1;
              const pct = Math.max(1, ((cat.area_km2 || 0) / totalArea) * 100);
              return (
                <div
                  key={cat.id}
                  style={{ width: `${pct}%`, backgroundColor: cat.color }}
                  title={`${cat.name}: ${cat.area_km2} km²`}
                  className="h-full transition-all duration-500"
                />
              );
            })}
          </div>

          {/* Simple Category Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            {categories_breakdown.map((cat) => (
              <div
                key={cat.id}
                className="p-2.5 rounded-xl bg-space-900 border border-space-750 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-200 font-medium">{cat.name}</span>
                </div>
                <span className="font-mono font-bold text-white">{cat.area_km2} km²</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collapsible Technical Details (Kept hidden unless wanted) */}
      <div className="pt-1 border-t border-space-750">
        <button
          onClick={() => setShowTechDetails(!showTechDetails)}
          className="text-xs text-slate-400 hover:text-cyan-400 font-medium flex items-center gap-1.5 transition"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{showTechDetails ? 'Hide Technical Radar Details' : 'View Technical Radar Details (For Researchers)'}</span>
        </button>

        {showTechDetails && (
          <div className="mt-3 p-3.5 rounded-xl bg-space-900 border border-space-750 text-xs text-slate-300 font-mono space-y-1.5">
            <div>Product Type: <span className="text-cyan-300">{product_type}</span></div>
            <div>Measurement Unit: <span className="text-white">{unit}</span></div>
            <div>Calculated Pixels: <span className="text-white">{stats.valid_pixel_coverage_pct || 100}% valid</span></div>
            <div>Processing Algorithm: <span className="text-slate-400">Calibrated NISAR L-band spatial difference</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
