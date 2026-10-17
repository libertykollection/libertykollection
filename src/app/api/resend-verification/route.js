import { NextResponse } from 'next/server';
import prisma from '../../util/prisma';
import { sendVerificationEmail } from '../../util/sendVerificationEmail';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const { email } = await request.json();

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (user.emailVerified) {
            return NextResponse.json({ message: 'Email is already verified' }, { status: 400 });
        }

        // Generate new token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationToken,
                verificationTokenExpires,
            },
        });

        await sendVerificationEmail(email, verificationToken);

        return NextResponse.json({
            message: 'Verification email resent successfully. Please check your inbox.',
            status: true,
        });
    } catch (error) {
        console.error('[RESEND_VERIFICATION] Error:', error);
        return NextResponse.json(
            { message: 'Failed to resend verification email', error: error.message },
            { status: 500 }
        );
    }
}
