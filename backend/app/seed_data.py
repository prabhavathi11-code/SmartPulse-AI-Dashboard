import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import User, Product, Customer, Order, OrderItem, Notification

PRODUCTS_DATA = [
    {"name": "UltraSound ANC Headphones Pro", "sku": "AUD-ANC-01", "category": "Audio", "price": 14999.0, "cost_price": 8500.0, "stock_quantity": 8, "min_stock_threshold": 15},
    {"name": "EchoPulse Wireless Earbuds", "sku": "AUD-EP-02", "category": "Audio", "price": 4999.0, "cost_price": 2200.0, "stock_quantity": 45, "min_stock_threshold": 20},
    {"name": "QuantumFit Smartwatch Gen 4", "sku": "WRB-QF-01", "category": "Wearables", "price": 12499.0, "cost_price": 7000.0, "stock_quantity": 18, "min_stock_threshold": 15},
    {"name": "AuraTrack Fitness Band X", "sku": "WRB-AT-02", "category": "Wearables", "price": 3499.0, "cost_price": 1500.0, "stock_quantity": 6, "min_stock_threshold": 15}, # Low stock
    {"name": "VisionPro 4K Ultra Monitor 27\"", "sku": "ELC-MON-01", "category": "Electronics", "price": 32999.0, "cost_price": 21000.0, "stock_quantity": 12, "min_stock_threshold": 10},
    {"name": "ApexMechanical Gaming Keyboard", "sku": "ACC-KBD-01", "category": "Accessories", "price": 6999.0, "cost_price": 3200.0, "stock_quantity": 30, "min_stock_threshold": 15},
    {"name": "PrecisionGlide Wireless Mouse", "sku": "ACC-MSE-01", "category": "Accessories", "price": 2499.0, "cost_price": 1100.0, "stock_quantity": 55, "min_stock_threshold": 20},
    {"name": "HyperCharge 100W GaN Station", "sku": "ACC-CHG-01", "category": "Accessories", "price": 3999.0, "cost_price": 1700.0, "stock_quantity": 4, "min_stock_threshold": 15}, # Low stock
    {"name": "HomeSync Smart AI Hub 360", "sku": "SHT-HUB-01", "category": "Smart Home", "price": 8999.0, "cost_price": 4800.0, "stock_quantity": 25, "min_stock_threshold": 10},
    {"name": "LumiGlow RGB Ambient Light Bar", "sku": "SHT-LGT-01", "category": "Smart Home", "price": 2799.0, "cost_price": 1200.0, "stock_quantity": 40, "min_stock_threshold": 15},
    {"name": "NovaTab OLED 11\" Tablet", "sku": "ELC-TAB-01", "category": "Electronics", "price": 44999.0, "cost_price": 31000.0, "stock_quantity": 14, "min_stock_threshold": 10},
    {"name": "TitanShield Thunderbolt 4 Dock", "sku": "ACC-DCK-01", "category": "Accessories", "price": 15999.0, "cost_price": 9200.0, "stock_quantity": 9, "min_stock_threshold": 12}, # Low stock
]

CUSTOMERS_DATA = [
    {"name": "Aarav Sharma", "email": "aarav.sharma@example.com", "phone": "+91 98765 43210", "location": "Hyderabad, IN", "segment": "VIP"},
    {"name": "Priya Reddy", "email": "priya.reddy@example.com", "phone": "+91 98450 12345", "location": "Hyderabad, IN", "segment": "Enterprise"},
    {"name": "Rohan Verma", "email": "rohan.v@example.com", "phone": "+91 97110 56789", "location": "Bengaluru, IN", "segment": "Regular"},
    {"name": "Sneha Patel", "email": "sneha.patel@example.com", "phone": "+91 96540 88990", "location": "Mumbai, IN", "segment": "VIP"},
    {"name": "Vikram Rao", "email": "vikram.rao@example.com", "phone": "+91 99887 76655", "location": "Chennai, IN", "segment": "Enterprise"},
    {"name": "Ananya Iyer", "email": "ananya.iyer@example.com", "phone": "+91 91234 56780", "location": "Pune, IN", "segment": "Regular"},
    {"name": "Karthik Subramanian", "email": "karthik.s@example.com", "phone": "+91 94440 11223", "location": "Bengaluru, IN", "segment": "VIP"},
    {"name": "Deepika Sen", "email": "deepika.sen@example.com", "phone": "+91 98101 22334", "location": "Delhi, IN", "segment": "Regular"},
    {"name": "Rajesh Kumar", "email": "rajesh.k@example.com", "phone": "+91 98220 99887", "location": "Hyderabad, IN", "segment": "Regular"},
    {"name": "Divya Nambiar", "email": "divya.n@example.com", "phone": "+91 97400 33445", "location": "Kochi, IN", "segment": "VIP"},
    {"name": "Aditya Joshi", "email": "aditya.j@example.com", "phone": "+91 99200 44556", "location": "Mumbai, IN", "segment": "Enterprise"},
    {"name": "Meera Menon", "email": "meera.m@example.com", "phone": "+91 94470 55667", "location": "Chennai, IN", "segment": "Regular"},
]

