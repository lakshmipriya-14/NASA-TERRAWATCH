import React, { useState } from 'react';
import {
  Database,
  ExternalLink,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  Satellite,
  Info,
  ShieldCheck,
  Radio,
  FileCode2
} from 'lucide-react';
import { api } from '../api';

const DATA_SOURCES = [
  {
    name: 'NASA ASF Vertex (Alaska Satellite Facility)',
    url: 'https://search.asf.alaska.edu/',
    description: 'The official NASA DAAC archive for synthetic aperture radar data. Provides NISAR GCOV and GUNW product discovery, spatial geographic filtering, and batch downloading.',
    productTypes: ['NISAR L-GCOV', 'NISAR L-GUNW', 'NISAR GSLC', 'Sentinel-1'],
    cadence: '12-Day Orbital Repeat',
    polarizations: ['HH', 'HV', 'VV', 'VH', 'Compact-Pol'],
    status: 'Operational DAAC Archive',
    access: 'Open NASA Earthdata Login',
  },
  {
    name: 'NASA Earthdata Search',
    url: 'https://search.earthdata.nasa.gov/',
    description: 'NASA Earth Science Data and Information System (ESDIS) global portal for multi-sensor satellite discovery and cross-mission synergy.',
    productTypes: ['NISAR All Levels', 'SMAP Soil Moisture', 'MODIS', 'VIIRS'],
    cadence: 'Daily to 12-Day',
    polarizations: ['Multi-Polarimetric', 'Radiometric'],
    status: 'Primary NASA Discovery Engine',
    access: 'Public / Free Registration',
  },
  {
    name: 'ISRO Bhoonidhi Data Portal',
    url: 'https://bhoonidhi.nrsc.gov.in/',
    description: 'Indian Space Research Organisation (ISRO) National Remote Sensing Centre (NRSC) open data dissemination platform for NISAR S-band and Indian Earth observation satellites.',
    productTypes: ['NISAR S-Band GCOV', 'Resourcesat', 'Cartosat', 'Oceansat'],
    cadence: '12-Day S-Band Swaths',
    polarizations: ['HH+HV', 'Circular Quad-Pol'],
    status: 'ISRO National Archive',
    access: 'Open Registration',
  },
  {
    name: 'NISAR Science Data User Guide (ASF)',
    url: 'https://nisar-docs.asf.alaska.edu/',
    description: 'Comprehensive technical documentation detailing NISAR Level-1 (SLC), Level-2 (GCOV, GUNW, GSV), and Level-3 products, HDF5 internal tree structures, and calibration coefficients.',
    productTypes: ['HDF5 / Cloud-Optimized GeoTIFF Specifications'],
    cadence: 'Continual Documentation Updates',
    polarizations: ['Dual-Frequency L & S Band Guides'],
    status: 'Official Science Documentation',
    access: 'Public Documentation',
  },
  {
    name: 'CSA RADARSAT Constellation Mission (RCM)',
    url: 'https://donnees-data.asc-csa.gc.ca/en/dataset/rcm',
    description: 'Canadian Space Agency trio of C-band SAR satellites offering daily maritime surveillance, ecosystem monitoring, and disaster response data.',
    productTypes: ['C-band SAR Geocoded Products'],
    cadence: '1-4 Days (Constellation)',
    polarizations: ['Compact Pol', 'Dual-Pol'],
    status: 'Partner Space Agency',
    access: 'Open License Dataset',
  },
  {
    name: 'CONAE SAOCOM Catalog (Argentina)',
    url: 'https://catalogos.conae.gov.ar/catalogo/catalogoSatSaocomInfo.html',
    description: 'National Space Activities Commission of Argentina L-band SAR satellite mission providing operational agricultural soil moisture maps and interferometry.',
    productTypes: ['L-band Quad-Pol SAR', 'Operational Soil Moisture'],
    cadence: '16-Day Repeat',
    polarizations: ['Full Polarimetric HH/HV/VV/VH'],
    status: 'Partner Space Agency',
    access: 'One-Click Login Profile',
  },
  {
    name: 'NASA ARSET Remote Sensing Training',
    url: 'https://appliedsciences.nasa.gov/get-involved/training',
    description: 'NASA Applied Remote Sensing Training program tutorials for disaster management, flood mapping, wildfire recovery, and radar interferometry.',
    productTypes: ['Training Handbooks, Jupyter Workbooks, Python Scripts'],
    cadence: 'Self-Paced Web Training',
    polarizations: ['Educational Resources'],
    status: 'NASA Applied Sciences',
    access: 'Free Open Education',
  },
  {
    name: 'JPL UAVSAR Airborne Radar Facility',
    url: 'https://uavsar.jpl.nasa.gov/education/postcards.html',
    description: 'NASA Jet Propulsion Laboratory airborne polarimetric L-band radar prototype instrument providing high-resolution benchmark validation datasets for NISAR.',
    productTypes: ['Airborne Polarimetric & InSAR Slant-Range GeoTIFFs'],
    cadence: 'Targeted Airborne Campaigns',
    polarizations: ['Full Polarimetric L-Band'],
    status: 'JPL Science Archive',
    access: 'Public Download',
  },
];

