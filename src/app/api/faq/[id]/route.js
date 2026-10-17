import prisma from '../../../util/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;
  try {
    const faq = await prisma.faq.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (!faq) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
    }
    return NextResponse.json(faq, { status: 200 });
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQ' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  const data = await req.json();
  try {
    const updatedFaq = await prisma.faq.update({
      where: { id: parseInt(id, 10) },
      data: {
        question: data.question,
        answer: data.answer,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(updatedFaq, { status: 200 });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    await prisma.faq.delete({
      where: { id: parseInt(id, 10) },
    });
    return NextResponse.json({ message: 'FAQ deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 });
  }
}