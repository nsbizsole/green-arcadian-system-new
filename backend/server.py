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

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'green-arcadian-secret-2026')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

security = HTTPBearer()

app = FastAPI(title="Green Arcadian API", version="2.0.0")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============= MODELS =============

ROLES = ["admin", "partner", "vendor", "customer", "crew", "manager"]
ACCOUNT_STATUS = ["pending", "active", "suspended", "rejected"]

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    role: str = "customer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    avatar_url: Optional[str] = None

class AdminUserUpdate(BaseModel):
    status: Optional[str] = None
    role: Optional[str] = None

# Inventory Models
class PlantCreate(BaseModel):
    name: str
    scientific_name: Optional[str] = None
    category: str
    growth_stage: str = "seedling"
    batch_number: Optional[str] = None
    price: float
    cost: float = 0
    quantity: int = 0
    reserved: int = 0
    min_stock: int = 10
    location: str = "main"
    description: Optional[str] = None
    care_info: Optional[str] = None
    image_url: Optional[str] = None

class PlantUpdate(BaseModel):
    name: Optional[str] = None
    scientific_name: Optional[str] = None
    category: Optional[str] = None
    growth_stage: Optional[str] = None
    batch_number: Optional[str] = None
    price: Optional[float] = None
    cost: Optional[float] = None
    quantity: Optional[int] = None
    reserved: Optional[int] = None
    min_stock: Optional[int] = None
    location: Optional[str] = None
    description: Optional[str] = None
    care_info: Optional[str] = None
    image_url: Optional[str] = None

# Project Models
class ProjectCreate(BaseModel):
    name: str
    client_id: Optional[str] = None
    client_name: str
    client_email: Optional[str] = None
    client_phone: Optional[str] = None
    project_type: str = "landscaping"
    description: Optional[str] = None
    site_address: str
    start_date: str
    end_date: str
    budget: float = 0
    boq_items: List[Dict[str, Any]] = []

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget: Optional[float] = None
    boq_items: Optional[List[Dict[str, Any]]] = None

class TaskCreate(BaseModel):
    project_id: str
    title: str
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    start_date: str
    end_date: str
    priority: str = "medium"

class CrewLogCreate(BaseModel):
    project_id: str
    crew_member_id: str
    date: str
    hours_worked: float
    tasks_completed: str
    notes: Optional[str] = None

# AMC Models
class AMCCreate(BaseModel):
    client_name: str
    client_email: str
    client_phone: Optional[str] = None
    service_type: str
    frequency: str = "monthly"
    amount: float
    start_date: str
    property_address: str
    services_included: List[str] = []
    notes: Optional[str] = None

class AMCVisitCreate(BaseModel):
    subscription_id: str
    scheduled_date: str
    crew_assigned: Optional[str] = None
    notes: Optional[str] = None

# Partner Models
class PartnerDealCreate(BaseModel):
    client_name: str
    client_email: Optional[str] = None
    deal_value: float
    description: Optional[str] = None

# Order Models
class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    items: List[Dict[str, Any]]
    subtotal: float
    discount: float = 0
    shipping: float = 0
    total: float
    order_type: str = "retail"
    is_gift: bool = False
    gift_message: Optional[str] = None
    notes: Optional[str] = None

# RFQ Models
class RFQCreate(BaseModel):
    company_name: str
    contact_name: str
    email: str
    phone: Optional[str] = None
    items: List[Dict[str, Any]]
    delivery_date: str
    delivery_address: str
    notes: Optional[str] = None

# Export Models
class ExportDocCreate(BaseModel):
    order_id: Optional[str] = None
    doc_type: str
    customer_name: str
    destination_country: str
    items: List[Dict[str, Any]]
    total_weight: float
    total_boxes: int
    shipping_method: str = "air"
    notes: Optional[str] = None

# Production Models
class ProductionCreate(BaseModel):
    product_type: str
    name: str
    description: Optional[str] = None
    components: List[Dict[str, Any]] = []
    quantity: int
    cost_per_unit: float = 0
    sell_price: float = 0

# Inquiry Model
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
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        if user.get("status") != "active":
            raise HTTPException(status_code=403, detail="Account not active")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_roles(allowed_roles: List[str]):
    async def role_checker(user: dict = Depends(get_current_user)):
        if user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker

