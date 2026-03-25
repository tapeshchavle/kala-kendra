'use client';

import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    line1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const handleCheckout = async () => {
    if (!user || !token) {
      toast.error('Please login to place an order');
      router.push('/login');
      return;
    }

    if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      toast.error('Please complete your shipping address');
      return;
    }

    setLoading(true);
    try {
      const rzpRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: total }),
      });

      if (!rzpRes.ok) {
        throw new Error('Failed to initialize payment gateway');
      }

      const orderOptions = await rzpRes.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderOptions.amount,
        currency: orderOptions.currency,
        name: "Kala-Kendra",
        description: "Purchase Authentic Crafts",
        order_id: orderOptions.id,
        handler: async function (response: any) {
          await finalizeOrder(response.razorpay_payment_id);
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#f59e0b",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(response.error?.description || 'Payment Failed');
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Payment initialization error');
      setLoading(false);
    }
  };

  const finalizeOrder = async (paymentId: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingAddress: shippingAddress,
          paymentId,
        }),
      });

      if (res.ok) {
        toast.success('Order placed successfully! 🎉');
        clearCart();
        router.push('/buyer/orders');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to place order');
        setLoading(false);
      }
    } catch {
      toast.error('Network error during order creation');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <p className="text-muted-foreground text-sm">Discover authentic crafts from Madhya Pradesh artisans</p>
        <Link href="/buyer">
          <Button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white gap-2">
            Start Shopping
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({itemCount} items)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items & Address */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">1. Cart Items</h2>
            {items.map((item) => (
              <Card key={item.productId} className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🎨</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.craftType} • by {item.sellerName}</p>
                      <p className="text-amber-400 font-bold">₹{item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => removeItem(item.productId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">2. Shipping Address</h2>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block text-muted-foreground">Address Line</label>
                  <Input 
                    placeholder="123 Street Name, Apartment, etc."
                    value={shippingAddress.line1}
                    onChange={(e) => setShippingAddress({...shippingAddress, line1: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block text-muted-foreground">City</label>
                    <Input 
                      placeholder="Bhopal"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    />
                  </div>
                  <div>
                     <label className="text-sm font-medium mb-1 block text-muted-foreground">State</label>
                     <Input 
                      placeholder="Madhya Pradesh"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-muted-foreground">Pincode</label>
                  <Input 
                    placeholder="462001"
                    value={shippingAddress.pincode}
                    onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Order Summary */}
        <Card className="bg-card/50 border-border/50 h-fit sticky top-20">
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-400">Free</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Platform fee (included)</span>
                <span className="text-muted-foreground">15%</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-amber-400">₹{total.toLocaleString()}</span>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 gap-2"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              💚 Your purchase directly supports rural artisans
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
