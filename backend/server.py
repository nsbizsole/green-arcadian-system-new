from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'green-arcadian-secret-key-2026')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

security = HTTPBearer()

app = FastAPI(title="Green Arcadian API", version="1.0.0")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============= MODELS =============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "admin"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    description: Optional[str] = None
    care_info: Optional[str] = None
    image_url: Optional[str] = None
    stock: int = 0
    unit: str = "piece"
    is_featured: bool = False
    is_available: bool = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    care_info: Optional[str] = None
    image_url: Optional[str] = None
    stock: Optional[int] = None
    unit: Optional[str] = None
    is_featured: Optional[bool] = None
    is_available: Optional[bool] = None

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    items: List[Dict[str, Any]]
    subtotal: float
    shipping: float = 0
    total: float
    notes: Optional[str] = None
    order_type: str = "retail"

class CustomerCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    customer_type: str = "retail"
    notes: Optional[str] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    customer_type: Optional[str] = None
    notes: Optional[str] = None

class ExportDocCreate(BaseModel):
    order_id: str
    doc_type: str
    customer_name: str
    destination_country: str
    items: List[Dict[str, Any]]
    total_weight: float
    total_boxes: int
    notes: Optional[str] = None

class InquiryCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    inquiry_type: str = "general"
    message: str

# ============= AUTH HELPERS =============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============= AUTH ROUTES =============

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "full_name": user_data.full_name,
        "role": user_data.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    token = create_token(user_id, user_data.role)
    return {
        "token": token,
        "user": {"id": user_id, "email": user_data.email, "full_name": user_data.full_name, "role": user_data.role}
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["role"])
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "full_name": user["full_name"], "role": user["role"]}
    }

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {"id": user["id"], "email": user["email"], "full_name": user["full_name"], "role": user["role"]}

# ============= PUBLIC ROUTES (No Auth) =============

@api_router.get("/products")
async def get_public_products(category: Optional[str] = None, featured: Optional[bool] = None):
    query = {"is_available": True}
    if category:
        query["category"] = category
    if featured:
        query["is_featured"] = True
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}")
async def get_public_product(product_id: str):
    product = await db.products.find_one({"id": product_id, "is_available": True}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.get("/categories")
async def get_categories():
    categories = await db.products.distinct("category", {"is_available": True})
    return categories

@api_router.post("/inquiries")
async def create_inquiry(inquiry: InquiryCreate):
    inquiry_id = str(uuid.uuid4())
    inquiry_doc = {
        "id": inquiry_id,
        **inquiry.model_dump(),
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.inquiries.insert_one(inquiry_doc)
    inquiry_doc.pop("_id", None)
    return inquiry_doc

@api_router.post("/orders/public")
async def create_public_order(order: OrderCreate):
    order_id = str(uuid.uuid4())
    order_number = f"GA-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
    
    order_doc = {
        "id": order_id,
        "order_number": order_number,
        **order.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(order_doc)
    order_doc.pop("_id", None)
    return order_doc

# ============= ADMIN DASHBOARD =============

@api_router.get("/admin/dashboard")
async def get_dashboard_stats(user: dict = Depends(get_current_user)):
    products_count = await db.products.count_documents({})
    low_stock = await db.products.count_documents({"stock": {"$lte": 10}})
    
    orders_count = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"status": "pending"})
    
    customers_count = await db.customers.count_documents({})
    inquiries_count = await db.inquiries.count_documents({"status": "new"})
    
    # Calculate revenue
    total_revenue = 0
    async for order in db.orders.find({"status": {"$in": ["completed", "shipped"]}}, {"total": 1}):
        total_revenue += order.get("total", 0)
    
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "inventory": {"total_products": products_count, "low_stock": low_stock},
        "orders": {"total": orders_count, "pending": pending_orders},
        "customers": {"total": customers_count},
        "inquiries": {"new": inquiries_count},
        "revenue": {"total": total_revenue},
        "recent_orders": recent_orders
    }

# ============= INVENTORY MANAGEMENT =============

