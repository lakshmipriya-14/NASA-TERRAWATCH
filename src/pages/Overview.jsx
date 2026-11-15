import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Globe2,
  Search,
  Droplets,
  Trees,
  Sprout,
  ActivitySquare,
  ArrowRight,
  Satellite,
  Layers,
  Calendar,
  CheckCircle2,
  X,
  Compass,
  MoveHorizontal,
  Eye,
  Sparkles,
} from 'lucide-react';
import { api } from '../api';
import InteractiveMap from '../components/InteractiveMap';
import MonitoringModuleCard from '../components/MonitoringModuleCard';
import RecentActivityTable from '../components/RecentActivityTable';
import StatisticsCard from '../components/StatisticsCard';

const INVESTIGATION_OPTIONS = [
  { id: 'water', label: 'Water', desc: 'Water bodies & flood spread', icon: Droplets, color: 'text-cyan-400', route: '/water' },
  { id: 'forest', label: 'Forest', desc: 'Tree cover & vegetation changes', icon: Trees, color: 'text-emerald-400', route: '/forest' },
  { id: 'agriculture', label: 'Agriculture', desc: 'Farmland & soil moisture', icon: Sprout, color: 'text-amber-400', route: '/agro' },
  { id: 'deformation', label: 'Land Movement', desc: 'Earthquakes & ground subsidence', icon: ActivitySquare, color: 'text-rose-400', route: '/geo' },
];

// Interactive Split-Curtain Image Slider for Feature 3 Showcase (Porto Alegre river flood style)
function ShowcaseComparisonSlider({
  beforeImage = '/images/flood_comparison_before.png',
  afterImage = '/images/flood_comparison_after.png',
  beforeLabel = 'Before Flood (Normal River Flow)',
  afterLabel = 'After Flood (Inundated Floodwaters)',
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    setSliderPos((x / rect.width) * 100);
  };

  const handleMouseMove = (e) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length > 0) handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  return (
    <div className="relative rounded-2xl border border-space-700 bg-space-950 overflow-hidden shadow-2xl flex flex-col">
      {/* Top Banner */}
      <div className="p-3 bg-space-900 border-b border-space-750 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white">Interactive Flood Comparison (River Basin)</span>
          <span className="text-[10px] text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            Drag the slider sideways to compare
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-slate-300">
            Dry: <b className="text-white">April 10, 2026</b>
          </span>
          <span className="text-slate-500">vs</span>
          <span className="text-cyan-300">
            Flood: <b className="text-white">May 05, 2026</b>
          </span>
        </div>
      </div>

      {/* Slider Viewport */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        className="relative w-full h-[380px] sm:h-[420px] select-none cursor-ew-resize overflow-hidden bg-space-900"
      >
        {/* Layer 2: After Flood (Full Background) */}
        <div className="absolute inset-0">
          <img
            src={afterImage}
            alt="After Flood"
            className="w-full h-full object-cover pointer-events-none"
          />
          <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-space-900/90 backdrop-blur-md border border-cyan-700 text-[11px] font-semibold text-cyan-300 pointer-events-none shadow-lg">
            {afterLabel}
          </div>
        </div>

        {/* Layer 1: Before Flood (Clipped with width percentage) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPos}%` }}
        >
          <div
            className="relative h-full"
            style={{
              width: containerRef.current?.getBoundingClientRect().width || '100%',
            }}
          >
            <img
              src={beforeImage}
              alt="Before Flood"
              className="w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-space-900/90 backdrop-blur-md border border-slate-700 text-[11px] font-semibold text-slate-200 pointer-events-none shadow-lg">
              {beforeLabel}
            </div>
          </div>
        </div>

        {/* Draggable Divider Line & Central Handle */}
        <div
          className="absolute top-0 bottom-0 z-20 w-0.5 bg-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.9)]"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-space-900 border-2 border-cyan-400 shadow-2xl flex items-center justify-center text-cyan-300 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
            <MoveHorizontal className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-space-900/95 border-t border-space-750 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <span className="text-[11px]">
          Comparison Position: <b className="text-cyan-400 font-mono">{Math.round(sliderPos)}%</b> (Left: Normal / Right: Inundated)
        </span>
        <button
          onClick={() => setSliderPos(50)}
          className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-semibold"
        >
          Reset Split to 50%
        </button>
      </div>
    </div>
  );
}

