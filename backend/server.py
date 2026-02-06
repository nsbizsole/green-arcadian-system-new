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
JWT_SECRET = os.environ.get('JWT_SECRET', 'greenforge-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Security
security = HTTPBearer()

app = FastAPI(title="GreenForge OS API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============= MODELS =============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company_name: Optional[str] = None
    role: str = "admin"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    company_name: Optional[str]
    role: str
    tenant_id: str
    created_at: str

class TenantCreate(BaseModel):
    name: str
    business_type: str = "nursery"
    currency: str = "USD"
    country: str = "US"

class PlantCreate(BaseModel):
    name: str
    scientific_name: Optional[str] = None
    category: str
    growth_stage: str = "seedling"
    price: float
    cost: float = 0
    quantity: int = 0
    min_stock: int = 10
    location: str = "main"
    description: Optional[str] = None
    care_instructions: Optional[str] = None
    image_url: Optional[str] = None

class PlantUpdate(BaseModel):
    name: Optional[str] = None
    scientific_name: Optional[str] = None
    category: Optional[str] = None
    growth_stage: Optional[str] = None
    price: Optional[float] = None
    cost: Optional[float] = None
    quantity: Optional[int] = None
    min_stock: Optional[int] = None
    location: Optional[str] = None
    description: Optional[str] = None
    care_instructions: Optional[str] = None
    image_url: Optional[str] = None

class ReservationCreate(BaseModel):
    plant_id: str
    quantity: int
    customer_name: str
    customer_email: Optional[str] = None
    notes: Optional[str] = None
    expires_at: Optional[str] = None

class LeadCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: str = "website"
    status: str = "new"
    notes: Optional[str] = None
    assigned_to: Optional[str] = None

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    assigned_to: Optional[str] = None

class QuoteCreate(BaseModel):
    lead_id: str
    items: List[Dict[str, Any]]
    subtotal: float
    discount: float = 0
    tax: float = 0
    total: float
    valid_until: str
    notes: Optional[str] = None

class ProjectCreate(BaseModel):
    name: str
    client_name: str
    client_email: Optional[str] = None
    description: Optional[str] = None
    start_date: str
    end_date: str
    budget: float = 0
    status: str = "planning"
    project_type: str = "landscaping"

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget: Optional[float] = None
    status: Optional[str] = None
    project_type: Optional[str] = None

class TaskCreate(BaseModel):
    project_id: str
    title: str
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    start_date: str
    end_date: str
    status: str = "pending"
    priority: str = "medium"

class PartnerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    commission_rate: float = 10.0
    status: str = "active"

class AMCSubscriptionCreate(BaseModel):
    client_name: str
    client_email: str
    client_phone: Optional[str] = None
    service_type: str
    frequency: str = "monthly"
    amount: float
    start_date: str
    property_address: Optional[str] = None
    notes: Optional[str] = None

class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    description: Optional[str] = None
    image_url: Optional[str] = None
    stock: int = 0
    is_gift: bool = False
    is_featured: bool = False

class OrderCreate(BaseModel):
    items: List[Dict[str, Any]]
    subtotal: float
    shipping: float = 0
    tax: float = 0
    total: float
    shipping_address: Dict[str, str]
    is_gift: bool = False
    gift_message: Optional[str] = None

class CourseCreate(BaseModel):
    title: str
    description: str
    instructor: str
    duration: str
    level: str = "beginner"
    price: float = 0
    image_url: Optional[str] = None
    modules: List[Dict[str, Any]] = []

# ============= AUTH HELPERS =============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, tenant_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "tenant_id": tenant_id,
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
    
    tenant_id = str(uuid.uuid4())
    tenant = {
        "id": tenant_id,
        "name": user_data.company_name or f"{user_data.full_name}'s Business",
        "business_type": "nursery",
        "currency": "USD",
        "country": "US",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.tenants.insert_one(tenant)
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "full_name": user_data.full_name,
        "company_name": user_data.company_name,
        "role": user_data.role,
        "tenant_id": tenant_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    token = create_token(user_id, tenant_id, user_data.role)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user_data.email,
            "full_name": user_data.full_name,
            "company_name": user_data.company_name,
            "role": user_data.role,
            "tenant_id": tenant_id
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["tenant_id"], user["role"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "company_name": user.get("company_name"),
            "role": user["role"],
            "tenant_id": user["tenant_id"]
        }
    }

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "company_name": user.get("company_name"),
        "role": user["role"],
        "tenant_id": user["tenant_id"]
    }

# ============= DASHBOARD ROUTES =============

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user: dict = Depends(get_current_user)):
    tenant_id = user["tenant_id"]
    
    plants_count = await db.plants.count_documents({"tenant_id": tenant_id})
    total_stock = 0
    low_stock = 0
    
    async for plant in db.plants.find({"tenant_id": tenant_id}, {"_id": 0}):
        total_stock += plant.get("quantity", 0)
        if plant.get("quantity", 0) <= plant.get("min_stock", 10):
            low_stock += 1
    
    leads_count = await db.leads.count_documents({"tenant_id": tenant_id})
    active_leads = await db.leads.count_documents({"tenant_id": tenant_id, "status": {"$in": ["new", "contacted", "qualified"]}})
    
    projects_count = await db.projects.count_documents({"tenant_id": tenant_id})
    active_projects = await db.projects.count_documents({"tenant_id": tenant_id, "status": {"$in": ["planning", "in_progress"]}})
    
    amc_count = await db.amc_subscriptions.count_documents({"tenant_id": tenant_id, "status": "active"})
    
    orders_count = await db.orders.count_documents({"tenant_id": tenant_id})
    
    partners_count = await db.partners.count_documents({"tenant_id": tenant_id, "status": "active"})
    
    return {
        "inventory": {
            "total_plants": plants_count,
            "total_stock": total_stock,
            "low_stock_alerts": low_stock
        },
        "crm": {
            "total_leads": leads_count,
            "active_leads": active_leads
        },
        "projects": {
            "total": projects_count,
            "active": active_projects
        },
        "amc": {
            "active_subscriptions": amc_count
        },
        "ecommerce": {
            "total_orders": orders_count
        },
        "partners": {
            "active": partners_count
        }
    }

