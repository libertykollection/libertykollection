import prisma from '../../util/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const privacyPolicies = await prisma.privacyPolicy.findMany();
    return NextResponse.json(privacyPolicies, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch privacy policies' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const newPrivacyPolicy = await prisma.privacyPolicy.create({
      data: {
        Title: data.Title,
        description: data.description,
        Text: data.Text,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(newPrivacyPolicy, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create privacy policy' }, { status: 500 });
  }
}