@api_router.get("/admin/inventory")
async def get_inventory(user: dict = Depends(get_current_user), category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    return products

@api_router.post("/admin/inventory")
async def create_product(product: ProductCreate, user: dict = Depends(get_current_user)):
    product_id = str(uuid.uuid4())
    sku = f"GA-{product.category[:3].upper()}-{str(uuid.uuid4())[:6].upper()}"
    
    product_doc = {
        "id": product_id,
        "sku": sku,
        **product.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.products.insert_one(product_doc)
    product_doc.pop("_id", None)
    return product_doc

@api_router.put("/admin/inventory/{product_id}")
async def update_product(product_id: str, update: ProductUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.products.update_one({"id": product_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return await db.products.find_one({"id": product_id}, {"_id": 0})

@api_router.delete("/admin/inventory/{product_id}")
async def delete_product(product_id: str, user: dict = Depends(get_current_user)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ============= ORDERS MANAGEMENT =============

@api_router.get("/admin/orders")
async def get_orders(user: dict = Depends(get_current_user), status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.get("/admin/orders/{order_id}")
async def get_order(order_id: str, user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str = Query(...), user: dict = Depends(get_current_user)):
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return await db.orders.find_one({"id": order_id}, {"_id": 0})

# ============= CUSTOMERS MANAGEMENT =============

@api_router.get("/admin/customers")
async def get_customers(user: dict = Depends(get_current_user), customer_type: Optional[str] = None):
    query = {}
    if customer_type:
        query["customer_type"] = customer_type
    
    customers = await db.customers.find(query, {"_id": 0}).to_list(1000)
    return customers

@api_router.post("/admin/customers")
async def create_customer(customer: CustomerCreate, user: dict = Depends(get_current_user)):
    customer_id = str(uuid.uuid4())
    customer_doc = {
        "id": customer_id,
        **customer.model_dump(),
        "total_orders": 0,
        "total_spent": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.customers.insert_one(customer_doc)
    customer_doc.pop("_id", None)
    return customer_doc

@api_router.put("/admin/customers/{customer_id}")
async def update_customer(customer_id: str, update: CustomerUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.customers.update_one({"id": customer_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return await db.customers.find_one({"id": customer_id}, {"_id": 0})

@api_router.delete("/admin/customers/{customer_id}")
async def delete_customer(customer_id: str, user: dict = Depends(get_current_user)):
    result = await db.customers.delete_one({"id": customer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted"}

# ============= EXPORT DOCUMENTATION =============

@api_router.get("/admin/exports")
async def get_export_docs(user: dict = Depends(get_current_user)):
    docs = await db.export_docs.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs

@api_router.post("/admin/exports")
async def create_export_doc(doc: ExportDocCreate, user: dict = Depends(get_current_user)):
    doc_id = str(uuid.uuid4())
    doc_number = f"EXP-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
    
    doc_dict = {
        "id": doc_id,
        "doc_number": doc_number,
        **doc.model_dump(),
        "status": "draft",
        "created_by": user["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.export_docs.insert_one(doc_dict)
    doc_dict.pop("_id", None)
    return doc_dict

@api_router.get("/admin/exports/{doc_id}")
async def get_export_doc(doc_id: str, user: dict = Depends(get_current_user)):
    doc = await db.export_docs.find_one({"id": doc_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@api_router.put("/admin/exports/{doc_id}/status")
async def update_export_status(doc_id: str, status: str = Query(...), user: dict = Depends(get_current_user)):
    result = await db.export_docs.update_one(
        {"id": doc_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return await db.export_docs.find_one({"id": doc_id}, {"_id": 0})

# ============= INQUIRIES =============

@api_router.get("/admin/inquiries")
async def get_inquiries(user: dict = Depends(get_current_user), status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    
    inquiries = await db.inquiries.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return inquiries

@api_router.put("/admin/inquiries/{inquiry_id}/status")
async def update_inquiry_status(inquiry_id: str, status: str = Query(...), user: dict = Depends(get_current_user)):
    result = await db.inquiries.update_one(
        {"id": inquiry_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return await db.inquiries.find_one({"id": inquiry_id}, {"_id": 0})

# ============= ROOT =============

@api_router.get("/")
async def root():
    return {"message": "Green Arcadian API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