# ============= INVENTORY ROUTES =============

@api_router.get("/inventory/plants")
async def get_plants(
    user: dict = Depends(get_current_user),
    category: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    low_stock: Optional[bool] = None
):
    tenant_id = user["tenant_id"]
    query = {"tenant_id": tenant_id}
    
    if category:
        query["category"] = category
    if location:
        query["location"] = location
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"scientific_name": {"$regex": search, "$options": "i"}}
        ]
    
    plants = await db.plants.find(query, {"_id": 0}).to_list(1000)
    
    if low_stock:
        plants = [p for p in plants if p.get("quantity", 0) <= p.get("min_stock", 10)]
    
    return plants

@api_router.post("/inventory/plants")
async def create_plant(plant: PlantCreate, user: dict = Depends(get_current_user)):
    plant_id = str(uuid.uuid4())
    plant_doc = {
        "id": plant_id,
        "tenant_id": user["tenant_id"],
        **plant.model_dump(),
        "reserved": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.plants.insert_one(plant_doc)
    del plant_doc["_id"] if "_id" in plant_doc else None
    return plant_doc

@api_router.get("/inventory/plants/{plant_id}")
async def get_plant(plant_id: str, user: dict = Depends(get_current_user)):
    plant = await db.plants.find_one({"id": plant_id, "tenant_id": user["tenant_id"]}, {"_id": 0})
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant

@api_router.put("/inventory/plants/{plant_id}")
async def update_plant(plant_id: str, update: PlantUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.plants.update_one(
        {"id": plant_id, "tenant_id": user["tenant_id"]},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    return await db.plants.find_one({"id": plant_id}, {"_id": 0})

@api_router.delete("/inventory/plants/{plant_id}")
async def delete_plant(plant_id: str, user: dict = Depends(get_current_user)):
    result = await db.plants.delete_one({"id": plant_id, "tenant_id": user["tenant_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plant not found")
    return {"message": "Plant deleted"}

@api_router.post("/inventory/reservations")
async def create_reservation(reservation: ReservationCreate, user: dict = Depends(get_current_user)):
    plant = await db.plants.find_one({"id": reservation.plant_id, "tenant_id": user["tenant_id"]}, {"_id": 0})
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    available = plant.get("quantity", 0) - plant.get("reserved", 0)
    if reservation.quantity > available:
        raise HTTPException(status_code=400, detail=f"Only {available} units available for reservation")
    
    reservation_id = str(uuid.uuid4())
    reservation_doc = {
        "id": reservation_id,
        "tenant_id": user["tenant_id"],
        **reservation.model_dump(),
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reservations.insert_one(reservation_doc)
    
    await db.plants.update_one(
        {"id": reservation.plant_id},
        {"$inc": {"reserved": reservation.quantity}}
    )
    
    del reservation_doc["_id"] if "_id" in reservation_doc else None
    return reservation_doc

@api_router.get("/inventory/reservations")
async def get_reservations(user: dict = Depends(get_current_user)):
    reservations = await db.reservations.find({"tenant_id": user["tenant_id"]}, {"_id": 0}).to_list(1000)
    return reservations

@api_router.delete("/inventory/reservations/{reservation_id}")
async def cancel_reservation(reservation_id: str, user: dict = Depends(get_current_user)):
    reservation = await db.reservations.find_one({"id": reservation_id, "tenant_id": user["tenant_id"]}, {"_id": 0})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    await db.plants.update_one(
        {"id": reservation["plant_id"]},
        {"$inc": {"reserved": -reservation["quantity"]}}
    )
    
    await db.reservations.delete_one({"id": reservation_id})
    return {"message": "Reservation cancelled"}

@api_router.get("/inventory/categories")
async def get_categories(user: dict = Depends(get_current_user)):
    categories = await db.plants.distinct("category", {"tenant_id": user["tenant_id"]})
    return categories

@api_router.get("/inventory/locations")
async def get_locations(user: dict = Depends(get_current_user)):
    locations = await db.plants.distinct("location", {"tenant_id": user["tenant_id"]})
    return locations

# ============= CRM ROUTES =============

@api_router.get("/crm/leads")
async def get_leads(
    user: dict = Depends(get_current_user),
    status: Optional[str] = None,
    source: Optional[str] = None
):
    query = {"tenant_id": user["tenant_id"]}
    if status:
        query["status"] = status
    if source:
        query["source"] = source
    
    leads = await db.leads.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return leads

@api_router.post("/crm/leads")
async def create_lead(lead: LeadCreate, user: dict = Depends(get_current_user)):
    lead_id = str(uuid.uuid4())
    lead_doc = {
        "id": lead_id,
        "tenant_id": user["tenant_id"],
        **lead.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.leads.insert_one(lead_doc)
    del lead_doc["_id"] if "_id" in lead_doc else None
    return lead_doc

@api_router.get("/crm/leads/{lead_id}")
async def get_lead(lead_id: str, user: dict = Depends(get_current_user)):
    lead = await db.leads.find_one({"id": lead_id, "tenant_id": user["tenant_id"]}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@api_router.put("/crm/leads/{lead_id}")
async def update_lead(lead_id: str, update: LeadUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.leads.update_one(
        {"id": lead_id, "tenant_id": user["tenant_id"]},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    return await db.leads.find_one({"id": lead_id}, {"_id": 0})

@api_router.delete("/crm/leads/{lead_id}")
async def delete_lead(lead_id: str, user: dict = Depends(get_current_user)):
    result = await db.leads.delete_one({"id": lead_id, "tenant_id": user["tenant_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted"}

@api_router.get("/crm/quotes")
async def get_quotes(user: dict = Depends(get_current_user)):
    quotes = await db.quotes.find({"tenant_id": user["tenant_id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return quotes

@api_router.post("/crm/quotes")
async def create_quote(quote: QuoteCreate, user: dict = Depends(get_current_user)):
    quote_id = str(uuid.uuid4())
    quote_number = f"QT-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
    
    quote_doc = {
        "id": quote_id,
        "quote_number": quote_number,
        "tenant_id": user["tenant_id"],
        **quote.model_dump(),
        "status": "draft",
        "created_by": user["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.quotes.insert_one(quote_doc)
    del quote_doc["_id"] if "_id" in quote_doc else None
    return quote_doc

@api_router.put("/crm/quotes/{quote_id}/status")
async def update_quote_status(quote_id: str, status: str = Query(...), user: dict = Depends(get_current_user)):
    result = await db.quotes.update_one(
        {"id": quote_id, "tenant_id": user["tenant_id"]},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Quote not found")
    return await db.quotes.find_one({"id": quote_id}, {"_id": 0})

# ============= PROJECT ROUTES =============

@api_router.get("/projects")
async def get_projects(user: dict = Depends(get_current_user), status: Optional[str] = None):
    query = {"tenant_id": user["tenant_id"]}
    if status:
        query["status"] = status
    
    projects = await db.projects.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return projects

@api_router.post("/projects")
async def create_project(project: ProjectCreate, user: dict = Depends(get_current_user)):
    project_id = str(uuid.uuid4())
    project_doc = {
        "id": project_id,
        "tenant_id": user["tenant_id"],
        **project.model_dump(),
        "created_by": user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.projects.insert_one(project_doc)
    del project_doc["_id"] if "_id" in project_doc else None
    return project_doc

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str, user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id, "tenant_id": user["tenant_id"]}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@api_router.put("/projects/{project_id}")
async def update_project(project_id: str, update: ProjectUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.projects.update_one(
        {"id": project_id, "tenant_id": user["tenant_id"]},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return await db.projects.find_one({"id": project_id}, {"_id": 0})

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, user: dict = Depends(get_current_user)):
    result = await db.projects.delete_one({"id": project_id, "tenant_id": user["tenant_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.tasks.delete_many({"project_id": project_id})
    return {"message": "Project deleted"}

@api_router.get("/projects/{project_id}/tasks")
async def get_project_tasks(project_id: str, user: dict = Depends(get_current_user)):
    tasks = await db.tasks.find({"project_id": project_id, "tenant_id": user["tenant_id"]}, {"_id": 0}).to_list(1000)
    return tasks

@api_router.post("/projects/tasks")
async def create_task(task: TaskCreate, user: dict = Depends(get_current_user)):
    task_id = str(uuid.uuid4())
    task_doc = {
        "id": task_id,
        "tenant_id": user["tenant_id"],
        **task.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.tasks.insert_one(task_doc)
    del task_doc["_id"] if "_id" in task_doc else None
    return task_doc

@api_router.put("/projects/tasks/{task_id}")
async def update_task(task_id: str, status: str = Query(...), user: dict = Depends(get_current_user)):
    result = await db.tasks.update_one(
        {"id": task_id, "tenant_id": user["tenant_id"]},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return await db.tasks.find_one({"id": task_id}, {"_id": 0})

# ============= PARTNER ROUTES =============

@api_router.get("/partners")
async def get_partners(user: dict = Depends(get_current_user)):
    partners = await db.partners.find({"tenant_id": user["tenant_id"]}, {"_id": 0}).to_list(1000)
    return partners

@api_router.post("/partners")
async def create_partner(partner: PartnerCreate, user: dict = Depends(get_current_user)):
    existing = await db.partners.find_one({"email": partner.email, "tenant_id": user["tenant_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Partner with this email already exists")
    
    partner_id = str(uuid.uuid4())
    partner_doc = {
        "id": partner_id,
        "tenant_id": user["tenant_id"],
        **partner.model_dump(),
        "total_sales": 0,
        "total_commission": 0,
        "pending_commission": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.partners.insert_one(partner_doc)
    del partner_doc["_id"] if "_id" in partner_doc else None
    return partner_doc

@api_router.get("/partners/{partner_id}")
async def get_partner(partner_id: str, user: dict = Depends(get_current_user)):
    partner = await db.partners.find_one({"id": partner_id, "tenant_id": user["tenant_id"]}, {"_id": 0})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    return partner

@api_router.post("/partners/{partner_id}/deals")
async def create_deal(partner_id: str, deal: Dict[str, Any], user: dict = Depends(get_current_user)):
    partner = await db.partners.find_one({"id": partner_id, "tenant_id": user["tenant_id"]}, {"_id": 0})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    deal_id = str(uuid.uuid4())
    commission = deal.get("amount", 0) * (partner["commission_rate"] / 100)
    
    deal_doc = {
        "id": deal_id,
        "partner_id": partner_id,
        "tenant_id": user["tenant_id"],
        "client_name": deal.get("client_name"),
        "amount": deal.get("amount", 0),
        "commission": commission,
        "status": "pending",
        "locked": True,
        "locked_at": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.deals.insert_one(deal_doc)
    
    await db.partners.update_one(
        {"id": partner_id},
        {"$inc": {"total_sales": deal.get("amount", 0), "pending_commission": commission}}
    )
    
    del deal_doc["_id"] if "_id" in deal_doc else None
    return deal_doc

@api_router.get("/partners/{partner_id}/deals")
async def get_partner_deals(partner_id: str, user: dict = Depends(get_current_user)):
    deals = await db.deals.find({"partner_id": partner_id, "tenant_id": user["tenant_id"]}, {"_id": 0}).to_list(1000)
    return deals

@api_router.post("/partners/deals/{deal_id}/complete")
async def complete_deal(deal_id: str, user: dict = Depends(get_current_user)):
    deal = await db.deals.find_one({"id": deal_id, "tenant_id": user["tenant_id"]}, {"_id": 0})
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    if deal["status"] != "pending":
        raise HTTPException(status_code=400, detail="Deal is not pending")
    
    await db.deals.update_one(
        {"id": deal_id},
        {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    await db.partners.update_one(
        {"id": deal["partner_id"]},
        {
            "$inc": {
                "pending_commission": -deal["commission"],
                "total_commission": deal["commission"]
            }
        }
    )
    
    return {"message": "Deal completed, commission released"}

# ============= AMC ROUTES =============

@api_router.get("/amc/subscriptions")
async def get_amc_subscriptions(user: dict = Depends(get_current_user)):
    subscriptions = await db.amc_subscriptions.find({"tenant_id": user["tenant_id"]}, {"_id": 0}).to_list(1000)
    return subscriptions

@api_router.post("/amc/subscriptions")
async def create_amc_subscription(subscription: AMCSubscriptionCreate, user: dict = Depends(get_current_user)):
    sub_id = str(uuid.uuid4())
    
    next_billing = datetime.now(timezone.utc)
    if subscription.frequency == "monthly":
        next_billing += timedelta(days=30)
    elif subscription.frequency == "quarterly":
        next_billing += timedelta(days=90)
    elif subscription.frequency == "yearly":
        next_billing += timedelta(days=365)
    
    sub_doc = {
        "id": sub_id,
        "tenant_id": user["tenant_id"],
        **subscription.model_dump(),
        "status": "active",
        "next_billing_date": next_billing.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.amc_subscriptions.insert_one(sub_doc)
    del sub_doc["_id"] if "_id" in sub_doc else None
    return sub_doc

@api_router.get("/amc/subscriptions/{sub_id}")
async def get_amc_subscription(sub_id: str, user: dict = Depends(get_current_user)):
    subscription = await db.amc_subscriptions.find_one({"id": sub_id, "tenant_id": user["tenant_id"]}, {"_id": 0})
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return subscription

@api_router.post("/amc/subscriptions/{sub_id}/invoice")
async def generate_amc_invoice(sub_id: str, user: dict = Depends(get_current_user)):
    subscription = await db.amc_subscriptions.find_one({"id": sub_id, "tenant_id": user["tenant_id"]}, {"_id": 0})
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    invoice_id = str(uuid.uuid4())
    invoice_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
    
    invoice = {
        "id": invoice_id,
        "invoice_number": invoice_number,
        "tenant_id": user["tenant_id"],
        "subscription_id": sub_id,
        "client_name": subscription["client_name"],
        "client_email": subscription["client_email"],
        "amount": subscription["amount"],
        "service_type": subscription["service_type"],
        "status": "pending",
        "due_date": (datetime.now(timezone.utc) + timedelta(days=15)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.invoices.insert_one(invoice)
    
    next_billing = datetime.fromisoformat(subscription["next_billing_date"].replace('Z', '+00:00'))
    if subscription["frequency"] == "monthly":
        next_billing += timedelta(days=30)
    elif subscription["frequency"] == "quarterly":
        next_billing += timedelta(days=90)
    elif subscription["frequency"] == "yearly":
        next_billing += timedelta(days=365)
    
    await db.amc_subscriptions.update_one(
        {"id": sub_id},
        {"$set": {"next_billing_date": next_billing.isoformat()}}
    )
    
    del invoice["_id"] if "_id" in invoice else None
    return invoice

@api_router.get("/amc/invoices")
async def get_invoices(user: dict = Depends(get_current_user)):
    invoices = await db.invoices.find({"tenant_id": user["tenant_id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return invoices

# ============= E-COMMERCE ROUTES =============

@api_router.get("/store/products")
async def get_products(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None
):
    query = {"is_active": True}
    if category:
        query["category"] = category
    if featured:
        query["is_featured"] = True
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    return products

@api_router.post("/store/products")
async def create_product(product: ProductCreate, user: dict = Depends(get_current_user)):
    product_id = str(uuid.uuid4())
    product_doc = {
        "id": product_id,
        "tenant_id": user["tenant_id"],
        **product.model_dump(),
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.products.insert_one(product_doc)
    del product_doc["_id"] if "_id" in product_doc else None
    return product_doc

@api_router.get("/store/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id, "is_active": True}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/store/orders")
async def create_order(order: OrderCreate, user: dict = Depends(get_current_user)):
    order_id = str(uuid.uuid4())
    order_number = f"ORD-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
    
    order_doc = {
        "id": order_id,
        "order_number": order_number,
        "tenant_id": user["tenant_id"],
        "user_id": user["id"],
        **order.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(order_doc)
    del order_doc["_id"] if "_id" in order_doc else None
    return order_doc

@api_router.get("/store/orders")
async def get_orders(user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"tenant_id": user["tenant_id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.get("/store/orders/{order_id}")
async def get_order(order_id: str, user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "tenant_id": user["tenant_id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# ============= COURSES ROUTES =============

@api_router.get("/courses")
async def get_courses():
    courses = await db.courses.find({"is_published": True}, {"_id": 0}).to_list(1000)
    return courses

@api_router.post("/courses")
async def create_course(course: CourseCreate, user: dict = Depends(get_current_user)):
    course_id = str(uuid.uuid4())
    course_doc = {
        "id": course_id,
        "tenant_id": user["tenant_id"],
        **course.model_dump(),
        "is_published": True,
        "enrolled_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.courses.insert_one(course_doc)
    del course_doc["_id"] if "_id" in course_doc else None
    return course_doc

@api_router.get("/courses/{course_id}")
async def get_course(course_id: str):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

# ============= ROOT =============

@api_router.get("/")
async def root():
    return {"message": "GreenForge OS API", "version": "1.0.0"}

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
