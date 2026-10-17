import prisma from '../../util/prisma'; // Make sure to import your Prisma client
import { NextResponse } from 'next/server';
// Fetch all pixel codes
export async function GET() {
    try {
      const pixels = await prisma.facebookPixel.findMany();
      return NextResponse.json({ data: pixels, status: true }, { status: 200 });
    } catch (error) {
      console.error('Error fetching pixels:', error);
      return NextResponse.json({ message: 'Failed to fetch pixels', status: false, error: error.message }, { status: 500 });
    }
  }

// Add a new pixel code
export async function POST(request) {
    try {
      const body = await request.json();
      const { pixelCode } = body;
  
      const newPixel = await prisma.facebookPixel.create({
        data: { pixelCode },
      });
  
      return NextResponse.json({ data: newPixel, status: true }, { status: 201 });
    } catch (error) {
      console.error('Error adding pixel:', error);
      return NextResponse.json({ message: 'Failed to add pixel', status: false, error: error.message }, { status: 500 });
    }
  }