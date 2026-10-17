import prisma from '../../util/prisma';
import { NextResponse } from 'next/server';

// Handler for GET requests
export async function GET() {
  try {
    const returnAndExchangePolicies = await prisma.returnAndExchangePolicy.findMany();
    return NextResponse.json(returnAndExchangePolicies, { status: 200 });
  } catch (error) {
    console.error('Error fetching return and exchange policies:', error);
    return NextResponse.json({ error: 'Failed to fetch return and exchange policies' }, { status: 500 });
  }
}

// Handler for POST requests
export async function POST(req) {
  try {
    const data = await req.json();
    const newReturnAndExchangePolicy = await prisma.returnAndExchangePolicy.create({
      data: {
        Title: data.Title,
        description: data.description,
        Text: data.Text,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(newReturnAndExchangePolicy, { status: 201 });
  } catch (error) {
    console.error('Error creating return and exchange policy:', error);
    return NextResponse.json({ error: 'Failed to create return and exchange policy' }, { status: 500 });
  }
}
