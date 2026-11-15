import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function MonitoringModuleCard({
  id,
  title,
  subtitle,
  description,
  path,
  icon: Icon,
  color = 'cyan',
  productTag,
  previewImage,
  bulletPoints = [],
  sampleMetric,
}) {
  const colorStyles = {
    cyan: {
      border: 'border-cyan-500/30 hover:border-cyan-400',
      badge: 'bg-cyan-950/90 text-cyan-300 border-cyan-700',
      btn: 'bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold shadow-glow-cyan',
      iconColor: 'text-cyan-400',
      dotColor: 'bg-cyan-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(53,196,224,0.15)]',
    },
    emerald: {
      border: 'border-emerald-500/30 hover:border-emerald-400',
      badge: 'bg-emerald-950/90 text-emerald-300 border-emerald-700',
      btn: 'bg-emerald-500 hover:bg-emerald-400 text-space-950 font-bold',
      iconColor: 'text-emerald-400',
      dotColor: 'bg-emerald-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(61,220,151,0.15)]',
    },
    amber: {
      border: 'border-amber-500/30 hover:border-amber-400',
      badge: 'bg-amber-950/90 text-amber-300 border-amber-700',
      btn: 'bg-amber-500 hover:bg-amber-400 text-space-950 font-bold',
      iconColor: 'text-amber-400',
      dotColor: 'bg-amber-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(255,190,59,0.15)]',
    },
    rose: {
      border: 'border-rose-500/30 hover:border-rose-400',
      badge: 'bg-rose-950/90 text-rose-300 border-rose-700',
      btn: 'bg-rose-500 hover:bg-rose-400 text-space-950 font-bold',
      iconColor: 'text-rose-400',
      dotColor: 'bg-rose-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(255,92,119,0.15)]',
    },
  };

  const style = colorStyles[color] || colorStyles.cyan;

  return (
    <div
      className={`group rounded-2xl bg-space-850 border ${style.border} ${style.glow} transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between`}
    >
      <div>
        {/* Real Satellite Preview Image (Matching user's reference picture) */}
        {previewImage && (
          <div className="relative w-full h-52 sm:h-56 bg-space-950 overflow-hidden border-b border-space-750">
            <img
              src={previewImage}
              alt={title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {/* Top Overlay Badge */}
            <div className="absolute top-3 right-3 z-10">
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border shadow-lg ${style.badge}`}>
                {productTag}
              </span>
            </div>
            {/* Subtle Gradient Shade at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-space-850 to-transparent pointer-events-none" />
          </div>
        )}

        {/* Content Section */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Title Header */}
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2.5 rounded-xl bg-space-900 border border-space-700 shrink-0">
                <Icon className={`w-5 h-5 ${style.iconColor}`} />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
                {title}
              </h3>
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
          </div>

          {/* Core Bullet Points (Exact 3 items from user reference screenshot) */}
          {bulletPoints.length > 0 && (
            <div className="space-y-2 pt-1">
              {bulletPoints.map((bp, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor} mt-1.5 shrink-0`} />
                  <span className="leading-relaxed">{bp}</span>
                </div>
              ))}
            </div>
          )}

          {/* Sample Metric / Context */}
          {sampleMetric && (
            <div className="p-2.5 rounded-xl bg-space-900/80 border border-space-750 text-[11px] flex items-center justify-between">
              <span className="text-slate-400">{sampleMetric.label}</span>
              <span className="font-mono font-semibold text-white">{sampleMetric.value}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-5 sm:p-6 pt-0">
        <Link
          to={path}
          className={`w-full py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all ${style.btn}`}
        >
          <span>Open {title.replace(/^\d+\.\s*/, '')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
