'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Package, ShoppingBag, TrendingUp, MapPin, Palette, Clock, IndianRupee } from 'lucide-react';

interface Stats {
  totalSellers: number;
  totalBuyers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  craftTypeStats: { _id: string; count: number }[];
  recentOrders: {
    _id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    buyer?: { name: string };
  }[];
  recentSellers: {
    _id: string;
    name: string;
    craftType: string;
    location: { village: string; district: string };
    createdAt: string;
  }[];
}

const statusColors: Record<string, string> = {
  placed: 'bg-blue-500/20 text-blue-400',
  confirmed: 'bg-amber-500/20 text-amber-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-green-500/20 text-green-400',
};

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setStats(data.stats);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [token]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" /></div>;
  }

  if (!stats) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Access denied or failed to load stats</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">Kala-Kendra platform overview</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Artisans', value: stats.totalSellers, icon: <Users className="h-5 w-5" />, color: 'text-amber-400 bg-amber-500/10' },
          { label: 'Buyers', value: stats.totalBuyers, icon: <Users className="h-5 w-5" />, color: 'text-blue-400 bg-blue-500/10' },
          { label: 'Products', value: stats.totalProducts, icon: <Package className="h-5 w-5" />, color: 'text-green-400 bg-green-500/10' },
          { label: 'Orders', value: stats.totalOrders, icon: <ShoppingBag className="h-5 w-5" />, color: 'text-purple-400 bg-purple-500/10' },
          { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <IndianRupee className="h-5 w-5" />, color: 'text-emerald-400 bg-emerald-500/10' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className={`inline-flex p-2 rounded-lg ${stat.color} mb-2`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Craft Distribution */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5 text-amber-400" />
              Craft Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.craftTypeStats.map((craft) => (
              <div key={craft._id} className="flex items-center justify-between">
                <span className="text-sm">{craft._id}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                      style={{ width: `${(craft.count / stats.totalProducts) * 100}%` }}
                    />
                  </div>
                  <Badge variant="secondary" className="text-xs min-w-[2rem] text-center">
                    {craft.count}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-purple-400" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
            ) : (
              stats.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{order.buyer?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-400">₹{order.totalAmount.toLocaleString()}</p>
                    <Badge className={`text-xs border-0 ${statusColors[order.status] || ''}`}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Artisans */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-400" />
              Recent Artisans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentSellers.map((seller) => (
              <div key={seller._id} className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-bold flex-shrink-0">
                  {seller.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm">{seller.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">{seller.craftType}</Badge>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {seller.location.district}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
