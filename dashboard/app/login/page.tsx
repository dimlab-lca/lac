'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '@/components/Button';
import { Card, CardContent } from '@/components/Card';
import { authApi } from '@/lib/api';
import type { LoginCredentials } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      
      // Store auth data
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('user_data', JSON.stringify(response.user));
      
      toast.success('Connexion réussie !');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(
        error.response?.data?.detail || 
        'Erreur de connexion. Vérifiez vos identifiants.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">LCA TV</h1>
          <p className="text-gray-600 mt-2">Dashboard Administratif</p>
        </div>

        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="username" className="form-label">
                  Nom d'utilisateur
                </label>
                <input
                  {...register('username', { required: 'Le nom d\'utilisateur est requis' })}
                  type="text"
                  id="username"
                  className="form-input"
                  placeholder="Entrez votre nom d'utilisateur"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  Mot de passe
                </label>
                <input
                  {...register('password', { required: 'Le mot de passe est requis' })}
                  type="password"
                  id="password"
                  className="form-input"
                  placeholder="Entrez votre mot de passe"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                loading={isLoading}
                className="w-full"
                size="lg"
              >
                Se connecter
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Identifiants de démonstration :</h3>
              <div className="text-sm text-gray-600">
                <p><strong>Admin :</strong> admin / admin123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>&copy; 2025 LCA TV Burkina Faso. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}