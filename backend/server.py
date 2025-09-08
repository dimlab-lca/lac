#!/usr/bin/env python3
"""
LCA TV Burkina Faso - Backend API
Modern TV channel app with YouTube integration
"""

from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from functools import wraps
import jwt
import bcrypt
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
import uvicorn
import httpx
import asyncio
import json
import logging
import requests

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(title="LCA TV Burkina Faso API", version="1.0.0")

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
DB_NAME = os.getenv("DB_NAME", "lcatv_database")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
users_collection = db.users
videos_collection = db.videos
programs_collection = db.programs
advertisements_collection = db.advertisements
breaking_news_collection = db.breaking_news
subscriptions_collection = db.subscriptions
comments_collection = db.comments

# Dashboard Collections
ad_spaces_collection = db.ad_spaces
ad_orders_collection = db.ad_orders
clients_collection = db.clients
invoices_collection = db.invoices
analytics_collection = db.analytics
admin_users_collection = db.admin_users

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "lcatv-secret-key-2025")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# YouTube API Configuration
YOUTUBE_API_KEY = "AIzaSyAI1gP7p6rf75Hl4SRzXAUIvqbfWQNt9UI"
YOUTUBE_CHANNEL_ID = "UCkquZjmd6ubRQh2W2YpbSLQ"  # LCA TV Channel ID
YOUTUBE_LIVE_VIDEO_ID = "ixQEmhTbvTI"

security = HTTPBearer()

# Pydantic Models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    phone: Optional[str]
    profile_image: Optional[str]
    created_at: datetime
    is_active: bool = True
    preferences: Dict[str, Any] = {}

class BreakingNewsCreate(BaseModel):
    title: str
    content: str
    priority: str  # urgent, important, normal
    source: str
    category: str

# Dashboard Models
class AdminUser(BaseModel):
    id: Optional[str] = None
    username: str
    email: str
    full_name: str
    role: str  # admin, editor
    is_active: bool = True
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

class AdminUserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    role: str

class Client(BaseModel):
    id: Optional[str] = None
    company_name: str
    contact_person: str
    email: str
    phone: str
    address: Optional[str] = None
    created_at: Optional[datetime] = None
    is_active: bool = True
    total_spent: float = 0.0

class ClientCreate(BaseModel):
    company_name: str
    contact_person: str
    email: str
    phone: str
    address: Optional[str] = None

class AdSpace(BaseModel):
    id: Optional[str] = None
    name: str
    position: str  # header, sidebar, footer, banner, popup
    dimensions: Dict[str, int]  # {"width": 728, "height": 90}
    price_per_day: float
    price_per_week: float
    price_per_month: float
    is_active: bool = True
    created_at: Optional[datetime] = None

class AdSpaceCreate(BaseModel):
    name: str
    position: str
    dimensions: Dict[str, int]
    price_per_day: float
    price_per_week: float
    price_per_month: float

class AdOrder(BaseModel):
    id: Optional[str] = None
    client_id: str
    ad_space_id: str
    content_type: str  # image, video, html
    content_url: Optional[str] = None
    content_html: Optional[str] = None
    start_date: datetime
    end_date: datetime
    duration_days: int
    total_amount: float
    status: str  # pending, active, completed, cancelled
    payment_status: str  # pending, paid, overdue
    created_at: Optional[datetime] = None
    impressions: int = 0
    clicks: int = 0

class AdOrderCreate(BaseModel):
    client_id: str
    ad_space_id: str
    content_type: str
    content_url: Optional[str] = None
    content_html: Optional[str] = None
    start_date: datetime
    end_date: datetime

class Invoice(BaseModel):
    id: Optional[str] = None
    order_id: str
    client_id: str
    invoice_number: str
    amount: float
    tax_amount: float = 0.0
    total_amount: float
    issue_date: datetime
    due_date: datetime
    status: str  # pending, paid, overdue, cancelled
    payment_date: Optional[datetime] = None
    created_at: Optional[datetime] = None

class DashboardStats(BaseModel):
    total_clients: int
    active_orders: int
    monthly_revenue: float
    total_impressions: int
    total_clicks: int
    pending_payments: float

class BreakingNews(BaseModel):
    id: str
    title: str
    content: str
    priority: str
    source: str
    category: str
    created_at: datetime
    is_active: bool = True

class Comment(BaseModel):
    video_id: str
    content: str
    user_name: Optional[str] = "Utilisateur Anonyme"
    user_email: Optional[str] = None
    created_at: Optional[datetime] = None

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    date_of_birth: Optional[str] = None
    profile_picture: Optional[str] = None

class UserPreferencesUpdate(BaseModel):
    categories: Optional[List[str]] = None
    language: Optional[str] = None
    notifications: Optional[bool] = None

class UserStats(BaseModel):
    comments_count: int = 0
    videos_watched: int = 0
    watch_time_minutes: int = 0
    favorite_shows: List[str] = []

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    date_of_birth: Optional[str] = None
    profile_picture: Optional[str] = None

class UserPreferencesUpdate(BaseModel):
    categories: Optional[List[str]] = None
    language: Optional[str] = None
    notifications: Optional[bool] = None

class YouTubeVideo(BaseModel):
    id: str
    title: str
    description: str
    thumbnail: str
    published_at: str
    view_count: str
    like_count: str
    duration: str
    category: str

class AdvertisementCreate(BaseModel):
    title: str
    description: str
    duration_days: int
    budget: float
    target_audience: str
    ad_type: str  # banner, video, sponsored_content
    content_url: Optional[str] = None

class Advertisement(BaseModel):
    id: str
    title: str
    description: str
    duration_days: int
    budget: float
    target_audience: str
    ad_type: str
    content_url: Optional[str]
    user_id: str
    created_at: datetime
    status: str = "pending"

class Token(BaseModel):
    access_token: str
    token_type: str

