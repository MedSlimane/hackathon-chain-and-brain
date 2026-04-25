from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

try:
    from .inference import ModelService
except ImportError:
    from inference import ModelService


app = FastAPI(
    title="AgriConnect Smart Model API",
    version="1.0.0",
    description="PyTorch inference API for biomass vision, quality, price, and carbon estimates.",
)

service: ModelService | None = None


def get_service() -> ModelService:
    global service
    if service is None:
        service = ModelService()
    return service


class PriceRequest(BaseModel):
    market_id: float = Field(0, description="Market identifier from the market dataset.")
    latitude: float = 0
    longitude: float = 0
    commodity_id: float = 0
    year: float = 2026
    month: float = 1
    day_of_year: float = 1


class CarbonRequest(BaseModel):
    dry_mass_kg: float = Field(..., gt=0)


class LotAnalysisRequest(PriceRequest):
    dry_mass_kg: float | None = Field(None, gt=0)


@app.get("/health")
def health():
    model_service = get_service()
    return {
        "status": "ok",
        "device": str(model_service.device),
        "models": {
            "biomass_type_classifier": True,
            "biomass_quality_regressor": True,
            "price_model": True,
        },
    }


@app.post("/predict/image")
async def predict_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload an image file.")
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Image file is empty.")
    return get_service().predict_image(image_bytes)


@app.post("/predict/price")
def predict_price(payload: PriceRequest):
    return get_service().predict_price(payload.model_dump())


@app.post("/predict/carbon")
def predict_carbon(payload: CarbonRequest):
    return get_service().carbon_for_burning(payload.dry_mass_kg)


@app.post("/predict/lot")
async def predict_lot(
    file: UploadFile = File(...),
    market_id: float = 0,
    latitude: float = 0,
    longitude: float = 0,
    commodity_id: float = 0,
    year: float = 2026,
    month: float = 1,
    day_of_year: float = 1,
    dry_mass_kg: float | None = None,
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload an image file.")

    model_service = get_service()
    image_result = model_service.predict_image(await file.read())
    price_result = model_service.predict_price(
        {
            "market_id": market_id,
            "latitude": latitude,
            "longitude": longitude,
            "commodity_id": commodity_id,
            "year": year,
            "month": month,
            "day_of_year": day_of_year,
        }
    )
    estimated_dry_mass = dry_mass_kg or image_result["quality"].get("dry_total", 0.0)

    result: dict[str, Any] = {
        "image": image_result,
        "price": price_result,
    }
    if estimated_dry_mass and estimated_dry_mass > 0:
        result["carbon"] = model_service.carbon_for_burning(float(estimated_dry_mass))
    return result
