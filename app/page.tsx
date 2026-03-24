'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, Smartphone, Sparkles, Users, TrendingUp, Heart } from 'lucide-react';

const crafts = [
  { name: 'Bagh Print', emoji: '🎨', desc: 'Ancient hand-block printed textiles with natural dyes', color: 'from-red-500 to-orange-500' },
  { name: 'Gond Art', emoji: '🖼️', desc: 'Vibrant tribal paintings depicting nature and folklore', color: 'from-emerald-500 to-teal-500' },
  { name: 'Chanderi Weaving', emoji: '🧵', desc: 'Exquisite silk and cotton sarees with gold buttis', color: 'from-purple-500 to-pink-500' },
  { name: 'Bell Metal Craft', emoji: '🔔', desc: 'Lost-wax cast ceremonial and decorative pieces', color: 'from-yellow-500 to-amber-500' },
  { name: 'Zardozi Embroidery', emoji: '✨', desc: 'Intricate gold and silver metallic threadwork', color: 'from-blue-500 to-indigo-500' },
];

const stats = [
  { label: 'Artisans Empowered', value: '50+', icon: <Users className="h-5 w-5" /> },
  { label: 'Products Listed', value: '200+', icon: <TrendingUp className="h-5 w-5" /> },
  { label: 'GI Tagged Crafts', value: '4', icon: <ShieldCheck className="h-5 w-5" /> },
  { label: 'Districts Covered', value: '12+', icon: <Heart className="h-5 w-5" /> },
];

export default function LandingPage() {
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    // Auto-seed on first visit
    const alreadySeeded = localStorage.getItem('kk-seeded');
    if (!alreadySeeded) {
      handleSeed();
    }
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('kk-seeded', 'true');
        setSeeded(true);
      }
      console.log('Seed result:', data);
    } catch (err) {
      console.error('Seed error:', err);
    }
    setSeeding(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-600/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center space-y-8">
            <Badge variant="secondary" className="px-4 py-1.5 text-sm gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Empowering MP Artisans Since 2026
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Kala-Kendra
              </span>
              <br />
              <span className="text-foreground text-3xl sm:text-4xl md:text-5xl mt-2 block">
                कला-केंद्र
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              A digital marketplace connecting <strong className="text-amber-400">Madhya Pradesh&apos;s rural artisans</strong> directly
              with art lovers worldwide. No middlemen. Fair prices. Authentic crafts.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/buyer">
                <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 gap-2 text-base px-8">
                  Explore Crafts
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8 border-amber-500/30 hover:bg-amber-500/10">
                  <Smartphone className="h-4 w-4" />
                  Register as Artisan
                </Button>
              </Link>
            </div>

            {/* Seed Button */}
            {!seeded && (
              <div className="pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSeed}
                  disabled={seeding}
                  className="text-xs text-muted-foreground"
                >
                  {seeding ? 'Seeding demo data...' : '🌱 Seed Demo Data'}
                </Button>
              </div>
            )}

            {/* Demo Credentials */}
            <Card className="mx-auto max-w-lg bg-card/50 backdrop-blur-sm border-amber-500/20">
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-2 text-amber-400">🔑 Demo Credentials (Password: password123)</p>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div className="text-center p-2 rounded bg-background/50">
                    <p className="font-medium text-foreground">Buyer</p>
                    <p>priya@example.com</p>
                  </div>
                  <div className="text-center p-2 rounded bg-background/50">
                    <p className="font-medium text-foreground">Seller</p>
                    <p>ramesh@example.com</p>
                  </div>
                  <div className="text-center p-2 rounded bg-background/50">
                    <p className="font-medium text-foreground">Admin</p>
                    <p>admin@kalakendra.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/40 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center space-y-2">
                <div className="flex justify-center text-amber-400">{stat.icon}</div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How Kala-Kendra Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We bridge the gap between rural artisans and the digital marketplace with a simple, WhatsApp-first approach.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'WhatsApp Onboarding',
                desc: "Artisan sends 'Hi' on WhatsApp. We collect details and auto-register them. No technical skills needed.",
                icon: <Smartphone className="h-8 w-8" />,
              },
              {
                step: '02',
                title: 'AI-Powered Listing',
                desc: 'Upload product photos. AI generates compelling descriptions. Set your price and go live.',
                icon: <Sparkles className="h-8 w-8" />,
              },
              {
                step: '03',
                title: 'Direct Sales',
                desc: 'Buyers discover your craft. No middlemen. Fair prices. Money goes directly to artisans.',
                icon: <TrendingUp className="h-8 w-8" />,
              },
            ].map((item) => (
              <Card key={item.step} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-amber-500/30 transition-colors group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-amber-500/30">{item.step}</span>
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Crafts */}
      <section className="py-20 bg-card/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Discover Madhya Pradesh Crafts</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Explore GI-tagged and traditional crafts that have been perfected over centuries.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {crafts.map((craft) => (
              <Link key={craft.name} href={`/buyer?craftType=${encodeURIComponent(craft.name)}`}>
                <Card className="overflow-hidden border-border/50 hover:border-amber-500/30 transition-all group cursor-pointer h-full">
                  <div className={`h-32 bg-gradient-to-br ${craft.color} flex items-center justify-center`}>
                    <span className="text-5xl group-hover:scale-110 transition-transform">{craft.emoji}</span>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold">{craft.name}</h3>
                    <p className="text-sm text-muted-foreground">{craft.desc}</p>
                    <Badge variant="secondary" className="text-xs gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Authentic MP Craft
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Support Rural Artisans?</h2>
          <p className="text-muted-foreground">
            Every purchase directly supports a family of artisans in Madhya Pradesh. 
            No middlemen, no exploitation — just pure craftsmanship reaching you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/buyer">
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 gap-2">
                Start Shopping
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-amber-500/30 hover:bg-amber-500/10">
                Join as Artisan
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
