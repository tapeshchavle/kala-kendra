'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductCard from '@/components/ProductCard';
import { Search, SlidersHorizontal } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  platformPrice: number;
  category: string;
  craftType: string;
  images: string[];
  giTagged: boolean;
  seller?: { name: string; location?: { village: string; district: string } };
}

const craftTypes = ['All', 'Bagh Print', 'Gond Art', 'Chanderi Weaving', 'Bell Metal Craft', 'Zardozi Embroidery'];
const categories = ['All', 'Textiles', 'Paintings', 'Home Decor', 'Sculptures', 'Accessories'];

export default function BuyerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [craftType, setCraftType] = useState('All');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check URL params for initial craft type filter
    const params = new URLSearchParams(window.location.search);
    const ct = params.get('craftType');
    if (ct) setCraftType(ct);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [craftType, category, search]);

  const fetchProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (craftType !== 'All') params.set('craftType', craftType);
    if (category !== 'All') params.set('category', category);
    if (search) params.set('search', search);

    try {
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      console.error('Error fetching products');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/40 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">Shop Authentic MP Crafts</h1>
          <p className="text-muted-foreground">Discover handcrafted treasures directly from Madhya Pradesh artisans</p>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products, crafts, artisans..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={craftType} onValueChange={setCraftType}>
              <SelectTrigger className="w-full sm:w-48">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Craft Type" />
              </SelectTrigger>
              <SelectContent>
                {craftTypes.map((ct) => (
                  <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {(craftType !== 'All' || category !== 'All' || search) && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {craftType !== 'All' && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setCraftType('All')}>
                  {craftType} ✕
                </Badge>
              )}
              {category !== 'All' && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setCategory('All')}>
                  {category} ✕
                </Badge>
              )}
              {search && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSearch('')}>
                  &quot;{search}&quot; ✕
                </Badge>
              )}
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setCraftType('All'); setCategory('All'); setSearch(''); }}>
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 rounded-lg bg-card/50 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-6">{products.length} products found</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🎨</p>
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
}
