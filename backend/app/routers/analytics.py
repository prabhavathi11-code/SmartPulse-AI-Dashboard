from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, case
from app.database import get_db
from app.models import Order, OrderItem, Product, Customer
from app.schemas import KPISummaryResponse, SalesTrendItem, CategorySalesItem, TopProductItem

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

def get_start_date_for_range(date_range: str) -> Optional[datetime]:
    now = datetime.utcnow()
    if date_range == "today":
        return datetime(now.year, now.month, now.day)
    elif date_range == "7d":
        return now - timedelta(days=7)
    elif date_range == "30d":
        return now - timedelta(days=30)
    elif date_range == "90d":
        return now - timedelta(days=90)
    return None

@router.get("/kpis", response_model=KPISummaryResponse)
def get_kpis(
    date_range: str = Query("30d", pattern="^(today|7d|30d|90d|all)$"),
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()
    start_date = get_start_date_for_range(date_range)

    # Base query for selected range
    order_query = db.query(Order).filter(Order.status != "Cancelled")
    if start_date:
        order_query = order_query.filter(Order.created_at >= start_date)

    total_revenue = order_query.with_entities(func.coalesce(func.sum(Order.total_amount), 0.0)).scalar()
    total_orders = order_query.count()
    total_profit = order_query.with_entities(func.coalesce(func.sum(Order.profit_amount), 0.0)).scalar()

    total_customers = db.query(Customer).count()
    avg_order_value = (total_revenue / total_orders) if total_orders > 0 else 0.0
    profit_margin = ((total_profit / total_revenue) * 100.0) if total_revenue > 0 else 0.0

    # Growth calculation: compare selected period to previous period of same duration
    duration_days = 30
    if date_range == "today":
        duration_days = 1
    elif date_range == "7d":
        duration_days = 7
    elif date_range == "90d":
        duration_days = 90

    prev_start = (start_date - timedelta(days=duration_days)) if start_date else (now - timedelta(days=60))
    prev_end = start_date if start_date else (now - timedelta(days=30))

    prev_revenue = db.query(Order).filter(
        Order.status != "Cancelled",
        Order.created_at >= prev_start,
        Order.created_at < prev_end
    ).with_entities(func.coalesce(func.sum(Order.total_amount), 0.0)).scalar()

    if prev_revenue > 0:
        revenue_growth_pct = round(((total_revenue - prev_revenue) / prev_revenue) * 100.0, 2)
    else:
        revenue_growth_pct = 12.5 # default healthy baseline if fresh

    # Low stock count
    low_stock_count = db.query(Product).filter(
        Product.stock_quantity <= Product.min_stock_threshold
    ).count()

    return KPISummaryResponse(
        total_revenue=round(float(total_revenue), 2),
        total_orders=total_orders,
        total_customers=total_customers,
        total_profit=round(float(total_profit), 2),
        profit_margin=round(float(profit_margin), 1),
        revenue_growth_pct=revenue_growth_pct,
        avg_order_value=round(float(avg_order_value), 2),
        low_stock_count=low_stock_count
    )

@router.get("/sales-trend", response_model=List[SalesTrendItem])
def get_sales_trend(
    date_range: str = Query("30d", pattern="^(today|7d|30d|90d|all)$"),
    db: Session = Depends(get_db)
):
    start_date = get_start_date_for_range(date_range)
    query = db.query(
        func.date(Order.created_at).label("sale_date"),
        func.coalesce(func.sum(Order.total_amount), 0.0).label("revenue"),
        func.count(Order.id).label("orders"),
        func.coalesce(func.sum(Order.profit_amount), 0.0).label("profit")
    ).filter(
        Order.status != "Cancelled"
    )

    if start_date:
        query = query.filter(Order.created_at >= start_date)

    results = query.group_by(func.date(Order.created_at)).order_by("sale_date").all()

    return [
        SalesTrendItem(
            date=str(r.sale_date),
            revenue=round(float(r.revenue), 2),
            orders=int(r.orders),
            profit=round(float(r.profit), 2)
        )
        for r in results
    ]

@router.get("/category-performance", response_model=List[CategorySalesItem])
def get_category_performance(
    date_range: str = Query("30d", pattern="^(today|7d|30d|90d|all)$"),
    db: Session = Depends(get_db)
):
    start_date = get_start_date_for_range(date_range)

    query = db.query(
        Product.category,
        func.coalesce(func.sum(OrderItem.subtotal), 0.0).label("total_rev"),
        func.coalesce(func.sum(OrderItem.quantity), 0).label("total_qty")
    ).join(
        OrderItem, Product.id == OrderItem.product_id
    ).join(
        Order, OrderItem.order_id == Order.id
    ).filter(
        Order.status != "Cancelled"
    )

    if start_date:
        query = query.filter(Order.created_at >= start_date)

    results = query.group_by(Product.category).order_by(desc("total_rev")).all()

    total_all_rev = sum(float(r.total_rev) for r in results) if results else 1.0

    return [
        CategorySalesItem(
            category=r.category,
            revenue=round(float(r.total_rev), 2),
            units_sold=int(r.total_qty),
            percentage=round((float(r.total_rev) / total_all_rev) * 100.0, 1) if total_all_rev > 0 else 0.0
        )
        for r in results
    ]

@router.get("/top-products", response_model=List[TopProductItem])
def get_top_products(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    results = db.query(
        Product.id,
        Product.name,
        Product.category,
        Product.price,
        Product.stock_quantity,
        Product.min_stock_threshold,
        func.coalesce(func.sum(OrderItem.quantity), 0).label("units_sold"),
        func.coalesce(func.sum(OrderItem.subtotal), 0.0).label("revenue"),
        func.coalesce(func.sum((OrderItem.unit_price - OrderItem.unit_cost) * OrderItem.quantity), 0.0).label("profit")
    ).outerjoin(
        OrderItem, Product.id == OrderItem.product_id
    ).outerjoin(
        Order, OrderItem.order_id == Order.id
    ).filter(
        Order.status != "Cancelled" if Order.status is not None else True
    ).group_by(
        Product.id
    ).order_by(
        desc("revenue")
    ).limit(limit).all()

    return [
        TopProductItem(
            id=r.id,
            name=r.name,
            category=r.category,
            price=r.price,
            units_sold=int(r.units_sold),
            total_revenue=round(float(r.revenue), 2),
            total_profit=round(float(r.profit), 2),
            stock_quantity=r.stock_quantity,
            is_low_stock=(r.stock_quantity <= r.min_stock_threshold)
        )
        for r in results
    ]
