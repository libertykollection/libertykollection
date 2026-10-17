
import { NextResponse } from 'next/server';
import prisma from '../../../util/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        let count = 0;
        try {
            count = await prisma.order.count({
                where: {
                    status: 'PENDING',
                },
            });
        } catch (dbError) {
            console.error("Database error in pending-count:", dbError);
            return NextResponse.json({ count: 0 });
        }
        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error fetching pending order count:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pending order count' },
            { status: 500 }
        );
    }
}
