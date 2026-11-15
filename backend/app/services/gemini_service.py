"""
TerraWatch - Simple AI Insights Service (Gemini API & Easy-to-Understand Fallback Engine)
Explains satellite radar analysis in everyday language so anyone can understand the results.
Zero jargon required.
"""
import os
import json
import logging
from typing import Dict, Any, List
import httpx
from ..models.schemas import InsightResponse

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are TerraWatch AI, an Earth observation assistant that explains satellite radar results in simple, easy-to-understand language.
You help everyday users, students, farmers, and researchers understand what changed on Earth's surface without needing technical radar jargon.

Rules:
1. Use SIMPLE, PLAIN ENGLISH. Avoid complex radar equations or intimidating acronyms.
2. Only interpret the actual calculated numbers provided (areas in km², dates, region names).
3. Frame potential causes as possible explanations / hypotheses that need ground verification.
4. If the user asks a specific question, answer it directly in simple terms.
5. Return JSON with:
   - headline: A single, friendly summary sentence.
   - summary: 2-3 clear sentences explaining what the satellite saw in plain words.
   - physical_drivers: 3 simple reasons why this change might have happened.
   - environmental_implications: 3 everyday impacts (on farming, safety, drinking water, or wildlife).
   - recommended_verification: 3 easy next steps (check rainfall reports, look at photos, inspect locally).
   - scientific_disclaimer: A friendly note that satellite views are indicators that should be verified on the ground.
