import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Droplets,
  Trees,
  Sprout,
  ActivitySquare,
  Globe2,
  Database,
  Info,
  Radio,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Satellite
} from 'lucide-react';
import { api } from '../api';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: Activity, badge: 'Home' },
  { path: '/water', label: 'WaterWatch', icon: Droplets, color: 'text-cyan-400', badge: 'Water & Floods' },
  { path: '/forest', label: 'ForestWatch', icon: Trees, color: 'text-emerald-400', badge: 'Trees & Forests' },
  { path: '/agro', label: 'AgroWatch', icon: Sprout, color: 'text-amber-400', badge: 'Farms & Crops' },
  { path: '/geo', label: 'GeoMotion', icon: ActivitySquare, color: 'text-rose-400', badge: 'Ground Motion' },
  { path: '/explorer', label: 'Global Explorer', icon: Globe2, badge: 'World Map' },
  { path: '/sources', label: 'Data Sources', icon: Database, badge: 'Data' },
  { path: '/about', label: 'About TerraWatch', icon: Info, badge: 'Guide' },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const [backendHealth, setBackendHealth] = useState({ status: 'checking', gemini: false });

  useEffect(() => {
    api.getHealth()
      .then(res => setBackendHealth({ status: 'online', gemini: res.gemini_api_configured }))
      .catch(() => setBackendHealth({ status: 'offline', gemini: false }));
  }, []);

  const closeMobile = () => setMobileOpen && setMobileOpen(false);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-space-900 border-r border-space-750 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-space-750 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-emerald-500 p-[1px] shadow-glow-cyan flex items-center justify-center">
              <div className="w-full h-full bg-space-950 rounded-xl flex items-center justify-center relative overflow-hidden">
                <Satellite className="w-5 h-5 text-cyan-400 z-10" />
                <div className="absolute inset-0 bg-cyan-500/10 radar-sweep-anim origin-bottom-right" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-wide">TerraWatch</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                  NISAR
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono tracking-tight">Earth Surface Intelligence</p>
            </div>
          </div>

          <button
            onClick={closeMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-space-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mission / Satellite Radar Badge */}
        <div className="mx-4 mt-4 p-3 rounded-lg bg-gradient-to-r from-space-850 to-space-800 border border-space-700/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>NISAR Earth Observation</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Dual-Frequency L & S-Band SAR</p>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-space-700/60 pt-1.5">
            <span className="text-emerald-400 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
              All-Weather Radar
            </span>
            <span className="text-amber-400/90 font-mono">12-Day Repeat</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Platform Modules
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/60 to-space-800 text-cyan-300 border-l-2 border-cyan-400 shadow-sm'
                      : 'text-slate-300 hover:bg-space-800/60 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      item.color || 'text-slate-400 group-hover:text-cyan-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-space-800 text-slate-400 border border-space-700 group-hover:border-space-600">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Mode & Health Footer */}
        <div className="p-4 border-t border-space-750 bg-space-950/60 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendHealth.status === 'online'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-rose-400'
                }`}
              />
              Backend: {backendHealth.status}
            </span>
            <span className="font-mono text-[10px] text-slate-400">v1.0.0</span>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300/90 flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
            <div>
              <span className="font-semibold block text-amber-200">DEMO MODE ACTIVE</span>
              <p className="text-[10px] text-amber-300/80 leading-relaxed mt-0.5">
                Displaying calibrated synthetic SAR simulation. NISAR H5 ingest ready.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

