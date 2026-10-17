import prisma from '../../../util/prisma';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
    try {
      const { id } = params;
      const body = await request.json();
      const { pixelCode } = body;
  
      const updatedPixel = await prisma.facebookPixel.update({
        where: { id: Number(id) },
        data: { pixelCode },
      });
  
      return NextResponse.json({ data: updatedPixel, status: true }, { status: 200 });
    } catch (error) {
      console.error('Error updating pixel:', error);
      return NextResponse.json({ message: 'Failed to update pixel', error: error.message, status: false }, { status: 500 });
    }
  }
  
  // DELETE: Remove a Facebook Pixel
  export async function DELETE(request, { params }) {
    try {
      const { id } = params;
  
      await prisma.facebookPixel.delete({
        where: { id: Number(id) },
      });
  
      return NextResponse.json({ message: 'Pixel deleted successfully', status: true }, { status: 200 });
    } catch (error) {
      console.error('Error deleting pixel:', error);
      return NextResponse.json({ message: 'Failed to delete pixel', error: error.message, status: false }, { status: 500 });
    }
  }