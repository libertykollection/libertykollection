import prisma from '../../../util/prisma';
import { NextResponse } from 'next/server';

// Handler for GET requests (Fetch About Us record by ID)
export async function GET(req, { params }) {
  const { id } = params;
  try {
    const aboutUs = await prisma.aboutUs.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (!aboutUs) {
      return NextResponse.json({ error: 'About Us record not found' }, { status: 404 });
    }
    return NextResponse.json(aboutUs, { status: 200 });
  } catch (error) {
    console.error('Error fetching About Us record:', error);
    return NextResponse.json({ error: 'Failed to fetch About Us record' }, { status: 500 });
  }
}

// Handler for PUT requests (Update About Us record by ID)
export async function PUT(req, { params }) {
  const { id } = params;
  const data = await req.json();
  try {
    const updatedAboutUs = await prisma.aboutUs.update({
      where: { id: parseInt(id, 10) },
      data: {
        Title: data.Title,
        description: data.description,
        Text: data.Text,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(updatedAboutUs, { status: 200 });
  } catch (error) {
    console.error('Error updating About Us record:', error);
    return NextResponse.json({ error: 'Failed to update About Us record' }, { status: 500 });
  }
}

// Handler for DELETE requests (Delete About Us record by ID)
export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    await prisma.aboutUs.delete({
      where: { id: parseInt(id, 10) },
    });
    return NextResponse.json({ message: 'About Us record deleted successfully' });
  } catch (error) {
    console.error('Error deleting About Us record:', error);
    return NextResponse.json({ error: 'Failed to delete About Us record' }, { status: 500 });
  }
}