"""

def generate_insights_fallback(
    module: str,
    region_name: str,
    before_date: str,
    after_date: str,
    product_type: str,
    stats: Dict[str, Any],
    polarization: str,
    user_query: str = None,
    is_demo: bool = True
) -> InsightResponse:
    """
    Generates clear, simple-English explanations from actual calculated numbers.
    """
    # Check if user asked a specific quick question
    q = (user_query or "").lower().strip()

    if module == "water":
        inundated = stats.get("newly_inundated_water_km2", 0.0)
        flooded_veg = stats.get("flooded_vegetation_wetland_km2", 0.0)
        receded = stats.get("receded_water_km2", 0.0)
        total = stats.get("total_water_impacted_km2", 0.0)

        headline = f"The satellite detected about {total} km² of water surface changes in {region_name}."
        
        if "what changed" in q:
            summary = f"Between {before_date} and {after_date}, water coverage expanded. The satellite spotted {inundated} km² of newly covered water areas (like ponds or flooded land) and {flooded_veg} km² where water rose beneath trees and grasses."
        elif "why" in q:
            summary = f"This increase in water spread likely occurred due to recent heavy rainfall, upstream river overflow, or seasonal monsoon drainage into low-lying areas across {region_name}."
        elif "attention" in q or "which areas" in q:
            summary = f"Low-lying riverbanks, agricultural floodplains, and wetland borders across {region_name} show the largest increase in water and should be checked for drainage or localized waterlogging."
        else:
            summary = (
                f"Satellite observations show a change in radar response across {region_name}. "
                f"About {inundated} km² shows signs of newly formed standing water, and {flooded_veg} km² shows water gathering under crops or vegetation between {before_date} and {after_date}."
            )

        physical_drivers = [
            "Heavy rainfall or storm surge that caused rivers and canals to spill into nearby fields.",
            "Seasonal filling of local lakes, wetlands, and agricultural irrigation ponds.",
            "Water gathering in low-lying depressions and slow-draining soils."
        ]
        environmental_implications = [
            f"Farms and low-lying roads near the river may be temporarily affected across {total} km².",
            "Replenished soil moisture and groundwater storage, benefiting surrounding vegetation.",
            "Possible temporary disruption for nearby communities if water levels remain high."
        ]
        recommended_verification = [
            "Check local weather station and rainfall totals for the days between both dates.",
            "Look at clear optical satellite photos or local river gauge water levels.",
            "Confirm field conditions on the ground with local agricultural or water management teams."
        ]
        disclaimer = "Satellite radar easily spots smooth water and flooded grass, but wind or waves can change the look. Local checks help confirm exact water boundaries."

    elif module == "forest":
        severe = stats.get("severe_canopy_loss_km2", 0.0)
        moderate = stats.get("moderate_disturbance_km2", 0.0)
        regrowth = stats.get("canopy_flush_regrowth_km2", 0.0)
        total = stats.get("total_disturbed_forest_km2", 0.0)

        headline = f"Satellite analysis identified about {total} km² of potential tree canopy changes in {region_name}."
        
        if "what changed" in q:
            summary = f"Between {before_date} and {after_date}, the satellite observed a reduction in leafy tree cover over {total} km², including {severe} km² of significant canopy loss and {moderate} km² of lighter thinning."
        elif "why" in q:
            summary = f"Possible causes include timber harvesting, storm or wind damage, dry-season leaf drop, or localized fire activity that reduced dense forest foliage."
        elif "attention" in q:
            summary = f"The {severe} km² area showing the strongest decrease in tree canopy deserves the closest review to see if clearing or fire occurred."
        else:
            summary = (
                f"Radar signals from {region_name} reveal that roughly {total} km² experienced a loss in dense branches and foliage. "
                f"Around {severe} km² shows significant canopy disturbance between {before_date} and {after_date}."
            )

        physical_drivers = [
            "Human activities such as tree cutting, road building, or agricultural clearing.",
            "Natural events like recent wildfire, wind damage from storms, or insect pests.",
            "Dry weather conditions causing leaves to drop and reducing forest moisture."
        ]
        environmental_implications = [
            f"Reduced shade and tree cover over {total} km², exposing soil to rainwater erosion.",
            "Temporary loss of natural habitat for birds and forest wildlife in affected patches.",
            "Changes in local carbon storage and microclimate temperature."
        ]
        recommended_verification = [
            "Check satellite fire alerts (NASA FIRMS) to see if heat or smoke was recorded.",
            "Examine regular optical satellite photos (Sentinel-2 or Landsat) to view actual tree colors.",
            "Consult with local forestry officers to verify permitted clearing or storm damage."
        ]
        disclaimer = "A drop in radar response shows that the canopy thinned out, but does not prove permanent deforestation without seeing the location in person."

    elif module == "agriculture":
        mean_sm = stats.get("mean_soil_moisture_m3m3", 0.22)
        moist_surge = stats.get("soil_moisture_surge_km2", 0.0)
        crop_growth = stats.get("active_crop_growth_km2", 0.0)
        harvest = stats.get("harvest_or_tillage_km2", 0.0)

        headline = f"Mapped farming field changes in {region_name}: average soil moisture is estimated at {int(mean_sm * 100)}%."
        
        if "what changed" in q:
            summary = f"Between {before_date} and {after_date}, {moist_surge} km² of farmland became noticeably wetter from irrigation or rain, {crop_growth} km² showed healthy crop growth, and {harvest} km² appeared to be harvested or plowed."
        elif "why" in q:
            summary = f"These field variations reflect normal farming cycles: canal or pump irrigation, growing seedlings, and farmers harvesting mature crops and tilling the soil."
        else:
            summary = (
                f"Satellite observations tracked soil and crop changes across {region_name}. "
                f"About {moist_surge} km² showed increased moisture from watering or rain, while {harvest} km² showed signs of harvest or tilling."
            )

        physical_drivers = [
            "Farmers turning on canal irrigation or tubewells across their plots.",
            "Crops growing taller and leafier, changing the radar reflection.",
            "Harvesting of mature grains and plowing fields for the next planting season."
        ]
        environmental_implications = [
            f"Helps identify which {moist_surge} km² of fields are receiving adequate irrigation water.",
            "Plowed and bare soil can temporarily dry out faster in windy weather.",
            "Provides early information on crop health and seasonal food production."
        ]
        recommended_verification = [
            "Compare with local farm calendars to confirm current planting or harvest stages.",
            "Check with regional irrigation authorities regarding recent canal water releases.",
            "Verify ground moisture readings using simple soil probe tests."
        ]
        disclaimer = "Soil moisture values are estimates calculated from radar reflection. Field roughness and plant height can influence readings."

    else:  # deformation (Land Movement)
        max_uplift = stats.get("max_los_uplift_cm", 0.0)
        max_sub = stats.get("max_los_subsidence_cm", 0.0)
        sub_km2 = stats.get("deforming_subsidence_area_km2", 0.0)

        headline = f"The satellite measured subtle ground movement in {region_name}, from {max_sub} cm sinking to +{max_uplift} cm rising."
        
        if "what changed" in q:
            summary = f"Between {before_date} and {after_date}, the satellite detected ground movement across {sub_km2} km². In some zones the surface settled downwards by up to {abs(max_sub)} cm, while other zones shifted slightly upward."
        elif "why" in q:
            summary = f"Ground shifts are commonly caused by natural earthquake fault motion, deep underground settling, or heavy groundwater pumping that causes soil layers to compress."
        else:
            summary = (
                f"Using satellite radar phase measurements, we observed subtle changes in ground elevation across {region_name}. "
                f"An estimated {sub_km2} km² experienced downward settling or tectonic displacement."
            )

        physical_drivers = [
            "Natural tectonic stress along underground geological fault lines.",
            "Heavy pumping of underground water, causing soft clay layers to slowly compact.",
            "Slope movement, landslides, or soil settling after intense rainfall."
        ]
        environmental_implications = [
            f"Slow sinking over {sub_km2} km² can cause cracks in buildings, bridges, and buried water pipes.",
            "Changes in ground slopes can alter the natural flow of rainwater and storm drainage.",
            "Mountain slopes with movement require monitoring to protect nearby roadways."
        ]
        recommended_verification = [
            "Compare with continuous GPS/GNSS sensor stations on the ground.",
            "Check earthquake records from geological survey monitoring networks.",
            "Inspect buildings and infrastructure in the affected zone for physical settlement cracks."
        ]
        disclaimer = "Ground movement is measured along the satellite's line of sight. Weather moisture in the air can create small visual distortions that require multi-date checking."

    return InsightResponse(
        analysis_id=stats.get("analysis_id", "demo_analysis"),
        module=module,
        region_name=region_name,
        headline=headline,
        summary=summary,
        physical_drivers=physical_drivers,
        environmental_implications=environmental_implications,
        recommended_verification=recommended_verification,
        scientific_disclaimer=disclaimer,
        source="terrawatch-simple-insights-engine"
    )

async def generate_ai_insights(
    analysis_record: Dict[str, Any],
    user_query: str = None
) -> InsightResponse:
    """
    Calls Gemini API if available with instructions for simple language,
    or falls back to the clean, non-jargon internal explanation engine.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    module = analysis_record.get("module", "water")
    region_name = analysis_record.get("region_name", "Study Region")
    before_date = analysis_record.get("before_date", "2026-01-01")
    after_date = analysis_record.get("after_date", "2026-02-01")
    product_type = analysis_record.get("product_type", "NISAR GCOV")
    stats = analysis_record.get("stats", {})
    polarization = analysis_record.get("polarization", "HH")
    is_demo = analysis_record.get("is_demo", True)

    if not api_key:
        return generate_insights_fallback(
            module, region_name, before_date, after_date, product_type, stats, polarization, user_query, is_demo
        )

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        user_prompt_content = f"""
Location: {region_name}
Investigation Type: {module.upper()}
Dates: {before_date} to {after_date}
Calculated Numbers: {json.dumps(stats)}
User Question: {user_query or "Explain what changed in simple words for an everyday user."}

Remember: Use simple, plain English. No jargon. Be friendly, accurate, and easy to understand.
"""
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": SYSTEM_PROMPT},
                        {"text": user_prompt_content}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(raw_text)
                return InsightResponse(
                    analysis_id=analysis_record.get("id", "analysis"),
                    module=module,
                    region_name=region_name,
                    headline=parsed.get("headline", f"Surface changes in {region_name}"),
                    summary=parsed.get("summary", ""),
                    physical_drivers=parsed.get("physical_drivers", []),
                    environmental_implications=parsed.get("environmental_implications", []),
                    recommended_verification=parsed.get("recommended_verification", []),
                    scientific_disclaimer=parsed.get("scientific_disclaimer", "Verified from satellite radar observations."),
                    source="gemini-1.5-flash"
                )
    except Exception as exc:
        logger.warning(f"Gemini API request failed ({exc}). Using internal plain-English engine.")

    return generate_insights_fallback(
        module, region_name, before_date, after_date, product_type, stats, polarization, user_query, is_demo
    )
