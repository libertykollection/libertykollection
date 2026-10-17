import prisma from '../../../util/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function PUT(request) {
    try {
        const { id, currentPassword, newPassword } = await request.json();

        if (!id || !currentPassword || !newPassword) {
            return NextResponse.json({ status: false, message: 'Missing required fields' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
        });

        if (!user) {
            return NextResponse.json({ status: false, message: 'User not found' }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ status: false, message: 'Incorrect current password' }, { status: 401 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: parseInt(id) },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ status: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json({ status: false, message: error.message }, { status: 500 });
    }
}
