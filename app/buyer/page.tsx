'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductCard from '@/components/ProductCard';
import BuyerChatbot from '@/components/BuyerChatbot';
import { Search, SlidersHorizontal, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  const [isMagicSearching, setIsMagicSearching] = useState(false);
  const [craftType, setCraftType] = useState('All');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    // Check URL params for initial craft type filter
    const params = new URLSearchParams(window.location.search);
    const ct = params.get('craftType');
    if (ct) setCraftType(ct);
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [craftType, category, search]);

  const handleMagicSearch = async () => {
    if (!search.trim()) return;
    setIsMagicSearching(true);
    
    try {
      const res = await fetch('/api/ai/magic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: search })
      });
      
      if (res.ok) {
        const filters = await res.json();
        if (filters.category && categories.includes(filters.category)) setCategory(filters.category);
        if (filters.craftType && craftTypes.includes(filters.craftType)) setCraftType(filters.craftType);
        if (filters.search !== undefined) setSearch(filters.search);
        
        toast.success("AI filtered the products for you! ✨");
      } else {
        toast.error("Could not understand your request.");
      }
    } catch (e) {
      toast.error("Network error during magic search.");
    }
    
    setIsMagicSearching(false);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/40 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">Shop Authentic MP Crafts</h1>
          <p className="text-muted-foreground">Discover handcrafted treasures directly from Madhya Pradesh artisans</p>

          {/* Unified Search & Filters */}
          <div className="mt-8 flex flex-col lg:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Product name, tags, or describe what you want to AI..."
                className="pl-10 pr-[100px] h-10 rounded-lg border-amber-500/30 focus-visible:border-amber-500/50 focus-visible:ring-amber-500/20 shadow-sm w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleMagicSearch()
                }}
              />
              <Button 
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-500/20 shadow-none transition-colors h-8 px-3 text-xs"
                onClick={handleMagicSearch}
                disabled={isMagicSearching || !search.trim()}
                title="Use AI to understand your request and apply filters"
              >
                {isMagicSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-3 w-3 mr-1.5" /> AI Search</>}
              </Button>
            </div>
            
            <div className="flex gap-3 w-full lg:w-auto shrink-0">
              <Select value={craftType} onValueChange={(v) => setCraftType(v || 'All')}>
                <SelectTrigger className="flex-1 lg:w-48 h-10 rounded-lg border-amber-500/30 bg-background/50 backdrop-blur-sm">
                  <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Craft Type" />
                </SelectTrigger>
                <SelectContent>
                  {craftTypes.map((ct) => (
                    <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={category} onValueChange={(v) => setCategory(v || 'All')}>
                <SelectTrigger className="flex-1 lg:w-48 h-10 rounded-lg border-amber-500/30 bg-background/50 backdrop-blur-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
      
      <BuyerChatbot />
    </div>
  );
}
