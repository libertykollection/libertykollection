import { NextResponse } from 'next/server';
import prisma from '../../util/prisma';


export async function GET() {
  console.log('[API/Sizes] GET request received');
  try {
    const sizes = await prisma.size.findMany();
    console.log('[API/Sizes] Success, count:', sizes.length);
    return NextResponse.json(sizes);
  } catch (error) {
    console.error('[API/Sizes] ERROR:', error);
    return NextResponse.json(
      { message: 'Failed to fetch sizes', error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { name } = await request.json();
    const newSize = await prisma.size.create({
      data: { name },
    });
    return NextResponse.json(newSize, { status: 201 });
  } catch (error) {
    console.error('Error creating size:', error);
    return NextResponse.json(
      { message: 'Failed to create size', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { id, name } = await request.json();
    const updatedSize = await prisma.size.update({
      where: { id: parseInt(id, 10) },
      data: { name },
    });
    return NextResponse.json(updatedSize);
  } catch (error) {
    console.error('Error updating size:', error);
    return NextResponse.json(
      { message: 'Failed to update size', error: error.message },
      { status: 500 }
    );
  }
}


export async function DELETE(request) {
  try {
    const { id } = await request.json(); // Assumes ID is passed in the request body
    await prisma.size.delete({
      where: { id: parseInt(id, 10) },
    });
    return NextResponse.json({ message: 'Size deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting size:', error);
    return NextResponse.json(
      { message: 'Failed to delete size', error: error.message },
      { status: 500 }
    );
  }
}