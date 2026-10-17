import prisma from '../../../util/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;
  try {
    const privacyPolicy = await prisma.privacyPolicy.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (!privacyPolicy) {
      return NextResponse.json({ error: 'Privacy policy not found' }, { status: 404 });
    }
    return NextResponse.json(privacyPolicy, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch privacy policy' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  const data = await req.json();
  try {
    const updatedPrivacyPolicy = await prisma.privacyPolicy.update({
      where: { id: parseInt(id, 10) },
      data: {
        Title: data.Title,
        description: data.description,
        Text: data.Text,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(updatedPrivacyPolicy, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update privacy policy' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    const deletedPolicy = await prisma.privacyPolicy.delete({
      where: { id: parseInt(id, 10) },
    });
    return NextResponse.json({ message: 'Privacy policy deleted successfully', deletedPolicy });
  } catch (error) {
    console.error('Error deleting privacy policy:', error);
    return NextResponse.json({ error: 'Failed to delete privacy policy' }, { status: 500 });
  }
}
