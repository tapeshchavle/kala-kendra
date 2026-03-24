'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Shield, Palette } from 'lucide-react';
import Link from 'next/link';

interface Seller {
  _id: string;
  name: string;
  craftType: string;
  yearsOfExperience: number;
  location: { village: string; district: string; state: string };
  story: string;
  giTagVerified: boolean;
}

const craftColors: Record<string, string> = {
  'Bagh Print': 'from-red-500/20 to-orange-500/20',
  'Gond Art': 'from-emerald-500/20 to-teal-500/20',
  'Chanderi Weaving': 'from-purple-500/20 to-pink-500/20',
  'Bell Metal Craft': 'from-yellow-500/20 to-amber-500/20',
  'Zardozi Embroidery': 'from-blue-500/20 to-indigo-500/20',
};

export default function ArtisansPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Fetch products and extract unique sellers
        const res = await fetch('/api/products');
        const data = await res.json();
        const products = data.products || [];
        const sellerMap = new Map<string, Seller>();
        for (const p of products) {
          if (p.seller && !sellerMap.has(p.seller._id)) {
            sellerMap.set(p.seller._id, p.seller);
          }
        }
        setSellers(Array.from(sellerMap.values()));
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/40 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl font-bold mb-3">Meet the Artisans</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Behind every product is a skilled artisan with decades of experience and a passion for preserving Madhya Pradesh&apos;s cultural heritage.
          </p>
        </div>
      </div>

      {/* Artisan Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellers.map((seller) => {
            const colorClass = craftColors[seller.craftType] || 'from-gray-500/20 to-gray-400/20';
            return (
              <Link key={seller._id} href={`/buyer?craftType=${encodeURIComponent(seller.craftType)}`}>
                <Card className="overflow-hidden bg-card/50 border-border/50 hover:border-amber-500/30 transition-all group h-full">
                  <div className={`h-24 bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-2xl font-bold text-amber-400 border-2 border-amber-500/30 group-hover:scale-110 transition-transform">
                      {seller.name.charAt(0)}
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{seller.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {seller.location?.village && `${seller.location.village}, `}
                        {seller.location?.district}, MP
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Palette className="h-3 w-3" />
                        {seller.craftType}
                      </Badge>
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Star className="h-3 w-3 text-amber-400" />
                        {seller.yearsOfExperience} yrs exp
                      </Badge>
                      {seller.giTagVerified && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1 text-xs">
                          <Shield className="h-3 w-3" />
                          GI Verified
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {seller.story}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {sellers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">👨‍🎨</p>
            <h3 className="text-lg font-semibold">No artisans found</h3>
            <p className="text-muted-foreground text-sm mt-1">Please seed the demo data first</p>
          </div>
        )}
      </div>
    </div>
  );
}
