import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Eye, MoveHorizontal, Calendar, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function BeforeAfterSlider({
  beforeGrid = [],
  afterGrid = [],
  beforeDate = '2026-01-01',
  afterDate = '2026-02-01',
  unit = 'dB',
  module = 'water',
  polarization = 'HH',
  height = 360,
}) {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPixel, setHoverPixel] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'split' or 'side-by-side'
  const containerRef = useRef(null);
  const beforeCanvasRef = useRef(null);
  const afterCanvasRef = useRef(null);
  const sideBeforeCanvasRef = useRef(null);
  const sideAfterCanvasRef = useRef(null);

  // Colormap conversion for SAR intensity
  const getColorForVal = useCallback((val, isAfter = false) => {
    if (module === 'deformation') {
      // InSAR LOS: -15cm (red) to 0 (white) to +15cm (blue)
      const norm = Math.max(-1, Math.min(1, val / 15.0));
      if (norm < 0) {
        // Red to White
        const r = 255;
        const g = Math.round(255 * (1 + norm));
        const b = Math.round(255 * (1 + norm));
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        // White to Blue
        const r = Math.round(255 * (1 - norm));
        const g = Math.round(255 * (1 - norm));
        const b = 255;
        return `rgb(${r}, ${g}, ${b})`;
      }
    } else {
      // Radar backscatter dB: typically -25 dB (dark) to 0 dB (bright)
      // High contrast radar grayscale with subtle blue/green hue
      const norm = Math.max(0, Math.min(1, (val + 24.0) / 24.0));
      const v = Math.round(norm * 255);
      if (isAfter) {
        return `rgb(${Math.round(v * 0.85)}, ${Math.round(v * 0.95)}, ${v})`;
      }
      return `rgb(${v}, ${v}, ${v})`;
    }
  }, [module]);

  // Draw Before and After rasters to canvases
  useEffect(() => {
    const drawGrid = (canvas, grid, isAfter) => {
      if (!canvas || !grid || grid.length === 0) return;
      const ctx = canvas.getContext('2d');
      const rows = grid.length;
      const cols = grid[0].length;
      canvas.width = cols;
      canvas.height = rows;

      const imgData = ctx.createImageData(cols, rows);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const val = grid[y][x];
          const colorStr = getColorForVal(val, isAfter);
          const match = colorStr.match(/\d+/g);
          if (match) {
            const idx = (y * cols + x) * 4;
            imgData.data[idx] = parseInt(match[0], 10);     // R
            imgData.data[idx + 1] = parseInt(match[1], 10); // G
            imgData.data[idx + 2] = parseInt(match[2], 10); // B
            imgData.data[idx + 3] = 255;                    // Alpha
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    };

    drawGrid(beforeCanvasRef.current, beforeGrid, false);
    drawGrid(afterCanvasRef.current, afterGrid, true);
    drawGrid(sideBeforeCanvasRef.current, beforeGrid, false);
    drawGrid(sideAfterCanvasRef.current, afterGrid, true);
  }, [beforeGrid, afterGrid, getColorForVal, viewMode]);

  const handlePointerMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const pct = (x / rect.width) * 100;

    if (isDragging) {
      setSliderPos(pct);
    }

    // Inspect pixel
    if (beforeGrid && beforeGrid.length > 0) {
      const rows = beforeGrid.length;
      const cols = beforeGrid[0].length;
      const py = Math.floor((e.clientY - rect.top) / (rect.height / rows));
      const px = Math.floor(x / (rect.width / cols));
      if (py >= 0 && py < rows && px >= 0 && px < cols) {
        const bVal = beforeGrid[py]?.[px] ?? 0;
        const aVal = afterGrid[py]?.[px] ?? 0;
        setHoverPixel({ x: px, y: py, before: bVal, after: aVal, diff: (aVal - bVal).toFixed(2) });
      }
    }
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="relative rounded-2xl border border-space-750 bg-space-950 overflow-hidden shadow-2xl flex flex-col">
      {/* Header Bar */}
      <div className="p-3 bg-space-900 border-b border-space-750 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-cyan-400" />
            Satellite Observation Comparison
          </span>
          <div className="flex items-center bg-space-800 p-0.5 rounded-lg border border-space-700">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                viewMode === 'split' ? 'bg-cyan-500 text-space-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Split Slider
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                viewMode === 'side-by-side' ? 'bg-cyan-500 text-space-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Side-by-Side
            </button>
          </div>
        </div>

        {/* Date Labels */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
            <span>Before: <b className="text-white">{beforeDate}</b></span>
          </div>
          <span className="text-slate-400">vs</span>
          <div className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
            <span>After: <b className="text-white">{afterDate}</b></span>
          </div>
        </div>
      </div>

      {/* Main Comparison Viewport (Split Slider or Side-by-Side) */}
      {viewMode === 'split' ? (
        <div
          ref={containerRef}
          onMouseMove={handlePointerMove}
          onMouseDown={handleMouseDown}
          onMouseLeave={() => setHoverPixel(null)}
          style={{ height }}
          className="relative w-full overflow-hidden select-none cursor-ew-resize bg-space-950"
        >
          {/* Layer 2: After Scene (Full Background) */}
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <canvas
              ref={afterCanvasRef}
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded bg-space-900/80 backdrop-blur-md border border-cyan-800/80 text-[10px] font-mono text-cyan-300 pointer-events-none">
              AFTER: {afterDate}
            </div>
          </div>

          {/* Layer 1: Before Scene (Clipped to Slider Position) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ width: `${sliderPos}%` }}
          >
            <div className="relative w-full h-full">
              <div
                className="absolute top-0 bottom-0 left-0 p-2 flex items-center justify-center"
                style={{
                  width: containerRef.current?.getBoundingClientRect().width || '100%',
                }}
              >
                <canvas
                  ref={beforeCanvasRef}
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded bg-space-900/80 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-slate-300 pointer-events-none">
                BEFORE: {beforeDate}
              </div>
            </div>
          </div>

          {/* Draggable Divider Line */}
          <div
            className="absolute top-0 bottom-0 z-20 w-0.5 bg-cyan-400 shadow-[0_0_12px_rgba(53,196,224,0.8)]"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-space-900 border-2 border-cyan-400 shadow-xl flex items-center justify-center text-cyan-300 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
              <MoveHorizontal className="w-4 h-4" />
            </div>
          </div>
        </div>
      ) : (
        /* Side-by-Side Dual Panels (Earlier Observation vs Later Observation) */
        <div style={{ height }} className="grid grid-cols-2 divide-x divide-space-800 bg-space-950 p-2 gap-2">
          {/* Panel 1: Before (Earlier observation) */}
          <div className="relative flex flex-col items-center justify-center p-2 rounded-xl bg-space-900/60 border border-space-800">
            <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-space-900/90 border border-slate-700 text-[10px] font-mono text-slate-300">
              BEFORE: {beforeDate}
            </div>
            <canvas
              ref={sideBeforeCanvasRef}
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
            <span className="absolute bottom-2 text-[10px] text-slate-400 font-mono">Earlier Satellite Pass</span>
          </div>

          {/* Panel 2: After (Later observation) */}
          <div className="relative flex flex-col items-center justify-center p-2 rounded-xl bg-space-900/60 border border-space-800">
            <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded bg-space-900/90 border border-cyan-700 text-[10px] font-mono text-cyan-300">
              AFTER: {afterDate}
            </div>
            <canvas
              ref={sideAfterCanvasRef}
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
            <span className="absolute bottom-2 text-[10px] text-cyan-400 font-mono">Later Satellite Pass</span>
          </div>
        </div>
      )}

      {/* Coordinate & Pixel Inspector Footer */}
      <div className="p-3 bg-space-900/90 border-t border-space-750 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <span>Swipe: <b className="text-cyan-400">{Math.round(sliderPos)}%</b></span>
          {hoverPixel ? (
            <div className="flex items-center gap-3 text-slate-300">
              <span>Pixel [{hoverPixel.x}, {hoverPixel.y}]</span>
              <span>Before: <b className="text-slate-200">{hoverPixel.before} {unit}</b></span>
              <span>After: <b className="text-cyan-300">{hoverPixel.after} {unit}</b></span>
              <span className="text-amber-400 font-semibold">Δ: {hoverPixel.diff} {unit}</span>
            </div>
          ) : (
            <span className="text-slate-400 italic">Hover over raster to inspect pixel values</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSliderPos(50)}
            className="p-1.5 rounded bg-space-800 text-slate-400 hover:text-white transition flex items-center gap-1 text-[11px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Split</span>
          </button>
        </div>
      </div>
    </div>
  );
}

