'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { ShoppingCart, Shield } from 'lucide-react';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    description: string;
    basePrice: number;
    platformPrice: number;
    category: string;
    craftType: string;
    images: string[];
    giTagged: boolean;
    seller?: {
      name: string;
      location?: { village: string; district: string };
    };
  };
}

const craftColors: Record<string, string> = {
  'Bagh Print': 'from-red-500/20 to-orange-500/20 text-orange-400',
  'Gond Art': 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
  'Chanderi Weaving': 'from-purple-500/20 to-pink-500/20 text-purple-400',
  'Bell Metal Craft': 'from-yellow-500/20 to-amber-500/20 text-yellow-400',
  'Zardozi Embroidery': 'from-blue-500/20 to-indigo-500/20 text-blue-400',
};

const craftEmojis: Record<string, string> = {
  'Bagh Print': '🎨',
  'Gond Art': '🖼️',
  'Chanderi Weaving': '🧵',
  'Bell Metal Craft': '🔔',
  'Zardozi Embroidery': '✨',
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const colorClass = craftColors[product.craftType] || 'from-gray-500/20 to-gray-400/20 text-gray-400';
  const emoji = craftEmojis[product.craftType] || '🎪';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product._id,
      name: product.name,
      price: product.platformPrice,
      image: product.images[0] || '',
      craftType: product.craftType,
      sellerName: product.seller?.name || 'Unknown',
    });
  };

  return (
    <Link href={`/buyer/product/${product._id}`}>
      <Card className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 h-full">
        {/* Image / Craft Type Visual */}
        <div className={`relative h-48 bg-gradient-to-br ${colorClass} flex items-center justify-center overflow-hidden`}>
          {product.images && product.images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{emoji}</span>
          )}
          {product.giTagged && (
            <Badge className="absolute top-3 right-3 bg-emerald-500/90 text-white border-0 gap-1">
              <Shield className="h-3 w-3" />
              GI Tagged
            </Badge>
          )}
          <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-foreground border-border/50">
            {product.category}
          </Badge>
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-amber-400 transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {product.craftType}
            </Badge>
          </div>

          {product.seller && (
            <p className="text-xs text-muted-foreground">
              by <span className="text-amber-400">{product.seller.name}</span>
              {product.seller.location?.district && ` • ${product.seller.location.district}`}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div>
              <p className="text-lg font-bold text-amber-400">₹{product.platformPrice.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground line-through">₹{Math.round(product.platformPrice * 1.2).toLocaleString()}</p>
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 gap-1"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
