"""
TerraWatch - Database Persistence Layer (SQLite)
Manages storage and retrieval of radar observations, analyses, uploaded products, and metadata.
"""
import sqlite3
import json
import os
import datetime
from typing import List, Dict, Any, Optional
from ..services.demo_data import GLOBAL_REGIONS, get_demo_observations

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "terrawatch.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id TEXT PRIMARY KEY,
                module TEXT NOT NULL,
                region_id TEXT NOT NULL,
                region_name TEXT NOT NULL,
                before_date TEXT NOT NULL,
                after_date TEXT NOT NULL,
                product_type TEXT NOT NULL,
                unit TEXT NOT NULL,
                label TEXT NOT NULL,
                is_demo INTEGER NOT NULL,
                stats_json TEXT NOT NULL,
                body_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS observations (
                id TEXT PRIMARY KEY,
                region_id TEXT NOT NULL,
                region_name TEXT NOT NULL,
                category TEXT NOT NULL,
                date TEXT NOT NULL,
                product TEXT NOT NULL,
                polarization TEXT NOT NULL,
                orbit_pass TEXT NOT NULL,
                coverage_km2 REAL NOT NULL,
                status TEXT NOT NULL,
                download_url TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS uploads (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                file_type TEXT NOT NULL,
                size_bytes INTEGER NOT NULL,
                metadata_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
    conn.close()

def seed_default_data_if_needed():
    """Populates default observations if table is empty."""
    conn = get_connection()
    count = conn.execute("SELECT COUNT(*) FROM observations").fetchone()[0]
    if count == 0:
        demo_obs = get_demo_observations()
        with conn:
            for obs in demo_obs:
                conn.execute("""
                    INSERT OR REPLACE INTO observations 
                    (id, region_id, region_name, category, date, product, polarization, orbit_pass, coverage_km2, status, download_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    obs["id"], obs["region_id"], obs["region_name"], obs["category"],
                    obs["date"], obs["product"], obs["polarization"], obs["orbit_pass"],
                    obs["coverage_km2"], obs["status"], obs.get("download_url")
                ))
    conn.close()

def save_analysis(analysis_dict: Dict[str, Any]) -> str:
    conn = get_connection()
    created_at = datetime.datetime.utcnow().isoformat()
    with conn:
        conn.execute("""
            INSERT OR REPLACE INTO analyses 
            (id, module, region_id, region_name, before_date, after_date, product_type, unit, label, is_demo, stats_json, body_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            analysis_dict["id"],
            analysis_dict["module"],
            analysis_dict["region_id"],
            analysis_dict["region_name"],
            analysis_dict["before_date"],
            analysis_dict["after_date"],
            analysis_dict["product_type"],
            analysis_dict["unit"],
            analysis_dict["label"],
            1 if analysis_dict.get("is_demo", True) else 0,
            json.dumps(analysis_dict.get("stats", {})),
            json.dumps(analysis_dict),
            created_at
        ))
    conn.close()
    return analysis_dict["id"]

def get_analysis_by_id(aid: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    row = conn.execute("SELECT body_json FROM analyses WHERE id=?", (aid,)).fetchone()
    conn.close()
    if not row:
        return None
    return json.loads(row["body_json"])

def list_recent_analyses(limit: int = 10) -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("""
        SELECT id, module, region_id, region_name, before_date, after_date, product_type, unit, label, is_demo, stats_json, created_at
        FROM analyses ORDER BY created_at DESC LIMIT ?
    """, (limit,)).fetchall()
    conn.close()
    
    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "module": r["module"],
            "region_id": r["region_id"],
            "region_name": r["region_name"],
            "before_date": r["before_date"],
            "after_date": r["after_date"],
            "product_type": r["product_type"],
            "unit": r["unit"],
            "label": r["label"],
            "is_demo": bool(r["is_demo"]),
            "stats": json.loads(r["stats_json"]),
            "created_at": r["created_at"]
        })
    return results

def get_all_observations() -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("SELECT * FROM observations ORDER BY date DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_platform_stats() -> Dict[str, Any]:
    conn = get_connection()
    regions_count = len(GLOBAL_REGIONS)
    obs_count = conn.execute("SELECT COUNT(*) FROM observations").fetchone()[0]
    analyses_count = conn.execute("SELECT COUNT(*) FROM analyses").fetchone()[0]
    total_area = conn.execute("SELECT SUM(coverage_km2) FROM observations").fetchone()[0] or 0.0
    conn.close()
    
    return {
        "monitored_regions": regions_count,
        "satellite_observations": obs_count,
        "completed_analyses": analyses_count,
        "total_analyzed_area_km2": round(float(total_area), 1),
        "active_modules": 4,
        "is_demo_mode": True,
        "primary_missions": ["NASA-ISRO NISAR", "L-Band SAR (24cm)", "S-Band SAR (9cm)"]
    }

