import io
import csv
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Order, OrderItem, Product, Customer

router = APIRouter(prefix="/api/reports", tags=["Reports & Export"])

@router.get("/summary")
def get_report_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Order).filter(Order.status != "Cancelled")

    if start_date:
        s_dt = datetime.strptime(start_date, "%Y-%m-%d")
        query = query.filter(Order.created_at >= s_dt)
    if end_date:
        e_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
        query = query.filter(Order.created_at < e_dt)

    total_orders = query.count()
    total_rev = query.with_entities(func.coalesce(func.sum(Order.total_amount), 0.0)).scalar()
    total_prof = query.with_entities(func.coalesce(func.sum(Order.profit_amount), 0.0)).scalar()

    return {
        "period": {"start": start_date or "All-Time", "end": end_date or "Present"},
        "total_revenue": round(float(total_rev), 2),
        "total_profit": round(float(total_prof), 2),
        "total_orders": total_orders,
        "profit_margin_pct": round((float(total_prof) / float(total_rev) * 100), 2) if total_rev > 0 else 0.0,
        "average_order_value": round(float(total_rev) / total_orders, 2) if total_orders > 0 else 0.0
    }

@router.get("/export/csv")
def export_orders_csv(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    since_date = datetime.utcnow() - timedelta(days=days)
    orders = db.query(Order).filter(
        Order.created_at >= since_date
    ).order_by(Order.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Write Header
    writer.writerow([
        "Order Number",
        "Date",
        "Customer Name",
        "Total Amount (INR)",
        "Profit Amount (INR)",
        "Payment Method",
        "Status",
        "Items Count"
    ])

    for o in orders:
        cust_name = o.customer.name if o.customer else "Guest"
        writer.writerow([
            o.order_number,
            o.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            cust_name,
            f"{o.total_amount:.2f}",
            f"{o.profit_amount:.2f}",
            o.payment_method,
            o.status,
            len(o.items)
        ])

    output.seek(0)
    filename = f"SmartPulse_Sales_Report_{datetime.utcnow().strftime('%Y%m%d')}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

