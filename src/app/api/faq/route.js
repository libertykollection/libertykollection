import prisma from '../../util/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const faqs = await prisma.faq.findMany();
    return NextResponse.json(faqs, { status: 200 });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const newFaq = await prisma.faq.create({
      data: {
        question: data.question,
        answer: data.answer,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(newFaq, { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 });
  }
}