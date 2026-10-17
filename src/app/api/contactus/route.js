import prisma from '../../util/prisma';
import { NextResponse } from 'next/server';

// Handler for GET requests (Fetch all Contact Us records)
export async function GET() {
  try {
    const contactUsRecords = await prisma.contactUs.findMany();
    return NextResponse.json(contactUsRecords, { status: 200 });
  } catch (error) {
    console.error('Error fetching Contact Us records:', error);
    return NextResponse.json({ error: 'Failed to fetch Contact Us records' }, { status: 500 });
  }
}

// Handler for POST requests (Create new Contact Us record)
export async function POST(req) {
  try {
    const data = await req.json();
    const newContactUs = await prisma.contactUs.create({
      data: {
        Title: data.Title,
        description: data.description,
        Text: data.Text,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(newContactUs, { status: 201 });
  } catch (error) {
    console.error('Error creating Contact Us record:', error);
    return NextResponse.json({ error: 'Failed to create Contact Us record' }, { status: 500 });
  }
}
