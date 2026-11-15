"""
TerraWatch - Scientific SAR Processing Pipeline
Implements rigorous radar remote sensing algorithms for NISAR GCOV and GUNW products.
"""
import numpy as np
from typing import Dict, Any, Tuple

# NISAR Physical Constants
NISAR_L_BAND_WAVELENGTH_M = 0.2384   # 23.84 cm (L-band center freq ~ 1.257 GHz)
NISAR_S_BAND_WAVELENGTH_M = 0.0937   # 9.37 cm (S-band center freq ~ 3.2 GHz)

def linear_to_db(linear_array: np.ndarray) -> np.ndarray:
    """Converts radar intensity/power to decibels (dB)."""
    return 10.0 * np.log10(np.clip(linear_array, 1e-7, None))

def db_to_linear(db_array: np.ndarray) -> np.ndarray:
    """Converts decibels back to linear power."""
    return 10.0 ** (db_array / 10.0)

def process_water_watch(
    before_sar_db: np.ndarray,
    after_sar_db: np.ndarray,
    pixel_area_km2: float = 0.0009,  # 30m x 30m = 900 m2 = 0.0009 km2
    water_threshold_db: float = -3.0,
    double_bounce_threshold_db: float = 2.5
) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    WaterWatch Inundation and Wetland Change Processor.
    
    Principles:
    - Specular reflection on open water leads to forward scatter and sharp backscatter drop (<= -3.0 dB).
    - Flooded vegetation exhibits double-bounce scattering (water surface + vertical vegetation),
      causing a distinctive increase in backscatter (>= +2.5 dB).
    - Receded water exhibits backscatter recovery.
    """
    valid = np.isfinite(before_sar_db) & np.isfinite(after_sar_db)
    delta_db = np.where(valid, after_sar_db - before_sar_db, np.nan)
    
    # Classification:
    # 0 = Stable Land / No significant change
    # 1 = Open Water Inundation (sharp backscatter drop)
    # 2 = Flooded Vegetation / Wetland expansion (double bounce increase)
    # 3 = Receded Water / Drainage (backscatter rise from prior water)
    class_map = np.zeros_like(delta_db, dtype=np.int32)
    
    open_water_mask = valid & (delta_db <= water_threshold_db) & (after_sar_db < -14.0)
    flooded_veg_mask = valid & (delta_db >= double_bounce_threshold_db) & (before_sar_db > -18.0)
    receded_water_mask = valid & (delta_db >= 3.0) & (before_sar_db < -14.0)
    
    class_map[open_water_mask] = 1
    class_map[flooded_veg_mask] = 2
    class_map[receded_water_mask] = 3
    
    new_inundation_km2 = float(np.sum(open_water_mask) * pixel_area_km2)
    flooded_veg_km2 = float(np.sum(flooded_veg_mask) * pixel_area_km2)
    receded_km2 = float(np.sum(receded_water_mask) * pixel_area_km2)
    total_impacted_km2 = new_inundation_km2 + flooded_veg_km2 + receded_km2
    
    stats = {
        "newly_inundated_water_km2": round(new_inundation_km2, 2),
        "flooded_vegetation_wetland_km2": round(flooded_veg_km2, 2),
        "receded_water_km2": round(receded_km2, 2),
        "total_water_impacted_km2": round(total_impacted_km2, 2),
        "mean_backscatter_change_db": round(float(np.nanmean(delta_db)), 2),
        "min_backscatter_change_db": round(float(np.nanmin(delta_db)), 2),
        "max_backscatter_change_db": round(float(np.nanmax(delta_db)), 2),
        "valid_pixel_coverage_pct": round(float(np.mean(valid) * 100), 1),
        "threshold_used_db": water_threshold_db,
    }
    
    return delta_db, class_map, stats

def process_forest_watch(
    before_sar_hv_db: np.ndarray,
    after_sar_hv_db: np.ndarray,
    pixel_area_km2: float = 0.0009,
    severe_threshold_db: float = -2.5,
    moderate_threshold_db: float = -1.5
) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    ForestWatch Canopy Disturbance and Fire Scar Processor.
    
    Principles:
    - Cross-polarization (HV) at L-band is governed by volume scattering within the 3D crown.
    - Biomass removal or wildfire foliage destruction removes volume scatterers, causing significant backscatter drop.
    - Note: Backscatter drops alone do not prove permanent deforestation without temporal validation.
    """
    valid = np.isfinite(before_sar_hv_db) & np.isfinite(after_sar_hv_db)
    delta_db = np.where(valid, after_sar_hv_db - before_sar_hv_db, np.nan)
    
    # 0 = Stable Forest Canopy
    # 1 = Severe Canopy Loss / High Disturbance (< severe_threshold_db)
    # 2 = Moderate Canopy Disturbance / Thinning (-1.5 to -2.5 dB)
    # 3 = Canopy Flush / Regrowth / Moisture Increase (>= +1.8 dB)
    class_map = np.zeros_like(delta_db, dtype=np.int32)
    
    severe_mask = valid & (delta_db <= severe_threshold_db)
    moderate_mask = valid & (delta_db > severe_threshold_db) & (delta_db <= moderate_threshold_db)
    regrowth_mask = valid & (delta_db >= 1.8)
    
    class_map[severe_mask] = 1
    class_map[moderate_mask] = 2
    class_map[regrowth_mask] = 3
    
    severe_km2 = float(np.sum(severe_mask) * pixel_area_km2)
    moderate_km2 = float(np.sum(moderate_mask) * pixel_area_km2)
    regrowth_km2 = float(np.sum(regrowth_mask) * pixel_area_km2)
    total_disturbed_km2 = severe_km2 + moderate_km2
    
    stats = {
        "severe_canopy_loss_km2": round(severe_km2, 2),
        "moderate_disturbance_km2": round(moderate_km2, 2),
        "canopy_flush_regrowth_km2": round(regrowth_km2, 2),
        "total_disturbed_forest_km2": round(total_disturbed_km2, 2),
        "mean_disturbance_anomaly_db": round(float(np.nanmean(delta_db)), 2),
        "valid_pixel_coverage_pct": round(float(np.mean(valid) * 100), 1),
        "severe_threshold_db": severe_threshold_db,
    }
    
    return delta_db, class_map, stats