export default function DataSources() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploading(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      const res = await api.uploadProduct(file);
      setUploadResult(res);
    } catch (err) {
      setUploadError(err.message || 'File ingestion failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-space-900 via-space-850 to-space-900 border border-space-700 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-extrabold text-white">Scientific Data Sources</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              NASA / ISRO / CEOS Catalog
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Authoritative repositories, satellite specifications, and data access guides for synthetic aperture radar observations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-3 py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
            DEMO TRANSPARENCY: Verified Links & Real Ingest Sandbox
          </span>
        </div>
      </div>

      {/* Real vs Demo Integrity Notice */}
      <div className="p-4 rounded-xl bg-space-900 border border-space-750 text-xs text-slate-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
        <div className="leading-relaxed">
          <span className="text-white font-semibold">Scientific Integrity Commitment: </span>
          TerraWatch explicitly distinguishes demonstration simulation rasters from operational NASA-ISRO satellite granules.
          We never fabricate satellite findings or disguise synthetic test data as real NISAR observations.
          Use the links below to acquire authentic HDF5/GeoTIFF products directly from NASA ASF Vertex and ISRO Bhoonidhi.
        </div>
      </div>

      {/* Real NISAR Ingestion Sandbox */}
      <div className="p-6 rounded-2xl bg-space-850/90 border border-cyan-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Live NISAR Product Ingestion Sandbox
              </h3>
              <p className="text-xs text-slate-400">
                Upload real NISAR HDF5 (.h5, .he5) or GeoTIFF (.tif) files to verify internal group structures and dataset readiness
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-1 rounded border border-cyan-800">
            FastAPI Ingest Endpoint
          </span>
        </div>

        <div className="p-6 border-2 border-dashed border-space-700 hover:border-cyan-500/60 rounded-xl bg-space-900/60 text-center transition">
          <input
            type="file"
            id="nisar-upload-input"
            accept=".h5,.he5,.hdf5,.tif,.tiff"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label
            htmlFor="nisar-upload-input"
            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
          >
            <FileCode2 className="w-8 h-8 text-cyan-400" />
            <span className="text-xs font-semibold text-white">
              {selectedFile ? selectedFile.name : 'Click to select or drag & drop NISAR HDF5 / GeoTIFF product'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Supports GCOV, GUNW, GSLC HDF5 hierarchy inspection
            </span>
          </label>
        </div>

        {uploading && (
          <div className="p-3 rounded-lg bg-space-800 text-xs text-cyan-300 font-mono flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <span>Inspecting HDF5 groups and radar metadata with h5py...</span>
          </div>
        )}

        {uploadError && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadResult && (
          <div className="p-4 rounded-xl bg-space-900 border border-emerald-500/40 text-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{uploadResult.message}</span>
            </div>
            <div className="font-mono text-[11px] text-slate-300 bg-space-950 p-3.5 rounded-xl border border-space-750 space-y-1.5">
              <div className="flex justify-between">
                <span>Filename:</span>
                <b className="text-white">{uploadResult.metadata?.filename}</b>
              </div>
              <div className="flex justify-between">
                <span>Verified Format:</span>
                <b className="text-cyan-300">{uploadResult.metadata?.format} ({uploadResult.metadata?.detected_nisar_product})</b>
              </div>
              <div className="flex justify-between">
                <span>File Size:</span>
                <b className="text-slate-200">{(uploadResult.metadata?.size_bytes / (1024 * 1024)).toFixed(2)} MB</b>
              </div>
              {uploadResult.metadata?.top_level_groups?.length > 0 && (
                <div className="pt-1 text-[10px] text-slate-400">
                  Top-Level HDF5 Tree: <span className="text-cyan-300 font-semibold">{uploadResult.metadata.top_level_groups.join(' / ')}</span>
                </div>
              )}

              {/* Verified Science Datasets */}
              {uploadResult.metadata?.science_datasets?.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-space-750 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                    Verified Internal Radar Grid Datasets:
                  </span>
                  <div className="space-y-1.5">
                    {uploadResult.metadata.science_datasets.map((ds, idx) => (
                      <div key={idx} className="p-2 rounded bg-space-900 border border-space-750 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                        <span className="text-cyan-300 font-bold">{ds.path}</span>
                        <div className="flex items-center gap-3 text-slate-300">
                          <span>Dim: <b className="text-white">{ds.shape.join('x')}</b></span>
                          <span>Range: <b className="text-emerald-400">{ds.min_val} to {ds.max_val} dB</b></span>
                          <span>Mean: <b className="text-amber-400">{ds.mean_val} dB</b></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Catalog Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-wide">
          Authoritative Remote Sensing Portals
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {DATA_SOURCES.map((src, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-space-850/80 border border-space-750 hover:border-cyan-500/40 transition shadow-lg flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {src.name}
                  </h3>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-space-800 hover:bg-space-750 text-cyan-400 border border-space-700 transition flex-shrink-0"
                    title="Open external portal"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {src.description}
                </p>

                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Products:</span>
                    <span className="text-cyan-300">{src.productTypes.join(' • ')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Cadence:</span>
                    <span className="text-slate-200">{src.cadence}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Polarizations:</span>
                    <span className="text-emerald-400">{src.polarizations.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-space-750 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{src.status}</span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
                >
                  <span>Access Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

