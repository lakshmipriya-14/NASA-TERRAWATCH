import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp, Calendar, Info } from 'lucide-react';

export default function ObservationTimeline({
  data = [],
  unit = 'dB',
  metricName = 'Surface Variation',
  color = '#35c4e0',
  title = 'Multi-Temporal Observation Trajectory',
}) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-space-850/80 border border-space-750 text-center text-xs text-slate-400">
        No multi-temporal series available for this location.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl bg-space-900/95 backdrop-blur-md border border-space-700 shadow-2xl text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pass: {label}</span>
          </div>
          <div className="font-mono text-sm font-bold text-white">
            {payload[0].value} <span className="text-xs text-cyan-300 font-normal">{unit}</span>
          </div>
          {payload[0].payload.confidence && (
            <div className="text-[10px] text-slate-400 font-mono">
              Interferometric Coherence: {payload[0].payload.confidence}%
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl bg-space-850/80 border border-space-750 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-space-800 text-cyan-400 border border-space-750">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{title}</h4>
            <p className="text-xs text-slate-400">NISAR 12-Day Orbital Repeat Cycles</p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
          <span className="text-slate-300">{metricName} ({unit})</span>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTrajectory" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#16294d" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              fontFamily="monospace"
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              fontFamily="monospace"
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorTrajectory)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="p-2.5 rounded-lg bg-space-900/60 border border-space-750/70 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Temporal Frequency: 12 Days (L-Band Repeat)</span>
        <span className="text-cyan-400">Sensor: NISAR SweepSAR</span>
      </div>
    </div>
  );
}

