import { NextResponse } from 'next/server';
import axios from 'axios';
import prisma from '../../util/prisma';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    let url = searchParams.get('url');
    const id = searchParams.get('id');
    let filename = searchParams.get('filename');

    try {
        // If ID is provided, fetch the file URL from the database
        if (id && !url) {
            const product = await prisma.product.findUnique({
                where: { id: parseInt(id) }
            });

            if (!product) {
                return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }

            if (!filename) {
                filename = product.name;
            }

            if (product.productType !== 'digital') {
                return NextResponse.json({ error: 'Product is not a digital item' }, { status: 400 });
            }

            const data = typeof product.digitalData === 'string' ? JSON.parse(product.digitalData) : product.digitalData;
            const fileUrl = data?.files?.[0]?.url;

            if (!fileUrl) {
                return NextResponse.json({ error: 'No digital file associated with this product' }, { status: 404 });
            }

            // Resolve URL
            if (fileUrl.startsWith('http')) {
                url = fileUrl;
            } else {
                const baseUrl = (process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL || '').trim();
                url = `${baseUrl}/${fileUrl}`;
            }
        }

        if (!url || url === 'undefined' || url === 'null') {
            return NextResponse.json({ error: 'Valid URL or ID is required' }, { status: 400 });
        }

        // Final URL cleanup
        url = url.trim();

        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'arraybuffer',
        });

        // Determine final filename with extension
        let finalFilename = filename;
        let extension = '';
        try {
            const urlPath = new URL(url).pathname;
            extension = urlPath.split('.').pop();
        } catch (e) {
            console.error('Failed to parse URL for extension:', url);
        }

        // If filename doesn't already have this extension, append it
        if (extension && extension.length < 5 && !finalFilename.toLowerCase().endsWith('.' + extension.toLowerCase())) {
            finalFilename = `${finalFilename}.${extension}`;
        }

        const contentType = response.headers['content-type'] || 'application/octet-stream';

        return new NextResponse(response.data, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${finalFilename}"`,
            },
        });
    } catch (error) {
        console.error('Download error for URL:', url, error.message);
        return NextResponse.json({
            error: 'Failed to download file',
            details: error.message,
            url: url
        }, { status: 500 });
    }
}
