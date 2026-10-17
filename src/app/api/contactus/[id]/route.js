import prisma from '../../../util/prisma';
import { NextResponse } from 'next/server';

// Handler for GET requests (Fetch Contact Us record by ID)
export async function GET(req, { params }) {
  const { id } = params;
  try {
    const contactUs = await prisma.contactUs.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (!contactUs) {
      return NextResponse.json({ error: 'Contact Us record not found' }, { status: 404 });
    }
    return NextResponse.json(contactUs, { status: 200 });
  } catch (error) {
    console.error('Error fetching Contact Us record:', error);
    return NextResponse.json({ error: 'Failed to fetch Contact Us record' }, { status: 500 });
  }
}

// Handler for PUT requests (Update Contact Us record by ID)
export async function PUT(req, { params }) {
  const { id } = params;
  const data = await req.json();
  try {
    const updatedContactUs = await prisma.contactUs.update({
      where: { id: parseInt(id, 10) },
      data: {
        Title: data.Title,
        description: data.description,
        Text: data.Text,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(updatedContactUs, { status: 200 });
  } catch (error) {
    console.error('Error updating Contact Us record:', error);
    return NextResponse.json({ error: 'Failed to update Contact Us record' }, { status: 500 });
  }
}

// Handler for DELETE requests (Delete Contact Us record by ID)
export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    await prisma.contactUs.delete({
      where: { id: parseInt(id, 10) },
    });
    return NextResponse.json({ message: 'Contact Us record deleted successfully' });
  } catch (error) {
    console.error('Error deleting Contact Us record:', error);
    return NextResponse.json({ error: 'Failed to delete Contact Us record' }, { status: 500 });
  }
}
