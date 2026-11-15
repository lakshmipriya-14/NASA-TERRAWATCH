import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export default function StatisticsCard({
  title,
  value,
  unit = '',
  subtitle,
  icon: Icon = Activity,
  color = 'cyan',
  change = null,
  isDemo = true,
}) {
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/30',
      bgGlow: 'bg-cyan-500/5',
      text: 'text-cyan-400',
      badge: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    },
    emerald: {
      border: 'border-emerald-500/30',
      bgGlow: 'bg-emerald-500/5',
      text: 'text-emerald-400',
      badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    },
    amber: {
      border: 'border-amber-500/30',
      bgGlow: 'bg-amber-500/5',
      text: 'text-amber-400',
      badge: 'bg-amber-950 text-amber-300 border-amber-800',
    },
    rose: {
      border: 'border-rose-500/30',
      bgGlow: 'bg-rose-500/5',
      text: 'text-rose-400',
      badge: 'bg-rose-950 text-rose-300 border-rose-800',
    },
  };

  const c = colorMap[color] || colorMap.cyan;

  return (
    <div
      className={`relative p-5 rounded-xl bg-space-850/80 border ${c.border} shadow-lg backdrop-blur-sm overflow-hidden group hover:border-opacity-60 transition duration-300`}
    >
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${c.bgGlow} blur-2xl group-hover:scale-125 transition duration-500`} />

      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-slate-400 tracking-wide">{title}</span>
        <div className={`p-2 rounded-lg bg-space-800/80 ${c.text} border border-space-700/60`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-bold tracking-tight text-white font-mono">
          {value}
        </span>
        {unit && <span className="text-xs text-slate-400 font-mono">{unit}</span>}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs">
        <span className="text-slate-400 text-[11px] truncate">{subtitle}</span>
        {change !== null && (
          <span
            className={`font-mono text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${
              change >= 0
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                : 'bg-rose-950/70 text-rose-300 border-rose-800'
            }`}
          >
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>

      {isDemo && (
        <div className="mt-2 pt-2 border-t border-space-750/50 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>SOURCE</span>
          <span className="text-amber-400/90">Calibrated Sample Data</span>
        </div>
      )}
    </div>
  );
}

