#!/usr/bin/env python3
"""
Script de démarrage pour le site web LCA TV
Démarre l'application Flask sur le port 5005
"""

import os
import sys
import subprocess

# Ajouter le répertoire lca-tv-website au path
website_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lca-tv-website')
sys.path.insert(0, website_dir)

def start_website():
    """Démarrer le site web LCA TV"""
    print("🚀 Démarrage du site web LCA TV...")
    
    # Changer vers le répertoire du site web
    os.chdir(website_dir)
    
    # Installer les dépendances Flask si nécessaire
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'flask', 'requests', 'werkzeug', 'pillow'], 
                      check=True, capture_output=True)
        print("✅ Dépendances Flask installées")
    except subprocess.CalledProcessError:
        print("⚠️  Erreur lors de l'installation des dépendances Flask")
    
    # Importer et démarrer l'application Flask
    from app_advanced import app, create_sample_data
    
    # Créer les données d'exemple
    try:
        create_sample_data()
        print("✅ Données d'exemple créées")
    except Exception as e:
        print(f"⚠️  Erreur lors de la création des données: {e}")
    
    print("🌐 Site web LCA TV disponible sur : http://localhost:5005")
    print("🔐 Login admin : admin / lcatv2024")
    print("📊 Dashboard disponible après connexion")
    
    # Démarrer l'application Flask
    app.run(host='0.0.0.0', port=5005, debug=False)

if __name__ == '__main__':
    start_website()