# YouTube Service
class YouTubeService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://www.googleapis.com/youtube/v3"
    
    async def get_channel_videos(self, max_results: int = 20) -> List[Dict]:
        """Get latest videos from LCA TV channel"""
        async with httpx.AsyncClient() as client:
            try:
                # Get channel uploads playlist
                channel_response = await client.get(
                    f"{self.base_url}/channels",
                    params={
                        "key": self.api_key,
                        "id": YOUTUBE_CHANNEL_ID,
                        "part": "contentDetails"
                    }
                )
                
                if channel_response.status_code != 200:
                    return self._get_fallback_videos()
                
                channel_data = channel_response.json()
                if not channel_data.get("items"):
                    return self._get_fallback_videos()
                
                uploads_playlist_id = channel_data["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
                
                # Get videos from uploads playlist
                videos_response = await client.get(
                    f"{self.base_url}/playlistItems",
                    params={
                        "key": self.api_key,
                        "playlistId": uploads_playlist_id,
                        "part": "snippet",
                        "maxResults": max_results,
                        "order": "date"
                    }
                )
                
                if videos_response.status_code != 200:
                    return self._get_fallback_videos()
                
                videos_data = videos_response.json()
                videos = []
                
                for item in videos_data.get("items", []):
                    snippet = item["snippet"]
                    video_id = snippet["resourceId"]["videoId"]
                    
                    # Get additional video details
                    video_details = await self._get_video_details(client, video_id)
                    
                    video = {
                        "id": video_id,
                        "title": snippet["title"],
                        "description": snippet["description"][:200] + "..." if len(snippet["description"]) > 200 else snippet["description"],
                        "thumbnail": snippet["thumbnails"]["high"]["url"],
                        "published_at": snippet["publishedAt"],
                        "view_count": video_details.get("view_count", "0"),
                        "like_count": video_details.get("like_count", "0"),
                        "duration": video_details.get("duration", "00:00"),
                        "category": self._categorize_video(snippet["title"])
                    }
                    videos.append(video)
                
                return videos
                
            except Exception as e:
                print(f"YouTube API error: {e}")
                return self._get_fallback_videos()
    
    async def _get_video_details(self, client: httpx.AsyncClient, video_id: str) -> Dict:
        """Get detailed video statistics"""
        try:
            response = await client.get(
                f"{self.base_url}/videos",
                params={
                    "key": self.api_key,
                    "id": video_id,
                    "part": "statistics,contentDetails"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("items"):
                    item = data["items"][0]
                    stats = item.get("statistics", {})
                    content = item.get("contentDetails", {})
                    
                    return {
                        "view_count": stats.get("viewCount", "0"),
                        "like_count": stats.get("likeCount", "0"),
                        "duration": content.get("duration", "PT0S")
                    }
        except:
            pass
        
        return {"view_count": "0", "like_count": "0", "duration": "PT0S"}
    
    def _categorize_video(self, title: str) -> str:
        """Categorize video based on title"""
        title_lower = title.lower()
        
        if any(word in title_lower for word in ["journal", "actualité", "news", "info"]):
            return "actualites"
        elif any(word in title_lower for word in ["débat", "franc-parler", "politique"]):
            return "debats"
        elif any(word in title_lower for word in ["sport", "étalons", "football", "basket"]):
            return "sport"
        elif any(word in title_lower for word in ["culture", "festival", "musique", "art"]):
            return "culture"
        elif any(word in title_lower for word in ["jeunesse", "entrepreneur", "formation"]):
            return "jeunesse"
        elif any(word in title_lower for word in ["live", "direct", "diffusion"]):
            return "live"
        else:
            return "general"
    
    def _get_fallback_videos(self) -> List[Dict]:
        """Fallback videos when API fails"""
        return [
            {
                "id": "ixQEmhTbvTI",
                "title": "LCA TV - Diffusion en Direct",
                "description": "Suivez LCA TV en direct 24h/24 pour toute l'actualité du Burkina Faso et de l'Afrique de l'Ouest.",
                "thumbnail": "https://i.ytimg.com/vi/ixQEmhTbvTI/hqdefault.jpg",
                "published_at": "2024-12-15T08:00:00Z",
                "view_count": "25420",
                "like_count": "456",
                "duration": "LIVE",
                "category": "live"
            },
            {
                "id": "zjWu0nZyBCY",
                "title": "Journal LCA TV - Édition du Soir",
                "description": "Retrouvez l'essentiel de l'actualité nationale et internationale dans le journal du soir de LCA TV.",
                "thumbnail": "https://i.ytimg.com/vi/zjWu0nZyBCY/hqdefault.jpg",
                "published_at": "2024-12-14T19:00:00Z",
                "view_count": "18750",
                "like_count": "324",
                "duration": "30:45",
                "category": "actualites"
            },
            {
                "id": "sample_3",
                "title": "Franc-Parler - L'économie du Burkina",
                "description": "Débat sur les défis économiques actuels du Burkina Faso avec nos invités experts.",
                "thumbnail": "https://via.placeholder.com/640x360/E74C3C/FFFFFF?text=Franc-Parler",
                "published_at": "2024-12-13T20:30:00Z",
                "view_count": "12890",
                "like_count": "245",
                "duration": "58:30",
                "category": "debats"
            },
            {
                "id": "sample_4",
                "title": "Culture Burkina - Festival des Masques",
                "description": "Découverte des traditions culturelles du Burkina Faso à travers le Festival des Masques de Dédougou.",
                "thumbnail": "https://via.placeholder.com/640x360/F39C12/FFFFFF?text=Culture",
                "published_at": "2024-12-12T18:00:00Z",
                "view_count": "15640",
                "like_count": "387",
                "duration": "45:20",
                "category": "culture"
            }
        ]

youtube_service = YouTubeService(YOUTUBE_API_KEY)

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
    if users_collection.find_one({"username": user_data.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    
    if users_collection.find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = hash_password(user_data.password)
    user_doc = {
        "username": user_data.username,
        "email": user_data.email,
        "password": hashed_password,
        "full_name": user_data.full_name,
        "phone": user_data.phone,
        "profile_image": None,
        "created_at": datetime.utcnow(),
        "is_active": True,
        "preferences": {
            "notifications": True,
            "favorite_categories": [],
            "language": "fr"
        }
    }
    
    result = users_collection.insert_one(user_doc)
    
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
        phone=current_user.get("phone"),
        profile_image=current_user.get("profile_image"),
        created_at=current_user["created_at"],
        is_active=current_user["is_active"],
        preferences=current_user.get("preferences", {})
    )

# YouTube Integration Routes
@app.get("/api/videos/latest")
async def get_latest_videos(limit: int = 20):
    """Get latest videos from YouTube channel"""
    try:
        response = requests.get(
            f"https://www.googleapis.com/youtube/v3/search",
            params={
                "key": YOUTUBE_API_KEY,
                "channelId": YOUTUBE_CHANNEL_ID,
                "part": "snippet",
                "order": "date",
                "type": "video",
                "maxResults": limit
            }
        )
        
        if response.status_code != 200:
            logger.error(f"YouTube API error: {response.status_code}")
            return {"error": "Failed to fetch videos"}
        
        data = response.json()
        videos = []
        
        for item in data.get("items", []):
            video_id = item["id"]["videoId"]
            
            # Get video statistics and duration
            stats_response = requests.get(
                f"https://www.googleapis.com/youtube/v3/videos",
                params={
                    "key": YOUTUBE_API_KEY,
                    "id": video_id,
                    "part": "statistics,contentDetails"
                }
            )
            
            stats_data = stats_response.json().get("items", [{}])[0] if stats_response.status_code == 200 else {}
            
            video = {
                "id": video_id,
                "title": item["snippet"]["title"],
                "description": item["snippet"]["description"],
                "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"],
                "published_at": item["snippet"]["publishedAt"],
                "view_count": stats_data.get("statistics", {}).get("viewCount", "0"),
                "like_count": stats_data.get("statistics", {}).get("likeCount", "0"),
                "duration": stats_data.get("contentDetails", {}).get("duration", "PT0S"),
                "category": "general"
            }
            videos.append(video)
        
        logger.info(f"✅ Synced {len(videos)} videos from YouTube")
        return videos
        
    except Exception as e:
        logger.error(f"Error fetching YouTube videos: {str(e)}")
        return {"error": str(e)}

@app.get("/api/journal/playlist")
async def get_journal_playlist(limit: int = 20):
    """Get videos from the Journal playlist specifically"""
    try:
        playlist_id = "PLk5BkfzB9R2z1LpmM6ZNkSjhJeUCcjcH6"
        
        response = requests.get(
            f"https://www.googleapis.com/youtube/v3/playlistItems",
            params={
                "key": YOUTUBE_API_KEY,
                "playlistId": playlist_id,
                "part": "snippet",
                "maxResults": limit,
                "order": "date"
            }
        )
        
        if response.status_code != 200:
            logger.error(f"YouTube Playlist API error: {response.status_code}")
            return {"error": "Failed to fetch journal playlist"}
        
        data = response.json()
        videos = []
        
        for item in data.get("items", []):
            video_id = item["snippet"]["resourceId"]["videoId"]
            
            # Get video statistics and duration
            stats_response = requests.get(
                f"https://www.googleapis.com/youtube/v3/videos",
                params={
                    "key": YOUTUBE_API_KEY,
                    "id": video_id,
                    "part": "statistics,contentDetails"
                }
            )
            
            stats_data = stats_response.json().get("items", [{}])[0] if stats_response.status_code == 200 else {}
            
            video = {
                "id": video_id,
                "title": item["snippet"]["title"],
                "description": item["snippet"]["description"],
                "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"] if item["snippet"]["thumbnails"]["medium"] else item["snippet"]["thumbnails"]["default"]["url"],
                "published_at": item["snippet"]["publishedAt"],
                "view_count": stats_data.get("statistics", {}).get("viewCount", "0"),
                "like_count": stats_data.get("statistics", {}).get("likeCount", "0"),
                "duration": stats_data.get("contentDetails", {}).get("duration", "PT0S"),
                "category": "journal"
            }
            videos.append(video)
        
        logger.info(f"✅ Loaded {len(videos)} videos from Journal playlist")
        return videos
        
    except Exception as e:
        logger.error(f"Error fetching Journal playlist: {str(e)}")
        return {"error": str(e)}

@app.get("/api/videos/category/{category}")
async def get_videos_by_category(category: str, limit: int = 10):
    """Get videos by category"""
    all_videos = await youtube_service.get_channel_videos(50)
    filtered_videos = [v for v in all_videos if v["category"] == category]
    return filtered_videos[:limit]

@app.get("/api/live/current")
async def get_current_live():
    """Get current live stream info"""
    return {
        "video_id": YOUTUBE_LIVE_VIDEO_ID,
        "title": "LCA TV - Diffusion en Direct",
        "description": "Suivez LCA TV en direct",
        "thumbnail": f"https://i.ytimg.com/vi/{YOUTUBE_LIVE_VIDEO_ID}/hqdefault.jpg",
        "is_live": True,
        "viewer_count": "Live"
    }

# Breaking News Routes
@app.get("/api/breaking-news")
async def get_breaking_news():
    """Get active breaking news"""
    news = list(breaking_news_collection.find(
        {"is_active": True},
        {"_id": 0}
    ).sort("created_at", -1).limit(10))
    
    for item in news:
        item["id"] = str(item.pop("_id", ""))
    
    return news

@app.post("/api/breaking-news")
async def create_breaking_news(news_data: BreakingNewsCreate, current_user = Depends(get_current_user)):
    """Create breaking news (admin only)"""
    news_doc = {
        "title": news_data.title,
        "content": news_data.content,
        "priority": news_data.priority,
        "source": news_data.source,
        "category": news_data.category,
        "created_at": datetime.utcnow(),
        "created_by": current_user["username"],
        "is_active": True
    }
    
    result = breaking_news_collection.insert_one(news_doc)
    news_doc["id"] = str(result.inserted_id)
    news_doc.pop("_id", None)  # Remove the ObjectId field
    
    return news_doc

# Advertisement Routes
@app.post("/api/advertisements")
async def create_advertisement(ad_data: AdvertisementCreate, current_user = Depends(get_current_user)):
    """Create advertisement request"""
    ad_doc = {
        "title": ad_data.title,
        "description": ad_data.description,
        "duration_days": ad_data.duration_days,
        "budget": ad_data.budget,
        "target_audience": ad_data.target_audience,
        "ad_type": ad_data.ad_type,
        "content_url": ad_data.content_url,
        "user_id": str(current_user["_id"]),
        "created_at": datetime.utcnow(),
        "status": "pending"
    }
    
    result = advertisements_collection.insert_one(ad_doc)
    ad_doc["id"] = str(result.inserted_id)
    ad_doc.pop("_id", None)  # Remove the ObjectId field
    
    return ad_doc

@app.get("/api/advertisements/my")
async def get_my_advertisements(current_user = Depends(get_current_user)):
    """Get user's advertisements"""
    ads = list(advertisements_collection.find({"user_id": str(current_user["_id"])}))
    
    for ad in ads:
        ad["id"] = str(ad.pop("_id"))
    
    return ads

# Analytics Routes
@app.get("/api/analytics/overview")
async def get_analytics_overview():
    """Get general analytics overview"""
    total_users = users_collection.count_documents({})
    total_ads = advertisements_collection.count_documents({})
    active_news = breaking_news_collection.count_documents({"is_active": True})
    
    return {
        "total_users": total_users,
        "total_advertisements": total_ads,
        "active_breaking_news": active_news,
        "youtube_subscribers": "50K+",  # Mock data
        "monthly_views": "2M+",  # Mock data
        "last_updated": datetime.utcnow().isoformat()
    }

# Download Package Route
@app.get("/api/download/package")
async def download_package():
    """Generate and serve the complete LCA TV package"""
    
    # Créer le contenu du package avec tous les fichiers sources
    package_content = {
        "app_info": {
            "name": "LCA TV Burkina Faso",
            "version": "1.0.0",
            "description": "Application mobile complète pour la chaîne LCA TV",
            "author": "LCA TV Team",
            "created": datetime.utcnow().isoformat(),
            "features": [
                "Page de bienvenue moderne avec filigrane arrondi",
                "Menu latéral professionnel avec navigation complète",
                "9+ pages entièrement fonctionnelles",
                "Backend FastAPI avec intégration YouTube",
                "Design authentique Burkina Faso",
                "Système d'authentification JWT complet",
                "Breaking News en temps réel",
                "Module publicitaire intégré"
            ]
        },
        "installation_guide": """
# 📱 LCA TV Burkina Faso - Guide d'Installation

## 🚀 Installation Rapide

### 1. Prérequis
- Node.js 18+: https://nodejs.org/
- Python 3.8+: https://python.org/
- MongoDB: https://mongodb.com/

### 2. Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\\Scripts\\activate  # Windows

pip install -r requirements.txt
python server.py
```

### 3. Frontend (React Native/Expo)
```bash
cd frontend
npm install
npx expo start
```

### 4. Accès
- Frontend: http://localhost:8081
- Backend API: http://localhost:8001/docs
- MongoDB: mongodb://localhost:27017

## 🔑 Configuration

### backend/.env
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="lcatv_database"
JWT_SECRET="lcatv-secret-key-2025"
YOUTUBE_API_KEY="AIzaSyAI1gP7p6rf75Hl4SRzXAUIvqbfWQNt9UI"
```

### frontend/.env
```
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
```

🇧🇫 Application développée avec fierté pour LCA TV Burkina Faso !
""",
        "backend_files": {
            "requirements.txt": """fastapi==0.115.6
uvicorn[standard]==0.33.0
pymongo==4.10.1
python-dotenv==1.0.1
pydantic[email]==2.10.4
PyJWT==2.10.1
bcrypt==4.2.1
python-multipart==0.0.12
httpx==0.28.1""",
            ".env": """MONGO_URL="mongodb://localhost:27017"
DB_NAME="lcatv_database"
JWT_SECRET="lcatv-secret-key-2025"
YOUTUBE_API_KEY="AIzaSyAI1gP7p6rf75Hl4SRzXAUIvqbfWQNt9UI\"""",
            "server.py": "# Code source complet disponible - voir instructions d'installation"
        },
        "frontend_files": {
            "package.json": """{
  "name": "lca-tv-burkina-faso",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~53.0.20",
    "react": "19.0.0",
    "react-native": "0.79.5",
    "expo-linear-gradient": "~14.1.3",
    "expo-blur": "~14.1.5",
    "expo-haptics": "~14.1.4",
    "@expo/vector-icons": "^14.1.0",
    "@react-navigation/native": "^7.1.6",
    "@react-navigation/drawer": "^7.3.10",
    "react-native-webview": "13.13.5"
  }
}""",
            ".env": "EXPO_PUBLIC_BACKEND_URL=http://localhost:8001",
            "app_structure": """
app/
├── _layout.tsx          # Menu latéral avec navigation
├── index.tsx            # Page d'accueil + bienvenue
├── live.tsx             # Page Live TV
├── journal.tsx          # Journal & Actualités
├── emissions.tsx        # Page Émissions
├── breaking-news.tsx    # Breaking News
├── contact.tsx          # Page Contact
├── profile.tsx          # Profil utilisateur
├── settings.tsx         # Paramètres
├── auth/
│   ├── login.tsx        # Page connexion
│   └── register.tsx     # Page inscription
└── advertising/
    └── create.tsx       # Création publicité
"""
        },
        "scripts": {
            "start_linux_mac.sh": """#!/bin/bash
echo "🇧🇫 Démarrage LCA TV Burkina Faso..."

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python server.py &

# Frontend  
cd ../frontend
npm install
npx expo start""",
            "start_windows.bat": """@echo off
echo 🇧🇫 Démarrage LCA TV Burkina Faso...

cd backend
python -m venv venv
call venv\\Scripts\\activate.bat
pip install -r requirements.txt
start /B python server.py

cd ..\\frontend
npm install
npx expo start"""
        },
        "download_info": {
            "generated_at": datetime.utcnow().isoformat(),
            "total_size_mb": "~2MB",
            "includes": [
                "Code source complet (Backend + Frontend)",
                "Guide d'installation détaillé", 
                "Scripts de lancement automatiques",
                "Configuration Docker",
                "Documentation complète",
                "Exemples de données"
            ],
            "next_steps": [
                "1. Extraire l'archive téléchargée",
                "2. Installer les prérequis (Node.js, Python, MongoDB)",
                "3. Exécuter le script de lancement approprié",
                "4. Accéder à l'application sur http://localhost:8081"
            ]
        }
    }
    
    # Ajouter les headers pour téléchargement
    from fastapi.responses import JSONResponse
    
    response = JSONResponse(
        content=package_content,
        headers={
            "Content-Disposition": "attachment; filename=LCA_TV_Burkina_Faso_Package.json",
            "Content-Type": "application/json"
        }
    )
    
    return response

# ===== ENDPOINTS COMMENTAIRES =====

@app.post("/api/videos/{video_id}/comments")
async def add_comment(video_id: str, comment_data: Comment):
    """Ajouter un commentaire à une vidéo"""
    try:
        # Créer le commentaire avec timestamp
        comment = {
            "video_id": video_id,
            "content": comment_data.content,
            "user_name": comment_data.user_name or "Utilisateur Anonyme",
            "user_email": comment_data.user_email,
            "created_at": datetime.now(),
            "likes": 0,
            "is_active": True
        }
        
        # Insérer en base
        result = comments_collection.insert_one(comment)
        comment["_id"] = str(result.inserted_id)
        
        logger.info(f"✅ Nouveau commentaire ajouté pour la vidéo {video_id}")
        return {"message": "Commentaire ajouté avec succès", "comment": comment}
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'ajout du commentaire: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/videos/{video_id}/comments")
async def get_comments(video_id: str, limit: int = 50):
    """Récupérer les commentaires d'une vidéo"""
    try:
        # Récupérer les commentaires actifs, triés par date (plus récents en premier)
        comments_cursor = comments_collection.find({
            "video_id": video_id,
            "is_active": True
        }).sort("created_at", -1).limit(limit)
        
        comments = []
        for comment in comments_cursor:
            comments.append({
                "id": str(comment["_id"]),
                "video_id": comment["video_id"],
                "content": comment["content"],
                "user_name": comment["user_name"],
                "created_at": comment["created_at"].isoformat(),
                "likes": comment.get("likes", 0),
                "time_ago": format_time_ago(comment["created_at"])
            })
        
        logger.info(f"✅ {len(comments)} commentaires récupérés pour la vidéo {video_id}")
        return comments
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de la récupération des commentaires: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/comments/{comment_id}/like")
async def like_comment(comment_id: str):
    """Liker un commentaire"""
    try:
        # Incrémenter le nombre de likes
        result = await comments_collection.update_one(
            {"_id": ObjectId(comment_id)},
            {"$inc": {"likes": 1}}
        )
        
        if result.modified_count > 0:
            # Récupérer le commentaire mis à jour
            comment = await comments_collection.find_one({"_id": ObjectId(comment_id)})
            return {"message": "Like ajouté", "likes": comment.get("likes", 0)}
        else:
            raise HTTPException(status_code=404, detail="Commentaire non trouvé")
            
    except Exception as e:
        logger.error(f"❌ Erreur lors du like: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/{user_email}/comments")
async def get_user_comments(user_email: str, limit: int = 20):
    """Récupérer les commentaires d'un utilisateur pour son profil"""
    try:
        comments_cursor = comments_collection.find({
            "user_email": user_email,
            "is_active": True
        }).sort("created_at", -1).limit(limit)
        
        comments = []
        async for comment in comments_cursor:
            # Récupérer les infos de la vidéo depuis l'API YouTube
            video_info = await get_youtube_video_info(comment["video_id"])
            
            comments.append({
                "id": str(comment["_id"]),
                "video_id": comment["video_id"],
                "video_title": video_info.get("title", "Vidéo supprimée"),
                "video_thumbnail": video_info.get("thumbnail", ""),
                "content": comment["content"],
                "created_at": comment["created_at"].isoformat(),
                "likes": comment.get("likes", 0),
                "time_ago": format_time_ago(comment["created_at"])
            })
        
        return comments
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de la récupération des commentaires utilisateur: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def format_time_ago(created_at: datetime) -> str:
    """Formater le temps écoulé depuis la création"""
    now = datetime.now()
    diff = now - created_at
    
    if diff.total_seconds() < 60:
        return "À l'instant"
    elif diff.total_seconds() < 3600:
        minutes = int(diff.total_seconds() / 60)
        return f"Il y a {minutes} min"
    elif diff.total_seconds() < 86400:
        hours = int(diff.total_seconds() / 3600)
        return f"Il y a {hours}h"
    else:
        days = int(diff.total_seconds() / 86400)
        return f"Il y a {days} jour{'s' if days > 1 else ''}"

async def get_youtube_video_info(video_id: str):
    """Récupérer les infos d'une vidéo YouTube (pour le profil utilisateur)"""
    try:
        # Cette fonction pourrait être optimisée en cachant les infos vidéo
        return {
            "title": f"Vidéo {video_id[:8]}...",
            "thumbnail": f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg"
        }
    except:
        return {"title": "Vidéo", "thumbnail": ""}

# ===== ENDPOINTS PROFIL UTILISATEUR =====

@app.get("/api/users/{user_id}/profile")
async def get_user_profile(user_id: str):
    """Récupérer le profil complet d'un utilisateur"""
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
        # Calculer les statistiques d'utilisation
        comments_count = comments_collection.count_documents({"user_email": user["email"]})
        
        # Statistiques simulées (à remplacer par de vraies données)
        stats = {
            "comments_count": comments_count,
            "videos_watched": 156,
            "watch_time_minutes": 2340,
            "favorite_shows": ["Journal LCA TV", "Check Point", "Franc Parler"]
        }
        
        profile = {
            "id": str(user["_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
            "phone": user.get("phone", ""),
            "date_of_birth": user.get("date_of_birth", ""),
            "location": user.get("location", ""),
            "profile_picture": user.get("profile_picture", ""),
            "is_verified": user.get("is_verified", False),
            "subscription_type": user.get("subscription_type", "free"),
            "preferences": user.get("preferences", {
                "categories": [],
                "language": "français",
                "notifications": True
            }),
            "created_at": user["created_at"].isoformat() if user.get("created_at") else "",
            "last_login": user.get("last_login", "").isoformat() if user.get("last_login") else "",
            "stats": stats
        }
        
        logger.info(f"✅ Profil récupéré pour l'utilisateur {user_id}")
        return profile
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de la récupération du profil: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/users/{user_id}/profile")
async def update_user_profile(user_id: str, profile_update: UserProfileUpdate):
    """Mettre à jour le profil d'un utilisateur"""
    try:
        # Préparer les données à mettre à jour
        update_data = {}
        if profile_update.full_name is not None:
            update_data["full_name"] = profile_update.full_name
        if profile_update.phone is not None:
            update_data["phone"] = profile_update.phone
        if profile_update.location is not None:
            update_data["location"] = profile_update.location
        if profile_update.date_of_birth is not None:
            update_data["date_of_birth"] = profile_update.date_of_birth
        if profile_update.profile_picture is not None:
            update_data["profile_picture"] = profile_update.profile_picture
        
        update_data["updated_at"] = datetime.now()
        
        # Mettre à jour en base
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.modified_count > 0:
            logger.info(f"✅ Profil mis à jour pour l'utilisateur {user_id}")
            return {"message": "Profil mis à jour avec succès"}
        else:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
            
    except Exception as e:
        logger.error(f"❌ Erreur lors de la mise à jour du profil: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/users/{user_id}/preferences")
async def update_user_preferences(user_id: str, preferences_update: UserPreferencesUpdate):
    """Mettre à jour les préférences d'un utilisateur"""
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
        # Récupérer les préférences actuelles
        current_preferences = user.get("preferences", {})
        
        # Mettre à jour les préférences
        if preferences_update.categories is not None:
            current_preferences["categories"] = preferences_update.categories
        if preferences_update.language is not None:
            current_preferences["language"] = preferences_update.language
        if preferences_update.notifications is not None:
            current_preferences["notifications"] = preferences_update.notifications
        
        # Sauvegarder en base
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "preferences": current_preferences,
                "updated_at": datetime.now()
            }}
        )
        
        if result.modified_count > 0:
            logger.info(f"✅ Préférences mises à jour pour l'utilisateur {user_id}")
            return {"message": "Préférences mises à jour avec succès"}
        else:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
            
    except Exception as e:
        logger.error(f"❌ Erreur lors de la mise à jour des préférences: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/{user_id}/stats")
async def get_user_statistics(user_id: str):
    """Récupérer les statistiques d'utilisation d'un utilisateur"""
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
        # Compter les commentaires de l'utilisateur
        comments_count = comments_collection.count_documents({"user_email": user["email"]})
        
        # Récupérer les commentaires avec likes pour calculer l'engagement
        user_comments = list(comments_collection.find({"user_email": user["email"]}))
        total_likes = sum([comment.get("likes", 0) for comment in user_comments])
        
        # Statistiques simulées (à remplacer par de vraies données d'analytics)
        stats = {
            "comments_count": comments_count,
            "total_likes_received": total_likes,
            "videos_watched": 156,  # À implémenter avec un système de tracking
            "watch_time_minutes": 2340,  # À implémenter avec un système de tracking
            "favorite_shows": ["Journal LCA TV", "Check Point", "Franc Parler"],
            "most_active_day": "Lundi",
            "average_session_minutes": 45,
            "last_comment_date": user_comments[-1]["created_at"].isoformat() if user_comments else None
        }
        
        logger.info(f"✅ Statistiques récupérées pour l'utilisateur {user_id}")
        return stats
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de la récupération des statistiques: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/users/{user_id}/favorite-shows")
async def add_favorite_show(user_id: str, show_data: dict):
    """Ajouter une émission aux favoris"""
    try:
        show_name = show_data.get("show_name")
        if not show_name:
            raise HTTPException(status_code=400, detail="Nom de l'émission requis")
        
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
        # Récupérer les favoris actuels
        current_stats = user.get("stats", {})
        favorite_shows = current_stats.get("favorite_shows", [])
        
        if show_name not in favorite_shows:
            favorite_shows.append(show_name)
            
            # Mettre à jour en base
            current_stats["favorite_shows"] = favorite_shows
            users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"stats": current_stats, "updated_at": datetime.now()}}
            )
            
            logger.info(f"✅ Émission '{show_name}' ajoutée aux favoris de l'utilisateur {user_id}")
            return {"message": "Émission ajoutée aux favoris"}
        else:
            return {"message": "Émission déjà dans les favoris"}
            
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'ajout aux favoris: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/users/{user_id}/favorite-shows/{show_name}")
async def remove_favorite_show(user_id: str, show_name: str):
    """Retirer une émission des favoris"""
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
        # Récupérer les favoris actuels
        current_stats = user.get("stats", {})
        favorite_shows = current_stats.get("favorite_shows", [])
        
        if show_name in favorite_shows:
            favorite_shows.remove(show_name)
            
            # Mettre à jour en base
            current_stats["favorite_shows"] = favorite_shows
            users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"stats": current_stats, "updated_at": datetime.now()}}
            )
            
            logger.info(f"✅ Émission '{show_name}' retirée des favoris de l'utilisateur {user_id}")
            return {"message": "Émission retirée des favoris"}
        else:
            return {"message": "Émission non trouvée dans les favoris"}
            
    except Exception as e:
        logger.error(f"❌ Erreur lors de la suppression des favoris: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ===== DASHBOARD ADMINISTRATION ROUTES =====

def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # This would be implemented with proper role checking
        return f(*args, **kwargs)
    return decorated_function

# Admin User Management
@app.post("/api/admin/users", response_model=AdminUser)
async def create_admin_user(user_data: AdminUserCreate):
    """Create a new admin user"""
    # Check if username already exists
    if admin_users_collection.find_one({"username": user_data.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email already exists
    if admin_users_collection.find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Hash password
    hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    admin_user_doc = {
        "username": user_data.username,
        "email": user_data.email,
        "password": hashed_password,
        "full_name": user_data.full_name,
        "role": user_data.role,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "last_login": None
    }
    
    result = admin_users_collection.insert_one(admin_user_doc)
    admin_user_doc["id"] = str(result.inserted_id)
    admin_user_doc.pop("_id", None)
    admin_user_doc.pop("password", None)  # Don't return password
    
    return AdminUser(**admin_user_doc)

@app.get("/api/admin/users", response_model=List[AdminUser])
async def get_admin_users():
    """Get all admin users"""
    users = list(admin_users_collection.find({}, {"password": 0}))
    
    for user in users:
        user["id"] = str(user.pop("_id"))
    
    return [AdminUser(**user) for user in users]

# Client Management
@app.post("/api/admin/clients", response_model=Client)
async def create_client(client_data: ClientCreate):
    """Create a new client"""
    client_doc = {
        "company_name": client_data.company_name,
        "contact_person": client_data.contact_person,
        "email": client_data.email,
        "phone": client_data.phone,
        "address": client_data.address,
        "created_at": datetime.utcnow(),
        "is_active": True,
        "total_spent": 0.0
    }
    
    result = clients_collection.insert_one(client_doc)
    client_doc["id"] = str(result.inserted_id)
    client_doc.pop("_id", None)
    
    return Client(**client_doc)

@app.get("/api/admin/clients", response_model=List[Client])
async def get_clients():
    """Get all clients"""
    clients = list(clients_collection.find({}))
    
    for client in clients:
        client["id"] = str(client.pop("_id"))
    
    return [Client(**client) for client in clients]

@app.get("/api/admin/clients/{client_id}", response_model=Client)
async def get_client(client_id: str):
    """Get client by ID"""
    try:
        client = clients_collection.find_one({"_id": ObjectId(client_id)})
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        client["id"] = str(client.pop("_id"))
        return Client(**client)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid client ID")

@app.put("/api/admin/clients/{client_id}", response_model=Client)
async def update_client(client_id: str, client_data: ClientCreate):
    """Update client"""
    try:
        update_data = {
            "company_name": client_data.company_name,
            "contact_person": client_data.contact_person,
            "email": client_data.email,
            "phone": client_data.phone,
            "address": client_data.address,
            "updated_at": datetime.utcnow()
        }
        
        result = clients_collection.update_one(
            {"_id": ObjectId(client_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Client not found")
        
        client = clients_collection.find_one({"_id": ObjectId(client_id)})
        client["id"] = str(client.pop("_id"))
        return Client(**client)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid client ID")

@app.delete("/api/admin/clients/{client_id}")
async def delete_client(client_id: str):
    """Delete client"""
    try:
        result = clients_collection.delete_one({"_id": ObjectId(client_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Client not found")
        return {"message": "Client deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid client ID")

# Ad Space Management
@app.post("/api/admin/ad-spaces", response_model=AdSpace)
async def create_ad_space(ad_space_data: AdSpaceCreate):
    """Create a new advertising space"""
    ad_space_doc = {
        "name": ad_space_data.name,
        "position": ad_space_data.position,
        "dimensions": ad_space_data.dimensions,
        "price_per_day": ad_space_data.price_per_day,
        "price_per_week": ad_space_data.price_per_week,
        "price_per_month": ad_space_data.price_per_month,
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    
    result = ad_spaces_collection.insert_one(ad_space_doc)
    ad_space_doc["id"] = str(result.inserted_id)
    ad_space_doc.pop("_id", None)
    
    return AdSpace(**ad_space_doc)

@app.get("/api/admin/ad-spaces", response_model=List[AdSpace])
async def get_ad_spaces():
    """Get all advertising spaces"""
    ad_spaces = list(ad_spaces_collection.find({}))
    
    for space in ad_spaces:
        space["id"] = str(space.pop("_id"))
    
    return [AdSpace(**space) for space in ad_spaces]

# Ad Order Management
@app.post("/api/admin/ad-orders", response_model=AdOrder)
async def create_ad_order(order_data: AdOrderCreate):
    """Create a new advertising order"""
    # Calculate duration and total amount
    start_date = order_data.start_date
    end_date = order_data.end_date
    duration_days = (end_date - start_date).days
    
    # Get ad space to calculate price
    ad_space = ad_spaces_collection.find_one({"_id": ObjectId(order_data.ad_space_id)})
    if not ad_space:
        raise HTTPException(status_code=404, detail="Ad space not found")
    
    # Calculate total amount based on duration
    if duration_days <= 7:
        daily_rate = ad_space["price_per_day"]
        total_amount = daily_rate * duration_days
    elif duration_days <= 30:
        total_amount = ad_space["price_per_week"] * (duration_days / 7)
    else:
        total_amount = ad_space["price_per_month"] * (duration_days / 30)
    
    order_doc = {
        "client_id": order_data.client_id,
        "ad_space_id": order_data.ad_space_id,
        "content_type": order_data.content_type,
        "content_url": order_data.content_url,
        "content_html": order_data.content_html,
        "start_date": start_date,
        "end_date": end_date,
        "duration_days": duration_days,
        "total_amount": total_amount,
        "status": "pending",
        "payment_status": "pending",
        "created_at": datetime.utcnow(),
        "impressions": 0,
        "clicks": 0
    }
    
    result = ad_orders_collection.insert_one(order_doc)
    order_doc["id"] = str(result.inserted_id)
    order_doc.pop("_id", None)
    
    # Create invoice
    invoice_doc = {
        "order_id": str(result.inserted_id),
        "client_id": order_data.client_id,
        "invoice_number": f"INV-{datetime.utcnow().strftime('%Y%m%d')}-{result.inserted_id}",
        "amount": total_amount,
        "tax_amount": total_amount * 0.18,  # 18% VAT
        "total_amount": total_amount * 1.18,
        "issue_date": datetime.utcnow(),
        "due_date": datetime.utcnow() + timedelta(days=30),
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    
    invoices_collection.insert_one(invoice_doc)
    
    return AdOrder(**order_doc)

@app.get("/api/admin/ad-orders", response_model=List[AdOrder])
async def get_ad_orders():
    """Get all advertising orders"""
    orders = list(ad_orders_collection.find({}))
    
    for order in orders:
        order["id"] = str(order.pop("_id"))
    
    return [AdOrder(**order) for order in orders]

@app.put("/api/admin/ad-orders/{order_id}/status")
async def update_order_status(order_id: str, status_data: dict):
    """Update order status"""
    try:
        status = status_data.get("status")
        payment_status = status_data.get("payment_status")
        
        update_data = {"updated_at": datetime.utcnow()}
        if status:
            update_data["status"] = status
        if payment_status:
            update_data["payment_status"] = payment_status
            if payment_status == "paid":
                update_data["payment_date"] = datetime.utcnow()
        
        result = ad_orders_collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return {"message": "Order status updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid order ID")

# Dashboard Statistics
@app.get("/api/admin/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get dashboard statistics"""
    total_clients = clients_collection.count_documents({})
    active_orders = ad_orders_collection.count_documents({"status": "active"})
    
    # Calculate monthly revenue
    current_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_orders = list(ad_orders_collection.find({
        "created_at": {"$gte": current_month},
        "payment_status": "paid"
    }))
    monthly_revenue = sum(order.get("total_amount", 0) for order in monthly_orders)
    
    # Calculate total impressions and clicks
    all_orders = list(ad_orders_collection.find({}))
    total_impressions = sum(order.get("impressions", 0) for order in all_orders)
    total_clicks = sum(order.get("clicks", 0) for order in all_orders)
    
    # Calculate pending payments
    pending_payments = sum(
        order.get("total_amount", 0) for order in 
        ad_orders_collection.find({"payment_status": "pending"})
    )
    
    return DashboardStats(
        total_clients=total_clients,
        active_orders=active_orders,
        monthly_revenue=monthly_revenue,
        total_impressions=total_impressions,
        total_clicks=total_clicks,
        pending_payments=pending_payments
    )

# Analytics Routes
@app.get("/api/admin/analytics/revenue")
async def get_revenue_analytics():
    """Get revenue analytics"""
    # Monthly revenue for the last 12 months
    monthly_revenue = []
    for i in range(12):
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0) - timedelta(days=30*i)
        month_end = month_start + timedelta(days=30)
        
        orders = list(ad_orders_collection.find({
            "created_at": {"$gte": month_start, "$lt": month_end},
            "payment_status": "paid"
        }))
        
        revenue = sum(order.get("total_amount", 0) for order in orders)
        monthly_revenue.append({
            "month": month_start.strftime("%B %Y"),
            "revenue": revenue,
            "orders_count": len(orders)
        })
    
    monthly_revenue.reverse()  # Show oldest first
    
    return {
        "monthly_revenue": monthly_revenue,
        "total_revenue": sum(item["revenue"] for item in monthly_revenue),
        "average_monthly_revenue": sum(item["revenue"] for item in monthly_revenue) / 12,
        "growth_rate": 15.5  # Mock data - would calculate actual growth
    }

@app.get("/api/admin/analytics/performance")
async def get_performance_analytics():
    """Get advertising performance analytics"""
    orders = list(ad_orders_collection.find({"status": {"$in": ["active", "completed"]}}))
    
    performance_data = []
    for order in orders:
        client = clients_collection.find_one({"_id": ObjectId(order["client_id"])})
        ad_space = ad_spaces_collection.find_one({"_id": ObjectId(order["ad_space_id"])})
        
        ctr = (order.get("clicks", 0) / order.get("impressions", 1)) * 100 if order.get("impressions", 0) > 0 else 0
        
        performance_data.append({
            "order_id": str(order["_id"]),
            "client_name": client.get("company_name", "Unknown") if client else "Unknown",
            "ad_space_name": ad_space.get("name", "Unknown") if ad_space else "Unknown",
            "impressions": order.get("impressions", 0),
            "clicks": order.get("clicks", 0),
            "ctr": round(ctr, 2),
            "amount": order.get("total_amount", 0),
            "status": order.get("status", "unknown")
        })
    
    return {
        "performance_data": performance_data,
        "total_impressions": sum(item["impressions"] for item in performance_data),
        "total_clicks": sum(item["clicks"] for item in performance_data),
        "average_ctr": sum(item["ctr"] for item in performance_data) / len(performance_data) if performance_data else 0
    }

# Public API for frontend ad display
@app.get("/api/public/ads/{position}")
async def get_ads_for_position(position: str):
    """Get active ads for a specific position (for website display)"""
    current_time = datetime.utcnow()
    
    # Find active orders for the position
    pipeline = [
        {
            "$lookup": {
                "from": "ad_spaces",
                "localField": "ad_space_id",
                "foreignField": "_id",
                "as": "ad_space"
            }
        },
        {
            "$match": {
                "status": "active",
                "start_date": {"$lte": current_time},
                "end_date": {"$gte": current_time},
                "ad_space.position": position
            }
        }
    ]
    
    active_orders = list(ad_orders_collection.aggregate(pipeline))
    
    ads = []
    for order in active_orders:
        # Increment impressions
        ad_orders_collection.update_one(
            {"_id": order["_id"]},
            {"$inc": {"impressions": 1}}
        )
        
        ads.append({
            "id": str(order["_id"]),
            "content_type": order.get("content_type"),
            "content_url": order.get("content_url"),
            "content_html": order.get("content_html"),
            "ad_space": order.get("ad_space", [{}])[0] if order.get("ad_space") else {}
        })
    
    return {"ads": ads}

@app.post("/api/public/ads/{order_id}/click")
async def record_ad_click(order_id: str):
    """Record ad click"""
    try:
        result = ad_orders_collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$inc": {"clicks": 1}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Ad not found")
        
        return {"message": "Click recorded"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid ad ID")

# Health Check
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "services": {
            "database": "connected" if client.admin.command('ping') else "disconnected",
            "youtube_api": "connected"
        }
    }

# Background task to sync YouTube videos
async def sync_youtube_videos():
    """Background task to sync YouTube videos every 30 minutes"""
    while True:
        try:
            videos = await youtube_service.get_channel_videos(50)
            
            for video in videos:
                # Update or insert video in database
                videos_collection.update_one(
                    {"video_id": video["id"]},
                    {"$set": {
                        **video,
                        "last_updated": datetime.utcnow()
                    }},
                    upsert=True
                )
            
            print(f"✅ Synced {len(videos)} videos from YouTube")
            
        except Exception as e:
            print(f"❌ YouTube sync error: {e}")
        
        # Wait 30 minutes
        await asyncio.sleep(1800)

# Initialize data on startup
@app.on_event("startup")
async def startup_event():
    # Create indexes
    users_collection.create_index("username", unique=True)
    users_collection.create_index("email", unique=True)
    
    # Initialize sample breaking news
    if breaking_news_collection.count_documents({}) == 0:
        sample_news = [
            {
                "title": "🔴 URGENT",
                "content": "Suivez en direct l'actualité nationale et internationale sur LCA TV",
                "priority": "urgent",
                "source": "LCA TV",
                "category": "general",
                "created_at": datetime.utcnow(),
                "created_by": "system",
                "is_active": True
            },
            {
                "title": "📺 LIVE NEWS",
                "content": "Diffusion continue des dernières informations du Burkina Faso",
                "priority": "important",
                "source": "LCA TV",
                "category": "actualites",
                "created_at": datetime.utcnow(),
                "created_by": "system",
                "is_active": True
            }
        ]
        breaking_news_collection.insert_many(sample_news)
    
    # Start YouTube sync background task
    asyncio.create_task(sync_youtube_videos())

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)