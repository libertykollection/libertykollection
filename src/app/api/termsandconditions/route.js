import prisma from '../../util/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const term = await prisma.termAndConditions.findMany();
    return NextResponse.json(term, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch terms and conditions' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const newterm = await prisma.termAndConditions.create({
      data: {
        Title: data.Title,
        description: data.description,
        Text: data.Text,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(newterm, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create Terms and Conditions' }, { status: 500 });
  }
}
