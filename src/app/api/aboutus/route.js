import prisma from '../../util/prisma';
import { NextResponse } from 'next/server';

// Handler for GET requests (Fetch all About Us records)
export async function GET() {
  try {
    const aboutUsRecords = await prisma.aboutUs.findMany();
    return NextResponse.json(aboutUsRecords, { status: 200 });
  } catch (error) {
    console.error('Error fetching About Us records:', error);
    return NextResponse.json({ error: 'Failed to fetch About Us records' }, { status: 500 });
  }
}

// Handler for POST requests (Create new About Us record)
export async function POST(req) {
  try {
    const data = await req.json();
    const newAboutUs = await prisma.aboutUs.create({
      data: {
        Title: data.Title,
        description: data.description,
        Text: data.Text,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(newAboutUs, { status: 201 });
  } catch (error) {
    console.error('Error creating About Us record:', error);
    return NextResponse.json({ error: 'Failed to create About Us record' }, { status: 500 });
  }
}
