import prisma from '../../../util/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;
  try {
    const contactInfo = await prisma.contactInfo.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (!contactInfo) {
      return NextResponse.json({ error: 'Contact information not found' }, { status: 404 });
    }
    return NextResponse.json(contactInfo, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contact information' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  const data = await req.json();
  try {
    const updatedContactInfo = await prisma.contactInfo.update({
      where: { id: parseInt(id, 10) },
      data,
    });
    return NextResponse.json(updatedContactInfo, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update contact information' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
    const { id } = params;
    try {
      const deletedContact = await prisma.contactInfo.delete({
        where: { id: parseInt(id, 10) },
      });
      return NextResponse.json({ message: 'Contact information deleted successfully', deletedContact });
    } catch (error) {
      console.error('Error deleting contact info:', error);
      return NextResponse.json({ error: 'Failed to delete contact information' }, { status: 500 });
    }
  }