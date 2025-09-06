# LCA TV Burkina Faso - Application Mobile Complète

![LCA TV Logo](https://img.youtube.com/vi/rcCObwec-0Q/maxresdefault.jpg)

## 📱 Vue d'ensemble

**LCA TV Burkina Faso** est une application mobile moderne développée avec **Expo React Native** et **FastAPI**, offrant une expérience de streaming TV complète avec intégration YouTube, système de commentaires, gestion d'utilisateurs et interface style Netflix.

### 🎯 Objectifs Principaux
- Diffusion en direct des émissions LCA TV
- Catalogue de vidéos organisé par rubriques
- Système de commentaires interactif
- Interface utilisateur moderne style Netflix
- Support multiplateforme (iOS/Android/Web)

---

## 🏗️ Architecture Technique

### Stack Technologique

#### Frontend (Mobile & Web)
```
├── Expo SDK 50+ (React Native)
├── TypeScript
├── Expo Router (Navigation file-based)
├── React Navigation (Drawer/Stack)
├── Expo Linear Gradient
├── React Native WebView (iframe fallback)
├── React Native Gesture Handler
├── React Native Reanimated
├── Expo Haptics
└── Expo Constants
```

#### Backend (API)
```
├── FastAPI (Python 3.9+)
├── MongoDB (Base de données NoSQL)
├── PyJWT (Authentication)
├── Bcrypt (Hash passwords)
├── YouTube Data API v3
├── Uvicorn (ASGI Server)
├── Motor (MongoDB Async Driver)
├── Pydantic (Data Validation)
└── CORS Middleware
```

#### Infrastructure
```
├── Docker & Docker Compose
├── Kubernetes (Production)
├── Nginx (Reverse Proxy)
├── MongoDB Atlas (Cloud Database)
└── Expo Application Services (Build & Deploy)
```

---

## 📂 Structure du Projet

```
LCA_TV_APP/
├── 📁 backend/                    # API FastAPI
│   ├── server.py                 # Serveur principal
│   ├── requirements.txt          # Dépendances Python
│   └── .env                      # Variables d'environnement backend
│
├── 📁 frontend/                   # Application Expo
│   ├── 📁 app/                   # Pages (Expo Router)
│   │   ├── index.tsx             # Page d'accueil/onboarding
│   │   ├── _layout.tsx           # Layout principal avec drawer
│   │   ├── live.tsx              # TV en direct
│   │   ├── emissions.tsx         # Catalogue style Netflix
│   │   ├── journal.tsx           # Actualités
│   │   ├── breaking-news.tsx     # News urgentes
│   │   ├── contact.tsx           # Contact & support
│   │   ├── profile.tsx           # Profil utilisateur
│   │   ├── settings.tsx          # Paramètres app
│   │   ├── 📁 auth/              # Authentification
│   │   │   ├── login.tsx         # Connexion
│   │   │   └── register.tsx      # Inscription
│   │   └── 📁 advertising/       # Publicité
│   │       └── create.tsx        # Création campagne
│   │
│   ├── app.json                  # Configuration Expo
│   ├── package.json              # Dépendances Node.js
│   ├── tsconfig.json             # Configuration TypeScript
│   └── .env                      # Variables d'environnement frontend
│
├── 📁 docs/                      # Documentation
├── docker-compose.yml            # Configuration Docker
├── Dockerfile                    # Image Docker
├── start_lcatv_app.sh           # Script de démarrage Linux/Mac
├── start_lcatv_app.bat          # Script de démarrage Windows
└── README.md                    # Ce fichier
```

---

## 🎨 Design System & Style Guide

### Palette de Couleurs Burkina Faso

```typescript
const BURKINA_COLORS = {
  primary: '#009639',    // Vert Burkina Faso
  secondary: '#FCD116',  // Jaune Burkina Faso  
  accent: '#CE1126',     // Rouge Burkina Faso
  dark: '#1a1a1a',      // Noir Netflix
  light: '#f8f9fa',     // Gris clair
  white: '#ffffff'      // Blanc pur
};
```

### Typography & Spacing

```typescript
// Système de grille 8pt
const SPACING = {
  xs: 4,    // 4px
  sm: 8,    // 8px  
  md: 16,   // 16px
  lg: 24,   // 24px
  xl: 32,   // 32px
  xxl: 48   // 48px
};

// Typographie
const TYPOGRAPHY = {
  heading1: { fontSize: 28, fontWeight: 'bold' },
  heading2: { fontSize: 24, fontWeight: '600' },
  heading3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 14, fontWeight: 'normal' },
  small: { fontSize: 12, fontWeight: 'normal' }
};
```

### Composants UI Réutilisables

#### Boutons
- **Primary Button**: Vert Burkina avec texte blanc
- **Secondary Button**: Transparent avec bordure
- **Danger Button**: Rouge pour actions critiques
- **Ghost Button**: Transparent avec texte coloré

#### Cards & Modals
- **Video Card**: Style Netflix avec overlay gradient
- **Info Card**: Fond blanc avec ombre subtile
- **Modal**: Plein écran avec header et scroll

#### Navigation
- **Drawer Menu**: Menu latéral avec icônes
- **Tab Navigation**: Navigation en bas (si nécessaire)
- **Stack Navigation**: Navigation hiérarchique

---

## 💾 Base de Données MongoDB

### Collections Principales

#### 1. **users** - Gestion des utilisateurs
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password_hash: String (bcrypt),
  full_name: String,
  phone: String,
  date_of_birth: Date,
  location: String,
  profile_picture: String (base64),
  is_verified: Boolean,
  subscription_type: String, // "free", "premium"
  preferences: {
    categories: [String],
    language: String,
    notifications: Boolean
  },
  created_at: Date,
  updated_at: Date,
  last_login: Date
}
```

#### 2. **comments** - Système de commentaires
```javascript
{
  _id: ObjectId,
  video_id: String (YouTube video ID),
  user_name: String,
  user_email: String,
  content: String (max 500 chars),
  likes: Number,
  is_active: Boolean,
  created_at: Date,
  updated_at: Date
}
```

#### 3. **breaking_news** - Actualités urgentes
```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  priority: String, // "urgent", "important", "normal"
  is_active: Boolean,
  created_at: Date,
  expires_at: Date,
  author: String
}
```

#### 4. **advertisements** - Publicités & campagnes
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  campaign_name: String,
  content_type: String, // "video", "text", "audio"
  content: String,
  target_audience: {
    age_range: [Number, Number],
    location: [String],
    interests: [String]
  },
  budget: Number,
  duration_days: Number,
  status: String, // "pending", "active", "completed", "cancelled"
  impressions: Number,
  clicks: Number,
  created_at: Date,
  start_date: Date,
  end_date: Date
}
```