def seed_database_if_empty(db: Session):
    # Check if products already exist
    if db.query(Product).first():
        return

    print("[SmartPulse] Seeding initial business database with 90-day history...")

    # 1. Create Default Admin/Manager User
    admin = User(
        username="admin",
        email="admin@smartpulse.ai",
        hashed_password="pbkdf2_sha256$260000$mockhashedpassword$smartpulse2026",
        role="Admin"
    )
    db.add(admin)

    # 2. Add Products
    db_products = []
    for p in PRODUCTS_DATA:
        prod = Product(**p)
        db.add(prod)
        db_products.append(prod)
    db.commit()

    for p in db_products:
        db.refresh(p)

    # 3. Add Customers
    db_customers = []
    for c in CUSTOMERS_DATA:
        cust = Customer(**c)
        db.add(cust)
        db_customers.append(cust)
    db.commit()

    for c in db_customers:
        db.refresh(c)

    # 4. Generate 90 Days of Realistic Orders
    # Start 90 days ago up to today
    now = datetime.utcnow()
    start_date = now - timedelta(days=90)

    payment_methods = ["UPI / QR", "Credit Card", "Net Banking", "Corporate Debit", "Razorpay"]
    order_seq = 1001

    orders_to_add = []
    order_items_to_add = []

    # Growth trend over 90 days
    for day_offset in range(91):
        current_day = start_date + timedelta(days=day_offset)
        # Upward trend factor + weekday seasonality (higher on weekends and month ends)
        day_factor = 1.0 + (day_offset / 90.0) * 0.45
        is_weekend = current_day.weekday() in (5, 6)
        weekend_mult = 1.25 if is_weekend else 1.0

        daily_order_count = int(random.randint(6, 14) * day_factor * weekend_mult)

        for _ in range(daily_order_count):
            order_time = current_day + timedelta(
                hours=random.randint(8, 22),
                minutes=random.randint(0, 59),
                seconds=random.randint(0, 59)
            )

            customer = random.choice(db_customers)
            # Pick 1 to 3 items per order
            num_items = random.choices([1, 2, 3], weights=[0.6, 0.3, 0.1])[0]
            chosen_products = random.sample(db_products, num_items)

            total_amount = 0.0
            profit_amount = 0.0

            order = Order(
                order_number=f"ORD-{order_seq}",
                customer_id=customer.id,
                total_amount=0.0,
                profit_amount=0.0,
                status="Completed",
                payment_method=random.choice(payment_methods),
                created_at=order_time
            )
            db.add(order)
            db.flush() # get order.id

            for prod in chosen_products:
                qty = random.choices([1, 2, 3], weights=[0.75, 0.20, 0.05])[0]
                subtotal = prod.price * qty
                unit_profit = (prod.price - prod.cost_price) * qty
                total_amount += subtotal
                profit_amount += unit_profit

                item = OrderItem(
                    order_id=order.id,
                    product_id=prod.id,
                    quantity=qty,
                    unit_price=prod.price,
                    unit_cost=prod.cost_price,
                    subtotal=subtotal
                )
                db.add(item)

            order.total_amount = round(total_amount, 2)
            order.profit_amount = round(profit_amount, 2)
            order_seq += 1

    # 5. Add Seed Notifications
    notifs = [
        Notification(
            title="System Initialized",
            message="SmartPulse AI Business Intelligence Engine is active and streaming real-time analytics.",
            type="insight",
            created_at=now - timedelta(days=2)
        ),
        Notification(
            title="Low Stock Alert: AuraTrack Fitness Band X",
            message="Stock level has reached 6 units (Threshold: 15). Consider restocking soon to avoid stockouts.",
            type="low_stock",
            created_at=now - timedelta(hours=14)
        ),
        Notification(
            title="Revenue Spike Detected",
            message="Electronics & Audio categories showed a 32% spike in weekend sales compared to the 30-day baseline.",
            type="anomaly",
            created_at=now - timedelta(hours=5)
        ),
        Notification(
            title="Low Stock Alert: HyperCharge 100W GaN Station",
            message="Stock level is critically low at 4 units. Restocking order recommended.",
            type="low_stock",
            created_at=now - timedelta(minutes=45)
        )
    ]
    for n in notifs:
        db.add(n)

    db.commit()
    print(f"[SmartPulse] Database successfully seeded with {order_seq - 1001} historical orders!")

