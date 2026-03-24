'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, Package, Loader2, ArrowLeft, Image as ImageIcon, Video, UploadCloud } from 'lucide-react';
import Link from 'next/link';

export default function AddProductPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    category: '',
    craftType: user?.craftType || '',
    tags: [] as string[],
    videoUrl: '',
  });

  const update = (key: string, value: string | string[]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const generateDescription = async () => {
    if (!formData.name || !formData.category || !formData.craftType) {
      toast.error('Please fill in product name, category, and craft type first');
      return;
    }

    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: formData.name,
          category: formData.category,
          craftType: formData.craftType,
          videoUrl: formData.videoUrl || '',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        update('description', data.description || '');
        if (data.tags) update('tags', data.tags);
        toast.success('AI description generated! ✨');
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'Failed to generate description');
      }
    } catch {
      toast.error('Network error while generating description');
    }
    setAiLoading(false);
  };

  const uploadFile = async (file: File) => {
    const data = new FormData();
    data.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    });
    if (!res.ok) throw new Error('Upload failed');
    const json = await res.json();
    return json.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please login first');
      return;
    }

    setLoading(true);
    try {
      let uploadedImages: string[] = [];
      let uploadedVideoUrl = formData.videoUrl;

      // Upload image
      if (imageFile) {
        toast.info('Uploading image...');
        const url = await uploadFile(imageFile);
        uploadedImages.push(url);
      }

      // Upload video
      if (videoFile) {
        toast.info('Uploading video...');
        const url = await uploadFile(videoFile);
        uploadedVideoUrl = url;
      }

      toast.info('Listing product...');
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          basePrice: Number(formData.basePrice),
          images: uploadedImages,
          videoUrl: uploadedVideoUrl,
        }),
      });

      if (res.ok) {
        toast.success('Product listed successfully! 🎉');
        router.push('/seller');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create product');
      }
    } catch {
      toast.error('Error uploading or creating product');
    }
    setLoading(false);
  };

  const platformPrice = formData.basePrice ? Math.round(Number(formData.basePrice) * 1.15) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/seller" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6 text-amber-400" />
          Add New Product
        </h1>
        <p className="text-muted-foreground text-sm mt-1">List your craft for buyers to discover</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                placeholder="e.g. Bagh Print Cotton Saree"
                value={formData.name}
                onChange={(e) => update('name', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => update('category', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Textiles">🧵 Textiles</SelectItem>
                    <SelectItem value="Paintings">🎨 Paintings</SelectItem>
                    <SelectItem value="Home Decor">🏠 Home Decor</SelectItem>
                    <SelectItem value="Sculptures">🗿 Sculptures</SelectItem>
                    <SelectItem value="Accessories">👜 Accessories</SelectItem>
                    <SelectItem value="Jewelry">💎 Jewelry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Craft Type</Label>
                <Select value={formData.craftType} onValueChange={(v) => update('craftType', v)}>
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
            </div>

            {/* AI Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateDescription}
                  disabled={aiLoading}
                  className="gap-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                >
                  {aiLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {aiLoading ? 'Generating...' : 'AI Generate ✨'}
                </Button>
              </div>
              <Textarea
                id="description"
                placeholder="Describe your product... or click 'AI Generate' to auto-create a description!"
                value={formData.description}
                onChange={(e) => update('description', e.target.value)}
                rows={6}
                required
              />
              {aiLoading && (
                <p className="text-xs text-amber-400 animate-pulse">
                  🤖 Kimi K2 is crafting a beautiful description for your product...
                </p>
              )}
            </div>

            {/* Tags */}
            {formData.tags.length > 0 && (
              <div className="space-y-2">
                <Label>AI Suggested Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Media Uploads */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Media</CardTitle>
            <CardDescription>Upload photos and videos of your product.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imageUpload" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Product Image
                </Label>
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="cursor-pointer file:text-amber-500"
                />
                {imageFile && <p className="text-xs text-muted-foreground text-amber-500">Selected: {imageFile.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUpload" className="flex items-center gap-2">
                  <Video className="h-4 w-4" /> Product Video (Optional)
                </Label>
                <Input
                  id="videoUpload"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="cursor-pointer file:text-amber-500"
                />
                {videoFile && <p className="text-xs text-muted-foreground text-amber-500">Selected: {videoFile.name}</p>}
              </div>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-2">
               <UploadCloud className="h-4 w-4" />
               Files will be uploaded automatically when you publish.
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Pricing</CardTitle>
            <CardDescription>Set your base price. Platform adds 15% for sustainability.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">Your Price (₹)</Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g. 3500"
                value={formData.basePrice}
                onChange={(e) => update('basePrice', e.target.value)}
                required
                min="1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL (Or Paste Link)</Label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://youtube.com/..."
                value={formData.videoUrl}
                onChange={(e) => update('videoUrl', e.target.value)}
              />
            </div>

            {formData.basePrice && (
              <Card className="bg-amber-500/5 border-amber-500/20">
                <CardContent className="p-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your price</span>
                    <span>₹{Number(formData.basePrice).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform fee (15%)</span>
                    <span>₹{(platformPrice - Number(formData.basePrice)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-amber-500/20 pt-2">
                    <span>Buyer pays</span>
                    <span className="text-amber-400">₹{platformPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    💚 Free for first 6 months! You receive 100% of your price.
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 gap-2 text-base py-6"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Package className="h-4 w-4" />
          )}
          {loading ? 'Publishing...' : 'Publish Product'}
        </Button>
      </form>
    </div>
  );
}
