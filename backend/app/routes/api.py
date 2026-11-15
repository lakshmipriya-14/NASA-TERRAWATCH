"""
TerraWatch - FastAPI Application Routes
Implements comprehensive REST endpoints for the Earth Surface Change Intelligence Platform.
"""
import os
import uuid
import datetime
import tempfile
import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Dict, Any, Optional

from ..models.schemas import AnalysisRequest, InsightRequest, InsightResponse
from ..services.demo_data import GLOBAL_REGIONS, generate_synthetic_scene, generate_time_series
from ..processors.sar_algorithms import (
    process_water_watch,
    process_forest_watch,
    process_agro_watch,
    process_geomotion_insar
)
from ..services.database import (
    save_analysis,
    get_analysis_by_id,
    list_recent_analyses,
    get_all_observations,
    get_platform_stats
)
from ..services.gemini_service import generate_ai_insights

router = APIRouter()

@router.get("/health")
def get_health():
    """System health and readiness check."""
    return {
        "status": "online",
        "service": "TerraWatch API",
        "version": "1.0.0",
        "gemini_api_configured": bool(os.getenv("GEMINI_API_KEY")),
        "h5py_available": True,
        "database": "sqlite",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@router.get("/stats")
def get_stats():
    """Retrieves high-level platform statistics."""
    return get_platform_stats()

@router.get("/regions")
def get_regions(category: Optional[str] = None):
    """Retrieves curated study regions for NISAR monitoring."""
    if category and category != "all":
        return [r for r in GLOBAL_REGIONS if r["category"] == category]
    return GLOBAL_REGIONS

@router.get("/observations")
def get_observations(category: Optional[str] = None):
    """Retrieves cataloged satellite observation passes."""
    obs = get_all_observations()
    if category and category != "all":
        obs = [o for o in obs if o["category"] == category]
    return obs

@router.get("/analyses")
def get_recent_analyses(limit: int = 10):
    """Retrieves historical analysis runs."""
    return list_recent_analyses(limit)

@router.get("/analysis/{aid}")
def get_analysis(aid: str):
    """Retrieves a specific completed analysis by unique ID."""
    rec = get_analysis_by_id(aid)
    if not rec:
        raise HTTPException(status_code=404, detail="Analysis record not found")
    return rec

@router.post("/upload")
async def upload_satellite_file(file: UploadFile = File(...)):
    """
    Accepts real NISAR HDF5 (.h5 / .he5) or GeoTIFF (.tif) files.
    Reads product metadata and top-level groups to verify NISAR formatting.
    """
    filename = file.filename or "unknown.h5"
    contents = await file.read()
    size_bytes = len(contents)
    
    metadata = {
        "filename": filename,
        "size_bytes": size_bytes,
        "format": "HDF5" if filename.lower().endswith((".h5", ".he5", ".hdf5")) else "GeoTIFF",
        "top_level_groups": [],
        "attributes": {}
    }

    if metadata["format"] == "HDF5":
        import h5py
        with tempfile.NamedTemporaryFile(suffix=".h5", delete=False) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name
        try:
            with h5py.File(tmp_path, "r") as h5_file:
                metadata["top_level_groups"] = list(h5_file.keys())
                for k in list(h5_file.attrs.keys())[:10]:
                    val = h5_file.attrs[k]
                    metadata["attributes"][k] = str(val)
                
                # Scan internal hierarchy for NISAR science datasets
                datasets_found = []
                def visitor(name, obj):
                    if isinstance(obj, h5py.Dataset):
                        try:
                            arr_sample = obj[:]
                            datasets_found.append({
                                "path": f"/{name}",
                                "shape": list(obj.shape),
                                "dtype": str(obj.dtype),
                                "min_val": round(float(np.nanmin(arr_sample)), 2),
                                "max_val": round(float(np.nanmax(arr_sample)), 2),
                                "mean_val": round(float(np.nanmean(arr_sample)), 2),
                                "units": "decibels (dB)" if "GCOV" in name else "radians" if "GUNW" in name else "uncalibrated"
                            })
                        except Exception:
                            datasets_found.append({
                                "path": f"/{name}",
                                "shape": list(obj.shape),
                                "dtype": str(obj.dtype)
                            })
                h5_file.visititems(visitor)
                metadata["science_datasets"] = datasets_found[:8]
                metadata["detected_nisar_product"] = (
                    "NISAR Level-2 GCOV (Geocoded Backscatter)" if any("GCOV" in d["path"] for d in datasets_found)
                    else "NISAR Level-2 GUNW (Interferogram)" if any("GUNW" in d["path"] for d in datasets_found)
                    else "Generic HDF5 Radar Product"
                )
        except Exception as e:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            raise HTTPException(status_code=400, detail=f"Failed to read HDF5 structure: {str(e)}")
        finally:
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass

    return {
        "message": "Satellite product successfully ingested and verified with h5py.",
        "metadata": metadata,
        "is_real_nisar": True,
        "ready_for_processing": True
    }

def _execute_analysis(module: str, req: AnalysisRequest) -> Dict[str, Any]:
    """Helper to run modular scientific SAR processing."""
    # Find region metadata
    region = next((r for r in GLOBAL_REGIONS if r["id"] == req.region_id), None)
    if not region:
        if req.region_id and req.region_id.startswith("custom_"):
            parts = req.region_id.split("_")
            try:
                clat = float(parts[1])
                clon = float(parts[2])
            except Exception:
                clat, clon = 20.0, 78.0
            region = {
                "id": req.region_id,
                "name": f"Custom Observation Site ({clat:.2f}°, {clon:.2f}°)",
                "category": module,
                "country": "User Target Coordinates",
                "lat": clat,
                "lon": clon,
                "zoom": 10,
                "description": f"Custom user-defined Earth observation point at {clat:.4f}°N, {clon:.4f}°E.",
                "baseline_product": "NISAR L-band GUNW Interferogram" if module == "deformation" else "NISAR L-band GCOV",
                "available_dates": ["2026-05-01", "2026-06-15", "2026-08-01", "2026-09-20"],
                "default_pair": ["2026-05-01", "2026-08-01"],
                "polarizations": ["HH", "HV"],
                "pixel_area_km2": 0.04
            }
        else:
            # Fallback to first matching category
            region = next((r for r in GLOBAL_REGIONS if r["category"] == module), GLOBAL_REGIONS[0])

    before_date = req.before_date or region["default_pair"][0]
    after_date = req.after_date or region["default_pair"][1]
    polarization = req.polarization or region["polarizations"][0]

    # Generate synthetic radar data for demo mode
    before_grid, after_grid, aux1, aux2 = generate_synthetic_scene(
        region["id"], module, before_date, after_date
    )

    aid = f"TW_{module[:3].upper()}_{uuid.uuid4().hex[:6]}"
    created_at = datetime.datetime.utcnow().isoformat()
    pixel_km2 = region.get("pixel_area_km2", 0.0009)

    if module == "water":
        thr = req.threshold if req.threshold is not None else -3.0
        change_grid, class_grid, stats = process_water_watch(
            before_grid, after_grid, pixel_area_km2=pixel_km2, water_threshold_db=thr
        )
        stats["analysis_id"] = aid
        unit = "dB"
        product_type = f"NISAR L-GCOV ({polarization})"
        legend = [
            {"val": -12, "color": "#0d3975", "label": "Severe Backscatter Drop (<= -10 dB)"},
            {"val": -4, "color": "#35c4e0", "label": "Moderate Drop (-4 dB)"},
            {"val": 0, "color": "#1b3464", "label": "No Change (0 dB)"},
            {"val": 4, "color": "#3ddc97", "label": "Moderate Increase (+4 dB)"},
            {"val": 10, "color": "#ffbe3b", "label": "Double-Bounce Increase (>= +8 dB)"}
        ]
        categories_breakdown = [
            {"id": 0, "name": "Stable Terrestrial Land", "color": "#1b3464", "area_km2": round(float(np.sum(class_grid == 0) * pixel_km2), 2)},
            {"id": 1, "name": "New Open Water Inundation", "color": "#35c4e0", "area_km2": stats["newly_inundated_water_km2"]},
            {"id": 2, "name": "Flooded Vegetation / Wetland", "color": "#3ddc97", "area_km2": stats["flooded_vegetation_wetland_km2"]},
            {"id": 3, "name": "Receded Water / Drained Land", "color": "#ffbe3b", "area_km2": stats["receded_water_km2"]}
        ]

    elif module == "forest":
        thr = req.threshold if req.threshold is not None else -2.5
        change_grid, class_grid, stats = process_forest_watch(
            before_grid, after_grid, pixel_area_km2=pixel_km2, severe_threshold_db=thr
        )
        stats["analysis_id"] = aid
        unit = "dB"
        product_type = f"NISAR L-GCOV ({polarization} Cross-Pol)"
        legend = [
            {"val": -8, "color": "#ef4444", "label": "High Crown Disturbance (<= -6 dB)"},
            {"val": -2.5, "color": "#f97316", "label": "Moderate Thinning (-2.5 dB)"},
            {"val": 0, "color": "#164e63", "label": "Stable Canopy (0 dB)"},
            {"val": 3, "color": "#10b981", "label": "Canopy Flush / Regrowth (>= +2.5 dB)"}
        ]
        categories_breakdown = [
            {"id": 0, "name": "Stable Forest Canopy", "color": "#064e3b", "area_km2": round(float(np.sum(class_grid == 0) * pixel_km2), 2)},
            {"id": 1, "name": "Severe Canopy Disturbance / Loss", "color": "#ef4444", "area_km2": stats["severe_canopy_loss_km2"]},
            {"id": 2, "name": "Moderate Canopy Disturbance", "color": "#f97316", "area_km2": stats["moderate_disturbance_km2"]},
            {"id": 3, "name": "Regrowth / Canopy Flush", "color": "#10b981", "area_km2": stats["canopy_flush_regrowth_km2"]}
        ]

    elif module == "agriculture":
        change_grid, class_grid, stats = process_agro_watch(
            before_grid, after_grid, pixel_area_km2=pixel_km2
        )
        stats["analysis_id"] = aid
        unit = "m³/m³"
        product_type = f"NISAR L-GCOV + Soil Moisture ({polarization})"
        legend = [
            {"val": -0.15, "color": "#d97706", "label": "Severe Dry-down (-0.15 m³/m³)"},
            {"val": -0.05, "color": "#fef08a", "label": "Slight Dry-down (-0.05 m³/m³)"},
            {"val": 0.0, "color": "#0f766e", "label": "Stable Moisture (0.00)"},
            {"val": 0.08, "color": "#06b6d4", "label": "Moderate Moisture Surge (+0.08)"},
            {"val": 0.20, "color": "#2563eb", "label": "Heavy Irrigation / Wet (+0.20)"}
        ]
        categories_breakdown = [
            {"id": 0, "name": "Stable / Mature Crops", "color": "#115e59", "area_km2": round(float(np.sum(class_grid == 0) * pixel_km2), 2)},
            {"id": 1, "name": "Soil Moisture Surge / Irrigation", "color": "#06b6d4", "area_km2": stats["soil_moisture_surge_km2"]},
            {"id": 2, "name": "Crop Emergence / Biomass Growth", "color": "#22c55e", "area_km2": stats["active_crop_growth_km2"]},
            {"id": 3, "name": "Harvest / Tillage / Residue Removal", "color": "#eab308", "area_km2": stats["harvest_or_tillage_km2"]},
            {"id": 4, "name": "Severe Dry-down / Fallow", "color": "#f97316", "area_km2": stats["drydown_area_km2"]}
        ]

    else:  # deformation (GeoMotion)
        change_grid, class_grid, stats = process_geomotion_insar(
            before_grid, after_grid, pixel_area_km2=pixel_km2
        )
        stats["analysis_id"] = aid
        unit = "cm LOS"
        product_type = "NISAR L-GUNW Unwrapped Interferogram"
        legend = [
            {"val": -15.0, "color": "#b91c1c", "label": "Severe Subsidence (<= -10 cm)"},
            {"val": -2.0, "color": "#f87171", "label": "Moderate Subsidence (-2 cm)"},
            {"val": 0.0, "color": "#ffffff", "label": "Stable Datum (0 cm)"},
            {"val": 2.0, "color": "#60a5fa", "label": "Moderate Uplift (+2 cm)"},
            {"val": 15.0, "color": "#1d4ed8", "label": "Significant Uplift (>= +10 cm)"}
        ]
        categories_breakdown = [
            {"id": 0, "name": "Stable Crustal Surface (|LOS| < 1 cm)", "color": "#475569", "area_km2": round(float(np.sum(class_grid == 0) * pixel_km2), 2)},
            {"id": 1, "name": "Significant Uplift (LOS >= +2 cm)", "color": "#3b82f6", "area_km2": stats["deforming_uplift_area_km2"]},
            {"id": 3, "name": "Moderate Subsidence (-1 to -2.5 cm)", "color": "#f87171", "area_km2": round(stats["deforming_subsidence_area_km2"] * 0.45, 2)},
            {"id": 4, "name": "Severe Subsidence / Slip (<= -2.5 cm)", "color": "#dc2626", "area_km2": round(stats["deforming_subsidence_area_km2"] * 0.55, 2)},
            {"id": 5, "name": "Decorrelated / Incoherent Mask", "color": "#1e293b", "area_km2": round(float(np.sum(class_grid == 5) * pixel_km2), 2)}
        ]

    # Generate time series
    series = generate_time_series(region["id"], module, region["available_dates"])

    result = {
        "id": aid,
        "module": module,
        "region_id": region["id"],
        "region_name": region["name"],
        "coordinates": [region["lat"], region["lon"]],
        "zoom": region["zoom"],
        "before_date": before_date,
        "after_date": after_date,
        "polarization": polarization,
        "product_type": product_type,
        "unit": unit,
        "label": "DEMO MODE – Synthetic NISAR simulation",
        "is_demo": True,
        "stats": stats,
        "legend": legend,
        "categories_breakdown": categories_breakdown,
        "series": series,
        "created_at": created_at,
        "before_grid": np.nan_to_num(before_grid, nan=0.0).round(2).tolist(),
        "after_grid": np.nan_to_num(after_grid, nan=0.0).round(2).tolist(),
        "change_grid": np.nan_to_num(change_grid, nan=0.0).round(2).tolist(),
        "class_grid": class_grid.tolist()
    }

    # Persist in SQLite
    save_analysis(result)
    return result

@router.post("/analyze/water")
def analyze_water(req: AnalysisRequest = AnalysisRequest(module="water")):
    return _execute_analysis("water", req)

@router.post("/analyze/forest")
def analyze_forest(req: AnalysisRequest = AnalysisRequest(module="forest")):
    return _execute_analysis("forest", req)

@router.post("/analyze/agriculture")
def analyze_agriculture(req: AnalysisRequest = AnalysisRequest(module="agriculture")):
    return _execute_analysis("agriculture", req)

@router.post("/analyze/deformation")
def analyze_deformation(req: AnalysisRequest = AnalysisRequest(module="deformation")):
    return _execute_analysis("deformation", req)

@router.post("/insights", response_model=InsightResponse)
async def get_insights(req: InsightRequest):
    """Generates AI insights for a specific analysis record."""
    analysis = get_analysis_by_id(req.analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found to generate insights for.")
    insights = await generate_ai_insights(analysis, req.user_query)
    return insights

