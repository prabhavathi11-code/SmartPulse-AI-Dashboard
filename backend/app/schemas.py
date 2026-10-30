from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    sku: str
    category: str
    price: float
    cost_price: float
    stock_quantity: int
    min_stock_threshold: int = 15
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CustomerBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = "Hyderabad, IN"
    segment: Optional[str] = "Regular"

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    quantity: int
    unit_price: float
    unit_cost: float
    subtotal: float
    model_config = ConfigDict(from_attributes=True)

class OrderCreate(BaseModel):
    customer_id: int
    payment_method: Optional[str] = "UPI / Card"
    items: List[OrderItemCreate]

class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_id: int
    customer_name: Optional[str] = None
    total_amount: float
    profit_amount: float
    status: str
    payment_method: str
    created_at: datetime
    items: List[OrderItemResponse] = []
    model_config = ConfigDict(from_attributes=True)

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class KPISummaryResponse(BaseModel):
    total_revenue: float
    total_orders: int
    total_customers: int
    total_profit: float
    profit_margin: float
    revenue_growth_pct: float
    avg_order_value: float
    low_stock_count: int

class SalesTrendItem(BaseModel):
    date: str
    revenue: float
    orders: int
    profit: float

class CategorySalesItem(BaseModel):
    category: str
    revenue: float
    units_sold: int
    percentage: float

class TopProductItem(BaseModel):
    id: int
    name: str
    category: str
    price: float
    units_sold: int
    total_revenue: float
    total_profit: float
    stock_quantity: int
    is_low_stock: bool

class ForecastPoint(BaseModel):
    date: str
    actual_sales: Optional[float] = None
    predicted_sales: Optional[float] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    is_forecast: bool = False

class ForecastResponse(BaseModel):
    timeline: List[ForecastPoint]
    metrics: Dict[str, Any]
    trend_direction: str
    trend_percentage: float
    insights: List[str]
    recommendations: List[str]

class AssistantRequest(BaseModel):
    message: str

class AssistantResponse(BaseModel):
    query: str
    reply: str
    intent: str
    data_context: Optional[Dict[str, Any]] = None
    suggestions: List[str] = []