#### 5. **subscriptions** - Abonnements utilisateurs
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  subscription_type: String,
  payment_method: String, // "orange_money", "moov_money", "card"
  amount: Number,
  currency: String, // "XOF"
  status: String, // "active", "expired", "cancelled"
  start_date: Date,
  end_date: Date,
  auto_renewal: Boolean,
  transaction_id: String
}
```

### Index de Performance
```javascript
// Optimisation des requêtes
db.comments.createIndex({ "video_id": 1, "created_at": -1 });
db.users.createIndex({ "email": 1 });
db.breaking_news.createIndex({ "is_active": 1, "created_at": -1 });
db.advertisements.createIndex({ "user_id": 1, "status": 1 });
db.subscriptions.createIndex({ "user_id": 1, "status": 1 });
```

---

## 🔌 API Endpoints Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "Nom Complet",
  "phone": "+22670123456"
}
```

#### POST `/api/auth/login`
```json
{
  "email": "user@example.com", 
  "password": "securepassword"
}
```

### Video & Content Endpoints

#### GET `/api/videos/latest?limit=50`
Récupère les dernières vidéos YouTube de la chaîne LCA TV.

#### GET `/api/live/current`
Récupère les informations du stream en direct actuel.

#### GET `/api/breaking-news`
Récupère les actualités urgentes actives.

### Comment System Endpoints

#### POST `/api/videos/{video_id}/comments`
```json
{
  "video_id": "youtube_video_id",
  "content": "Commentaire utilisateur",
  "user_name": "Nom Utilisateur",
  "user_email": "email@example.com"
}
```

#### GET `/api/videos/{video_id}/comments?limit=50`
Récupère les commentaires d'une vidéo spécifique.

#### PUT `/api/comments/{comment_id}/like`
Incrémente le nombre de likes d'un commentaire.

#### GET `/api/users/{user_email}/comments`
Récupère l'historique des commentaires d'un utilisateur.

### Campaign Management Endpoints

#### POST `/api/campaigns/create`
Création de campagne publicitaire.

