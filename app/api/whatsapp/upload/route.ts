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
    const extension = file.name ? file.name.split('.').pop() : 'png';
    const filename = `${uniqueSuffix}.${extension}`;

    // In production on Vercel, use Blob storage. The @vercel/blob SDK
    // automatically reads BLOB_READ_WRITE_TOKEN, so we don't need to
    // pass the token explicitly here.
    if (process.env.VERCEL && process.env.BLOB_READ_WRITE_TOKEN) {
      console.log('Using Vercel Blob for upload...');
      try {
        const blob = await put(`whatsapp/${filename}`, file, {
          access: 'public',
        });
        return NextResponse.json({ url: blob.url });
      } catch (blobError: any) {
        console.error('Vercel Blob put error:', blobError);
        return NextResponse.json(
          { error: 'Vercel Blob upload failed', details: blobError?.message || String(blobError) },
          { status: 500 }
        );
      }
    } else {
      console.log('Falling back to local filesystem for upload...');
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const dir = join(process.cwd(), 'public', 'uploads', 'whatsapp');
        
        // Catch read-only file system errors on platforms like Vercel
        try {
          await mkdir(dir, { recursive: true });
          const path = join(dir, filename);
          await writeFile(path, buffer);
          return NextResponse.json({ url: `/uploads/whatsapp/${filename}` });
        } catch (fsError: any) {
          if (fsError.code === 'EROFS') {
            return NextResponse.json(
              { error: 'Read-only file system. Please configure Vercel Blob storage by setting BLOB_READ_WRITE_TOKEN.' },
              { status: 500 }
            );
          }
          throw fsError;
        }
      } catch (fsError: any) {
        console.error('Filesystem upload error:', fsError);
        return NextResponse.json(
          { error: 'Local upload failed', details: fsError?.message },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('WhatsApp upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error?.message || String(error) },
      { status: 500 },
    );
  }
}
