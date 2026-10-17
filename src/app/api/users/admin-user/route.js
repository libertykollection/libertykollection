// adminUser API
import { NextResponse } from 'next/server';
import prisma from '../../../util/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, email, password, phoneno, city, imageUrl } = data;

    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered. Please use a different email.', status: false },
        { status: 400 }
      );
    }

    // Hash the user's password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Generate a verification token and expiration date (if needed)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token valid for 24 hours

    // Create the new admin user in the database with emailVerified: true and role: 'ADMIN'
    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneno,
        city,
        role: 'ADMIN',  // Role set as 'ADMIN'
        imageUrl,
        verificationToken,
        verificationTokenExpires,
        emailVerified: true,  // Email verified by default
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Admin user registered successfully.',
      status: true,
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      {
        message: 'Failed to create admin user',
        status: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
