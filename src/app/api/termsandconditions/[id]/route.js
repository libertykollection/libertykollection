import prisma from '../../../util/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;
  try {
    const term = await prisma.termAndConditions.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (!term) {
      return NextResponse.json({ error: 'Term and condition not found' }, { status: 404 });
    }
    return NextResponse.json(privacyPolicy, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch terms and condition' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  const data = await req.json();
  try {
    const updatedterm = await prisma.termAndConditions.update({
      where: { id: parseInt(id, 10) },
      data: {
        Title: data.Title,
        description: data.description,
        Text: data.Text,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(updatedterm, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update termAndConditions' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    const deletedterm = await prisma.termAndConditions.delete({
      where: { id: parseInt(id, 10) },
    });
    return NextResponse.json({ message: 'termAndConditions deleted successfully', deletedterm });
  } catch (error) {
    console.error('Error deleting termAndConditions:', error);
    return NextResponse.json({ error: 'Failed to delete termAndConditions' }, { status: 500 });
  }
}
