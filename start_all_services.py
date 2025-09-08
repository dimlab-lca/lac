#!/usr/bin/env python3
"""
Script de démarrage pour tous les services LCA TV
- Site web Flask (port 5005)
- Backend FastAPI (port 8001) 
- Dashboard React (port 3000)
"""

import os
import sys
import time
import subprocess
import threading
from pathlib import Path

class ServiceManager:
    def __init__(self):
        self.base_dir = Path(__file__).parent
        self.processes = []
        
    def start_flask_website(self):
        """Démarrer le site web Flask"""
        print("🌐 Démarrage du site web Flask LCA TV (port 5005)...")
        
        try:
            # Changer vers le répertoire du site web
            website_dir = self.base_dir / 'lca-tv-website'
            os.chdir(website_dir)
            
            # Démarrer l'application Flask intégrée
            process = subprocess.Popen([
                sys.executable, 'app_integrated.py'
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            self.processes.append(('Flask Website', process))
            print("✅ Site web Flask démarré sur http://localhost:5005")
            
        except Exception as e:
            print(f"❌ Erreur lors du démarrage du site web Flask: {e}")
    
    def start_fastapi_backend(self):
        """Vérifier et redémarrer le backend FastAPI si nécessaire"""
        print("🔧 Vérification du backend FastAPI (port 8001)...")
        
        try:
            import requests
            response = requests.get('http://localhost:8001/api/health', timeout=5)
            if response.status_code == 200:
                print("✅ Backend FastAPI déjà en cours d'exécution")
                return
        except:
            print("🔄 Backend FastAPI non disponible, tentative de redémarrage...")
        
        try:
            # Redémarrer via supervisor
            subprocess.run(['sudo', 'supervisorctl', 'restart', 'backend'], check=True)
            time.sleep(5)
            
            # Vérifier à nouveau
            response = requests.get('http://localhost:8001/api/health', timeout=10)
            if response.status_code == 200:
                print("✅ Backend FastAPI redémarré avec succès")
            else:
                print("⚠️  Backend FastAPI répond mais avec des erreurs")
                
        except Exception as e:
            print(f"❌ Erreur lors du redémarrage du backend: {e}")
    
    def start_react_dashboard(self):
        """Démarrer le dashboard React"""
        print("⚛️  Démarrage du dashboard React (port 3000)...")
        
        try:
            # Changer vers le répertoire du dashboard
            dashboard_dir = self.base_dir / 'dashboard'
            os.chdir(dashboard_dir)
            
            # Vérifier si les dépendances sont installées
            if not (dashboard_dir / 'node_modules').exists():
                print("📦 Installation des dépendances React...")
                subprocess.run(['yarn', 'install'], check=True)
            
            # Démarrer le serveur de développement
            process = subprocess.Popen([
                'yarn', 'dev'
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            self.processes.append(('React Dashboard', process))
            print("✅ Dashboard React démarré sur http://localhost:3000")
            
        except Exception as e:
            print(f"❌ Erreur lors du démarrage du dashboard React: {e}")
    
    def check_services(self):
        """Vérifier l'état des services"""
        print("\n🔍 Vérification des services...")
        
        services = [
            ('Site web Flask', 'http://localhost:5005'),
            ('Backend FastAPI', 'http://localhost:8001/api/health'),
            ('Dashboard React', 'http://localhost:3000'),
        ]
        
        import requests
        for name, url in services:
            try:
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    print(f"✅ {name}: Opérationnel")
                else:
                    print(f"⚠️  {name}: Répond avec le code {response.status_code}")
            except:
                print(f"❌ {name}: Non disponible")
    
    def print_access_info(self):
        """Afficher les informations d'accès"""
        print("\n" + "="*60)
        print("🚀 SERVICES LCA TV DÉMARRÉS")
        print("="*60)
        print("🌐 Site web principal    : http://localhost:5005")
        print("🔐 Login admin          : admin / lcatv2024")
        print("📊 Dashboard moderne    : http://localhost:3000")
        print("🔧 API Backend          : http://localhost:8001")
        print("="*60)
        print("💡 UTILISATION:")
        print("1. Visitez http://localhost:5005 pour le site web")
        print("2. Cliquez sur 'Login' et utilisez: admin / lcatv2024")
        print("3. Vous serez redirigé vers le dashboard moderne")
        print("4. Le dashboard utilise l'API backend pour les données")
        print("="*60)
    
    def start_all(self):
        """Démarrer tous les services"""
        print("🚀 Démarrage de tous les services LCA TV...")
        
        # 1. Backend FastAPI (via supervisor)
        self.start_fastapi_backend()
        time.sleep(3)
        
        # 2. Dashboard React 
        dashboard_thread = threading.Thread(target=self.start_react_dashboard)
        dashboard_thread.daemon = True
        dashboard_thread.start()
        time.sleep(10)  # Attendre que React démarre
        
        # 3. Site web Flask
        flask_thread = threading.Thread(target=self.start_flask_website)
        flask_thread.daemon = True
        flask_thread.start()
        time.sleep(5)
        
        # 4. Vérifier les services
        self.check_services()
        
        # 5. Afficher les informations d'accès
        self.print_access_info()
        
        # 6. Garder le script en vie
        try:
            print("\n⏳ Services en cours d'exécution... Appuyez sur Ctrl+C pour arrêter.")
            while True:
                time.sleep(10)
                # Optionnellement, vérifier périodiquement les services
        except KeyboardInterrupt:
            print("\n🛑 Arrêt des services...")
            self.stop_all()
    
    def stop_all(self):
        """Arrêter tous les processus"""
        for name, process in self.processes:
            try:
                process.terminate()
                print(f"✅ {name} arrêté")
            except:
                print(f"⚠️  Erreur lors de l'arrêt de {name}")

if __name__ == '__main__':
    manager = ServiceManager()
    manager.start_all()