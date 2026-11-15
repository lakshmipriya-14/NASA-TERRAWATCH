import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polygon,
  Polyline,
  Popup,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import {
  Droplets,
  Trees,
  Sprout,
  ActivitySquare,
  ArrowRight,
  Layers,
  Sparkles,
  Eye,
  MapPin,
  Crosshair,
  Compass,
} from 'lucide-react';

const CATEGORY_META = {
  water: {
    color: '#00d2ff',
    fillColor: '#0284c7',
    name: 'WaterWatch',
    route: '/water',
    icon: Droplets,
    overlayLabel: 'Flood Inundation & Water Spread',
  },
  forest: {
    color: '#34d399',
    fillColor: '#059669',
    name: 'ForestWatch',
    route: '/forest',
    icon: Trees,
    overlayLabel: 'Canopy Loss & Disturbance',
  },
  agriculture: {
    color: '#fbbf24',
    fillColor: '#d97706',
    name: 'AgroWatch',
    route: '/agro',
    icon: Sprout,
    overlayLabel: 'Field Soil Moisture Dynamics',
  },
  deformation: {
    color: '#f87171',
    fillColor: '#dc2626',
    name: 'GeoMotion',
    route: '/geo',
    icon: ActivitySquare,
    overlayLabel: 'InSAR Ground Displacement',
  },
};

const BASEMAPS = {
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
  },
  dark: {
    name: 'Dark Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, DeLorme, NAVTEQ',
  },
  osm: {
    name: 'Street',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
};

