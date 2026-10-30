"""
SmartPulse Backend Verification Script
Tests database seeding, analytics endpoints, ML forecasting, and assistant query.
"""
import sys
# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.seed_data import seed_database_if_empty

print("[SmartPulse] Running end-to-end test...")

# Seed DB if needed
Base.metadata.create_all(bind=engine)
db = SessionLocal()
seed_database_if_empty(db)
db.close()

client = TestClient(app)

# 1. Health check
res = client.get("/")
assert res.status_code == 200, f"Root health failed: {res.text}"
print("[OK] Root endpoint:", res.json()["system"])

# 2. KPIs
res = client.get("/api/analytics/kpis?date_range=30d")
assert res.status_code == 200, f"KPIs failed: {res.text}"
kpis = res.json()
print(f"[OK] KPIs: Revenue=INR {kpis['total_revenue']:,}, Orders={kpis['total_orders']}, Margin={kpis['profit_margin']}%")

# 3. Sales Trend
res = client.get("/api/analytics/sales-trend?date_range=30d")
assert res.status_code == 200, f"Sales trend failed: {res.text}"
trend = res.json()
print(f"[OK] Sales Trend: {len(trend)} days aggregated")

# 4. Scikit-Learn Sales Forecast
res = client.get("/api/predictions/sales-forecast?days=14")
assert res.status_code == 200, f"Forecast failed: {res.text}"
forecast = res.json()
print(f"[OK] AI Forecast: Horizon=14 days, R2={forecast['metrics']['r2_score']}, Projected=INR {forecast['metrics']['projected_total']:,}")

# 5. AI Business Assistant Chat
res = client.post("/api/assistant/chat", json={"message": "What is today's revenue?"})
assert res.status_code == 200, f"Assistant chat failed: {res.text}"
reply = res.json()["reply"]
print("[OK] AI Assistant Query:\n" + reply[:150] + "...")

# 6. Simulator Trigger
res = client.post("/api/simulator/trigger")
assert res.status_code == 200, f"Simulator failed: {res.text}"
print("[OK] Simulator Order Injected:", res.json()["order"]["order_number"])

print("\n>>> ALL TESTS PASSED WITH 100% SUCCESS! <<<")