export default function Overview() {
  const [regions, setRegions] = useState([]);
  const [observations, setObservations] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [stats, setStats] = useState({
    monitored_regions: 35,
    satellite_observations: 151,
    completed_analyses: 7,
    total_analyzed_area_km2: 31460.0,
    is_demo_mode: true,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('water');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.getRegions().catch(() => []),
      api.getObservations().catch(() => []),
      api.getRecentAnalyses(10).catch(() => []),
      api.getStats().catch(() => null),
    ]).then(([regRes, obsRes, anaRes, statsRes]) => {
      if (regRes.length > 0) {
        setRegions(regRes);
        // Default to Thamirabarani River or first region
        const defaultPlace = regRes.find((r) => r.id === 'water_thamirabarani') || regRes[0];
        setSelectedRegion(defaultPlace);
      }
      if (obsRes) setObservations(obsRes);
      if (anaRes) setAnalyses(anaRes);
      if (statsRes) setStats(statsRes);
    });
  }, []);

  // Filter autocomplete suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = regions
      .filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.country.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      )
      .slice(0, 5);
    setSuggestions(matches);
  }, [searchQuery, regions]);

  // Handle Start Exploring action
  const handleStartExploring = () => {
    const targetRegion =
      selectedRegion || regions.find((r) => r.category === selectedCategory) || regions[0];
    const cat = selectedCategory || (targetRegion ? targetRegion.category : 'water');
    const routeMap = {
      water: '/water',
      forest: '/forest',
      agriculture: '/agro',
      deformation: '/geo',
    };
    const path = routeMap[cat] || '/water';
    navigate(`${path}?region=${targetRegion?.id || 'water_thamirabarani'}`);
  };

  const handleSelectSuggestion = (r) => {
    setSelectedRegion(r);
    setSelectedCategory(r.category);
    setSearchQuery(r.name);
    setSuggestions([]);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Header & Quick Exploration Bar (First Thing User Sees) */}
      <div className="rounded-3xl bg-gradient-to-br from-space-900 via-space-850 to-space-900 border border-space-700 p-6 lg:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            TerraWatch
          </h1>
          <p className="text-base sm:text-lg text-cyan-300 font-medium">
            Explore how Earth's surface changes using NASA–ISRO NISAR satellite data.
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            See real changes in rivers, forests, croplands, and earthquake zones without needing to understand complex satellite technology.
          </p>
        </div>

        {/* Search & Investigation Options Box */}
        <div className="p-4 rounded-2xl bg-space-950/80 border border-space-700/80 shadow-xl space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            {/* Search Box */}
            <div className="lg:col-span-8 relative">
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Search a place or location:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., Thamirabarani River, Kerala, Amazon, Punjab, Turkey..."
                  className="w-full bg-space-800 border border-space-700 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-space-850 border border-space-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-space-750">
                  {suggestions.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleSelectSuggestion(r)}
                      className="w-full p-2.5 text-left text-xs hover:bg-space-800 flex items-center justify-between text-slate-200 transition"
                    >
                      <div>
                        <span className="font-semibold block text-white">{r.name}</span>
                        <span className="text-[10px] text-slate-400">{r.country}</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-space-800 text-cyan-300">
                        {r.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Start Exploring Button */}
            <div className="lg:col-span-4 flex items-end">
              <button
                onClick={handleStartExploring}
                className="w-full py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-glow-cyan transition mt-auto"
              >
                <span>Start Exploring</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Four Options: Water, Forest, Agriculture, Land Movement */}
          <div>
            <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
              Choose what you want to investigate:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {INVESTIGATION_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedCategory === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSelectedCategory(opt.id);
                      const matchingPlace = regions.find((r) => r.category === opt.id);
                      if (matchingPlace) setSelectedRegion(matchingPlace);
                    }}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                      isSelected
                        ? 'bg-space-800 border-cyan-400 text-white shadow-md'
                        : 'bg-space-900 border-space-750 text-slate-300 hover:bg-space-800/60'
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-space-950 ${opt.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">{opt.label}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{opt.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Large Interactive World Map (Default Satellite Imagery + Real Radar Change Layers) */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-cyan-400" />
              <span>Interactive Earth Observation Map</span>
            </h2>
            <p className="text-xs text-slate-300">
              Real high-resolution satellite imagery with radar change layers. Click any site or focus button to zoom in.
            </p>
          </div>

          {selectedRegion && (
            <div className="text-xs text-slate-300 bg-space-850 px-3 py-1.5 rounded-xl border border-space-700 flex items-center gap-2">
              <span>Selected: <b className="text-white">{selectedRegion.name}</b></span>
              <button
                onClick={handleStartExploring}
                className="ml-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline"
              >
                Investigate Now →
              </button>
            </div>
          )}
        </div>

        <InteractiveMap
          regions={regions}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          height="540px"
          showFilters={true}
          initialCategory="all"
        />
      </div>

      {/* 3. The Four Core Investigation Areas (Exact Layout & Satellite Images from User Reference Picture) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Four Core Monitoring Areas
          </h2>
          <p className="text-xs text-slate-300">
            Real satellite radar observations explained in plain, simple English.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: WaterWatch */}
          <MonitoringModuleCard
            id="water"
            title="1. WaterWatch"
            subtitle="Radar Water Body & Flood Extent Monitoring"
            previewImage="/images/waterwatch_preview.png"
            productTag="Radar Backscatter GCOV"
            path="/water"
            icon={Droplets}
            color="cyan"
            bulletPoints={[
              'Find changes in water bodies.',
              'Explore possible flood-affected areas.',
              'Compare water spread between dates.',
            ]}
            sampleMetric={{ label: 'Demonstration Site', value: 'Thamirabarani River Basin & Kerala Floods' }}
          />

          {/* Card 2: ForestWatch */}
          <MonitoringModuleCard
            id="forest"
            title="2. ForestWatch"
            subtitle="Vegetation Disturbance & Canopy Change Monitoring"
            previewImage="/images/forestwatch_preview.png"
            productTag="Cross-Pol Volume Scattering"
            path="/forest"
            icon={Trees}
            color="emerald"
            bulletPoints={[
              'Monitor forest changes.',
              'Identify areas with possible vegetation disturbance.',
              'Compare forest conditions.',
            ]}
            sampleMetric={{ label: 'Demonstration Site', value: 'Amazon Rainforest (Rondônia Arc)' }}
          />

          {/* Card 3: AgroWatch */}
          <MonitoringModuleCard
            id="agriculture"
            title="3. AgroWatch"
            subtitle="Farmland Soil Moisture & Crop Growth Monitoring"
            previewImage="/images/agrowatch_preview.png"
            productTag="L-band Dielectric Soil Moisture"
            path="/agro"
            icon={Sprout}
            color="amber"
            bulletPoints={[
              'Observe agricultural land changes.',
              'Compare field conditions over time.',
              'Explore possible crop and soil-related changes.',
            ]}
            sampleMetric={{ label: 'Demonstration Site', value: 'Punjab Agricultural Belt & California' }}
          />

          {/* Card 4: GeoMotion */}
          <MonitoringModuleCard
            id="deformation"
            title="4. GeoMotion"
            subtitle="Ground Movement & Fault Slip Monitoring"
            previewImage="/images/geomotion_preview.png"
            productTag="InSAR Displacement Interferogram"
            path="/geo"
            icon={ActivitySquare}
            color="rose"
            bulletPoints={[
              'Explore ground movement.',
              'Monitor possible land subsidence.',
              'Visualize earthquake-related deformation.',
            ]}
            sampleMetric={{ label: 'Demonstration Site', value: 'East Anatolian Fault Zone & Ridgecrest' }}
          />
        </div>
      </div>

      {/* 4. Feature 3: Before-and-After Satellite Comparison Showcase */}
      <div className="space-y-4 rounded-3xl bg-space-850/60 border border-space-700/80 p-6 lg:p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold inline-block mb-1">
              Core Platform Feature
            </span>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Feature 3: Before-and-after comparison
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              This is one of the most important features. For example, when a user selects a river area:
              the first date shows the dry riverbank before the storm; the second date reveals the swollen floodwaters.
              The slider lets you swipe back and forth to inspect the exact spread of water across the terrain.
            </p>
          </div>

          <Link
            to="/water?region=water_thamirabarani"
            className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold text-xs flex items-center gap-2 shadow-glow-cyan transition shrink-0"
          >
            <span>Try in WaterWatch</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Interactive Split Slider */}
        <ShowcaseComparisonSlider
          beforeImage="/images/flood_comparison_before.png"
          afterImage="/images/flood_comparison_after.png"
          beforeLabel="Dry Condition (Normal Channel)"
          afterLabel="Inundated Floodwaters (Burst Banks)"
        />
      </div>

      {/* 5. Recent Observations & Analyses History */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-wide">
          Recent Satellite Observations & Analyses
        </h2>
        <RecentActivityTable observations={observations} analyses={analyses} />
      </div>
    </div>
  );
}
