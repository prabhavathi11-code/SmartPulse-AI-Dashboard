import datetime
import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models import Order, OrderItem, Product, Customer, Notification
from app.schemas import OrderResponse, OrderCreate
from app.routers.websocket import manager

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.get("", response_model=List[OrderResponse])
def get_orders(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Order).order_by(desc(Order.created_at))
    if status:
        query = query.filter(Order.status == status)

    orders = query.offset(offset).limit(limit).all()

    # Format response with customer name and items
    res = []
    for o in orders:
        items = [
            {
                "id": it.id,
                "product_id": it.product_id,
                "product_name": it.product.name if it.product else "Unknown",
                "quantity": it.quantity,
                "unit_price": it.unit_price,
                "unit_cost": it.unit_cost,
                "subtotal": it.subtotal
            }
            for it in o.items
        ]
        res.append(OrderResponse(
            id=o.id,
            order_number=o.order_number,
            customer_id=o.customer_id,
            customer_name=o.customer.name if o.customer else "Walk-in Guest",
            total_amount=o.total_amount,
            profit_amount=o.profit_amount,
            status=o.status,
            payment_method=o.payment_method,
            created_at=o.created_at,
            items=items
        ))
    return res

@router.post("", response_model=OrderResponse)
async def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if not payload.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    # Generate next order number
    count = db.query(Order).count()
    order_num = f"ORD-{1000 + count + 1}"

    order = Order(
        order_number=order_num,
        customer_id=customer.id,
        total_amount=0.0,
        profit_amount=0.0,
        status="Completed",
        payment_method=payload.payment_method or "UPI / Card",
        created_at=datetime.datetime.utcnow()
    )
    db.add(order)
    db.flush()

    total_amount = 0.0
    total_profit = 0.0
    order_items_res = []
    alerts_triggered = []

    for item_data in payload.items:
        product = db.query(Product).filter(Product.id == item_data.product_id).first()
        if not product:
            continue

        qty = max(1, item_data.quantity)
        subtotal = product.price * qty
        unit_profit = (product.price - product.cost_price) * qty
        total_amount += subtotal
        total_profit += unit_profit

        # Deduct inventory stock
        product.stock_quantity = max(0, product.stock_quantity - qty)

        # Check for low-stock trigger
        if product.stock_quantity <= product.min_stock_threshold:
            alert_msg = f"Low Stock Warning: {product.name} has only {product.stock_quantity} units remaining!"
            notif = Notification(
                title="Low Stock Alert",
                message=alert_msg,
                type="low_stock",
                created_at=datetime.datetime.utcnow()
            )
            db.add(notif)
            alerts_triggered.append(alert_msg)

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=qty,
            unit_price=product.price,
            unit_cost=product.cost_price,
            subtotal=subtotal
        )
        db.add(order_item)
        order_items_res.append({
            "id": order_item.id or 0,
            "product_id": product.id,
            "product_name": product.name,
            "quantity": qty,
            "unit_price": product.price,
            "unit_cost": product.cost_price,
            "subtotal": subtotal
        })

    order.total_amount = round(total_amount, 2)
    order.profit_amount = round(total_profit, 2)
    db.commit()
    db.refresh(order)

    # Broadcast via WebSocket to connected live dashboards
    ws_event = {
        "type": "NEW_ORDER",
        "data": {
            "order_number": order.order_number,
            "customer_name": customer.name,
            "total_amount": order.total_amount,
            "profit_amount": order.profit_amount,
            "status": order.status,
            "timestamp": order.created_at.isoformat(),
            "alerts": alerts_triggered
        }
    }
    await manager.broadcast(ws_event)

    return OrderResponse(
        id=order.id,
        order_number=order.order_number,
        customer_id=order.customer_id,
        customer_name=customer.name,
        total_amount=order.total_amount,
        profit_amount=order.profit_amount,
        status=order.status,
        payment_method=order.payment_method,
        created_at=order.created_at,
        items=order_items_res
    )

