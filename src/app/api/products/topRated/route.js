import prisma from "../../../util/prisma";
import { NextResponse } from 'next/server';

export async function GET(request) {
    console.log('[API/TopRated] GET request received');
    try {
        if (!prisma) {
            console.error('[API/TopRated] Prisma client not initialized!');
            throw new Error('Prisma client unavailable');
        }
        const topRatedProducts = await prisma.product.findMany({
            where: { isTopRated: true },
            include: {
                images: true,
                subcategory: {
                    include: {
                        category: true
                    }
                }
            },
        });
        console.log('[API/TopRated] Success, count:', topRatedProducts.length);
        return NextResponse.json({ data: topRatedProducts, status: true }, { status: 200 });
    } catch (error) {
        console.error('[API/TopRated] ERROR:', error);
        return NextResponse.json({
            message: 'Failed to fetch top-rated products',
            error: error.message,
            status: false,
            stack: error.stack
        }, { status: 500 });
    }
}
