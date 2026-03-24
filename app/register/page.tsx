'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('buyer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    craftType: '',
    district: '',
    village: '',
    story: '',
    yearsOfExperience: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await register({
      ...formData,
      role,
      yearsOfExperience: Number(formData.yearsOfExperience) || 0,
      location: {
        village: formData.village,
        district: formData.district,
        state: 'Madhya Pradesh',
      },
    });

    if (result.success) {
      toast.success('Registration successful!');
      router.push(role === 'seller' ? '/seller' : '/buyer');
    } else {
      toast.error(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  const update = (key: string, value: string) => setFormData((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white text-2xl font-bold">
              क
            </div>
          </div>
          <CardTitle className="text-2xl">Join Kala-Kendra</CardTitle>
          <CardDescription>Create your account to start buying or selling</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label>I want to</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={role === 'buyer' ? 'default' : 'outline'}
                  onClick={() => setRole('buyer')}
                  className={role === 'buyer' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white' : ''}
                >
                  🛒 Buy Crafts
                </Button>
                <Button
                  type="button"
                  variant={role === 'seller' ? 'default' : 'outline'}
                  onClick={() => setRole('seller')}
                  className={role === 'seller' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white' : ''}
                >
                  🎨 Sell Crafts
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Your name" value={formData.name} onChange={(e) => update('name', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+91 ..." value={formData.phone} onChange={(e) => update('phone', e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input id="reg-email" type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => update('email', e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password">Password</Label>
              <Input id="reg-password" type="password" placeholder="Create a password" value={formData.password} onChange={(e) => update('password', e.target.value)} required />
            </div>

            {role === 'seller' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Craft Type</Label>
                    <Select value={formData.craftType} onValueChange={(v) => update('craftType', v || '')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select craft" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bagh Print">🎨 Bagh Print</SelectItem>
                        <SelectItem value="Gond Art">🖼️ Gond Art</SelectItem>
                        <SelectItem value="Chanderi Weaving">🧵 Chanderi Weaving</SelectItem>
                        <SelectItem value="Bell Metal Craft">🔔 Bell Metal Craft</SelectItem>
                        <SelectItem value="Zardozi Embroidery">✨ Zardozi Embroidery</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exp">Years of Experience</Label>
                    <Input id="exp" type="number" placeholder="e.g. 10" value={formData.yearsOfExperience} onChange={(e) => update('yearsOfExperience', e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="village">Village</Label>
                    <Input id="village" placeholder="Your village" value={formData.village} onChange={(e) => update('village', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input id="district" placeholder="Your district" value={formData.district} onChange={(e) => update('district', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story">Your Story</Label>
                  <Textarea id="story" placeholder="Tell buyers about your craft journey..." value={formData.story} onChange={(e) => update('story', e.target.value)} rows={3} />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 gap-2"
              disabled={loading}
            >
              <UserPlus className="h-4 w-4" />
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-400 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
