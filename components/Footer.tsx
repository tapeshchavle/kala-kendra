import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-lg">
                क
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Kala-Kendra
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering Madhya Pradesh artisans by connecting them directly with buyers. Preserving tradition, enabling livelihoods.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link href="/buyer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Shop All</Link>
              <Link href="/artisans" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Meet Artisans</Link>
              <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Become a Seller</Link>
            </div>
          </div>

          {/* Craft Types */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Explore Crafts</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Bagh Print</span>
              <span className="text-sm text-muted-foreground">Gond Art</span>
              <span className="text-sm text-muted-foreground">Chanderi Weaving</span>
              <span className="text-sm text-muted-foreground">Bell Metal Craft</span>
              <span className="text-sm text-muted-foreground">Zardozi Embroidery</span>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>📍 Bhopal, Madhya Pradesh</p>
              <p>📞 +91 98765 43210</p>
              <p>✉️ info@kalakendra.com</p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 Kala-Kendra. Made with ❤️ for Madhya Pradesh Artisans</p>
          <p className="text-xs">Hackathon Prototype — Empowering Rural Artisans</p>
        </div>
      </div>
    </footer>
  );
}
