#!/bin/bash

# 🇧🇫 LCA TV Burkina Faso - Script de Lancement Rapide
echo "🇧🇫 Démarrage de l'application LCA TV Burkina Faso..."

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}   LCA TV BURKINA FASO - LANCEUR     ${NC}"
echo -e "${GREEN}======================================${NC}"

# Vérification des prérequis
echo -e "${BLUE}🔍 Vérification des prérequis...${NC}"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version) détecté${NC}"

# Vérifier Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 n'est pas installé. Veuillez l'installer depuis https://python.org/${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python $(python3 --version) détecté${NC}"

# Vérifier MongoDB
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB n'est pas installé localement. Assurez-vous d'avoir une instance MongoDB disponible.${NC}"
fi

# Créer et activer l'environnement virtuel Python
echo -e "${BLUE}🐍 Configuration de l'environnement Python...${NC}"
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✅ Environnement virtuel créé${NC}"
fi

# Activer l'environnement virtuel
source venv/bin/activate || source venv/Scripts/activate

# Installer les dépendances Python
pip install -r requirements.txt
echo -e "${GREEN}✅ Dépendances Python installées${NC}"

# Démarrer le backend en arrière-plan
echo -e "${BLUE}🚀 Démarrage du backend FastAPI...${NC}"
python server.py &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend démarré (PID: $BACKEND_PID)${NC}"

# Attendre que le backend soit prêt
sleep 5

# Configuration du frontend
echo -e "${BLUE}📱 Configuration du frontend React Native...${NC}"
cd ../frontend

# Installer les dépendances Node.js
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Dépendances Node.js installées${NC}"
fi

# Démarrer le frontend
echo -e "${BLUE}🌟 Démarrage de l'application mobile...${NC}"
echo -e "${YELLOW}📱 Scanner le QR code avec Expo Go pour tester sur mobile${NC}"
echo -e "${YELLOW}🌐 Appuyer 'w' pour ouvrir dans le navigateur web${NC}"
echo -e "${YELLOW}📊 API Documentation: http://localhost:8001/docs${NC}"

npx expo start

# Nettoyage à la fermeture
cleanup() {
    echo -e "${BLUE}🧹 Arrêt des services...${NC}"
    kill $BACKEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Services arrêtés${NC}"
    exit 0
}

trap cleanup INT TERM EXIT