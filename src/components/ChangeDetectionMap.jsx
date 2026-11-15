import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Layers, Crosshair, Info, Sparkles, Filter } from 'lucide-react';

export default function ChangeDetectionMap({
  changeGrid = [],
  classGrid = [],
  legend = [],
  categories = [],
  unit = 'dB',
  module = 'water',
  title = 'Surface Change Map',
  height = 360,
}) {
  const [viewMode, setViewMode] = useState('continuous'); // 'continuous' or 'classified'
  const [hoverPixel, setHoverPixel] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Colormaps for continuous difference
  const getContinuousColor = useCallback((val) => {
    if (module === 'deformation') {
      // InSAR LOS: -15cm (Subsidence: Red) to 0 (White) to +15cm (Uplift: Blue)
      const norm = Math.max(-1, Math.min(1, val / 15.0));
      if (norm < 0) {
        // Red to White
        const r = 240;
        const g = Math.round(240 * (1 + norm));
        const b = Math.round(240 * (1 + norm));
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        // White to Blue
        const r = Math.round(240 * (1 - norm));
        const g = Math.round(240 * (1 - norm));
        const b = 255;
        return `rgb(${r}, ${g}, ${b})`;
      }
    } else if (module === 'forest') {
      // Forest: Negative dB (Red: loss) to 0 (dark cyan) to Positive (green: regrowth)
      const norm = Math.max(-1, Math.min(1, val / 6.0));
      if (norm < 0) {
        // Red gradient
        const r = 239;
        const g = Math.round(68 * (1 + norm));
        const b = 68;
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        // Emerald gradient
        const r = Math.round(16 * (1 - norm));
        const g = 185;
        const b = Math.round(129 * norm + 80);
        return `rgb(${r}, ${g}, ${b})`;
      }
    } else if (module === 'agriculture') {
      // Soil moisture: -0.15 (Amber) to 0 (Teal) to +0.20 (Blue)
      const norm = Math.max(-1, Math.min(1, val / 0.15));
      if (norm < 0) {
        return `rgb(245, 158, 11)`; // Amber
      } else if (norm > 0.2) {
        return `rgb(37, 99, 235)`;  // Blue surge
      }
      return `rgb(20, 184, 166)`;    // Teal
    } else {
      // Water: -8 dB (Cyan: Inundation), 0 (Dark Blue), +8 dB (Yellow: Double bounce)
      const norm = Math.max(-1, Math.min(1, val / 8.0));
      if (norm < -0.2) {
        // Inundated open water: Bright Cyan
        return `rgb(53, 196, 224)`;
      } else if (norm > 0.3) {
        // Double-bounce flooded veg: Bright Amber/Yellow
        return `rgb(255, 190, 59)`;
      } else {
        // Background stable land
        return `rgb(20, 42, 80)`;
      }
    }
  }, [module]);

  // Colormaps for categorized classes
  const getClassColor = useCallback((classId) => {
    const cat = categories.find((c) => c.id === classId);
    if (cat && cat.color) return cat.color;
    return '#1b3464';
  }, [categories]);

  // Render to Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !changeGrid || changeGrid.length === 0) return;

    const rows = changeGrid.length;
    const cols = changeGrid[0].length;
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(cols, rows);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let colorStr;
        if (viewMode === 'classified' && classGrid && classGrid.length > 0) {
          const cid = classGrid[y][x];
          colorStr = getClassColor(cid);
        } else {
          const val = changeGrid[y][x];
          colorStr = getContinuousColor(val);
        }

        // Parse hex or rgb
        let r = 27, g = 52, b = 100;
        if (colorStr.startsWith('#')) {
          const hex = colorStr.replace('#', '');
          r = parseInt(hex.substring(0, 2), 16);
          g = parseInt(hex.substring(2, 4), 16);
          b = parseInt(hex.substring(4, 6), 16);
        } else {
          const match = colorStr.match(/\d+/g);
          if (match) {
            r = parseInt(match[0], 10);
            g = parseInt(match[1], 10);
            b = parseInt(match[2], 10);
          }
        }

        const idx = (y * cols + x) * 4;
        imgData.data[idx] = r;
        imgData.data[idx + 1] = g;
        imgData.data[idx + 2] = b;
        imgData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [changeGrid, classGrid, viewMode, getContinuousColor, getClassColor]);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !changeGrid || changeGrid.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rows = changeGrid.length;
    const cols = changeGrid[0].length;
    const px = Math.floor(((e.clientX - rect.left) / rect.width) * cols);
    const py = Math.floor(((e.clientY - rect.top) / rect.height) * rows);

    if (py >= 0 && py < rows && px >= 0 && px < cols) {
      const val = changeGrid[py][px];
      const cid = classGrid?.[py]?.[px] ?? 0;
      const cat = categories.find((c) => c.id === cid);
      setHoverPixel({
        x: px,
        y: py,
        val: typeof val === 'number' ? val.toFixed(2) : val,
        className: cat ? cat.name : 'Unclassified',
        color: cat ? cat.color : '#3ddc97',
      });
    }
  };

  return (
    <div className="relative rounded-2xl border border-space-750 bg-space-950 overflow-hidden shadow-2xl flex flex-col">
      {/* Header Controls */}
      <div className="p-3 bg-space-900 border-b border-space-750 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">{title}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-800 text-cyan-300 border border-space-700">
            {unit}
          </span>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-space-850 border border-space-700">
          <button
            onClick={() => setViewMode('continuous')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
              viewMode === 'continuous'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Continuous Heatmap
          </button>
          <button
            onClick={() => setViewMode('classified')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
              viewMode === 'classified'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Categorized Classes
          </button>
        </div>
      </div>

      {/* Main Raster Viewport */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverPixel(null)}
        style={{ height }}
        className="relative w-full flex items-center justify-center p-3 bg-space-950 cursor-crosshair overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Hover Inspector Tooltip Floating */}
        {hoverPixel && (
          <div className="absolute top-3 left-3 z-20 pointer-events-none p-2.5 rounded-xl bg-space-900/95 backdrop-blur-md border border-space-700 shadow-2xl text-[11px] space-y-1">
            <div className="flex items-center gap-2">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-slate-300">
                Pixel [{hoverPixel.x}, {hoverPixel.y}]
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 font-mono">
              <span className="text-slate-400">Magnitude:</span>
              <span className="font-bold text-white">
                {hoverPixel.val} {unit}
              </span>
            </div>
            <div className="flex items-center gap-1.5 pt-1 border-t border-space-750">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: hoverPixel.color }}
              />
              <span className="text-slate-200 font-medium">{hoverPixel.className}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Legend Bar */}
      <div className="p-3 bg-space-900/90 border-t border-space-750 flex flex-wrap items-center justify-between gap-3 text-xs">
        {viewMode === 'continuous' ? (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-[11px] font-mono text-slate-400">Scale:</span>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              {legend.slice(0, 5).map((l, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span
                    className="w-2.5 h-2.5 rounded"
                    style={{ backgroundColor: l.color }}
                  />
                  <span className="text-slate-300">{l.val}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center gap-1.5 text-[11px]">
                <span
                  className="w-2.5 h-2.5 rounded"
                  style={{ backgroundColor: c.color }}
                />
                <span className="text-slate-300">{c.name}</span>
                <span className="text-slate-400 font-mono text-[10px]">({c.area_km2} km²)</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

