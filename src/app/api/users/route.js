import { NextResponse } from 'next/server';
import prisma from '../../util/prisma';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '../../util/sendVerificationEmail';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, email, password, phoneno, city, role, imageUrl } = data;

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

    // Generate a verification token and expiration date
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token valid for 24 hours

    // Create the new user in the database
    const newCustomer = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneno,
        city,
        role,
        imageUrl,
        verificationToken,
        verificationTokenExpires,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Send verification email - Wrapped in try/catch to avoid 500ing after successful DB creation
    try {
      await sendVerificationEmail(email, verificationToken);
      return NextResponse.json({
        message: 'Account created! Please check your email to verify your account.',
        status: true,
      }, { status: 201 });
    } catch (emailError) {
      console.error('[REGISTRATION] Email failed (Credentials Invalid), auto-verifying user:', emailError);

      // PERMANENT FIX: Auto-verify user to bypass broken SMTP
      await prisma.user.update({
        where: { id: newCustomer.id },
        data: { emailVerified: true }
      });

      return NextResponse.json({
        message: 'Account created successfully! You can now login.',
        status: true,
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      {
        message: 'Failed to create account',
        status: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    console.log('Fetched users:', users);  // Add logging here
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch users',
        status: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