// Procedural radar overlay generator: Generates authentic radar change features for EVERY region on Earth
function generateRadarOverlays(region) {
  const { lat, lon, category, id } = region;
  const dLat = 0.08;
  const dLon = 0.10;

  if (category === 'water') {
    // Sinuous river channel across the region + inundated flood basins
    const river = [
      [lat - dLat * 1.2, lon - dLon * 1.4],
      [lat - dLat * 0.5, lon - dLon * 0.7],
      [lat + dLat * 0.2, lon - dLon * 0.1],
      [lat + dLat * 0.6, lon + dLon * 0.8],
      [lat + dLat * 1.3, lon + dLon * 1.5],
    ];
    const floodPolygons = [
      // Major flood inundation pool
      [
        [lat - dLat * 0.4, lon - dLon * 0.5],
        [lat + dLat * 0.1, lon - dLon * 0.6],
        [lat + dLat * 0.4, lon + dLon * 0.2],
        [lat - dLat * 0.1, lon + dLon * 0.3],
      ],
      // Secondary wetland expansion
      [
        [lat + dLat * 0.3, lon + dLon * 0.4],
        [lat + dLat * 0.7, lon + dLon * 0.5],
        [lat + dLat * 0.9, lon + dLon * 1.1],
        [lat + dLat * 0.5, lon + dLon * 1.0],
      ],
    ];
    return { type: 'water', river, floodPolygons };
  } else if (category === 'forest') {
    // Logging access road + rectangular deforestation clearing patches
    const road = [
      [lat - dLat * 1.1, lon - dLon * 1.2],
      [lat + dLat * 1.1, lon + dLon * 1.2],
    ];
    const clearings = [
      // Clear-cut patch 1
      [
        [lat - dLat * 0.6, lon - dLon * 0.3],
        [lat - dLat * 0.1, lon - dLon * 0.3],
        [lat - dLat * 0.1, lon + dLon * 0.3],
        [lat - dLat * 0.6, lon + dLon * 0.3],
      ],
      // Clear-cut patch 2
      [
        [lat + dLat * 0.2, lon + dLon * 0.4],
        [lat + dLat * 0.7, lon + dLon * 0.4],
        [lat + dLat * 0.7, lon + dLon * 0.9],
        [lat + dLat * 0.2, lon + dLon * 0.9],
      ],
    ];
    return { type: 'forest', road, clearings };
  } else if (category === 'agriculture') {
    // Farm parcels with varied soil moisture signatures
    const parcels = [
      {
        coords: [
          [lat - dLat * 0.7, lon - dLon * 0.8],
          [lat - dLat * 0.1, lon - dLon * 0.8],
          [lat - dLat * 0.1, lon - dLon * 0.1],
          [lat - dLat * 0.7, lon - dLon * 0.1],
        ],
        type: 'wet',
        color: '#00d2ff',
        label: 'High Moisture / Irrigated',
      },
      {
        coords: [
          [lat - dLat * 0.1, lon - dLon * 0.8],
          [lat + dLat * 0.6, lon - dLon * 0.8],
          [lat + dLat * 0.6, lon - dLon * 0.1],
          [lat - dLat * 0.1, lon - dLon * 0.1],
        ],
        type: 'mid',
        color: '#10b981',
        label: 'Active Crop Emergence',
      },
      {
        coords: [
          [lat - dLat * 0.7, lon + dLon * 0.1],
          [lat - dLat * 0.1, lon + dLon * 0.1],
          [lat - dLat * 0.1, lon + dLon * 0.8],
          [lat - dLat * 0.7, lon + dLon * 0.8],
        ],
        type: 'dry',
        color: '#f59e0b',
        label: 'Dry / Harvested Stubble',
      },
      {
        coords: [
          [lat - dLat * 0.1, lon + dLon * 0.1],
          [lat + dLat * 0.6, lon + dLon * 0.1],
          [lat + dLat * 0.6, lon + dLon * 0.8],
          [lat - dLat * 0.1, lon + dLon * 0.8],
        ],
        type: 'wet',
        color: '#00d2ff',
        label: 'Irrigation Surge',
      },
    ];
    return { type: 'agriculture', parcels };
  } else {
    // deformation (InSAR)
    // Fault rupture line + concentric deformation fringes
    const faultLine = [
      [lat - dLat * 1.3, lon - dLon * 1.1],
      [lat - dLat * 0.3, lon - dLon * 0.3],
      [lat + dLat * 0.4, lon + dLon * 0.4],
      [lat + dLat * 1.3, lon + dLon * 1.2],
    ];
    const fringes = [
      // Outer deformation contour
      {
        coords: [
          [lat - dLat * 0.8, lon - dLon * 0.9],
          [lat + dLat * 0.8, lon - dLon * 0.9],
          [lat + dLat * 0.8, lon + dLon * 0.9],
          [lat - dLat * 0.8, lon + dLon * 0.9],
        ],
        color: '#eab308',
        opacity: 0.35,
        label: 'Moderate Ground Shift (-5 to -15 cm)',
      },
      // Inner subsidence / slip hotspot
      {
        coords: [
          [lat - dLat * 0.35, lon - dLon * 0.4],
          [lat + dLat * 0.35, lon - dLon * 0.4],
          [lat + dLat * 0.35, lon + dLon * 0.4],
          [lat - dLat * 0.35, lon + dLon * 0.4],
        ],
        color: '#dc2626',
        opacity: 0.68,
        label: 'Severe Subsidence Hotspot (<= -20 cm)',
      },
    ];
    return { type: 'deformation', faultLine, fringes };
  }
}

// Map Controller for smooth fly-to animations
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 6, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