#### GET `/api/campaigns/user/{user_id}`
Récupère les campagnes d'un utilisateur.

#### PUT `/api/campaigns/{campaign_id}/status`
Met à jour le statut d'une campagne.

---

## 📱 Installation & Configuration

### Prérequis Système

#### Développement Local
```bash
# Node.js & npm/yarn
Node.js >= 18.0.0
npm >= 8.0.0 ou yarn >= 1.22.0

# Python & pip  
Python >= 3.9.0
pip >= 21.0.0

# Base de données
MongoDB >= 5.0.0 (local ou Atlas)

# Mobile Development
Expo CLI >= 6.0.0
Android Studio (pour Android)
Xcode (pour iOS, macOS seulement)
```

#### Production
```bash
# Containerisation
Docker >= 20.0.0
Docker Compose >= 2.0.0

# Orchestration (optionnel)
Kubernetes >= 1.24.0

# Monitoring
MongoDB Atlas
Expo Application Services (EAS)
```

### Configuration Rapide

#### 1. Clone du Projet
```bash
git clone https://github.com/your-org/lca-tv-burkina.git
cd lca-tv-burkina
```

#### 2. Configuration Backend
```bash
cd backend

# Installation des dépendances
pip install -r requirements.txt

# Configuration des variables d'environnement
cp .env.example .env

# Éditer .env avec vos clés
nano .env
```

#### 3. Configuration Frontend
```bash
cd frontend

# Installation des dépendances
npm install
# ou
yarn install

# Configuration des variables d'environnement
cp .env.example .env

# Éditer .env avec vos configurations
nano .env
```

#### 4. Variables d'Environnement

**Backend (.env)**
```env
# Base de données
MONGO_URL=mongodb://localhost:27017/lcatv_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION_HOURS=24

# YouTube API
YOUTUBE_API_KEY=your-youtube-api-key-here
YOUTUBE_CHANNEL_ID=your-channel-id-here

# Email Configuration (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Paiements (à venir)
ORANGE_MONEY_API_KEY=your-orange-money-key
MOOV_MONEY_API_KEY=your-moov-money-key
```

**Frontend (.env)**
```env
# Backend API
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001

# Expo Configuration
EXPO_PACKAGER_HOSTNAME=localhost
EXPO_USE_FAST_RESOLVER=1

# App Configuration
EXPO_PUBLIC_APP_NAME=LCA TV Burkina Faso
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### 🚀 Démarrage de l'Application

#### Démarrage Automatique (Recommandé)
```bash
# Linux/macOS
chmod +x start_lcatv_app.sh
./start_lcatv_app.sh

# Windows
start_lcatv_app.bat
```

#### Démarrage Manuel

**Backend**
```bash
cd backend
python server.py
# ou
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Frontend**
```bash
cd frontend
npx expo start
# ou
yarn expo start
```

**Base de données MongoDB**
```bash
# Local MongoDB
mongod --dbpath /path/to/your/db

# Ou utiliser MongoDB Atlas (cloud)
# Configurer l'URL dans .env
```

---

## 📦 Génération APK & Distribution

### Configuration EAS (Expo Application Services)

#### 1. Installation EAS CLI
```bash
npm install -g @expo/eas-cli
eas login
```

#### 2. Configuration du Projet
```bash
cd frontend
eas build:configure
```

#### 3. Configuration `eas.json`
```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890"
      }
    }
  }
}
```

#### 4. Configuration `app.json` Complète
```json
{
  "expo": {
    "name": "LCA TV Burkina Faso",
    "slug": "lca-tv-burkina",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#009639"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.lcatv.burkina",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "Cette app utilise la caméra pour les photos de profil.",
        "NSMicrophoneUsageDescription": "Cette app utilise le microphone pour les commentaires audio."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#009639"
      },
      "package": "com.lcatv.burkina",
      "versionCode": 1,
      "permissions": [
        "INTERNET",
        "WRITE_EXTERNAL_STORAGE",
        "READ_EXTERNAL_STORAGE",
        "CAMERA",
        "RECORD_AUDIO"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    },
    "owner": "your-expo-username"
  }
}
```

### Génération des Builds

#### APK de Développement
```bash
eas build --platform android --profile development
```

#### APK de Production
```bash
eas build --platform android --profile production
```

#### iOS Build
```bash
eas build --platform ios --profile production
```

