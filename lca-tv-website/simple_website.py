#!/usr/bin/env python3
"""
LCA TV - Site web simple avec redirection vers Dashboard React
"""

from flask import Flask, render_template, request, redirect, flash
import os
import sqlite3
from werkzeug.security import check_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = 'lcatv-simple-secret-key'

# Configuration de base de données
DB_PATH = 'lca_tv.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Initialiser la base de données avec un utilisateur admin"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Créer la table users si elle n'existe pas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            role TEXT DEFAULT 'user',
            is_active INTEGER DEFAULT 1,
            created_at TEXT,
            last_login TEXT
        )
    ''')
    
    # Vérifier si l'utilisateur admin existe
    cursor.execute('SELECT COUNT(*) FROM users WHERE username = ?', ('admin',))
    if cursor.fetchone()[0] == 0:
        from werkzeug.security import generate_password_hash
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, role, full_name, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ('admin', 'admin@lcatv.bf', generate_password_hash('lcatv2024'), 'admin', 'Administrateur LCA TV', 1))
        conn.commit()
        print("✅ Utilisateur admin créé")
    
    conn.close()

@app.route('/')
def home():
    """Page d'accueil"""
    return render_template('home_simple.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Page de connexion avec redirection vers Dashboard React"""
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        
        # Vérification des identifiants admin pour redirection
        if username == 'admin' and password == 'lcatv2024':
            return redirect('http://localhost:3000/login?token=admin_authorized')
        
        # Vérification normale dans la base de données
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM users WHERE username = ? AND is_active = 1', (username,))
            user = cursor.fetchone()
            
            if user and check_password_hash(user['password_hash'], password):
                conn.close()
                if user['role'] == 'admin':
                    return redirect('http://localhost:3000/login?token=admin_authorized')
                else:
                    flash('Accès autorisé - Version standard', 'success')
                    return redirect('/')
            else:
                flash('Nom d\'utilisateur ou mot de passe incorrect.', 'error')
            
            conn.close()
        except Exception as e:
            flash(f'Erreur de connexion: {str(e)}', 'error')
    
    return render_template('login_integrated.html')

@app.route('/api/auth/verify', methods=['POST'])
def verify_auth():
    """API d'authentification pour le Dashboard React"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        # Vérification admin
        if username == 'admin' and password in ['lcatv2024', 'admin123']:
            return {
                'success': True,
                'token': 'admin_token_2025',
                'user': {
                    'username': 'admin',
                    'full_name': 'Administrateur LCA TV',
                    'role': 'admin',
                    'email': 'admin@lcatv.bf'
                }
            }
        
        # Vérification base de données
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE username = ? AND is_active = 1', (username,))
        user = cursor.fetchone()
        
        if user and check_password_hash(user['password_hash'], password):
            conn.close()
            return {
                'success': True,
                'token': f'token_{user["id"]}',
                'user': {
                    'username': user['username'],
                    'full_name': user['full_name'] or user['username'],
                    'role': user['role'],
                    'email': user['email']
                }
            }
        
        conn.close()
        return {'success': False, 'message': 'Identifiants incorrects'}, 401
        
    except Exception as e:
        return {'success': False, 'message': str(e)}, 500

@app.route('/about')
def about():
    """Page à propos"""
    return "<h1>LCA TV - À propos</h1><p>Chaîne de télévision du Burkina Faso</p>"

@app.route('/contact')
def contact():
    """Page contact"""
    return "<h1>LCA TV - Contact</h1><p>Contactez-nous pour plus d'informations</p>"

if __name__ == '__main__':
    print("🚀 Initialisation du site web LCA TV...")
    init_database()
    print("🌐 Site web disponible sur : http://localhost:5005")
    print("🔐 Login admin : admin / lcatv2024")
    app.run(host='0.0.0.0', port=5005, debug=False)