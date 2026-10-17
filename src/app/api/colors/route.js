import { NextResponse } from 'next/server';
import prisma from '../../util/prisma';

export async function GET() {
  console.log('[API/Colors] GET request received');
  try {
    const colors = await prisma.color.findMany();
    console.log('[API/Colors] Success, count:', colors.length);
    return NextResponse.json(colors);
  } catch (error) {
    console.error('[API/Colors] ERROR:', error);
    return NextResponse.json(
      { message: 'Failed to fetch colors', error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    const { name, hex } = await request.json(); // Destructure both name and hex
    const newColor = await prisma.color.create({
      data: { name, hex }, // Save both the name and hex value
    });
    return NextResponse.json(newColor, { status: 201 });
  } catch (error) {
    console.error('Error creating color:', error);
    return NextResponse.json(
      { message: 'Failed to create color', error: error.message },
      { status: 500 }
    );
  }
}


export async function PUT(request) {
  try {
    const { id, name, hex } = await request.json(); // Destructure both name and hex
    const updatedColor = await prisma.color.update({
      where: { id: parseInt(id) },
      data: { name, hex }, // Update both the name and hex value
    });
    return NextResponse.json(updatedColor);
  } catch (error) {
    console.error('Error updating color:', error);
    return NextResponse.json(
      { message: 'Failed to update color', error: error.message },
      { status: 500 }
    );
  }
}


export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await prisma.color.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: 'Color deleted successfully' });
  } catch (error) {
    console.error('Error deleting color:', error);
    return NextResponse.json(
      { message: 'Failed to delete color', error: error.message },
      { status: 500 }
    );
  }
}
