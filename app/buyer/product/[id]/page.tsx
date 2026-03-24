'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ShoppingCart, Shield, Palette, MapPin, Star, PlayCircle, Image as ImageIcon } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  platformPrice: number;
  category: string;
  craftType: string;
  images: string[];
  videoUrl?: string;
  giTagged: boolean;
  tags?: string[];
  seller?: {
    name: string;
    location?: { village: string; district: string; state: string };
    craftType: string;
    yearsOfExperience: number;
    story: string;
    giTagVerified: boolean;
  };
}

const craftEmojis: Record<string, string> = {
  'Bagh Print': '🎨', 'Gond Art': '🖼️', 'Chanderi Weaving': '🧵',
  'Bell Metal Craft': '🔔', 'Zardozi Embroidery': '✨',
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    (async () => {
      const { id } = await params;
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data.product);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [params]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product._id,
      name: product.name,
      price: product.platformPrice,
      image: product.images?.[0] || '',
      craftType: product.craftType,
      sellerName: product.seller?.name || 'Unknown',
    });
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const mediaList = [
    ...(product.images || []),
    ...(product.videoUrl ? [product.videoUrl] : []),
  ];
  const craftEmoji = craftEmojis[product.craftType] || '🎪';

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Media Gallery */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-border/50 bg-black/50">
            <div className="relative aspect-square flex items-center justify-center bg-gradient-to-br from-amber-500/5 to-orange-500/5">
              {mediaList.length > 0 ? (
                activeMedia < (product.images?.length || 0) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaList[activeMedia]} alt={product.name} className="w-full h-full object-contain" />
                ) : (
                  <video src={mediaList[activeMedia]} controls autoPlay className="w-full h-full object-contain" />
                )
              ) : (
                <span className="text-9xl opacity-50">{craftEmoji}</span>
              )}
            </div>
          </Card>
          
          {/* Thumbnails */}
          {mediaList.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {mediaList.map((media, idx) => {
                const isVideo = idx >= (product.images?.length || 0);
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveMedia(idx)}
                    className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeMedia === idx ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-transparent hover:border-amber-500/50'
                    }`}
                  >
                    {!isVideo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={media} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <PlayCircle className="h-8 w-8 text-amber-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{product.category}</Badge>
              <Badge variant="secondary">{product.craftType}</Badge>
              {product.giTagged && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1">
                  <Shield className="h-3 w-3" />
                  GI Tagged
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-amber-400">₹{product.platformPrice.toLocaleString()}</span>
            <span className="text-lg text-muted-foreground line-through">₹{Math.round(product.platformPrice * 1.2).toLocaleString()}</span>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Save 20%
            </Badge>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs text-amber-500/80 border-amber-500/20">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Button
            size="lg"
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 gap-2 text-base h-14"
          >
            <ShoppingCart className="h-5 w-5" />
            Add to Cart — ₹{product.platformPrice.toLocaleString()}
          </Button>

          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4 text-sm text-muted-foreground space-y-2">
              <p className="flex items-center gap-2"><span className="text-amber-500">✓</span> Authentic handcrafted product</p>
              <p className="flex items-center gap-2"><span className="text-amber-500">✓</span> Directly from the artisan — no middlemen</p>
              <p className="flex items-center gap-2"><span className="text-amber-500">✓</span> Artisan receives {Math.round((product.basePrice / product.platformPrice) * 100)}% of your payment</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Artisan Story */}
      {product.seller && (
        <Card className="mt-12 bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-amber-400" />
              Meet the Artisan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white text-2xl font-bold flex-shrink-0 shadow-lg shadow-amber-500/20">
                {product.seller.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{product.seller.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {product.seller.location?.village && `${product.seller.location.village}, `}
                  {product.seller.location?.district}, {product.seller.location?.state}
                </div>
                <div className="flex items-center gap-3 text-sm mt-1">
                  <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-0">
                    <Palette className="h-3 w-3" />
                    {product.seller.craftType}
                  </Badge>
                  <span className="text-muted-foreground flex items-center gap-1 font-medium">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    {product.seller.yearsOfExperience} years experience
                  </span>
                  {product.seller.giTagVerified && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1 text-xs px-2 py-0">
                      <Shield className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {product.seller.story && (
              <div className="pl-20 mt-4">
                <h4 className="font-semibold text-sm mb-2 uppercase tracking-wide text-muted-foreground/80">Their Story</h4>
                <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-amber-500/30 pl-4 py-1">{product.seller.story}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
