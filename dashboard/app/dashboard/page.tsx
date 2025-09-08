'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Eye,
  MousePointer,
  AlertCircle,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/Card';
import LoadingSpinner from '@/components/LoadingSpinner';
import { dashboardApi } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { DashboardStats, RevenueAnalytics } from '@/types';

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 2400000 },
  { month: 'Fév', revenue: 1800000 },
  { month: 'Mar', revenue: 3200000 },
  { month: 'Avr', revenue: 2800000 },
  { month: 'Mai', revenue: 3600000 },
  { month: 'Jun', revenue: 4200000 },
];

const clientTypeData = [
  { name: 'Télécommunications', value: 45, color: '#dc2626' },
  { name: 'Banques', value: 30, color: '#ea580c' },
  { name: 'Commerce', value: 15, color: '#d97706' },
  { name: 'Services', value: 10, color: '#ca8a04' },
];

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}

function StatsCard({ title, value, change, changeType = 'neutral', icon: Icon, loading }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {loading ? <LoadingSpinner size="sm" /> : value}
            </p>
            {change && (
              <p className={`text-sm mt-1 ${
                changeType === 'positive' ? 'text-green-600' : 
                changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {change}
              </p>
            )}
          </div>
          <div className="p-3 bg-red-50 rounded-full">
            <Icon className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('30d');

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch revenue analytics
  const { data: revenueAnalytics, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue-analytics'],
    queryFn: dashboardApi.getRevenueAnalytics,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600 mt-1">Vue d'ensemble de votre activité publicitaire</p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="form-input py-2 text-sm"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
              <option value="1y">1 an</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Clients"
            value={formatNumber(stats?.total_clients || 0)}
            change="+12% ce mois"
            changeType="positive"
            icon={Users}
            loading={statsLoading}
          />
          <StatsCard
            title="Commandes Actives"
            value={formatNumber(stats?.active_orders || 0)}
            change="+8% ce mois"
            changeType="positive"
            icon={FileText}
            loading={statsLoading}
          />
          <StatsCard
            title="Revenus Mensuels"
            value={formatCurrency(stats?.monthly_revenue || 0)}
            change="+15% ce mois"
            changeType="positive"
            icon={DollarSign}
            loading={statsLoading}
          />
          <StatsCard
            title="Paiements en Attente"
            value={formatCurrency(stats?.pending_payments || 0)}
            change="3 factures"
            changeType="neutral"
            icon={AlertCircle}
            loading={statsLoading}
          />
        </div>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatsCard
            title="Total Impressions"
            value={formatNumber(stats?.total_impressions || 0)}
            change="+25% ce mois"
            changeType="positive"
            icon={Eye}
            loading={statsLoading}
          />
          <StatsCard
            title="Total Clics"
            value={formatNumber(stats?.total_clicks || 0)}
            change="+18% ce mois"
            changeType="positive"
            icon={MousePointer}
            loading={statsLoading}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Évolution des Revenus</h3>
              <p className="text-sm text-gray-500">Revenus des 6 derniers mois</p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {revenueLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenus']} />
                      <Bar dataKey="revenue" fill="#dc2626" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Client Types Chart */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Répartition des Clients</h3>
              <p className="text-sm text-gray-500">Par secteur d'activité</p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {clientTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Part']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {clientTypeData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Activité Récente</h3>
            <p className="text-sm text-gray-500">Dernières actions dans le système</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: 'Nouvelle commande créée',
                  client: 'Orange Burkina Faso',
                  time: 'Il y a 15 minutes',
                  type: 'order',
                },
                {
                  action: 'Paiement reçu',
                  client: 'Banque Atlantique',
                  time: 'Il y a 1 heure',
                  type: 'payment',
                },
                {
                  action: 'Campagne terminée',
                  client: 'Moov Africa',
                  time: 'Il y a 2 heures',
                  type: 'campaign',
                },
                {
                  action: 'Nouveau client ajouté',
                  client: 'Coris Bank',
                  time: 'Il y a 3 heures',
                  type: 'client',
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'order' ? 'bg-blue-500' :
                      activity.type === 'payment' ? 'bg-green-500' :
                      activity.type === 'campaign' ? 'bg-yellow-500' : 'bg-purple-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.client}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}