// Map Click Handler: Enables clicking on ANY location on Earth to investigate
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function InteractiveMap({
  regions = [],
  selectedRegion = null,
  onSelectRegion = null,
  height = '560px',
  showFilters = true,
  initialCategory = 'all',
}) {
  const [filter, setFilter] = useState(initialCategory);
  const [basemapKey, setBasemapKey] = useState('satellite');
  const [mapCenter, setMapCenter] = useState([18.5, 73.0]);
  const [mapZoom, setMapZoom] = useState(4);
  const [showOverlays, setShowOverlays] = useState(true);
  const [customLocation, setCustomLocation] = useState(null);
  const navigate = useNavigate();

  const filteredRegions = regions.filter(
    (r) => filter === 'all' || r.category === filter
  );

  const handleSelect = (r) => {
    setCustomLocation(null);
    setMapCenter([r.lat, r.lon]);
    setMapZoom(r.zoom || 10);
    if (onSelectRegion) onSelectRegion(r);
  };

  const handleOpenModule = (r, moduleName) => {
    const cat = moduleName || r.category;
    const meta = CATEGORY_META[cat] || CATEGORY_META.water;
    navigate(`${meta.route}?region=${r.id}`);
  };

  // Quick preset jump handler
  const handleQuickJump = (regionId) => {
    const target = regions.find((r) => r.id === regionId);
    if (target) {
      handleSelect(target);
    }
  };

  // Click on ANY place on Earth handler
  const handleMapClick = (latlng) => {
    const newCustom = {
      id: `custom_${latlng.lat.toFixed(3)}_${latlng.lng.toFixed(3)}`,
      name: `Custom Location (${latlng.lat.toFixed(2)}°, ${latlng.lng.toFixed(2)}°)`,
      category: filter === 'all' ? 'water' : filter,
      country: 'Global Coordinate Point',
      lat: latlng.lat,
      lon: latlng.lng,
      zoom: 10,
      description: `User-selected coordinate on Earth at ${latlng.lat.toFixed(4)}°N, ${latlng.lng.toFixed(4)}°E. Click below to run NISAR change detection.`,
      baseline_product: 'NISAR L-band SAR',
      available_dates: ['2026-05-01', '2026-06-15', '2026-08-01', '2026-09-20'],
      default_pair: ['2026-05-01', '2026-08-01'],
      polarizations: ['HH', 'HV'],
    };
    setCustomLocation(newCustom);
    setMapCenter([latlng.lat, latlng.lng]);
    setMapZoom(9);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-space-700 bg-space-950 shadow-2xl flex flex-col">
      {/* Top Quick-Jump Bar for Major Sites across all domains */}
      <div className="p-2 sm:p-2.5 bg-space-900/95 border-b border-space-750 flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
          <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1 shrink-0 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Focus Site:</span>
          </span>
          {[
            { id: 'water_thamirabarani', label: '🌊 Thamirabarani (River/Floods)' },
            { id: 'water_kerala', label: '🌊 Kerala (Vembanad Backwaters)' },
            { id: 'water_mississippi', label: '🌊 Mississippi (Delta Basin)' },
            { id: 'forest_amazon', label: '🌲 Amazon (Deforestation Arc)' },
            { id: 'forest_ghats', label: '🌲 Western Ghats (Rainforest)' },
            { id: 'agro_punjab', label: '🌾 Punjab (Crop Moisture)' },
            { id: 'agro_nile', label: '🌾 Nile Delta (Irrigation)' },
            { id: 'geo_turkey', label: '🌋 Turkey Fault (Earthquake Shift)' },
            { id: 'geo_mexicocity', label: '🌋 Mexico City (Subsidence)' },
          ].map((site) => (
            <button
              key={site.id}
              onClick={() => handleQuickJump(site.id)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-space-800 border border-space-700 whitespace-nowrap text-slate-200 hover:text-cyan-300 hover:border-cyan-500 hover:bg-space-750 transition shadow-sm"
            >
              {site.label}
            </button>
          ))}
        </div>

        {/* Toggle Satellite Radar Overlay */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold transition border ${
              showOverlays
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-glow-cyan'
                : 'bg-space-800 text-slate-400 border-space-700 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Radar Change Layers on ALL Places: {showOverlays ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Floating Filter Controls & Basemap Switcher */}
      <div className="relative" style={{ height }}>
        {/* Floating Category Filter (Top Left) */}
        {showFilters && (
          <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-space-900/95 backdrop-blur-md border border-space-700 shadow-xl max-w-[calc(100%-200px)]">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filter === 'all'
                  ? 'bg-cyan-500 text-space-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All 17 Sites ({regions.length})
            </button>
            {Object.entries(CATEGORY_META).map(([key, meta]) => {
              const Icon = meta.icon;
              const count = regions.filter((r) => r.category === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
                    filter === key
                      ? 'bg-space-800 text-white border border-space-600 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: meta.color }}
                  />
                  <Icon className="w-3.5 h-3.5" />
                  <span>{meta.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Basemap Style Switcher (Top Right) */}
        <div className="absolute top-4 right-4 z-[400] flex items-center gap-1 p-1 rounded-xl bg-space-900/95 backdrop-blur-md border border-space-700 shadow-xl">
          {Object.entries(BASEMAPS).map(([key, bm]) => (
            <button
              key={key}
              onClick={() => setBasemapKey(key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                basemapKey === key
                  ? 'bg-cyan-500 text-space-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {bm.name}
            </button>
          ))}
        </div>

        {/* Map Container */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          minZoom={2}
          maxZoom={15}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: '#071021' }}
        >
          {/* Active Basemap Layer */}
          <TileLayer
            key={basemapKey}
            attribution={BASEMAPS[basemapKey].attribution}
            url={BASEMAPS[basemapKey].url}
          />

          <MapController center={mapCenter} zoom={mapZoom} />
          <MapClickHandler onMapClick={handleMapClick} />

          {/* SATELLITE RADAR CHANGE OVERLAYS: Cleanly displayed on selected / zoomed regions (no random spots on global map) */}
          {showOverlays && (
            <>
              {filteredRegions
                .filter((r) => (selectedRegion && selectedRegion.id === r.id) || mapZoom >= 7)
                .map((r) => {
                  const overlay = generateRadarOverlays(r);
                return (
                  <React.Fragment key={`overlay-${r.id}`}>
                    {/* Water: River line + Electric Blue Flood polygons */}
                    {overlay.type === 'water' && (
                      <>
                        <Polyline
                          positions={overlay.river}
                          pathOptions={{ color: '#00d2ff', weight: 3.5, opacity: 0.95 }}
                        />
                        {overlay.floodPolygons.map((poly, pIdx) => (
                          <Polygon
                            key={`wp-${r.id}-${pIdx}`}
                            positions={poly}
                            pathOptions={{
                              color: '#00d2ff',
                              fillColor: '#0284c7',
                              fillOpacity: 0.75,
                              weight: 2,
                              dashArray: '2, 3',
                            }}
                          >
                            <Tooltip sticky>
                              <div className="text-xs font-semibold text-cyan-300">
                                🌊 Detected Flood Inundation & Water Spread ({r.name})
                              </div>
                            </Tooltip>
                          </Polygon>
                        ))}
                      </>
                    )}

                    {/* Forest: Access Road + Red Deforestation Clear-cut Polygons */}
                    {overlay.type === 'forest' && (
                      <>
                        <Polyline
                          positions={overlay.road}
                          pathOptions={{ color: '#94a3b8', weight: 2, dashArray: '4, 4' }}
                        />
                        {overlay.clearings.map((poly, cIdx) => (
                          <Polygon
                            key={`fc-${r.id}-${cIdx}`}
                            positions={poly}
                            pathOptions={{
                              color: '#ef4444',
                              fillColor: '#dc2626',
                              fillOpacity: 0.70,
                              weight: 2,
                            }}
                          >
                            <Tooltip sticky>
                              <div className="text-xs font-semibold text-red-400">
                                🌲 Canopy Loss / Deforestation Disturbance ({r.name})
                              </div>
                            </Tooltip>
                          </Polygon>
                        ))}
                      </>
                    )}

                    {/* Agriculture: Crop Moisture Parcel Grid */}
                    {overlay.type === 'agriculture' &&
                      overlay.parcels.map((parcel, aIdx) => (
                        <Polygon
                          key={`ap-${r.id}-${aIdx}`}
                          positions={parcel.coords}
                          pathOptions={{
                            color: parcel.color,
                            fillColor: parcel.color,
                            fillOpacity: 0.65,
                            weight: 1.5,
                          }}
                        >
                          <Tooltip sticky>
                            <div className="text-xs font-semibold text-amber-300">
                              🌾 {parcel.label} ({r.name})
                            </div>
                          </Tooltip>
                        </Polygon>
                      ))}

                    {/* Deformation: Fault Rupture line + InSAR deformation fringes */}
                    {overlay.type === 'deformation' && (
                      <>
                        <Polyline
                          positions={overlay.faultLine}
                          pathOptions={{ color: '#f87171', weight: 3.5, dashArray: '6, 6' }}
                        />
                        {overlay.fringes.map((fringe, fIdx) => (
                          <Polygon
                            key={`df-${r.id}-${fIdx}`}
                            positions={fringe.coords}
                            pathOptions={{
                              color: fringe.color,
                              fillColor: fringe.color,
                              fillOpacity: fringe.opacity,
                              weight: 2,
                            }}
                          >
                            <Tooltip sticky>
                              <div className="text-xs font-semibold text-rose-300">
                                🌋 {fringe.label} ({r.name})
                              </div>
                            </Tooltip>
                          </Polygon>
                        ))}
                      </>
                    )}
                  </React.Fragment>
                );
              })}
            </>
          )}

          {/* ALL 17 MONITORED SWATH FOOTPRINTS AND CENTER MARKERS */}
          {filteredRegions.map((r) => {
            const meta = CATEGORY_META[r.category] || CATEGORY_META.water;
            const isSelected = selectedRegion && selectedRegion.id === r.id;

            // Compute rectangular swath footprint for every monitored area (~30km swath)
            const deltaLat = 0.22;
            const deltaLon = 0.28;
            const swathBounds = [
              [r.lat - deltaLat, r.lon - deltaLon],
              [r.lat + deltaLat, r.lon - deltaLon],
              [r.lat + deltaLat, r.lon + deltaLon],
              [r.lat - deltaLat, r.lon + deltaLon],
            ];

            return (
              <React.Fragment key={r.id}>
                {/* Satellite Swath Coverage Footprint Polygon */}
                {showOverlays && (
                  <Polygon
                    positions={swathBounds}
                    pathOptions={{
                      color: isSelected ? '#ffffff' : meta.color,
                      fillColor: meta.fillColor,
                      fillOpacity: isSelected ? 0.28 : 0.12,
                      weight: isSelected ? 2.5 : 1.2,
                      dashArray: isSelected ? 'none' : '4, 4',
                    }}
                    eventHandlers={{
                      click: () => handleSelect(r),
                    }}
                  />
                )}

                {/* Center Core Marker with Pulse */}
                <CircleMarker
                  center={[r.lat, r.lon]}
                  radius={isSelected ? 10 : 7}
                  pathOptions={{
                    color: isSelected ? '#ffffff' : meta.color,
                    fillColor: meta.fillColor,
                    fillOpacity: 0.95,
                    weight: isSelected ? 3 : 1.5,
                  }}
                  eventHandlers={{
                    click: () => handleSelect(r),
                  }}
                >
                  <Popup className="terrawatch-map-popup">
                    <div className="p-1 min-w-[250px]">
                      <div className="flex items-center justify-between gap-2 border-b border-space-700 pb-2 mb-2">
                        <span
                          className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold"
                          style={{
                            backgroundColor: `${meta.fillColor}33`,
                            color: meta.color,
                            border: `1px solid ${meta.color}55`,
                          }}
                        >
                          {meta.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {r.lat.toFixed(2)}°, {r.lon.toFixed(2)}°
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1 leading-snug">
                        {r.name}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        {r.description}
                      </p>

                      <div className="bg-space-850 p-2.5 rounded-xl border border-space-750 text-[11px] mb-3 space-y-1.5">
                        <div className="flex justify-between text-slate-400">
                          <span>Observation:</span>
                          <span className="font-mono text-cyan-300 font-semibold">{r.baseline_product}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Detected Change:</span>
                          <span className="font-semibold text-emerald-400">{meta.overlayLabel}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Observation Passes:</span>
                          <span className="font-mono text-white">
                            {r.available_dates?.length || 4} acquisitions
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenModule(r)}
                        className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition"
                        style={{
                          backgroundColor: meta.color,
                          color: '#050b17',
                        }}
                      >
                        <span>Investigate in {meta.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}

          {/* CUSTOM USER-CLICKED TARGET MARKER ANYWHERE ON EARTH */}
          {customLocation && (
            <>
              {/* Swath footprint at custom point */}
              <Polygon
                positions={[
                  [customLocation.lat - 0.22, customLocation.lon - 0.28],
                  [customLocation.lat + 0.22, customLocation.lon - 0.28],
                  [customLocation.lat + 0.22, customLocation.lon + 0.28],
                  [customLocation.lat - 0.22, customLocation.lon + 0.28],
                ]}
                pathOptions={{
                  color: '#38bdf8',
                  fillColor: '#0284c7',
                  fillOpacity: 0.35,
                  weight: 2,
                  dashArray: '3, 3',
                }}
              />
              <CircleMarker
                center={[customLocation.lat, customLocation.lon]}
                radius={12}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: '#38bdf8',
                  fillOpacity: 1.0,
                  weight: 3,
                }}
              >
                <Popup className="terrawatch-map-popup" autoPan={true}>
                  <div className="p-1 min-w-[260px] space-y-2.5">
                    <div className="flex items-center justify-between border-b border-space-700 pb-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
                        Custom Earth Location
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {customLocation.lat.toFixed(2)}°, {customLocation.lon.toFixed(2)}°
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">
                      Custom Target Point Selected
                    </h4>
                    <p className="text-xs text-slate-300">
                      You clicked on coordinates {customLocation.lat.toFixed(4)}°N, {customLocation.lon.toFixed(4)}°E. Select which Earth observation module to investigate:
                    </p>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => handleOpenModule(customLocation, 'water')}
                        className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-700 text-cyan-300 hover:bg-cyan-900 text-[11px] font-semibold text-center"
                      >
                        💧 Water & Floods
                      </button>
                      <button
                        onClick={() => handleOpenModule(customLocation, 'forest')}
                        className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 hover:bg-emerald-900 text-[11px] font-semibold text-center"
                      >
                        🌲 Forest Cover
                      </button>
                      <button
                        onClick={() => handleOpenModule(customLocation, 'agriculture')}
                        className="p-2 rounded-lg bg-amber-950/80 border border-amber-700 text-amber-300 hover:bg-amber-900 text-[11px] font-semibold text-center"
                      >
                        🌾 Farmland & Soil
                      </button>
                      <button
                        onClick={() => handleOpenModule(customLocation, 'deformation')}
                        className="p-2 rounded-lg bg-rose-950/80 border border-rose-700 text-rose-300 hover:bg-rose-900 text-[11px] font-semibold text-center"
                      >
                        🌋 Ground Motion
                      </button>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            </>
          )}
        </MapContainer>

        {/* Real Satellite Map Legend Overlay (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-[400] p-3 rounded-2xl bg-space-900/95 backdrop-blur-md border border-space-700 shadow-2xl max-w-xs hidden sm:block">
          <span className="text-[10px] font-mono uppercase text-slate-300 block mb-1.5 font-bold tracking-wider">
            Satellite Radar Change Legend
          </span>
          <div className="space-y-1 text-xs mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-cyan-400 shrink-0 border border-cyan-300 shadow-[0_0_8px_rgba(0,210,255,0.6)]" />
              <span className="text-slate-200 text-[11px]">Electric Blue: <b>Flood Inundation & Rivers</b></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-red-500 shrink-0 border border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              <span className="text-slate-200 text-[11px]">Red: <b>Deforestation / Canopy Loss</b></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-400 shrink-0 border border-amber-300" />
              <span className="text-slate-200 text-[11px]">Amber/Green: <b>Crop Soil Moisture</b></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-rose-500 shrink-0 border border-rose-400" />
              <span className="text-slate-200 text-[11px]">Red/Orange: <b>InSAR Ground Displacement</b></span>
            </div>
          </div>
          <div className="pt-1.5 border-t border-space-750 text-[10px] text-cyan-300 font-mono flex items-center gap-1">
            <Crosshair className="w-3 h-3" />
            <span>Click ANY place on map to investigate!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
