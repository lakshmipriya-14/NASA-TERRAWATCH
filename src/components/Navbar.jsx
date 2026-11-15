import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  User,
  Menu,
  ShieldCheck,
  Radio,
  ExternalLink,
  Droplets,
  Trees,
  Sprout,
  ActivitySquare,
  Sparkles,
  X
} from 'lucide-react';
import { api } from '../api';

const MODULE_ICONS = {
  water: Droplets,
  forest: Trees,
  agriculture: Sprout,
  deformation: ActivitySquare,
};

export default function Navbar({ onMenuToggle }) {
  const [query, setQuery] = useState('');
  const [regions, setRegions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getRegions().then(setRegions).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    const matches = regions.filter(
      r => r.name.toLowerCase().includes(q) ||
           r.country.toLowerCase().includes(q) ||
           r.category.toLowerCase().includes(q)
    ).slice(0, 5);
    setSuggestions(matches);
  }, [query, regions]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRegion = (r) => {
    const routeMap = {
      water: '/water',
      forest: '/forest',
      agriculture: '/agro',
      deformation: '/geo',
    };
    setShowSearch(false);
    setQuery('');
    navigate(`${routeMap[r.category] || '/'}?region=${r.id}`);
  };

  const notifications = [
    {
      id: 1,
      title: 'New NISAR Orbit Pass Ingested',
      time: '12m ago',
      desc: 'L-GCOV dual-pol acquired over Kerala Backwaters (Pass 142 Ascending).',
      tag: 'WaterWatch'
    },
    {
      id: 2,
      title: 'Earthquake Co-Seismic InSAR Processed',
      time: '45m ago',
      desc: 'GUNW unwrapped interferogram ready for East Anatolian Fault.',
      tag: 'GeoMotion'
    },
    {
      id: 3,
      title: 'Agricultural Moisture Anomaly Detected',
      time: '2h ago',
      desc: 'Significant volumetric soil moisture surge (> +0.08 m³/m³) in Punjab belt.',
      tag: 'AgroWatch'
    }
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-space-900/90 backdrop-blur-md border-b border-space-750 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-space-800 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-200">TerraWatch Platform</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono">
              Live Monitoring
            </span>
          </div>
          <p className="text-[11px] text-slate-400">NISAR Radar Earth Surface Intelligence</p>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-lg relative" ref={searchRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSearch(true);
            }}
            onFocus={() => setShowSearch(true)}
            placeholder="Search regions, coordinates, or change types (e.g. Kerala, Amazon, Fault)..."
            className="w-full bg-space-850/90 border border-space-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setSuggestions([]); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearch && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-space-850 border border-space-700 rounded-lg shadow-xl overflow-hidden z-50">
            <div className="p-2 text-[10px] uppercase font-mono text-slate-400 border-b border-space-750">
              Matching Study Sites
            </div>
            {suggestions.map((r) => {
              const Icon = MODULE_ICONS[r.category] || ActivitySquare;
              return (
                <button
                  key={r.id}
                  onClick={() => handleSelectRegion(r)}
                  className="w-full text-left px-3 py-2.5 hover:bg-space-750/80 flex items-center justify-between border-b border-space-750/50 last:border-0 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-space-800 text-cyan-400">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-200 block">{r.name}</span>
                      <span className="text-[10px] text-slate-400">{r.country} • {r.baseline_product}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-space-800 text-slate-400">
                    {r.category}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Mode Tag */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-space-800 border border-space-700 text-[11px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-mono text-[10px] text-amber-300 font-medium">Demo Mode</span>
        </div>

        {/* Notifications Button */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-space-800 transition relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-space-850 border border-space-700 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-3 border-b border-space-750 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Radar Ingest Alerts</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded">
                  3 New
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-space-750/50">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-space-800/50 transition">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-200">{n.title}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{n.desc}</p>
                    <span className="inline-block mt-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-space-800 text-cyan-300">
                      {n.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Placeholder */}
        <div className="flex items-center gap-2 pl-2 border-l border-space-750">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 p-[1px]">
            <div className="w-full h-full bg-space-900 rounded-full flex items-center justify-center text-xs font-semibold text-cyan-300">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="hidden xl:block text-left">
            <span className="text-xs font-medium text-slate-200 block">Radar Analyst</span>
            <span className="text-[10px] text-slate-400 font-mono">Earth Observation</span>
          </div>
        </div>
      </div>
    </header>
  );
}

