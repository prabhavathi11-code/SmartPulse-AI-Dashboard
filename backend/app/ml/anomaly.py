import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Order, Product, Notification

def detect_business_anomalies(db: Session) -> List[Dict[str, Any]]:
    """
    Detect statistical sales anomalies (Z-score / sudden drops/spikes)
    and inventory stock depletion risks.
    """
    anomalies = []

    # 1. Detect Low Stock Anomalies
    low_stock_products = db.query(Product).filter(
        Product.stock_quantity <= Product.min_stock_threshold
    ).all()

    for p in low_stock_products:
        severity = "high" if p.stock_quantity <= 5 else "medium"
        anomalies.append({
            "id": f"stock-{p.id}",
            "type": "low_stock",
            "severity": severity,
            "title": f"Low Stock: {p.name}",
            "message": f"Only {p.stock_quantity} units remaining in stock (Threshold is {p.min_stock_threshold}).",
            "metric": f"{p.stock_quantity} left",
            "recommended_action": f"Initiate PO for at least {p.min_stock_threshold * 3} units from supplier.",
            "timestamp": datetime.utcnow().isoformat()
        })

    # 2. Detect Sales Anomalies (Last 30 days)
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)

    daily_sales = db.query(
        func.date(Order.created_at).label("sale_date"),
        func.sum(Order.total_amount).label("revenue"),
        func.count(Order.id).label("orders")
    ).filter(
        Order.created_at >= thirty_days_ago,
        Order.status != "Cancelled"
    ).group_by(
        func.date(Order.created_at)
    ).order_by("sale_date").all()

    if len(daily_sales) >= 7:
        revenues = [float(r.revenue or 0.0) for r in daily_sales]
        dates = [str(r.sale_date) for r in daily_sales]

        # Calculate 7-day rolling baseline
        mean_rev = np.mean(revenues)
        std_rev = np.std(revenues) if np.std(revenues) > 0 else 1.0

        recent_rev = revenues[-1]
        recent_date = dates[-1]
        z_score = (recent_rev - mean_rev) / std_rev

        if z_score < -1.8:
            anomalies.append({
                "id": "sales-drop",
                "type": "sales_drop",
                "severity": "high",
                "title": "Significant Revenue Drop Detected",
                "message": f"Daily revenue on {recent_date} was ₹{recent_rev:,.2f}, which is {abs(z_score):.1f}σ below the 30-day baseline average (₹{mean_rev:,.2f}).",
                "metric": f"{((recent_rev - mean_rev) / mean_rev) * 100:.1f}% vs Avg",
                "recommended_action": "Check website payment gateways and ad conversion funnels immediately.",
                "timestamp": datetime.utcnow().isoformat()
            })
        elif z_score > 2.0:
            anomalies.append({
                "id": "sales-spike",
                "type": "sales_spike",
                "severity": "low",
                "title": "Positive Sales Spike Detected",
                "message": f"Daily revenue on {recent_date} reached ₹{recent_rev:,.2f}, surpassing standard deviation by +{z_score:.1f}σ.",
                "metric": f"+{((recent_rev - mean_rev) / mean_rev) * 100:.1f}% surge",
                "recommended_action": "Verify top converting campaigns and replenish associated inventory.",
                "timestamp": datetime.utcnow().isoformat()
            })

    # 3. Detect Order Cancellation Rate Anomaly
    total_recent_orders = db.query(Order).filter(Order.created_at >= (now - timedelta(days=7))).count()
    cancelled_orders = db.query(Order).filter(
        Order.created_at >= (now - timedelta(days=7)),
        Order.status == "Cancelled"
    ).count()

    if total_recent_orders > 0:
        cancellation_rate = (cancelled_orders / total_recent_orders) * 100
        if cancellation_rate > 10.0:
            anomalies.append({
                "id": "cancellation-rate",
                "type": "cancellations",
                "severity": "medium",
                "title": "Elevated Cancellation Rate",
                "message": f"7-day order cancellation rate is {cancellation_rate:.1f}% ({cancelled_orders}/{total_recent_orders} orders).",
                "metric": f"{cancellation_rate:.1f}% cancelled",
                "recommended_action": "Audit customer checkout dropoff and order confirmation UX.",
                "timestamp": datetime.utcnow().isoformat()
            })

    return anomalies

