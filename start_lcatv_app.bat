@echo off
rem 🇧🇫 LCA TV Burkina Faso - Script de Lancement Windows
echo 🇧🇫 Démarrage de l'application LCA TV Burkina Faso...

echo ======================================
echo    LCA TV BURKINA FASO - LANCEUR
echo ======================================

echo 🔍 Vérification des prérequis...

rem Vérifier Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js détecté

rem Vérifier Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python n'est pas installé. Veuillez l'installer depuis https://python.org/
    pause
    exit /b 1
)
echo ✅ Python détecté

echo 🐍 Configuration de l'environnement Python...
cd backend

rem Créer l'environnement virtuel s'il n'existe pas
if not exist "venv" (
    python -m venv venv
    echo ✅ Environnement virtuel créé
)

rem Activer l'environnement virtuel
call venv\Scripts\activate.bat

rem Installer les dépendances Python
pip install -r requirements.txt
echo ✅ Dépendances Python installées

echo 🚀 Démarrage du backend FastAPI...
start /B python server.py

rem Attendre que le backend soit prêt
timeout /t 5 >nul

echo 📱 Configuration du frontend React Native...
cd ..\frontend

rem Installer les dépendances Node.js si nécessaire
if not exist "node_modules" (
    npm install
    echo ✅ Dépendances Node.js installées
)

echo 🌟 Démarrage de l'application mobile...
echo 📱 Scanner le QR code avec Expo Go pour tester sur mobile
echo 🌐 Appuyer 'w' pour ouvrir dans le navigateur web
echo 📊 API Documentation: http://localhost:8001/docs

npx expo start

pause