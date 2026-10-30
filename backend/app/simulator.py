import asyncio
import random
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal
from app.models import Order, OrderItem, Product, Customer, Notification
from app.routers.websocket import manager

router = APIRouter(prefix="/api/simulator", tags=["Live Simulator"])

# Background simulator state
_simulator_task = None
_simulator_running = False

async def create_simulated_order(db: Session):
    customers = db.query(Customer).all()
    products = db.query(Product).all()

    if not customers or not products:
        return None

    customer = random.choice(customers)
    num_items = random.choices([1, 2], weights=[0.75, 0.25])[0]
    chosen_products = random.sample(products, min(num_items, len(products)))

    count = db.query(Order).count()
    order_num = f"ORD-{1000 + count + 1}"

    order = Order(
        order_number=order_num,
        customer_id=customer.id,
        total_amount=0.0,
        profit_amount=0.0,
        status="Completed",
        payment_method=random.choice(["UPI / QR", "Credit Card", "Razorpay"]),
        created_at=datetime.utcnow()
    )
    db.add(order)
    db.flush()

    total_amount = 0.0
    total_profit = 0.0
    items_summary = []
    alerts = []

    for prod in chosen_products:
        qty = random.randint(1, 2)
        subtotal = prod.price * qty
        unit_profit = (prod.price - prod.cost_price) * qty
        total_amount += subtotal
        total_profit += unit_profit

        # Deduct stock
        prod.stock_quantity = max(0, prod.stock_quantity - qty)

        # Check low stock
        if prod.stock_quantity <= prod.min_stock_threshold:
            alert_msg = f"Low Stock Warning: {prod.name} has only {prod.stock_quantity} units left!"
            notif = Notification(
                title="Low Stock Alert",
                message=alert_msg,
                type="low_stock",
                created_at=datetime.utcnow()
            )
            db.add(notif)
            alerts.append(alert_msg)

        item = OrderItem(
            order_id=order.id,
            product_id=prod.id,
            quantity=qty,
            unit_price=prod.price,
            unit_cost=prod.cost_price,
            subtotal=subtotal
        )
        db.add(item)
        items_summary.append(f"{prod.name} (x{qty})")

    order.total_amount = round(total_amount, 2)
    order.profit_amount = round(total_profit, 2)
    db.commit()
    db.refresh(order)

    # Broadcast event via WebSocket
    event_payload = {
        "type": "NEW_ORDER",
        "data": {
            "order_number": order.order_number,
            "customer_name": customer.name,
            "total_amount": order.total_amount,
            "profit_amount": order.profit_amount,
            "items_summary": ", ".join(items_summary),
            "timestamp": order.created_at.strftime("%H:%M:%S"),
            "alerts": alerts
        }
    }
    await manager.broadcast(event_payload)

    return {
        "order_number": order.order_number,
        "customer": customer.name,
        "amount": order.total_amount,
        "profit": order.profit_amount,
        "items": items_summary,
        "alerts": alerts
    }

async def background_simulation_loop():
    global _simulator_running
    while _simulator_running:
        try:
            await asyncio.sleep(random.randint(12, 20))
            if not _simulator_running:
                break
            db = SessionLocal()
            try:
                await create_simulated_order(db)
            finally:
                db.close()
        except Exception as e:
            print(f"[Simulator] Error in background simulation: {e}")
            await asyncio.sleep(5)

@router.post("/trigger")
async def trigger_live_order(db: Session = Depends(get_db)):
    """
    Manually inject a real-time order transaction into the database
    and broadcast live event to all connected dashboard clients.
    """
    result = await create_simulated_order(db)
    return {
        "success": True,
        "message": "Live order injected and broadcasted over WebSocket!",
        "order": result
    }

@router.post("/toggle")
async def toggle_simulator():
    """
    Toggle the auto-order background simulator on or off.
    """
    global _simulator_running, _simulator_task
    _simulator_running = not _simulator_running

    if _simulator_running:
        _simulator_task = asyncio.create_task(background_simulation_loop())
        status = "started"
    else:
        if _simulator_task:
            _simulator_task.cancel()
        status = "stopped"

    return {
        "simulator_active": _simulator_running,
        "status": status,
        "message": f"Live order background simulator {status}."
    }

@router.get("/status")
def get_simulator_status():
    global _simulator_running
    return {
        "simulator_active": _simulator_running
    }