def process_agro_watch(
    before_hh_db: np.ndarray,
    after_hh_db: np.ndarray,
    pixel_area_km2: float = 0.0009,
    baseline_sm_m3m3: float = 0.22
) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    AgroWatch Cropland Dynamics and Soil Moisture Variation Processor.
    
    Principles:
    - L-band penetrates thin crop vegetation into top 5 cm soil.
    - Sensitivity d(sigma0_HH)/d(SM) ~ 20-25 dB / (m3/m3) -> 1 dB ~ 0.045 m3/m3 delta soil moisture.
    - Distinguishes direct backscatter measurement (dB) from derived soil moisture estimates (m3/m3).
    """
    valid = np.isfinite(before_hh_db) & np.isfinite(after_hh_db)
    delta_db = np.where(valid, after_hh_db - before_hh_db, np.nan)
    
    # Derived volumetric soil moisture change (m3/m3)
    sm_sensitivity = 0.045  # m3/m3 per dB
    delta_sm = np.where(valid, delta_db * sm_sensitivity, np.nan)
    after_sm = np.clip(baseline_sm_m3m3 + delta_sm, 0.04, 0.48)
    
    # 0 = Normal Vegetative Stage / Stable
    # 1 = Soil Moisture Surge / Heavy Irrigation Event (delta_sm >= +0.06)
    # 2 = Emergence / Canopy Growth (delta_db >= +2.0 dB)
    # 3 = Harvest / Residue Removal / Tillage (delta_db <= -2.2 dB)
    # 4 = Severe Soil Dry-down (delta_sm <= -0.06)
    class_map = np.zeros_like(delta_db, dtype=np.int32)
    
    moist_mask = valid & (delta_sm >= 0.06)
    emergence_mask = valid & (delta_db >= 2.0) & (~moist_mask)
    harvest_mask = valid & (delta_db <= -2.2)
    dry_mask = valid & (delta_sm <= -0.06) & (~harvest_mask)
    
    class_map[moist_mask] = 1
    class_map[emergence_mask] = 2
    class_map[harvest_mask] = 3
    class_map[dry_mask] = 4
    
    moisture_surge_km2 = float(np.sum(moist_mask) * pixel_area_km2)
    crop_growth_km2 = float(np.sum(emergence_mask) * pixel_area_km2)
    harvest_tillage_km2 = float(np.sum(harvest_mask) * pixel_area_km2)
    drydown_km2 = float(np.sum(dry_mask) * pixel_area_km2)
    
    stats = {
        "mean_soil_moisture_m3m3": round(float(np.nanmean(after_sm)), 3),
        "mean_sm_change_m3m3": round(float(np.nanmean(delta_sm)), 3),
        "soil_moisture_surge_km2": round(moisture_surge_km2, 2),
        "active_crop_growth_km2": round(crop_growth_km2, 2),
        "harvest_or_tillage_km2": round(harvest_tillage_km2, 2),
        "drydown_area_km2": round(drydown_km2, 2),
        "mean_backscatter_change_db": round(float(np.nanmean(delta_db)), 2),
        "valid_pixel_coverage_pct": round(float(np.mean(valid) * 100), 1),
    }
    
    return delta_sm, class_map, stats

def process_geomotion_insar(
    unwrapped_phase_rad: np.ndarray,
    coherence: np.ndarray,
    wavelength_m: float = NISAR_L_BAND_WAVELENGTH_M,
    min_coherence: float = 0.35,
    pixel_area_km2: float = 0.0009
) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    GeoMotion InSAR Line-Of-Sight (LOS) Ground Deformation Processor.
    
    Principles:
    - Uses NISAR GUNW geocoded unwrapped interferograms.
    - Displacement along satellite Line-Of-Sight (LOS):
      d_LOS = - (lambda / (4 * pi)) * unwrapped_phase
    - Coherence mask filters decorrelated vegetated/water areas.
    - Does NOT use backscatter subtraction for mm/cm-scale displacement!
    """
    valid = np.isfinite(unwrapped_phase_rad) & (coherence >= min_coherence)
    
    # Displacement in centimeters
    # Negative LOS = moving away from satellite (subsidence / down-dip slip)
    # Positive LOS = moving towards satellite (uplift / up-dip slip)
    los_disp_m = -(wavelength_m / (4.0 * np.pi)) * unwrapped_phase_rad
    los_disp_cm = np.where(valid, los_disp_m * 100.0, np.nan)
    
    # 0 = Negligible / Stable (|LOS| < 1.0 cm)
    # 1 = Significant Uplift (LOS >= +2.0 cm)
    # 2 = Moderate Uplift (+1.0 to +2.0 cm)
    # 3 = Moderate Subsidence (-1.0 to -2.5 cm)
    # 4 = Severe Subsidence / Fault Slip (LOS <= -2.5 cm)
    # 5 = Decorrelated / Low Coherence
    class_map = np.zeros_like(los_disp_cm, dtype=np.int32)
    
    sig_uplift = valid & (los_disp_cm >= 2.0)
    mod_uplift = valid & (los_disp_cm >= 1.0) & (los_disp_cm < 2.0)
    mod_subsidence = valid & (los_disp_cm <= -1.0) & (los_disp_cm > -2.5)
    sev_subsidence = valid & (los_disp_cm <= -2.5)
    decorrelated = ~valid
    
    class_map[sig_uplift] = 1
    class_map[mod_uplift] = 2
    class_map[mod_subsidence] = 3
    class_map[sev_subsidence] = 4
    class_map[decorrelated] = 5
    
    max_uplift_cm = float(np.nanmax(los_disp_cm)) if np.any(valid) else 0.0
    max_subsidence_cm = float(np.nanmin(los_disp_cm)) if np.any(valid) else 0.0
    mean_disp_cm = float(np.nanmean(los_disp_cm)) if np.any(valid) else 0.0
    
    uplift_km2 = float(np.sum(sig_uplift | mod_uplift) * pixel_area_km2)
    subsidence_km2 = float(np.sum(mod_subsidence | sev_subsidence) * pixel_area_km2)
    
    stats = {
        "max_los_uplift_cm": round(max_uplift_cm, 2),
        "max_los_subsidence_cm": round(max_subsidence_cm, 2),
        "mean_los_displacement_cm": round(mean_disp_cm, 2),
        "deforming_subsidence_area_km2": round(subsidence_km2, 2),
        "deforming_uplift_area_km2": round(uplift_km2, 2),
        "mean_interferometric_coherence": round(float(np.nanmean(coherence)), 3),
        "coherent_valid_fraction_pct": round(float(np.mean(valid) * 100), 1),
        "radar_wavelength_cm": round(wavelength_m * 100.0, 2),
        "phase_to_cm_factor": round((wavelength_m / (4.0 * np.pi)) * 100.0, 3),
    }
    
    return los_disp_cm, class_map, stats

