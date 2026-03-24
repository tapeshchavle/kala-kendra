import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = file.name.split('.').pop();
    const filename = `${uniqueSuffix}.${extension}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`whatsapp/${filename}`, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return NextResponse.json({ url: blob.url });
    } else {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const dir = join(process.cwd(), 'public', 'uploads', 'whatsapp');
      await mkdir(dir, { recursive: true });
      const path = join(dir, filename);
      await writeFile(path, buffer);
      return NextResponse.json({ url: `/uploads/whatsapp/${filename}` });
    }
  } catch (error: any) {
    console.error('WhatsApp upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error?.message || String(error) },
      { status: 500 },
    );
  }
}