# ============= AUTH ROUTES =============

@api_router.post("/auth/register")
async def register(data: UserRegister):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    # First admin is auto-approved, others need approval
    admin_count = await db.users.count_documents({"role": "admin", "status": "active"})
    status = "active" if (data.role == "admin" and admin_count == 0) else "pending"
    
    user = {
        "id": user_id,
        "email": data.email,
        "password": hash_password(data.password),
        "full_name": data.full_name,
        "phone": data.phone,
        "company": data.company,
        "address": data.address,
        "role": data.role if data.role in ROLES else "customer",
        "status": status,
        "avatar_url": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    if status == "active":
        token = create_token(user_id, user["role"])
        return {"token": token, "user": {k: v for k, v in user.items() if k != "password" and k != "_id"}, "message": "Account created and activated"}
    
    return {"message": "Account created. Please wait for admin approval.", "status": "pending"}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user.get("status") == "pending":
        raise HTTPException(status_code=403, detail="Account pending approval")
    if user.get("status") == "suspended":
        raise HTTPException(status_code=403, detail="Account suspended")
    if user.get("status") == "rejected":
        raise HTTPException(status_code=403, detail="Account rejected")
    
    token = create_token(user["id"], user["role"])
    user_data = {k: v for k, v in user.items() if k != "password" and k != "_id"}
    return {"token": token, "user": user_data}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

@api_router.put("/auth/profile")
async def update_profile(update: UserUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.users.update_one({"id": user["id"]}, {"$set": update_data})
    return await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})

@api_router.put("/auth/change-password")
async def change_password(old_password: str, new_password: str, user: dict = Depends(get_current_user)):
    full_user = await db.users.find_one({"id": user["id"]})
    if not verify_password(old_password, full_user["password"]):
        raise HTTPException(status_code=400, detail="Current password incorrect")
    await db.users.update_one({"id": user["id"]}, {"$set": {"password": hash_password(new_password)}})
    return {"message": "Password changed successfully"}

# ============= ADMIN USER MANAGEMENT =============

@api_router.get("/admin/users")
async def get_all_users(
    status: Optional[str] = None,
    role: Optional[str] = None,
    user: dict = Depends(require_roles(["admin"]))
):
    query = {}
    if status:
        query["status"] = status
    if role:
        query["role"] = role
    users = await db.users.find(query, {"_id": 0, "password": 0}).sort("created_at", -1).to_list(1000)
    return users

