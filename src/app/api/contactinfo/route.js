import prisma from '../../util/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const contactInfos = await prisma.contactInfo.findMany();
    return NextResponse.json(contactInfos, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contact information' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const newContactInfo = await prisma.contactInfo.create({ data });
    return NextResponse.json(newContactInfo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create contact information' }, { status: 500 });
  }
}
