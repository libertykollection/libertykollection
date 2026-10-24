import { NextResponse } from 'next/server';
import prisma from '../../../util/prisma';

// Get a single setting by ID
export async function GET(request, { params }) {
  const { id } = params;
  try {
    const setting = await prisma.settings.findFirst({
      where: { id: parseInt(id) },
    });
    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error fetching setting:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch setting',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Update a setting by ID
export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const data = await request.json();
    const { deliveryCharge, taxPercentage, other1, other2 } = data;

    const parsedDelivery = isNaN(parseFloat(deliveryCharge)) ? 0 : parseFloat(deliveryCharge);
    const parsedTax = isNaN(parseFloat(taxPercentage)) ? 0 : parseFloat(taxPercentage);
    const parsedOther1 = isNaN(parseFloat(other1)) ? 0 : parseFloat(other1);
    const parsedOther2 = isNaN(parseFloat(other2)) ? 0 : parseFloat(other2);

    const updatedSetting = await prisma.settings.update({
      where: { id: parseInt(id) },
      data: {
        deliveryCharge: parsedDelivery,
        taxPercentage: parsedTax,
        other1: parsedOther1,
        other2: parsedOther2,
      },
    });

    return NextResponse.json(updatedSetting);
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      {
        message: 'Failed to update setting',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Delete a setting by ID
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    await prisma.settings.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json(
      {
        message: 'Failed to delete setting',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
