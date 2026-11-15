import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe2,
  Search,
  Filter,
  Layers,
  ArrowRight,
  Droplets,
  Trees,
  Sprout,
  ActivitySquare,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../api';
import InteractiveMap from '../components/InteractiveMap';

export default function Explorer() {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getRegions()
      .then((res) => {
        setRegions(res);
        if (res.length > 0) setSelectedRegion(res[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredRegions = regions.filter((r) => {
    const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAnalysis = (r) => {
    const routeMap = {
      water: '/water',
      forest: '/forest',
      agriculture: '/agro',
      deformation: '/geo',
    };
    navigate(`${routeMap[r.category] || '/'}?region=${r.id}`);
  };

  const CATEGORY_ICONS = {
    water: Droplets,
    forest: Trees,
    agriculture: Sprout,
    deformation: ActivitySquare,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-space-900 via-space-850 to-space-900 border border-space-700 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-extrabold text-white">Global Explorer</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              Interactive Catalog
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Browse monitored Earth observation study areas across hydrological, forest, agricultural, and tectonic domains.
          </p>
        </div>

        <div className="text-right text-xs font-mono text-slate-400">
          <span>Active Sites: <b className="text-cyan-400">{filteredRegions.length}</b></span>
          <span className="block text-[11px]">All-weather Day/Night SAR</span>
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="p-4 rounded-xl bg-space-850 border border-space-750 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search a place (e.g. Thamirabarani River, Kerala, Amazon, Punjab)..."
            className="w-full bg-space-800 border border-space-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Places' },
            { id: 'water', label: 'Water' },
            { id: 'forest', label: 'Forest' },
            { id: 'agriculture', label: 'Agriculture' },
            { id: 'deformation', label: 'Land Movement' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                categoryFilter === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-space-800 text-slate-400 hover:text-white border border-space-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map & Region Inspector Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Map */}
        <div className="lg:col-span-2">
          <InteractiveMap
            regions={filteredRegions}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
            height="580px"
            showFilters={false}
          />
        </div>

        {/* Right 1 Col: Selected Region Dossier */}
        <div className="space-y-4">
          {selectedRegion ? (
            <div className="p-5 rounded-2xl bg-space-850 border border-space-750 shadow-xl space-y-4">
              <div className="border-b border-space-750 pb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-space-800 text-cyan-300 border border-space-700">
                    {selectedRegion.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {selectedRegion.lat.toFixed(2)}°N, {selectedRegion.lon.toFixed(2)}°E
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{selectedRegion.name}</h3>
                <p className="text-xs text-slate-400">{selectedRegion.country}</p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedRegion.description}
              </p>

              <div className="p-3 rounded-xl bg-space-900 border border-space-750 text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Baseline Product:</span>
                  <span className="font-mono text-cyan-300 font-semibold">{selectedRegion.baseline_product}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Polarizations:</span>
                  <span className="font-mono text-emerald-400">{selectedRegion.polarizations?.join(', ')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Repeat Interval:</span>
                  <span className="font-mono text-white">12 Days</span>
                </div>
              </div>

              {/* Available Observation Dates */}
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 block mb-2 font-semibold">
                  Cataloged Observation Passes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRegion.available_dates?.map((d) => (
                    <span
                      key={d}
                      className="px-2 py-1 rounded bg-space-800 border border-space-700 font-mono text-[10px] text-slate-300"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleOpenAnalysis(selectedRegion)}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold text-xs flex items-center justify-center gap-2 shadow-glow-cyan transition"
              >
                <span>Open Detailed Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-space-850 border border-space-750 text-center text-xs text-slate-400">
              Select a location on the map to inspect satellite products and parameters.
            </div>
          )}

          {/* Region Quick Selector List */}
          <div className="p-4 rounded-2xl bg-space-850/80 border border-space-750 shadow-lg">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-2 font-semibold">
              Study Site Directory ({filteredRegions.length})
            </span>
            <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
              {filteredRegions.map((r) => {
                const isSelected = selectedRegion?.id === r.id;
                const Icon = CATEGORY_ICONS[r.category] || Globe2;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRegion(r)}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-space-800 text-cyan-300 font-semibold border border-space-700'
                        : 'text-slate-300 hover:bg-space-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{r.name}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
