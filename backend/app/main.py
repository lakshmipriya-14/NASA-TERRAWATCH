"""
TerraWatch - Earth Surface Change Intelligence Platform
Backend Application Entry Point
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from .services.database import init_db, seed_default_data_if_needed, list_recent_analyses
from .routes.api import router as api_router, _execute_analysis
from .models.schemas import AnalysisRequest

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup sequence
    init_db()
    seed_default_data_if_needed()
    
    # Pre-seed starter analyses if none exist
    recent = list_recent_analyses(limit=1)
    if len(recent) == 0:
        try:
            _execute_analysis("water", AnalysisRequest(region_id="water_kerala", module="water"))
            _execute_analysis("forest", AnalysisRequest(region_id="forest_amazon", module="forest"))
            _execute_analysis("agriculture", AnalysisRequest(region_id="agro_punjab", module="agriculture"))
            _execute_analysis("deformation", AnalysisRequest(region_id="geo_turkey", module="deformation"))
        except Exception as e:
            print(f"Warning: Initial analysis pre-seed encountered: {e}")
    yield

app = FastAPI(
    title="TerraWatch – NISAR Earth Surface Intelligence API",
    description="Backend microservices for analyzing NISAR satellite radar observations (GCOV backscatter & GUNW interferometry).",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "platform": "TerraWatch",
        "description": "NISAR-Powered Earth Surface Change Intelligence Platform",
        "status": "active",
        "api_docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
