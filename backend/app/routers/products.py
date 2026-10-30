from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models import Product, Notification
from app.schemas import ProductResponse, ProductCreate
from app.routers.websocket import manager
import datetime

router = APIRouter(prefix="/api/products", tags=["Products & Inventory"])

@router.get("", response_model=List[ProductResponse])
def get_products(
    category: Optional[str] = None,
    low_stock_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    if low_stock_only:
        query = query.filter(Product.stock_quantity <= Product.min_stock_threshold)

    return query.order_by(Product.name).all()

@router.post("", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(Product).filter(Product.sku == product.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product with this SKU already exists")

    db_prod = Product(**product.model_dump())
    db.add(db_prod)
    db.commit()
    db.refresh(db_prod)
    return db_prod

@router.put("/{product_id}/restock", response_model=ProductResponse)
async def restock_product(
    product_id: int,
    quantity: int = Query(..., ge=1),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.stock_quantity += quantity
    db.commit()
    db.refresh(product)

    # Notify dashboard of stock update
    await manager.broadcast({
        "type": "STOCK_UPDATED",
        "data": {
            "product_id": product.id,
            "product_name": product.name,
            "new_stock": product.stock_quantity
        }
    })

    return product

