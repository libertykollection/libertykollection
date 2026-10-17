import prisma from '../../../util/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;
  try {
    const shippingPolicy = await prisma.shippingPolicy.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (!shippingPolicy) {
      return NextResponse.json({ error: 'Shipping policy not found' }, { status: 404 });
    }
    return NextResponse.json(shippingPolicy, { status: 200 });
  } catch (error) {
    console.error('Error fetching shipping policy:', error); // More detailed error logging
    return NextResponse.json({ error: 'Failed to fetch shipping policy' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  const data = await req.json();
  try {
    const updatedShippingPolicy = await prisma.shippingPolicy.update({
      where: { id: parseInt(id, 10) },
      data: {
        Title: data.Title,
        description: data.description,
        Text: data.Text,
        updatedAt: new Date(), // Ensure your model handles this if not automatically set
      },
    });
    return NextResponse.json(updatedShippingPolicy, { status: 200 });
  } catch (error) {
    console.error('Error updating shipping policy:', error); // More detailed error logging
    return NextResponse.json({ error: 'Failed to update shipping policy' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    await prisma.shippingPolicy.delete({
      where: { id: parseInt(id, 10) },
    });
    return NextResponse.json({ message: 'Shipping policy deleted successfully' }); // Just return a success message
  } catch (error) {
    console.error('Error deleting shipping policy:', error); // More detailed error logging
    return NextResponse.json({ error: 'Failed to delete shipping policy' }, { status: 500 });
  }
}
