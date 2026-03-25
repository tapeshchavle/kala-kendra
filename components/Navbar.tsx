'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Menu, LogOut, LayoutDashboard, Package, Palette, Languages } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'seller': return '/seller';
      case 'admin': return '/admin';
      default: return '/buyer';
    }
  };

  const isSeller = user?.role === 'seller';
  const gT = (key: Parameters<typeof t>[0], fallback: string) => isSeller ? t(key) : fallback;

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Kala-Kendra Logo"
              width={52}
              height={52}
              className="rounded-lg object-contain"
              priority
            />
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              {gT('brandName', 'Kala-Kendra')}
            </span>
          </Link>

          {/* Desktop Nav */}
          {!isSeller && (
            <div className="hidden md:flex items-center gap-6">
              <Link href="/buyer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                <Package className="h-4 w-4" />
                {gT('navShop', 'Shop')}
              </Link>
              <Link href="/artisans" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                <Palette className="h-4 w-4" />
                {gT('navArtisans', 'Artisans')}
              </Link>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Language Toggle (Sellers Only) */}
            {user?.role === 'seller' && (
              <div className="hidden md:flex items-center">
                <Select value={language} onValueChange={(v: 'en' | 'hi') => setLanguage(v)}>
                  <SelectTrigger className="w-[110px] h-8 border-border/50 bg-background/50 hover:bg-accent focus:ring-0 gap-2">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Languages className="h-4 w-4" />
                      <SelectValue placeholder="Lang" />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Cart - Hide for Sellers */}
            {!isSeller && (
              <Link href="/buyer/cart" className="relative">
                <Button variant="ghost" size="icon" className="relative overflow-visible">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white border border-background shadow-sm rounded-full">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-accent transition-colors">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm">{user.name}</span>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {user.role}
                  </Badge>
                </button>
                {/* Simple dropdown on hover */}
                <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all absolute right-0 top-full mt-1 w-48 rounded-lg bg-popover border border-border shadow-lg p-1 z-50">
                  <Link
                    href={getDashboardLink()}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {gT('navDashboard', 'Dashboard')}
                  </Link>
                  <div className="h-px bg-border my-1" />
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-accent w-full transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    {gT('navLogout', 'Logout')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">{gT('navLogin', 'Login')}</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700">
                    {gT('navRegister', 'Register')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md h-10 w-10 hover:bg-accent"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/40 py-4 space-y-2">
            {user?.role === 'seller' && (
              <div className="px-2 py-2">
                <Select value={language} onValueChange={(v: 'en' | 'hi') => { setLanguage(v); setMobileOpen(false); }}>
                  <SelectTrigger className="w-full h-9 bg-transparent border-0 shadow-none text-muted-foreground hover:text-foreground hover:bg-accent flex justify-start items-center gap-2 pl-0 focus:ring-0">
                    <span className="flex items-center gap-2 font-medium">
                      <Languages className="h-4 w-4" />
                      <SelectValue placeholder="Language" />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {!isSeller && (
              <>
                <Link
                  href="/buyer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
                >
                  <Package className="h-4 w-4" />
                  {gT('navShop', 'Shop')}
                </Link>
                <Link
                  href="/artisans"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
                >
                  <Palette className="h-4 w-4" />
                  {gT('navArtisans', 'Artisans')}
                </Link>
              </>
            )}

            {user && (
              <Link
                href={getDashboardLink()}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                {gT('navDashboard', 'Dashboard')}
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
