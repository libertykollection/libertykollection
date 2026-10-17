import prisma from '../../../util/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;
  try {
    const returnAndExchangePolicy = await prisma.returnAndExchangePolicy.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (!returnAndExchangePolicy) {
      return NextResponse.json({ error: 'Return and exchange policy not found' }, { status: 404 });
    }
    return NextResponse.json(returnAndExchangePolicy, { status: 200 });
  } catch (error) {
    console.error('Error fetching return and exchange policy:', error); // More detailed error logging
    return NextResponse.json({ error: 'Failed to fetch return and exchange policy' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  const data = await req.json();
  try {
    const updatedReturnAndExchangePolicy = await prisma.returnAndExchangePolicy.update({
      where: { id: parseInt(id, 10) },
      data: {
        Title: data.Title,
        description: data.description,
        Text: data.Text,
        updatedAt: new Date(), // Ensure your model handles this if not automatically set
      },
    });
    return NextResponse.json(updatedReturnAndExchangePolicy, { status: 200 });
  } catch (error) {
    console.error('Error updating return and exchange policy:', error); // More detailed error logging
    return NextResponse.json({ error: 'Failed to update return and exchange policy' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    await prisma.returnAndExchangePolicy.delete({
      where: { id: parseInt(id, 10) },
    });
    return NextResponse.json({ message: 'Return and exchange policy deleted successfully' }); // Just return a success message
  } catch (error) {
    console.error('Error deleting return and exchange policy:', error); // More detailed error logging
    return NextResponse.json({ error: 'Failed to delete return and exchange policy' }, { status: 500 });
  }
}
