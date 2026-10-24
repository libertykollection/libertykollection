import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let base64Data = null;
    let fileName = `receipt_${Date.now()}`;
    let fileExtension = 'jpg';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') || formData.get('image');

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      base64Data = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
      
      const originalName = file.name || 'receipt.jpg';
      const parts = originalName.split('.');
      if (parts.length > 1) {
        fileExtension = parts.pop().toLowerCase();
      }
      fileName = `${parts.join('_')}_${Date.now()}.${fileExtension}`;

      // Try uploading to remote API first if configured
      if (process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API) {
        try {
          const remoteRes = await fetch(process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Data }),
          });
          if (remoteRes.ok) {
            const data = await remoteRes.json();
            const remoteUrl = data.url || data.image_url;
            if (remoteUrl) {
              return NextResponse.json({ url: remoteUrl, status: true }, { status: 200 });
            }
          }
        } catch (remoteErr) {
          console.warn('Remote upload API failed, falling back to local storage:', remoteErr.message);
        }
      }

      // Local fallback in public/uploads
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      const localFilePath = path.join(uploadsDir, fileName);
      await fs.writeFile(localFilePath, buffer);

      return NextResponse.json({
        url: `/uploads/${fileName}`,
        status: true,
      }, { status: 200 });

    } else {
      // JSON body with base64
      const body = await request.json();
      const { image, name } = body;

      if (!image) {
        return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
      }

      // Try remote API first
      if (process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API) {
        try {
          const remoteRes = await fetch(process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image }),
          });
          if (remoteRes.ok) {
            const data = await remoteRes.json();
            const remoteUrl = data.url || data.image_url;
            if (remoteUrl) {
              return NextResponse.json({ url: remoteUrl, status: true }, { status: 200 });
            }
          }
        } catch (remoteErr) {
          console.warn('Remote upload API failed, falling back to local storage:', remoteErr.message);
        }
      }

      // Local fallback
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer;
      if (matches && matches.length === 3) {
        const mime = matches[1];
        fileExtension = mime.split('/')[1] || 'jpg';
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(image, 'base64');
      }

      fileName = `${name ? name.replace(/[^a-zA-Z0-9_-]/g, '_') : 'receipt'}_${Date.now()}.${fileExtension}`;
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      const localFilePath = path.join(uploadsDir, fileName);
      await fs.writeFile(localFilePath, buffer);

      return NextResponse.json({
        url: `/uploads/${fileName}`,
        status: true,
      }, { status: 200 });
    }
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Failed to upload image', details: err.message }, { status: 500 });
  }
}
