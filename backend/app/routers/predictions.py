from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.schemas import ForecastResponse
from app.ml.forecast import generate_sales_forecast
from app.ml.anomaly import detect_business_anomalies

router = APIRouter(prefix="/api/predictions", tags=["AI & Predictions"])

@router.get("/sales-forecast", response_model=ForecastResponse)
def get_sales_forecast(
    days: int = Query(14, ge=7, le=60),
    db: Session = Depends(get_db)
):
    """
    Returns Scikit-Learn ML sales forecast for the next N days along with
    confidence intervals, model metrics, and business recommendations.
    """
    return generate_sales_forecast(db, days_ahead=days)

@router.get("/anomalies", response_model=List[Dict[str, Any]])
def get_anomalies(db: Session = Depends(get_db)):
    """
    Scans recent transactions and inventory levels to detect statistical anomalies,
    sudden sales drops, surges, and inventory depletion risks.
    """
    return detect_business_anomalies(db)

