#!/usr/bin/env python3
"""
LCA TV - Application Intégrée avec Redirection vers Dashboard React
Version modifiée qui redirige vers le dashboard React après login
"""

from flask import Flask, render_template, jsonify, request, session, redirect, url_for, flash, send_from_directory
import requests
import os
import json
import sqlite3
from datetime import datetime, timedelta
from functools import wraps
import threading
import time
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from PIL import Image
import base64

# Importer la configuration et les fonctions de base depuis app_advanced
from app_advanced import *

# Override de la route login pour redirection vers Dashboard React
@app.route('/login', methods=['GET', 'POST'])
def login():
    """Connexion administrateur avec redirection vers Dashboard React"""
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        
        # Vérification des identifiants admin spéciaux pour le dashboard
        if username == 'admin' and password == 'lcatv2024':
            # Redirection directe vers le Dashboard React
            return redirect('http://localhost:3000/login?token=admin_authorized')
        
        # Authentification normale pour les autres utilisateurs
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE username = ? AND is_active = 1', (username,))
        user = cursor.fetchone()
        
        if user and check_password_hash(user['password_hash'], password):
            # Mettre à jour la dernière connexion
            cursor.execute('UPDATE users SET last_login = ? WHERE id = ?', 
                         (datetime.now(), user['id']))
            conn.commit()
            
            session['user'] = user['username']
            session['user_id'] = user['id']
            session['user_role'] = user['role']
            session.permanent = True
            
            log_activity('login', f'Connexion réussie pour {username}', user['id'])
            
            # Si c'est un admin, rediriger vers le Dashboard React
            if user['role'] == 'admin':
                conn.close()
                return redirect('http://localhost:3000/login?token=admin_authorized')
            else:
                flash(f'Bienvenue {user["full_name"] or user["username"]} !', 'success')
                conn.close()
                return redirect(url_for('dashboard'))
        else:
            log_activity('login_failed', f'Tentative de connexion échouée pour {username}')
            flash('Nom d\'utilisateur ou mot de passe incorrect.', 'error')
        
        conn.close()
    
    return render_template('login_integrated.html')

# Route API pour vérifier l'authentification depuis le Dashboard React
@app.route('/api/auth/verify', methods=['POST'])
def verify_auth():
    """Vérifier l'authentification pour le Dashboard React"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        # Vérification des identifiants admin
        if username == 'admin' and password in ['lcatv2024', 'admin123']:
            return jsonify({
                'success': True,
                'token': 'admin_token_2025',
                'user': {
                    'username': 'admin',
                    'full_name': 'Administrateur LCA TV',
                    'role': 'admin',
                    'email': 'admin@lcatv.bf'
                }
            })
        
        # Vérification dans la base de données SQLite
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE username = ? AND is_active = 1', (username,))
        user = cursor.fetchone()
        
        if user and check_password_hash(user['password_hash'], password):
            conn.close()
            return jsonify({
                'success': True,
                'token': f'token_{user["id"]}_{int(time.time())}',
                'user': {
                    'username': user['username'],
                    'full_name': user['full_name'] or user['username'],
                    'role': user['role'],
                    'email': user['email']
                }
            })
        
        conn.close()
        return jsonify({'success': False, 'message': 'Identifiants incorrects'}), 401
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005, debug=False)