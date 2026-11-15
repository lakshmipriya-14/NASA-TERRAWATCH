import React from 'react';
import { Link } from 'react-router-dom';
import {
  Satellite,
  Info,
  Radio,
  Layers,
  Sparkles,
  ShieldCheck,
  Globe2,
  Cpu,
  BookOpen,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Hero Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-space-900 via-space-850 to-space-900 border border-space-700 shadow-2xl text-center space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Global Earth Surface Observation</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          About TerraWatch
        </h1>

        <p className="text-base text-cyan-300 font-medium max-w-2xl mx-auto italic">
          "Turning NISAR radar observations into understandable insights about Earth's constantly changing surface."
        </p>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          TerraWatch is an advanced Synthetic Aperture Radar intelligence platform.
          Our mission is to bridge the gap between complex raw radar physics and actionable intelligence for environmental scientists,
          disaster responders, agricultural decision-makers, and curious global citizens.
        </p>
      </div>

      {/* The Science of SAR Section */}
      <div className="p-6 rounded-2xl bg-space-850 border border-space-750 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Why Synthetic Aperture Radar (SAR)?</h2>
            <p className="text-xs text-slate-400">All-weather, day-and-night microwave Earth observation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-space-900 border border-space-750 text-xs space-y-2">
            <h3 className="font-bold text-cyan-300">Penetrates Clouds, Smoke & Night</h3>
            <p className="text-slate-300 leading-relaxed">
              Unlike optical satellites (Landsat, Sentinel-2) which are blinded by heavy cloud cover, monsoon storms, and nighttime darkness,
              SAR illuminates the Earth with its own microwave pulses (1.25 GHz L-band and 3.2 GHz S-band), penetrating clouds, dust, and smoke effortlessly.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-space-900 border border-space-750 text-xs space-y-2">
            <h3 className="font-bold text-emerald-300">Phase & Interferometry (InSAR)</h3>
            <p className="text-slate-300 leading-relaxed">
              SAR records both <i>amplitude</i> (intensity of backscatter) and <i>phase</i> (wave cycle position).
              Comparing the phase of two repeat passes (Interferometry) resolves millimeter-to-centimeter crustal displacement, fault slip, and subsidence.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-space-900 border border-space-750 text-xs space-y-2">
            <h3 className="font-bold text-amber-300">Polarimetric Scattering Mechanisms</h3>
            <p className="text-slate-300 leading-relaxed">
              By transmitting and receiving in horizontal (H) and vertical (V) orientations, NISAR distinguishes:
              (1) <b>Specular scatter</b> on smooth water, (2) <b>Volume scatter</b> in forest canopies, and (3) <b>Double-bounce</b> in flooded wetlands.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-space-900 border border-space-750 text-xs space-y-2">
            <h3 className="font-bold text-rose-300">Dielectric Soil Sensitivity</h3>
            <p className="text-slate-300 leading-relaxed">
              The dielectric constant of water (ε ≈ 80) is an order of magnitude higher than dry soil (ε ≈ 3.5).
              Microwave backscatter increases rapidly as soil moisture rises, enabling direct agro-hydrological monitoring.
            </p>
          </div>
        </div>
      </div>

      {/* NISAR Satellite Architecture */}
      <div className="p-6 rounded-2xl bg-space-850 border border-space-750 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
            <Satellite className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">The NASA-ISRO NISAR Mission</h2>
            <p className="text-xs text-slate-400">Revolutionary dual-frequency SweepSAR technology</p>
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left font-mono border border-space-750 rounded-xl overflow-hidden bg-space-900">
            <thead className="bg-space-950 text-slate-400 text-[11px] uppercase border-b border-space-750">
              <tr>
                <th className="py-2.5 px-4">Parameter</th>
                <th className="py-2.5 px-4">L-Band Radar (NASA JPL)</th>
                <th className="py-2.5 px-4">S-Band Radar (ISRO SAC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-space-750/60 text-slate-300">
              <tr>
                <td className="py-2.5 px-4 font-semibold text-white">Wavelength / Freq</td>
                <td className="py-2.5 px-4 text-cyan-300">23.84 cm / 1.257 GHz</td>
                <td className="py-2.5 px-4 text-emerald-300">9.37 cm / 3.2 GHz</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-white">Primary Applications</td>
                <td className="py-2.5 px-4">Biomass, InSAR Deformation, Soil Moisture</td>
                <td className="py-2.5 px-4">Crop Types, Coastal Wetlands, Polar Ice</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-white">Swath Width</td>
                <td className="py-2.5 px-4">242 km (SweepSAR continuous)</td>
                <td className="py-2.5 px-4">242 km (Targeted global swaths)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-white">Repeat Cycle</td>
                <td className="py-2.5 px-4" colSpan={2}>12-Day exact repeat orbit (Ascending & Descending)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-white">Spatial Resolution</td>
                <td className="py-2.5 px-4" colSpan={2}>3 m to 10 m (Single Look Complex) • 30 m (GCOV/GUNW standard)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Four Monitoring Modules Overview */}
      <div className="p-6 rounded-2xl bg-space-850 border border-space-750 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white">Four Core TerraWatch Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-space-900 border border-cyan-800/50 space-y-1">
            <span className="font-bold text-cyan-300 block">1. WaterWatch</span>
            <p className="text-slate-300 leading-relaxed">
              Maps open water expansion, wetland hydroperiods, and flood inundation using calibrated L-GCOV backscatter thresholding (-3.0 dB specular drop and +2.5 dB double bounce).
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-space-900 border border-emerald-800/50 space-y-1">
            <span className="font-bold text-emerald-300 block">2. ForestWatch</span>
            <p className="text-slate-300 leading-relaxed">
              Detects canopy clearing, selective logging, and wildfire damage by measuring cross-polarized ($HV$) volume scattering loss from tree crowns.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-space-900 border border-amber-800/50 space-y-1">
            <span className="font-bold text-amber-300 block">3. AgroWatch</span>
            <p className="text-slate-300 leading-relaxed">
              Monitors seasonal crop phenology, irrigation pulses, and volumetric soil moisture ($m^3/m^3$) using semi-empirical radar dielectric models.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-space-900 border border-rose-800/50 space-y-1">
            <span className="font-bold text-rose-300 block">4. GeoMotion</span>
            <p className="text-slate-300 leading-relaxed">
              Measures tectonic fault ruptures, co-seismic slip, and urban groundwater subsidence using phase unwrapping from NISAR GUNW interferograms.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-space-900 to-space-850 border border-cyan-500/30 text-center space-y-3">
        <h3 className="text-base font-bold text-white">Ready to Explore NISAR Observations?</h3>
        <p className="text-xs text-slate-300 max-w-lg mx-auto">
          Start exploring global study sites in the Interactive Explorer or launch any of our four specialized monitoring modules.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/explorer"
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold text-xs flex items-center gap-2 shadow-glow-cyan transition"
          >
            <span>Launch Global Explorer</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-space-800 hover:bg-space-750 text-slate-200 border border-space-700 text-xs font-semibold transition"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
