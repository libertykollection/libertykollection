import prisma from '../../util/prisma'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';


const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

export async function POST(request) {
  const data = await request.json();
  const { email, password } = data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({
        message: "User does not exist",
      }, { status: 404 });
    }

    // Check if email is verified OR if the account has been manually activated by an admin (status === 1)
    if (!user.emailVerified && user.status !== 1) {
      return NextResponse.json({
        message: "Please verify your email before logging in.",
      }, { status: 403 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({
        message: "Invalid Password",
      }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email, id: user.id, name: user.name, role: user.role }, SECRET_KEY, {
      expiresIn: '1h' // token will expire in 1 hour
    });

    // Extract all user data except sensitive fields
    const { password: userPassword, verificationToken, verificationTokenExpires, resetToken, resetTokenExpires, ...userData } = user;

    return NextResponse.json({
      success: true,
      message: "Login Successfully",
      token,
      user: userData, // Return all user details
    });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
