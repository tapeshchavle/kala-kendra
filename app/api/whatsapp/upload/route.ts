import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary env vars missing', { cloudName, apiKey: !!apiKey, apiSecret: !!apiSecret });
      return NextResponse.json(
        { error: 'Upload failed', details: 'Cloudinary configuration missing on server' },
        { status: 500 },
      );
    }

    // Configure Cloudinary per request (cheap) to avoid build-time issues
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert file buffer to base64 Data URI to avoid Vercel edge/stream issues
    const mimeType = file.type || 'application/octet-stream';
    const base64Data = buffer.toString('base64');
    const dataURI = `data:${mimeType};base64,${base64Data}`;

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'whatsapp',
      resource_type: 'auto',
    });

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error: any) {
    console.error('WhatsApp Cloudinary upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error?.message || String(error) },
      { status: 500 },
    );
  }
}
