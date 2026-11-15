from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class AnalysisRequest(BaseModel):
    region_id: str = "water_kerala"
    module: str = "water"  # "water", "forest", "agriculture", "deformation"
    before_date: Optional[str] = None
    after_date: Optional[str] = None
    polarization: str = "HH"  # "HH", "HV", "VV", "VH", "HH+HV"
    threshold: Optional[float] = None
    mode: str = "demo"  # "demo" or "real"

class InsightRequest(BaseModel):
    analysis_id: str
    user_query: Optional[str] = None

class InsightResponse(BaseModel):
    analysis_id: str
    module: str
    region_name: str
    headline: str
    summary: str
    physical_drivers: List[str]
    environmental_implications: List[str]
    recommended_verification: List[str]
    scientific_disclaimer: str
    source: str  # "gemini-1.5-flash" or "terrawatch-science-synthesis-engine"

class Region(BaseModel):
    id: str
    name: str
    category: str
    country: str
    lat: float
    lon: float
    zoom: int
    description: str
    baseline_product: str
    available_dates: List[str]
    default_pair: List[str]
    polarizations: List[str]

class Observation(BaseModel):
    id: str
    region_id: str
    region_name: str
    date: str
    product: str
    polarization: str
    orbit_pass: str  # "Ascending" or "Descending"
    coverage_km2: float
    status: str
    download_url: Optional[str] = None

class AnalysisRecord(BaseModel):
    id: str
    module: str
    region_id: str
    region_name: str
    coordinates: List[float]
    before_date: str
    after_date: str
    polarization: str
    product_type: str
    unit: str
    label: str
    is_demo: bool
    stats: Dict[str, Any]
    legend: List[Dict[str, Any]]
    series: List[Dict[str, Any]]
    categories_breakdown: List[Dict[str, Any]]
    created_at: str
    # 2D raster matrices for visualization
    before_grid: Optional[List[List[float]]] = None
    after_grid: Optional[List[List[float]]] = None
    change_grid: Optional[List[List[float]]] = None
    class_grid: Optional[List[List[int]]] = None

