import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed_data import seed_database_if_empty
from app.routers import (
    analytics,
    predictions,
    assistant,
    orders,
    products,
    reports,
    notifications,
    websocket
)
from app import simulator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SmartPulse")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Database Tables
    logger.info("[SmartPulse] Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    # Seed Database if empty
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
    finally:
        db.close()

    logger.info("[SmartPulse] Server initialized and ready to serve requests.")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise Real-Time AI Business Intelligence Dashboard API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(analytics.router)
app.include_router(predictions.router)
app.include_router(assistant.router)
app.include_router(orders.router)
app.include_router(products.router)
app.include_router(reports.router)
app.include_router(notifications.router)
app.include_router(simulator.router)
app.include_router(websocket.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs_url": "/docs",
        "websocket_stream": "/ws/live"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