#### Build Multiplateforme
```bash
eas build --platform all --profile production
```

### Soumission aux Stores

#### Google Play Store
```bash
eas submit --platform android --profile production
```

#### Apple App Store
```bash
eas submit --platform ios --profile production
```

---

## 🔧 Customisation & Personnalisation

### Thèmes & Couleurs

#### Modification des Couleurs Primaires
```typescript
// frontend/constants/Colors.ts
export const CUSTOM_BURKINA_COLORS = {
  primary: '#your-primary-color',
  secondary: '#your-secondary-color',
  accent: '#your-accent-color',
  // ... autres couleurs
};
```

#### Thème Sombre/Clair
```typescript
// frontend/contexts/ThemeContext.tsx
export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  
  const theme = {
    colors: isDark ? DARK_COLORS : LIGHT_COLORS,
    // ... autres propriétés
  };
  
  return (
    <ThemeContext.Provider value={{ theme, isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Localisation & Langues

#### Configuration i18n
```bash
npm install react-native-localize expo-localization
```

#### Fichiers de Traduction
```typescript
// frontend/locales/fr.json
{
  "welcome": "Bienvenue sur LCA TV",
  "watch": "Regarder",
  "comments": "Commentaires",
  "login": "Se connecter"
}

// frontend/locales/en.json  
{
  "welcome": "Welcome to LCA TV",
  "watch": "Watch",
  "comments": "Comments", 
  "login": "Login"
}
```

### Configuration YouTube Channel

#### Changement de Chaîne YouTube
```python
# backend/server.py
YOUTUBE_CHANNEL_ID = "your-new-channel-id"
YOUTUBE_API_KEY = "your-youtube-api-key"

# Mise à jour des endpoints de récupération vidéos
async def get_latest_videos():
    # Logique mise à jour pour nouvelle chaîne
    pass
```

### Personnalisation des Rubriques

#### Modification des Catégories Automatiques
```typescript
// frontend/app/emissions.tsx
const categorizeVideos = (videos: YouTubeVideo[]): VideoCategory[] => {
  // Ajouter vos propres règles de catégorisation
  const customCategories = [
    {
      key: 'your_custom_category',
      label: 'Votre Catégorie',
      icon: 'your-icon',
      color: 'your-color',
      videos: videos.filter(v => 
        v.title.toLowerCase().includes('votre-mot-clé')
      )
    }
    // ... autres catégories
  ];
};
```

### Customisation du Logo & Branding

#### Remplacement des Assets
```bash
frontend/assets/
├── icon.png              # Icône app (1024x1024)
├── adaptive-icon.png      # Icône Android adaptive
├── splash.png             # Écran de démarrage
├── favicon.png            # Favicon web
└── logo/
    ├── logo-light.png     # Logo clair
    ├── logo-dark.png      # Logo sombre
    └── watermark.png      # Filigrane
```

---

## 🧪 Tests & Qualité

### Tests Frontend

#### Configuration Jest
```bash
npm install --save-dev jest @testing-library/react-native
```

#### Tests Unitaires
```typescript
// __tests__/components/VideoCard.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import VideoCard from '../components/VideoCard';

describe('VideoCard', () => {
  it('should render video title', () => {
    const mockVideo = {
      id: 'test123',
      title: 'Test Video',
      thumbnail: 'test.jpg'
    };
    
    const { getByText } = render(<VideoCard video={mockVideo} />);
    expect(getByText('Test Video')).toBeTruthy();
  });
});
```

### Tests Backend

#### Tests API avec pytest
```bash
pip install pytest pytest-asyncio httpx
```

```python
# tests/test_comments.py
import pytest
from httpx import AsyncClient
from server import app

@pytest.mark.asyncio
async def test_add_comment():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/videos/test123/comments",
            json={
                "video_id": "test123",
                "content": "Test comment",
                "user_name": "Test User"
            }
        )
    assert response.status_code == 200
    assert "Commentaire ajouté avec succès" in response.json()["message"]
```

### Linting & Formatage

#### ESLint Configuration
```json
// .eslintrc.js
module.exports = {
  extends: ['expo', '@react-native-community'],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-unused-vars': 'error'
  }
};
```

#### Prettier Configuration
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

---

## 🚀 Déploiement Production

### Déploiement avec Docker

#### Construction des Images
```bash
# Backend
docker build -t lcatv-backend ./backend

