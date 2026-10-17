import prisma from '../../util/prisma';
import { NextResponse } from 'next/server';

// Handler for GET requests
export async function GET() {
  try {
    const shippingPolicies = await prisma.shippingPolicy.findMany();
    return NextResponse.json(shippingPolicies, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shipping policies' }, { status: 500 });
  }
}

// Handler for POST requests
export async function POST(req) {
  try {
    const data = await req.json();
    const newShippingPolicy = await prisma.shippingPolicy.create({
      data: {
        Title: data.Title,
        description: data.description,
        Text: data.Text,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(newShippingPolicy, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create shipping policy' }, { status: 500 });
  }
}
