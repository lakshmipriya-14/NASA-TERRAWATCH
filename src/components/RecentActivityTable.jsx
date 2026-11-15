import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Satellite,
  Activity,
  Calendar,
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function RecentActivityTable({
  observations = [],
  analyses = [],
  onOpenAnalysis = null,
}) {
  const [tab, setTab] = useState('analyses'); // 'analyses' or 'observations'
  const [filterText, setFilterText] = useState('');
  const navigate = useNavigate();

  const filteredAnalyses = analyses.filter(a =>
    a.region_name?.toLowerCase().includes(filterText.toLowerCase()) ||
    a.module?.toLowerCase().includes(filterText.toLowerCase()) ||
    a.product_type?.toLowerCase().includes(filterText.toLowerCase())
  );

  const filteredObservations = observations.filter(o =>
    o.region_name?.toLowerCase().includes(filterText.toLowerCase()) ||
    o.category?.toLowerCase().includes(filterText.toLowerCase()) ||
    o.product?.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleOpenAnalysis = (a) => {
    const routeMap = {
      water: '/water',
      forest: '/forest',
      agriculture: '/agro',
      deformation: '/geo',
    };
    navigate(`${routeMap[a.module] || '/'}?analysis=${a.id}&region=${a.region_id}`);
  };

  return (
    <div className="rounded-2xl bg-space-850/80 border border-space-750 shadow-xl overflow-hidden">
      {/* Header Tabs */}
      <div className="p-4 bg-space-900 border-b border-space-750 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('analyses')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              tab === 'analyses'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Recent Completed Analyses ({analyses.length})</span>
          </button>
          <button
            onClick={() => setTab('observations')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              tab === 'observations'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Satellite Observation Catalog ({observations.length})</span>
          </button>
        </div>

        {/* Filter Input */}
        <div className="relative">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter table..."
            className="bg-space-850 border border-space-700 rounded-lg px-3 py-1 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto max-h-80 overflow-y-auto">
        {tab === 'analyses' ? (
          <table className="w-full text-left text-xs">
            <thead className="bg-space-900/90 text-slate-400 font-mono text-[11px] uppercase border-b border-space-750 sticky top-0">
              <tr>
                <th className="py-2.5 px-4">Analysis ID</th>
                <th className="py-2.5 px-4">Study Region</th>
                <th className="py-2.5 px-4">Module</th>
                <th className="py-2.5 px-4">Observation Pair</th>
                <th className="py-2.5 px-4">Radar Product</th>
                <th className="py-2.5 px-4">Status / Label</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-space-750/50">
              {filteredAnalyses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No matching analysis records found.
                  </td>
                </tr>
              ) : (
                filteredAnalyses.map((a) => (
                  <tr key={a.id} className="hover:bg-space-800/40 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-cyan-400">
                      {a.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {a.region_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-space-700 uppercase">
                        {a.module}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                      {a.before_date} → {a.after_date}
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      {a.product_type}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800">
                        {a.is_demo ? 'Demo Analysis' : 'Verified NISAR'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenAnalysis(a)}
                        className="px-2.5 py-1 rounded bg-space-800 hover:bg-space-750 text-cyan-300 border border-space-700 text-[11px] font-medium transition inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-space-900/90 text-slate-400 font-mono text-[11px] uppercase border-b border-space-750 sticky top-0">
              <tr>
                <th className="py-2.5 px-4">Obs ID</th>
                <th className="py-2.5 px-4">Region</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Acquisition Date</th>
                <th className="py-2.5 px-4">Radar Product</th>
                <th className="py-2.5 px-4">Polarization</th>
                <th className="py-2.5 px-4">Orbit Pass</th>
                <th className="py-2.5 px-4">Processing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-space-750/50">
              {filteredObservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No matching satellite observations.
                  </td>
                </tr>
              ) : (
                filteredObservations.map((o) => (
                  <tr key={o.id} className="hover:bg-space-800/40 transition">
                    <td className="py-3 px-4 font-mono text-cyan-400 text-[11px]">
                      {o.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {o.region_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-space-700 uppercase">
                        {o.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {o.date}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {o.product}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400">
                      {o.polarization}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {o.orbit_pass}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