# Frontend (pour web)
docker build -t lcatv-frontend ./frontend
```

#### Docker Compose Production
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build: ./backend
    environment:
      - MONGO_URL=mongodb://mongodb:27017/lcatv_prod
      - JWT_SECRET=${JWT_SECRET}
      - YOUTUBE_API_KEY=${YOUTUBE_API_KEY}
    depends_on:
      - mongodb
    networks:
      - lcatv-network

  mongodb:
    image: mongo:5.0
    volumes:
      - mongodb_data:/data/db
    networks:
      - lcatv-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    networks:
      - lcatv-network

volumes:
  mongodb_data:

networks:
  lcatv-network:
    driver: bridge
```

### Déploiement Kubernetes

#### Deployment Backend
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lcatv-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: lcatv-backend
  template:
    metadata:
      labels:
        app: lcatv-backend
    spec:
      containers:
      - name: backend
        image: lcatv-backend:latest
        ports:
        - containerPort: 8001
        env:
        - name: MONGO_URL
          valueFrom:
            secretKeyRef:
              name: lcatv-secrets
              key: mongo-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: lcatv-secrets
              key: jwt-secret
```

### Configuration CI/CD

#### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy LCA TV App

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd frontend && npm ci
        cd ../backend && pip install -r requirements.txt
        
    - name: Run tests
      run: |
        cd frontend && npm test
        cd ../backend && pytest

  build-mobile:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup EAS
      uses: expo/expo-github-action@v7
      with:
        token: ${{ secrets.EXPO_TOKEN }}
        
    - name: Build APK
      run: |
        cd frontend
        eas build --platform android --non-interactive --no-wait

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to production
      run: |
        # Scripts de déploiement
        echo "Deploying backend..."
```

---

## 📊 Monitoring & Analytics

### Logging System

#### Configuration des Logs
```python
# backend/logger_config.py
import logging
from logging.handlers import RotatingFileHandler

def setup_logger():
    logger = logging.getLogger("lcatv")
    logger.setLevel(logging.INFO)
    
    # File handler
    file_handler = RotatingFileHandler(
        'logs/lcatv.log', 
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    
    # Console handler
    console_handler = logging.StreamHandler()
    
    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    )
    
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger
```

### Métriques d'Usage

#### Suivi des Événements
```typescript
// frontend/utils/analytics.ts
export const trackVideoView = (videoId: string, duration: number) => {
  // Envoyer à votre service d'analytics
  console.log(`Video ${videoId} viewed for ${duration} seconds`);
};

export const trackCommentPosted = (videoId: string) => {
  console.log(`Comment posted on video ${videoId}`);
};

export const trackUserRegistration = (method: string) => {
  console.log(`User registered via ${method}`);
};
```

### Monitoring de Performance

#### Health Check Endpoints
```python
# backend/server.py
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "version": "1.0.0",
        "services": {
            "database": "connected",
            "youtube_api": "operational"
        }
    }
```

---

## 🔒 Sécurité & Bonnes Pratiques

### Authentification & Autorisation

#### JWT Token Management
```python
# backend/auth.py
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except JWTError:
        return None
```

### Validation des Données

#### Modèles Pydantic Renforcés
```python
from pydantic import BaseModel, EmailStr, validator

class CommentCreate(BaseModel):
    video_id: str
    content: str
    user_name: Optional[str] = "Utilisateur Anonyme"
    
    @validator('content')
    def validate_content(cls, v):
        if len(v.strip()) < 1:
            raise ValueError('Le commentaire ne peut pas être vide')
        if len(v) > 500:
            raise ValueError('Le commentaire ne peut pas dépasser 500 caractères')
        return v.strip()
```

### Protection CORS & Rate Limiting

```python
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

# Rate Limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/videos/{video_id}/comments")
@limiter.limit("5/minute")  # Max 5 commentaires par minute
async def add_comment(request: Request, ...):
    # Implementation
    pass
```

---

## 🛠️ Maintenance & Mise à Jour

### Mise à Jour de l'Application

#### Mise à Jour OTA (Over-The-Air)
```bash
# Publier une mise à jour
eas update --branch production --message "Bug fixes and improvements"
```

#### Configuration Auto-Update
```typescript
// frontend/app/_layout.tsx
import * as Updates from 'expo-updates';

useEffect(() => {
  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.log('Update check failed:', error);
    }
  };
  
  checkForUpdates();
}, []);
```

### Sauvegarde Base de Données

