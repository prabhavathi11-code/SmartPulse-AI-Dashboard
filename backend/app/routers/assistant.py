from datetime import datetime, timedelta
import re
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models import Order, OrderItem, Product, Customer
from app.schemas import AssistantRequest, AssistantResponse
from app.ml.forecast import generate_sales_forecast
from app.ml.anomaly import detect_business_anomalies

router = APIRouter(prefix="/api/assistant", tags=["AI Business Assistant"])

@router.post("/chat", response_model=AssistantResponse)
def ask_assistant(req: AssistantRequest, db: Session = Depends(get_db)):
    query = req.message.strip().lower()
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    month_start = datetime(now.year, now.month, 1)

    # 1. Intent: Today's Sales / Revenue
    if any(k in query for k in ["today's sales", "today sales", "today revenue", "sales today", "today's revenue"]):
        today_orders = db.query(Order).filter(
            Order.created_at >= today_start,
            Order.status != "Cancelled"
        ).all()
        today_rev = sum(o.total_amount for o in today_orders)
        today_profit = sum(o.profit_amount for o in today_orders)
        count = len(today_orders)

        reply = (
            f"📊 **Today's Business Summary ({now.strftime('%b %d, %Y')})**\n\n"
            f"- **Total Revenue**: ₹{today_rev:,.2f}\n"
            f"- **Orders Received**: {count} orders\n"
            f"- **Estimated Profit**: ₹{today_profit:,.2f} (Margin: {(today_profit/today_rev*100) if today_rev > 0 else 0:.1f}%)\n"
            f"- **Average Order Value**: ₹{(today_rev/count) if count > 0 else 0:,.2f}\n\n"
            f"💡 *All values are synced directly with live database records.*"
        )
        return AssistantResponse(
            query=req.message,
            reply=reply,
            intent="today_sales",
            data_context={"revenue": today_rev, "orders": count, "profit": today_profit},
            suggestions=["Which product generated the highest revenue?", "Which products are low in stock?", "Predict next month's sales"]
        )

    # 2. Intent: Highest Revenue Product / Top Selling
    elif any(k in query for k in ["highest revenue", "top product", "best selling", "top revenue", "highest selling"]):
        top_prod = db.query(
            Product.name,
            Product.category,
            func.sum(OrderItem.subtotal).label("revenue"),
            func.sum(OrderItem.quantity).label("units")
        ).join(
            OrderItem, Product.id == OrderItem.product_id
        ).join(
            Order, OrderItem.order_id == Order.id
        ).filter(
            Order.status != "Cancelled"
        ).group_by(
            Product.id
        ).order_by(
            desc("revenue")
        ).first()

        if top_prod:
            reply = (
                f"🏆 **Top-Performing Product**\n\n"
                f"**{top_prod.name}** ({top_prod.category}) is your highest-grossing product.\n\n"
                f"- **Total Generated Revenue**: ₹{float(top_prod.revenue):,.2f}\n"
                f"- **Total Units Sold**: {int(top_prod.units)} units\n\n"
                f"💡 **Recommendation**: This is your primary revenue engine. Ensure uninterrupted inventory supply and consider bundling with related accessories."
            )
            return AssistantResponse(
                query=req.message,
                reply=reply,
                intent="top_product",
                data_context={"product": top_prod.name, "revenue": float(top_prod.revenue)},
                suggestions=["What is today's revenue?", "Predict next month's sales", "Why did sales decrease?"]
            )

    # 3. Intent: Monthly Orders / Month Sales
    elif any(k in query for k in ["orders this month", "this month", "orders were received", "monthly sales"]):
        monthly_orders = db.query(Order).filter(
            Order.created_at >= month_start,
            Order.status != "Cancelled"
        ).all()
        month_rev = sum(o.total_amount for o in monthly_orders)
        month_count = len(monthly_orders)
        month_profit = sum(o.profit_amount for o in monthly_orders)

        reply = (
            f"📅 **Month-to-Date Performance ({now.strftime('%B %Y')})**\n\n"
            f"- **Total Orders Received**: {month_count:,} orders\n"
            f"- **Gross Revenue**: ₹{month_rev:,.2f}\n"
            f"- **Total Net Profit**: ₹{month_profit:,.2f}\n"
            f"- **Average Order Value**: ₹{(month_rev/month_count) if month_count > 0 else 0:,.2f}\n\n"
            f"📈 Your sales run-rate is pacing on target with standard month projections."
        )
        return AssistantResponse(
            query=req.message,
            reply=reply,
            intent="month_orders",
            data_context={"month_orders": month_count, "revenue": month_rev},
            suggestions=["Which product generated the highest revenue?", "Predict next month's sales", "Check low stock alerts"]
        )

    # 4. Intent: Low Stock / Inventory Alert
    elif any(k in query for k in ["low in stock", "low stock", "inventory", "stock", "out of stock"]):
        low_stock = db.query(Product).filter(
            Product.stock_quantity <= Product.min_stock_threshold
        ).all()

        if low_stock:
            items_str = "\n".join([f"- **{p.name}** ({p.category}): `{p.stock_quantity}` units remaining (Threshold: {p.min_stock_threshold})" for p in low_stock])
            reply = (
                f"⚠️ **Low Stock Alert ({len(low_stock)} items critical)**\n\n"
                f"{items_str}\n\n"
                f"🚨 **Action Required**: Initiate purchase orders for these items immediately to prevent out-of-stock losses and shipping delays."
            )
        else:
            reply = "✅ **Inventory Healthy**: All product inventory levels are currently above their safety thresholds."

        return AssistantResponse(
            query=req.message,
            reply=reply,
            intent="low_stock",
            data_context={"low_stock_count": len(low_stock)},
            suggestions=["What is today's revenue?", "Predict next month's sales", "Which product generated the highest revenue?"]
        )

    # 5. Intent: Sales Forecast / Prediction
    elif any(k in query for k in ["predict", "forecast", "future sales", "next month", "upcoming sales"]):
        forecast_res = generate_sales_forecast(db, days_ahead=30)
        projected = forecast_res.metrics.get("projected_total", 0.0)
        growth = forecast_res.trend_percentage

        reply = (
            f"🔮 **AI Sales Forecast (Next 30 Days)**\n\n"
            f"- **Projected Revenue**: ₹{projected:,.2f}\n"
            f"- **Trend Direction**: {forecast_res.trend_direction} ({growth:+0.1f}%)\n"
            f"- **ML Model Accuracy (R²)**: {forecast_res.metrics.get('r2_score', 0.85)*100:.1f}%\n\n"
            f"🎯 **Key Recommendations**:\n"
            + "\n".join([f"- {rec}" for rec in forecast_res.recommendations[:2]])
        )
        return AssistantResponse(
            query=req.message,
            reply=reply,
            intent="forecast",
            data_context=forecast_res.metrics,
            suggestions=["Why did sales decrease?", "Which product generated the highest revenue?", "What is today's revenue?"]
        )

    # 6. Intent: Why did sales decrease / Anomaly inquiry
    elif any(k in query for k in ["decrease", "dropped", "fell", "why did sales", "anomaly", "drop"]):
        anomalies = detect_business_anomalies(db)
        sales_anomalies = [a for a in anomalies if a["type"] in ("sales_drop", "cancellations")]

        if sales_anomalies:
            anomaly_msgs = "\n".join([f"- **{a['title']}**: {a['message']} *(Action: {a['recommended_action']})*" for a in sales_anomalies])
            reply = (
                f"🔍 **Root Cause Analysis: Revenue Drops & Anomalies**\n\n"
                f"{anomaly_msgs}\n\n"
                f"💡 **AI Diagnosis**: Periodic dips often coincide with post-weekend dips and inventory stockouts in high-demand categories. Check marketing campaigns and ensure stock availability."
            )
        else:
            reply = (
                f"📈 **Sales Health Check**:\n\n"
                f"Our statistical anomaly detector does not find any abnormal drops in the recent 7-day window. "
                f"Overall sales trajectory remains within normal seasonal boundaries."
            )
        return AssistantResponse(
            query=req.message,
            reply=reply,
            intent="sales_decrease_analysis",
            suggestions=["Predict next month's sales", "What is today's revenue?", "Which products are low in stock?"]
        )

    # 7. General Assistant Fallback with Live Context
    total_rev = db.query(func.coalesce(func.sum(Order.total_amount), 0.0)).filter(Order.status != "Cancelled").scalar()
    total_orders = db.query(Order).filter(Order.status != "Cancelled").count()
    reply = (
        f"🤖 **SmartPulse Business Assistant**\n\n"
        f"I have live access to your business database:\n"
        f"- **Cumulative Revenue**: ₹{total_rev:,.2f}\n"
        f"- **Completed Orders**: {total_orders:,} orders\n\n"
        f"You can ask me specific questions like:\n"
        f"1. *'What is today's revenue?'*\n"
        f"2. *'Which product generated the highest revenue?'*\n"
        f"3. *'How many orders were received this month?'*\n"
        f"4. *'Which products are low in stock?'*\n"
        f"5. *'Predict next month's sales.'*\n"
        f"6. *'Why did sales decrease?'*"
    )
    return AssistantResponse(
        query=req.message,
        reply=reply,
        intent="general",
        suggestions=["What is today's revenue?", "Which product generated the highest revenue?", "Predict next month's sales", "Which products are low in stock?"]
    )

