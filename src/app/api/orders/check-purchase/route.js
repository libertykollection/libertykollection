import { NextResponse } from 'next/server';
import prisma from '../../../util/prisma';

export async function POST(request) {
    try {
        const { userId, productId } = await request.json();

        if (!userId || !productId) {
            return NextResponse.json({ purchased: false, message: 'Missing userId or productId' });
        }

        // Check if there is a COMPLETED or DELIVERED order for this user containing this product
        const order = await prisma.order.findFirst({
            where: {
                userId: parseInt(userId),
                status: {
                    in: ['COMPLETED', 'DELIVERED']
                },
                items: {
                    some: {
                        productId: parseInt(productId)
                    }
                }
            }
        });

        if (order) {
            return NextResponse.json({ purchased: true });
        }

        return NextResponse.json({ purchased: false });

    } catch (error) {
        console.error('Error checking purchase status:', error);
        return NextResponse.json(
            { purchased: false, error: 'Database error' },
            { status: 500 }
        );
    }
}
