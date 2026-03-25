'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Package, Plus, ShoppingBag, TrendingUp, Eye } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  basePrice: number;
  platformPrice: number;
  category: string;
  craftType: string;
  status: string;
  createdAt: string;
}

export default function SellerDashboard() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) return;
    (async () => {
      try {
        const [prodRes, orderRes] = await Promise.all([
          fetch(`/api/products?sellerId=${user.id || user._id}&status=all`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const prodData = await prodRes.json();
        const orderData = await orderRes.json();
        setProducts(prodData.products || []);
        setOrders(orderData.orders || []);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [token, user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" /></div>;
  }

  const totalRevenue = products.reduce((sum, p) => sum + p.platformPrice, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t('sellerDashboard')}</h1>
          <p className="text-muted-foreground text-sm">{t('welcomeBack')}, {user?.name} 🙏</p>
        </div>
        <Link href="/seller/products/add">
          <Button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 gap-2">
            <Plus className="h-4 w-4" />
            {t('addProduct')}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('products'), value: products.length, icon: <Package className="h-5 w-5" />, color: 'text-blue-400' },
          { label: t('active'), value: products.filter(p => p.status === 'active').length, icon: <Eye className="h-5 w-5" />, color: 'text-green-400' },
          { label: t('orders'), value: orders.length, icon: <ShoppingBag className="h-5 w-5" />, color: 'text-purple-400' },
          { label: t('estRevenue'), value: `₹${totalRevenue.toLocaleString()}`, icon: <TrendingUp className="h-5 w-5" />, color: 'text-amber-400' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={stat.color}>{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Products */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t('yourProducts')}</CardTitle>
          <Link href="/seller/products/add">
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3.5 w-3.5" /> {t('addNew')}
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">{t('noProducts')}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {products.map((product) => (
                <div key={product._id} className="flex items-center justify-between py-3">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{product.craftType}</Badge>
                      <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                      <Badge className={`text-xs border-0 ${product.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {product.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-400">₹{product.platformPrice?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{t('base')}: ₹{product.basePrice.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