@api_router.get("/admin/users/pending")
async def get_pending_users(user: dict = Depends(require_roles(["admin"]))):
    users = await db.users.find({"status": "pending"}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.put("/admin/users/{user_id}")
async def update_user_admin(user_id: str, update: AdminUserUpdate, user: dict = Depends(require_roles(["admin"]))):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    update_data["updated_by"] = user["id"]
    
    result = await db.users.update_one({"id": user_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})

@api_router.post("/admin/users/{user_id}/approve")
async def approve_user(user_id: str, user: dict = Depends(require_roles(["admin"]))):
    result = await db.users.update_one(
        {"id": user_id, "status": "pending"},
        {"$set": {"status": "active", "approved_at": datetime.now(timezone.utc).isoformat(), "approved_by": user["id"]}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found or not pending")
    return {"message": "User approved"}

@api_router.post("/admin/users/{user_id}/reject")
async def reject_user(user_id: str, user: dict = Depends(require_roles(["admin"]))):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"status": "rejected", "rejected_at": datetime.now(timezone.utc).isoformat(), "rejected_by": user["id"]}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User rejected"}

@api_router.post("/admin/users/{user_id}/suspend")
async def suspend_user(user_id: str, user: dict = Depends(require_roles(["admin"]))):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"status": "suspended", "suspended_at": datetime.now(timezone.utc).isoformat(), "suspended_by": user["id"]}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User suspended"}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, user: dict = Depends(require_roles(["admin"]))):
    if user_id == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

# ============= ADMIN DASHBOARD =============

@api_router.get("/admin/dashboard")
async def get_admin_dashboard(user: dict = Depends(require_roles(["admin", "manager"]))):
    stats = {
        "users": {
            "total": await db.users.count_documents({}),
            "pending": await db.users.count_documents({"status": "pending"}),
            "active": await db.users.count_documents({"status": "active"}),
            "by_role": {}
        },
        "inventory": {
            "total_plants": await db.plants.count_documents({}),
            "low_stock": await db.plants.count_documents({"$expr": {"$lte": ["$quantity", "$min_stock"]}}),
            "total_value": 0
        },
        "projects": {
            "total": await db.projects.count_documents({}),
            "active": await db.projects.count_documents({"status": {"$in": ["planning", "in_progress"]}}),
            "completed": await db.projects.count_documents({"status": "completed"})
        },
        "orders": {
            "total": await db.orders.count_documents({}),
            "pending": await db.orders.count_documents({"status": "pending"}),
            "total_revenue": 0
        },
        "amc": {
            "active": await db.amc_subscriptions.count_documents({"status": "active"}),
            "mrr": 0
        },
        "partners": {
            "active": await db.users.count_documents({"role": "partner", "status": "active"}),
            "pending_commissions": 0
        },
        "recent_orders": [],
        "recent_users": []
    }
    
    # Calculate inventory value
    async for plant in db.plants.find({}, {"quantity": 1, "price": 1}):
        stats["inventory"]["total_value"] += plant.get("quantity", 0) * plant.get("price", 0)
    
    # Calculate revenue
    async for order in db.orders.find({"status": {"$in": ["completed", "shipped"]}}, {"total": 1}):
        stats["orders"]["total_revenue"] += order.get("total", 0)
    
    # Calculate MRR
    async for amc in db.amc_subscriptions.find({"status": "active"}, {"amount": 1, "frequency": 1}):
        amount = amc.get("amount", 0)
        freq = amc.get("frequency", "monthly")
        if freq == "monthly":
            stats["amc"]["mrr"] += amount
        elif freq == "quarterly":
            stats["amc"]["mrr"] += amount / 3
        elif freq == "yearly":
            stats["amc"]["mrr"] += amount / 12
    
    # Calculate pending commissions
    async for deal in db.partner_deals.find({"status": "pending"}, {"commission": 1}):
        stats["partners"]["pending_commissions"] += deal.get("commission", 0)
    
    # User counts by role
    for role in ROLES:
        stats["users"]["by_role"][role] = await db.users.count_documents({"role": role})
    
    # Recent data
    stats["recent_orders"] = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    stats["recent_users"] = await db.users.find({}, {"_id": 0, "password": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    return stats

# ============= INVENTORY (Plants) =============

@api_router.get("/inventory")
async def get_inventory(
    category: Optional[str] = None,
    location: Optional[str] = None,
    growth_stage: Optional[str] = None,
    low_stock: Optional[bool] = None,
    search: Optional[str] = None,
    user: dict = Depends(require_roles(["admin", "manager", "crew"]))
):
    query = {}
    if category:
        query["category"] = category
    if location:
        query["location"] = location
    if growth_stage:
        query["growth_stage"] = growth_stage
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"scientific_name": {"$regex": search, "$options": "i"}},
            {"batch_number": {"$regex": search, "$options": "i"}}
        ]
    
    plants = await db.plants.find(query, {"_id": 0}).to_list(1000)
    
    if low_stock:
        plants = [p for p in plants if p.get("quantity", 0) <= p.get("min_stock", 10)]
    
    return plants

@api_router.post("/inventory")
async def create_plant(plant: PlantCreate, user: dict = Depends(require_roles(["admin", "manager"]))):
    plant_id = str(uuid.uuid4())
    sku = f"GA-{plant.category[:3].upper()}-{str(uuid.uuid4())[:6].upper()}"
    batch = plant.batch_number or f"B-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
    
    plant_doc = {
        "id": plant_id,
        "sku": sku,
        "batch_number": batch,
        **plant.model_dump(),
        "created_by": user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.plants.insert_one(plant_doc)
    plant_doc.pop("_id", None)
    return plant_doc

@api_router.get("/inventory/{plant_id}")
async def get_plant(plant_id: str, user: dict = Depends(require_roles(["admin", "manager", "crew"]))):
    plant = await db.plants.find_one({"id": plant_id}, {"_id": 0})
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant

@api_router.put("/inventory/{plant_id}")
async def update_plant(plant_id: str, update: PlantUpdate, user: dict = Depends(require_roles(["admin", "manager"]))):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    update_data["updated_by"] = user["id"]
    
    result = await db.plants.update_one({"id": plant_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Plant not found")
    return await db.plants.find_one({"id": plant_id}, {"_id": 0})

@api_router.put("/inventory/{plant_id}/stock")
async def update_stock(plant_id: str, quantity_change: int, reason: str, user: dict = Depends(require_roles(["admin", "manager", "crew"]))):
    plant = await db.plants.find_one({"id": plant_id})
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    new_qty = plant.get("quantity", 0) + quantity_change
    if new_qty < 0:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Log stock movement
    movement = {
        "id": str(uuid.uuid4()),
        "plant_id": plant_id,
        "plant_name": plant["name"],
        "quantity_change": quantity_change,
        "new_quantity": new_qty,
        "reason": reason,
        "user_id": user["id"],
        "user_name": user["full_name"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.stock_movements.insert_one(movement)
    
    await db.plants.update_one({"id": plant_id}, {"$set": {"quantity": new_qty, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"message": "Stock updated", "new_quantity": new_qty}

@api_router.delete("/inventory/{plant_id}")
async def delete_plant(plant_id: str, user: dict = Depends(require_roles(["admin"]))):
    result = await db.plants.delete_one({"id": plant_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plant not found")
    return {"message": "Plant deleted"}

@api_router.get("/inventory/categories/list")
async def get_categories(user: dict = Depends(require_roles(["admin", "manager", "crew"]))):
    return await db.plants.distinct("category")

@api_router.get("/inventory/locations/list")
async def get_locations(user: dict = Depends(require_roles(["admin", "manager", "crew"]))):
    return await db.plants.distinct("location")

# ============= PROJECTS (Landscaping) =============

@api_router.get("/projects")
async def get_projects(
    status: Optional[str] = None,
    project_type: Optional[str] = None,
    user: dict = Depends(require_roles(["admin", "manager", "crew"]))
):
    query = {}
    if status:
        query["status"] = status
    if project_type:
        query["project_type"] = project_type
    
    projects = await db.projects.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return projects

@api_router.post("/projects")
async def create_project(project: ProjectCreate, user: dict = Depends(require_roles(["admin", "manager"]))):
    project_id = str(uuid.uuid4())
    project_number = f"PRJ-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
    
    project_doc = {
        "id": project_id,
        "project_number": project_number,
        **project.model_dump(),
        "status": "planning",
        "progress": 0,
        "actual_cost": 0,
        "created_by": user["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.projects.insert_one(project_doc)
    project_doc.pop("_id", None)
    return project_doc

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str, user: dict = Depends(require_roles(["admin", "manager", "crew"]))):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get tasks
    project["tasks"] = await db.project_tasks.find({"project_id": project_id}, {"_id": 0}).to_list(100)
    # Get crew logs
    project["crew_logs"] = await db.crew_logs.find({"project_id": project_id}, {"_id": 0}).to_list(100)
    
    return project

@api_router.put("/projects/{project_id}")
async def update_project(project_id: str, update: ProjectUpdate, user: dict = Depends(require_roles(["admin", "manager"]))):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.projects.update_one({"id": project_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return await db.projects.find_one({"id": project_id}, {"_id": 0})

@api_router.post("/projects/{project_id}/signoff")
async def client_signoff(project_id: str, signature: str, notes: Optional[str] = None, user: dict = Depends(require_roles(["admin", "manager"]))):
    result = await db.projects.update_one(
        {"id": project_id},
        {"$set": {
            "status": "completed",
            "client_signoff": True,
            "signoff_signature": signature,
            "signoff_notes": notes,
            "signoff_date": datetime.now(timezone.utc).isoformat(),
            "signoff_by": user["id"]
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project signed off"}

@api_router.post("/projects/tasks")
async def create_task(task: TaskCreate, user: dict = Depends(require_roles(["admin", "manager"]))):
    task_id = str(uuid.uuid4())
    task_doc = {
        "id": task_id,
        **task.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.project_tasks.insert_one(task_doc)
    task_doc.pop("_id", None)
    return task_doc

@api_router.put("/projects/tasks/{task_id}")
async def update_task(task_id: str, status: str = Query(...), user: dict = Depends(require_roles(["admin", "manager", "crew"]))):
    result = await db.project_tasks.update_one(
        {"id": task_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return await db.project_tasks.find_one({"id": task_id}, {"_id": 0})

@api_router.post("/projects/crew-logs")
async def create_crew_log(log: CrewLogCreate, user: dict = Depends(require_roles(["admin", "manager", "crew"]))):
    log_id = str(uuid.uuid4())
    log_doc = {
        "id": log_id,
        **log.model_dump(),
        "created_by": user["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.crew_logs.insert_one(log_doc)
    log_doc.pop("_id", None)
    return log_doc

@api_router.get("/projects/{project_id}/crew-logs")
async def get_crew_logs(project_id: str, user: dict = Depends(require_roles(["admin", "manager", "crew"]))):
    logs = await db.crew_logs.find({"project_id": project_id}, {"_id": 0}).to_list(1000)
    return logs

# ============= AMC (Maintenance Subscriptions) =============

@api_router.get("/amc")
async def get_amc_subscriptions(
    status: Optional[str] = None,
    user: dict = Depends(require_roles(["admin", "manager"]))
):
    query = {}
    if status:
        query["status"] = status
    
    subs = await db.amc_subscriptions.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return subs

@api_router.post("/amc")
async def create_amc(amc: AMCCreate, user: dict = Depends(require_roles(["admin", "manager"]))):
    sub_id = str(uuid.uuid4())
    contract_number = f"AMC-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
    
    # Calculate next billing date
    next_billing = datetime.fromisoformat(amc.start_date)
    if amc.frequency == "monthly":
        next_billing += timedelta(days=30)
    elif amc.frequency == "quarterly":
        next_billing += timedelta(days=90)
    elif amc.frequency == "yearly":
        next_billing += timedelta(days=365)
    
    sub_doc = {
        "id": sub_id,
        "contract_number": contract_number,
        **amc.model_dump(),
        "status": "active",
        "next_billing_date": next_billing.isoformat(),
        "total_visits": 0,
        "created_by": user["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.amc_subscriptions.insert_one(sub_doc)
    sub_doc.pop("_id", None)
    return sub_doc

@api_router.get("/amc/{sub_id}")
async def get_amc(sub_id: str, user: dict = Depends(require_roles(["admin", "manager"]))):
    sub = await db.amc_subscriptions.find_one({"id": sub_id}, {"_id": 0})
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    sub["visits"] = await db.amc_visits.find({"subscription_id": sub_id}, {"_id": 0}).to_list(100)
    sub["invoices"] = await db.invoices.find({"subscription_id": sub_id}, {"_id": 0}).to_list(100)
    
    return sub

@api_router.post("/amc/{sub_id}/visit")
async def schedule_visit(sub_id: str, visit: AMCVisitCreate, user: dict = Depends(require_roles(["admin", "manager"]))):
    visit_id = str(uuid.uuid4())
    visit_doc = {
        "id": visit_id,
        **visit.model_dump(),
        "status": "scheduled",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.amc_visits.insert_one(visit_doc)
    visit_doc.pop("_id", None)
    return visit_doc

@api_router.put("/amc/visits/{visit_id}/complete")
async def complete_visit(visit_id: str, notes: Optional[str] = None, user: dict = Depends(require_roles(["admin", "manager", "crew"]))):
    result = await db.amc_visits.update_one(
        {"id": visit_id},
        {"$set": {
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "completed_by": user["id"],
            "completion_notes": notes
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Visit not found")
    
    # Update subscription visit count
    visit = await db.amc_visits.find_one({"id": visit_id})
    await db.amc_subscriptions.update_one(
        {"id": visit["subscription_id"]},
        {"$inc": {"total_visits": 1}}
    )
    
    return {"message": "Visit completed"}

@api_router.post("/amc/{sub_id}/invoice")
async def generate_invoice(sub_id: str, user: dict = Depends(require_roles(["admin", "manager"]))):
    sub = await db.amc_subscriptions.find_one({"id": sub_id}, {"_id": 0})
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    invoice_id = str(uuid.uuid4())
    invoice_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
    
    invoice = {
        "id": invoice_id,
        "invoice_number": invoice_number,
        "subscription_id": sub_id,
        "client_name": sub["client_name"],
        "client_email": sub["client_email"],
        "amount": sub["amount"],
        "service_type": sub["service_type"],
        "status": "pending",
        "due_date": (datetime.now(timezone.utc) + timedelta(days=15)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.invoices.insert_one(invoice)
    
    # Update next billing date
    next_billing = datetime.fromisoformat(sub["next_billing_date"])
    if sub["frequency"] == "monthly":
        next_billing += timedelta(days=30)
    elif sub["frequency"] == "quarterly":
        next_billing += timedelta(days=90)
    elif sub["frequency"] == "yearly":
        next_billing += timedelta(days=365)
    
    await db.amc_subscriptions.update_one(
        {"id": sub_id},
        {"$set": {"next_billing_date": next_billing.isoformat()}}
    )
    
    invoice.pop("_id", None)
    return invoice

@api_router.get("/amc/invoices/all")
async def get_all_invoices(status: Optional[str] = None, user: dict = Depends(require_roles(["admin", "manager"]))):
    query = {}
    if status:
        query["status"] = status
    invoices = await db.invoices.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return invoices

# ============= PARTNERS (Sales Commission) =============

@api_router.get("/partners")
async def get_partners(user: dict = Depends(require_roles(["admin", "manager"]))):
    partners = await db.users.find({"role": "partner"}, {"_id": 0, "password": 0}).to_list(1000)
    
    # Enrich with deal stats
    for partner in partners:
        deals = await db.partner_deals.find({"partner_id": partner["id"]}, {"_id": 0}).to_list(1000)
        partner["total_deals"] = len(deals)
        partner["total_sales"] = sum(d.get("deal_value", 0) for d in deals)
        partner["total_commission"] = sum(d.get("commission", 0) for d in deals if d.get("status") == "paid")
        partner["pending_commission"] = sum(d.get("commission", 0) for d in deals if d.get("status") == "pending")
    
    return partners

@api_router.get("/partners/me")
async def get_partner_me(user: dict = Depends(require_roles(["partner"]))):
    deals = await db.partner_deals.find({"partner_id": user["id"]}, {"_id": 0}).to_list(1000)
    
    return {
        "user": user,
        "deals": deals,
        "stats": {
            "total_deals": len(deals),
            "total_sales": sum(d.get("deal_value", 0) for d in deals),
            "total_commission": sum(d.get("commission", 0) for d in deals if d.get("status") == "paid"),
            "pending_commission": sum(d.get("commission", 0) for d in deals if d.get("status") == "pending")
        }
    }

@api_router.post("/partners/deals")
async def create_deal(deal: PartnerDealCreate, user: dict = Depends(require_roles(["partner", "admin"]))):
    # Get partner's commission rate (default 10%)
    partner = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    commission_rate = partner.get("commission_rate", 10)
    
    deal_id = str(uuid.uuid4())
    deal_doc = {
        "id": deal_id,
        "partner_id": user["id"],
        "partner_name": user["full_name"],
        **deal.model_dump(),
        "commission_rate": commission_rate,
        "commission": deal.deal_value * (commission_rate / 100),
        "status": "pending",
        "locked": True,
        "locked_at": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.partner_deals.insert_one(deal_doc)
    deal_doc.pop("_id", None)
    return deal_doc

@api_router.get("/partners/{partner_id}/deals")
async def get_partner_deals(partner_id: str, user: dict = Depends(require_roles(["admin", "manager"]))):
    deals = await db.partner_deals.find({"partner_id": partner_id}, {"_id": 0}).to_list(1000)
    return deals

@api_router.post("/partners/deals/{deal_id}/approve")
async def approve_deal(deal_id: str, user: dict = Depends(require_roles(["admin"]))):
    result = await db.partner_deals.update_one(
        {"id": deal_id, "status": "pending"},
        {"$set": {"status": "approved", "approved_at": datetime.now(timezone.utc).isoformat(), "approved_by": user["id"]}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Deal not found or not pending")
    return {"message": "Deal approved"}

@api_router.post("/partners/deals/{deal_id}/pay")
async def pay_commission(deal_id: str, user: dict = Depends(require_roles(["admin"]))):
    deal = await db.partner_deals.find_one({"id": deal_id, "status": "approved"})
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found or not approved")
    
    await db.partner_deals.update_one(
        {"id": deal_id},
        {"$set": {"status": "paid", "paid_at": datetime.now(timezone.utc).isoformat(), "paid_by": user["id"]}}
    )
    return {"message": "Commission paid", "amount": deal["commission"]}

# ============= ORDERS (E-commerce) =============

@api_router.get("/orders")
async def get_orders(
    status: Optional[str] = None,
    order_type: Optional[str] = None,
    user: dict = Depends(require_roles(["admin", "manager"]))
):
    query = {}
    if status:
        query["status"] = status
    if order_type:
        query["order_type"] = order_type
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.post("/orders")
async def create_order(order: OrderCreate, user: dict = Depends(get_current_user)):
    order_id = str(uuid.uuid4())
    order_number = f"GA-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
    
    order_doc = {
        "id": order_id,
        "order_number": order_number,
        "user_id": user["id"],
        **order.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(order_doc)
    order_doc.pop("_id", None)
    return order_doc

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

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, user: dict = Depends(get_current_user)):
    query = {"id": order_id}
    if user["role"] == "customer":
        query["user_id"] = user["id"]
    
    order = await db.orders.find_one(query, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str = Query(...), user: dict = Depends(require_roles(["admin", "manager"]))):
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return await db.orders.find_one({"id": order_id}, {"_id": 0})

@api_router.get("/orders/my/all")
async def get_my_orders(user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

# ============= RFQ (Bulk Quotes) =============

@api_router.get("/rfq")
async def get_rfqs(status: Optional[str] = None, user: dict = Depends(require_roles(["admin", "manager"]))):
    query = {}
    if status:
        query["status"] = status
    rfqs = await db.rfqs.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return rfqs

@api_router.post("/rfq")
async def create_rfq(rfq: RFQCreate):
    rfq_id = str(uuid.uuid4())
    rfq_number = f"RFQ-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
    
    rfq_doc = {
        "id": rfq_id,
        "rfq_number": rfq_number,
        **rfq.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.rfqs.insert_one(rfq_doc)
    rfq_doc.pop("_id", None)
    return rfq_doc

@api_router.put("/rfq/{rfq_id}/quote")
async def respond_to_rfq(rfq_id: str, quote_amount: float, valid_until: str, notes: Optional[str] = None, user: dict = Depends(require_roles(["admin", "manager"]))):
    result = await db.rfqs.update_one(
        {"id": rfq_id},
        {"$set": {
            "status": "quoted",
            "quote_amount": quote_amount,
            "quote_valid_until": valid_until,
            "quote_notes": notes,
            "quoted_by": user["id"],
            "quoted_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="RFQ not found")
    return await db.rfqs.find_one({"id": rfq_id}, {"_id": 0})

# ============= EXPORT DOCS =============

@api_router.get("/exports")
async def get_exports(status: Optional[str] = None, user: dict = Depends(require_roles(["admin", "manager"]))):
    query = {}
    if status:
        query["status"] = status
    docs = await db.export_docs.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs

@api_router.post("/exports")
async def create_export_doc(doc: ExportDocCreate, user: dict = Depends(require_roles(["admin", "manager"]))):
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

@api_router.get("/exports/{doc_id}")
async def get_export_doc(doc_id: str, user: dict = Depends(require_roles(["admin", "manager"]))):
    doc = await db.export_docs.find_one({"id": doc_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@api_router.put("/exports/{doc_id}/status")
async def update_export_status(doc_id: str, status: str = Query(...), user: dict = Depends(require_roles(["admin", "manager"]))):
    result = await db.export_docs.update_one(
        {"id": doc_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return await db.export_docs.find_one({"id": doc_id}, {"_id": 0})

# ============= PRODUCTION (Value-Added) =============

@api_router.get("/production")
async def get_productions(user: dict = Depends(require_roles(["admin", "manager"]))):
    productions = await db.productions.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return productions

@api_router.post("/production")
async def create_production(prod: ProductionCreate, user: dict = Depends(require_roles(["admin", "manager"]))):
    prod_id = str(uuid.uuid4())
    batch_number = f"PROD-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
    
    prod_doc = {
        "id": prod_id,
        "batch_number": batch_number,
        **prod.model_dump(),
        "status": "in_progress",
        "created_by": user["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.productions.insert_one(prod_doc)
    prod_doc.pop("_id", None)
    return prod_doc

@api_router.put("/production/{prod_id}/complete")
async def complete_production(prod_id: str, actual_quantity: int, user: dict = Depends(require_roles(["admin", "manager"]))):
    result = await db.productions.update_one(
        {"id": prod_id},
        {"$set": {
            "status": "completed",
            "actual_quantity": actual_quantity,
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "completed_by": user["id"]
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Production not found")
    return await db.productions.find_one({"id": prod_id}, {"_id": 0})

# ============= PUBLIC ROUTES =============

@api_router.get("/products")
async def get_public_products(category: Optional[str] = None, featured: Optional[bool] = None):
    query = {"quantity": {"$gt": 0}}
    if category:
        query["category"] = category
    if featured:
        query["is_featured"] = True
    
    products = await db.plants.find(query, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}")
async def get_public_product(product_id: str):
    product = await db.plants.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

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

@api_router.get("/inquiries")
async def get_inquiries(status: Optional[str] = None, user: dict = Depends(require_roles(["admin", "manager"]))):
    query = {}
    if status:
        query["status"] = status
    inquiries = await db.inquiries.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return inquiries

@api_router.put("/inquiries/{inquiry_id}/status")
async def update_inquiry_status(inquiry_id: str, status: str = Query(...), user: dict = Depends(require_roles(["admin", "manager"]))):
    result = await db.inquiries.update_one(
        {"id": inquiry_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return await db.inquiries.find_one({"id": inquiry_id}, {"_id": 0})

# ============= VENDOR PORTAL =============

@api_router.get("/vendor/me")
async def get_vendor_profile(user: dict = Depends(require_roles(["vendor"]))):
    return user

@api_router.get("/vendor/orders")
async def get_vendor_orders(user: dict = Depends(require_roles(["vendor"]))):
    # Vendors see orders for products they supply
    orders = await db.orders.find({"vendor_id": user["id"]}, {"_id": 0}).to_list(100)
    return orders

# ============= CUSTOMER PORTAL =============

@api_router.get("/customer/me")
async def get_customer_profile(user: dict = Depends(require_roles(["customer"]))):
    orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    return {"user": user, "recent_orders": orders}

# ============= CREW PORTAL =============

@api_router.get("/crew/me")
async def get_crew_profile(user: dict = Depends(require_roles(["crew"]))):
    # Get assigned tasks
    tasks = await db.project_tasks.find({"assigned_to": user["id"], "status": {"$ne": "completed"}}, {"_id": 0}).to_list(100)
    # Get recent logs
    logs = await db.crew_logs.find({"crew_member_id": user["id"]}, {"_id": 0}).sort("created_at", -1).limit(20).to_list(20)
    # Get scheduled visits
    visits = await db.amc_visits.find({"crew_assigned": user["id"], "status": "scheduled"}, {"_id": 0}).to_list(100)
    
    return {"user": user, "assigned_tasks": tasks, "recent_logs": logs, "scheduled_visits": visits}

@api_router.post("/crew/log")
async def submit_crew_log(log: CrewLogCreate, user: dict = Depends(require_roles(["crew"]))):
    log_id = str(uuid.uuid4())
    log_doc = {
        "id": log_id,
        **log.model_dump(),
        "crew_member_id": user["id"],
        "crew_member_name": user["full_name"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.crew_logs.insert_one(log_doc)
    log_doc.pop("_id", None)
    return log_doc

# ============= ROOT =============

@api_router.get("/")
async def root():
    return {"message": "Green Arcadian API", "version": "2.0.0"}

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
