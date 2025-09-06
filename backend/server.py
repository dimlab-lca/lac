#!/usr/bin/env python3
"""
Publicity Campaign Ordering API
Modern FastAPI backend for mobile app
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
import jwt
import bcrypt
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()

app = FastAPI(title="Publicity Campaign API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "publicity_campaigns")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
users_collection = db.users
campaigns_collection = db.campaigns
orders_collection = db.orders
ratings_collection = db.ratings

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "publicity-app-secret-key-2025")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

# Pydantic Models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    created_at: datetime
    is_active: bool = True

class CampaignCreate(BaseModel):
    title: str
    description: str
    modalities: List[str]  # video, text, audio
    budget: float
    duration_days: int
    target_audience: str

class Campaign(BaseModel):
    id: str
    title: str
    description: str
    modalities: List[str]
    budget: float
    duration_days: int
    target_audience: str
    created_by: str
    created_at: datetime
    status: str = "active"
    rating: float = 0.0
    total_ratings: int = 0

class OrderCreate(BaseModel):
    campaign_id: str
    selected_modalities: List[str]
    custom_message: Optional[str] = None

class Order(BaseModel):
    id: str
    user_id: str
    campaign_id: str
    selected_modalities: List[str]
    custom_message: Optional[str]
    status: str = "pending"
    created_at: datetime
    total_cost: float

class RatingCreate(BaseModel):
    campaign_id: str
    rating: int  # 1-5
    comment: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

# Utility Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = users_collection.find_one({"username": username})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# Authentication Routes
@app.post("/api/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    if users_collection.find_one({"username": user_data.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    
    if users_collection.find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = hash_password(user_data.password)
    user_doc = {
        "username": user_data.username,
        "email": user_data.email,
        "password": hashed_password,
        "full_name": user_data.full_name,
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    result = users_collection.insert_one(user_doc)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    user = users_collection.find_one({"username": user_credentials.username})
    
    if not user or not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=User)
async def get_current_user_info(current_user = Depends(get_current_user)):
    return User(
        id=str(current_user["_id"]),
        username=current_user["username"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        created_at=current_user["created_at"],
        is_active=current_user["is_active"]
    )

# Campaign Routes
@app.get("/api/campaigns", response_model=List[Campaign])
async def get_campaigns(skip: int = 0, limit: int = 20):
    campaigns = list(campaigns_collection.find().skip(skip).limit(limit))
    
    result = []
    for campaign in campaigns:
        result.append(Campaign(
            id=str(campaign["_id"]),
            title=campaign["title"],
            description=campaign["description"],
            modalities=campaign["modalities"],
            budget=campaign["budget"],
            duration_days=campaign["duration_days"],
            target_audience=campaign["target_audience"],
            created_by=campaign["created_by"],
            created_at=campaign["created_at"],
            status=campaign.get("status", "active"),
            rating=campaign.get("rating", 0.0),
            total_ratings=campaign.get("total_ratings", 0)
        ))
    
    return result

@app.post("/api/campaigns", response_model=Campaign)
async def create_campaign(campaign_data: CampaignCreate, current_user = Depends(get_current_user)):
    campaign_doc = {
        "title": campaign_data.title,
        "description": campaign_data.description,
        "modalities": campaign_data.modalities,
        "budget": campaign_data.budget,
        "duration_days": campaign_data.duration_days,
        "target_audience": campaign_data.target_audience,
        "created_by": current_user["username"],
        "created_at": datetime.utcnow(),
        "status": "active",
        "rating": 0.0,
        "total_ratings": 0
    }
    
    result = campaigns_collection.insert_one(campaign_doc)
    campaign_doc["_id"] = result.inserted_id
    
    return Campaign(
        id=str(campaign_doc["_id"]),
        title=campaign_doc["title"],
        description=campaign_doc["description"],
        modalities=campaign_doc["modalities"],
        budget=campaign_doc["budget"],
        duration_days=campaign_doc["duration_days"],
        target_audience=campaign_doc["target_audience"],
        created_by=campaign_doc["created_by"],
        created_at=campaign_doc["created_at"],
        status=campaign_doc["status"],
        rating=campaign_doc["rating"],
        total_ratings=campaign_doc["total_ratings"]
    )

# Order Routes
@app.post("/api/orders", response_model=Order)
async def create_order(order_data: OrderCreate, current_user = Depends(get_current_user)):
    # Get campaign details
    campaign = campaigns_collection.find_one({"_id": ObjectId(order_data.campaign_id)})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Calculate cost based on selected modalities
    base_cost = campaign["budget"] / len(campaign["modalities"])
    total_cost = base_cost * len(order_data.selected_modalities)
    
    order_doc = {
        "user_id": str(current_user["_id"]),
        "campaign_id": order_data.campaign_id,
        "selected_modalities": order_data.selected_modalities,
        "custom_message": order_data.custom_message,
        "status": "pending",
        "created_at": datetime.utcnow(),
        "total_cost": total_cost
    }
    
    result = orders_collection.insert_one(order_doc)
    order_doc["_id"] = result.inserted_id
    
    return Order(
        id=str(order_doc["_id"]),
        user_id=order_doc["user_id"],
        campaign_id=order_doc["campaign_id"],
        selected_modalities=order_doc["selected_modalities"],
        custom_message=order_doc["custom_message"],
        status=order_doc["status"],
        created_at=order_doc["created_at"],
        total_cost=order_doc["total_cost"]
    )

@app.get("/api/orders/my", response_model=List[Order])
async def get_my_orders(current_user = Depends(get_current_user)):
    orders = list(orders_collection.find({"user_id": str(current_user["_id"])}))
    
    result = []
    for order in orders:
        result.append(Order(
            id=str(order["_id"]),
            user_id=order["user_id"],
            campaign_id=order["campaign_id"],
            selected_modalities=order["selected_modalities"],
            custom_message=order.get("custom_message"),
            status=order["status"],
            created_at=order["created_at"],
            total_cost=order["total_cost"]
        ))
    
    return result

# Rating Routes
@app.post("/api/ratings")
async def rate_campaign(rating_data: RatingCreate, current_user = Depends(get_current_user)):
    # Check if user already rated this campaign
    existing_rating = ratings_collection.find_one({
        "user_id": str(current_user["_id"]),
        "campaign_id": rating_data.campaign_id
    })
    
    if existing_rating:
        # Update existing rating
        ratings_collection.update_one(
            {"_id": existing_rating["_id"]},
            {"$set": {
                "rating": rating_data.rating,
                "comment": rating_data.comment,
                "updated_at": datetime.utcnow()
            }}
        )
    else:
        # Create new rating
        rating_doc = {
            "user_id": str(current_user["_id"]),
            "campaign_id": rating_data.campaign_id,
            "rating": rating_data.rating,
            "comment": rating_data.comment,
            "created_at": datetime.utcnow()
        }
        ratings_collection.insert_one(rating_doc)
    
    # Update campaign average rating
    pipeline = [
        {"$match": {"campaign_id": rating_data.campaign_id}},
        {"$group": {
            "_id": None,
            "avg_rating": {"$avg": "$rating"},
            "total_ratings": {"$sum": 1}
        }}
    ]
    
    result = list(ratings_collection.aggregate(pipeline))
    if result:
        campaigns_collection.update_one(
            {"_id": ObjectId(rating_data.campaign_id)},
            {"$set": {
                "rating": round(result[0]["avg_rating"], 1),
                "total_ratings": result[0]["total_ratings"]
            }}
        )
    
    return {"message": "Rating submitted successfully"}

# Health Check
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "database": "connected" if client.admin.command('ping') else "disconnected"
    }

# Initialize some sample data
@app.on_event("startup")
async def startup_event():
    # Create indexes
    users_collection.create_index("username", unique=True)
    users_collection.create_index("email", unique=True)
    
    # Add sample campaigns if none exist
    if campaigns_collection.count_documents({}) == 0:
        sample_campaigns = [
            {
                "title": "Summer Fashion Campaign",
                "description": "Promote your summer fashion collection with stunning visuals and engaging content",
                "modalities": ["video", "text", "audio"],
                "budget": 5000.0,
                "duration_days": 30,
                "target_audience": "Fashion enthusiasts, 18-35 years",
                "created_by": "admin",
                "created_at": datetime.utcnow(),
                "status": "active",
                "rating": 4.5,
                "total_ratings": 12
            },
            {
                "title": "Tech Product Launch",
                "description": "Launch your innovative tech product with comprehensive digital marketing",
                "modalities": ["video", "text"],
                "budget": 8000.0,
                "duration_days": 45,
                "target_audience": "Tech professionals, 25-50 years",
                "created_by": "admin",
                "created_at": datetime.utcnow(),
                "status": "active",
                "rating": 4.8,
                "total_ratings": 8
            },
            {
                "title": "Restaurant Grand Opening",
                "description": "Create buzz for your restaurant grand opening with multimedia content",
                "modalities": ["video", "audio"],
                "budget": 3000.0,
                "duration_days": 21,
                "target_audience": "Food lovers, local community",
                "created_by": "admin",
                "created_at": datetime.utcnow(),
                "status": "active",
                "rating": 4.2,
                "total_ratings": 15
            }
        ]
        campaigns_collection.insert_many(sample_campaigns)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)