#### Script de Sauvegarde MongoDB
```bash
#!/bin/bash
# backup_database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/lcatv"
DB_NAME="lcatv_db"

# Créer le répertoire de sauvegarde
mkdir -p $BACKUP_DIR

# Sauvegarde MongoDB
mongodump --db $DB_NAME --out $BACKUP_DIR/backup_$DATE

# Compression
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/backup_$DATE

# Nettoyage
rm -rf $BACKUP_DIR/backup_$DATE

# Garder seulement les 30 dernières sauvegardes
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

### Monitoring Continu

#### Script de Monitoring
```python
# scripts/monitor.py
import requests
import smtplib
from email.mime.text import MIMEText
from datetime import datetime

def check_api_health():
    try:
        response = requests.get('http://localhost:8001/api/health', timeout=10)
        return response.status_code == 200
    except:
        return False

def send_alert(message):
    # Configuration email d'alerte
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    sender_email = "alerts@lcatv.com"
    sender_password = "app_password"
    recipient = "admin@lcatv.com"
    
    msg = MIMEText(message)
    msg['Subject'] = "LCA TV Alert"
    msg['From'] = sender_email
    msg['To'] = recipient
    
    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)

if __name__ == "__main__":
    if not check_api_health():
        send_alert(f"API Health Check Failed - {datetime.now()}")
        print("Alert sent: API is down")
    else:
        print("API is healthy")
```

---

## 📚 Documentation Développeur

### Guides de Contribution

#### Structure des Commits
```
feat: add new comment system
fix: resolve video loading issue  
docs: update API documentation
style: format code according to standards
refactor: reorganize video categorization logic
test: add unit tests for authentication
chore: update dependencies
```

#### Pull Request Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

### Standards de Code

#### React Native/TypeScript Standards
```typescript
// Bon exemple de composant
interface VideoCardProps {
  video: YouTubeVideo;
  onPress: (video: YouTubeVideo) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onPress }) => {
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(video);
  }, [video, onPress]);

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image source={{ uri: video.thumbnail }} style={styles.thumbnail} />
      <Text style={styles.title}>{video.title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: BURKINA_COLORS.white,
  },
  // ... autres styles
});
```

---

## 🎯 Roadmap & Futures Fonctionnalités

### Version 1.1 (Q1 2025)
- [ ] Intégration Orange Money & Moov Money
- [ ] Notifications Push Firebase
- [ ] Mode hors-ligne avec cache vidéos
- [ ] Système de favoris & playlists

### Version 1.2 (Q2 2025)
- [ ] Chat en direct pendant les émissions
- [ ] Partage social (Facebook, WhatsApp, Twitter)
- [ ] Système de recommandations IA
- [ ] Support multi-langues (Français, Moore, Dioula)

### Version 2.0 (Q3 2025)
- [ ] Streaming audio en arrière-plan
- [ ] Téléchargement vidéos pour visionnage hors-ligne
- [ ] Interface tablette optimisée
- [ ] API ouverte pour développeurs tiers

---

## 📞 Support & Contact

### Équipe de Développement
- **Lead Developer**: [Votre nom]
- **Backend Developer**: [Nom développeur backend]
- **Mobile Developer**: [Nom développeur mobile]
- **UI/UX Designer**: [Nom designer]

### Ressources d'Aide
- **Documentation**: [https://docs.lcatv.bf](https://docs.lcatv.bf)
- **Issues GitHub**: [https://github.com/org/lca-tv/issues](https://github.com/org/lca-tv/issues)
- **Email Support**: support@lcatv.bf
- **Communauté Discord**: [https://discord.gg/lcatv](https://discord.gg/lcatv)

### Signalement de Bugs
Pour signaler un bug, veuillez inclure:
1. Version de l'application
2. Plateforme (iOS/Android/Web)
3. Étapes pour reproduire
4. Captures d'écran si applicable
5. Logs d'erreur

---

## 📄 Licence & Copyright

```
MIT License

Copyright (c) 2025 LCA TV Burkina Faso

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Remerciements

Nous remercions tous les contributeurs, testeurs et la communauté qui ont rendu ce projet possible. LCA TV Burkina Faso est fier de servir la communauté burkinabè avec une technologie moderne et accessible.

**Fait avec ❤️ au Burkina Faso 🇧🇫**

---

*Dernière mise à jour: 6 septembre 2025*
*Version du document: 1.0.0*
