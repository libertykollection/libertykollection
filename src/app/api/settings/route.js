import { NextResponse } from 'next/server';
import prisma from '../../util/prisma'; // Ensure the path is correct

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          deliveryCharge: 200,
          taxPercentage: 0,
          other1: 0,
          other2: 0,
        },
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch settings',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { deliveryCharge, taxPercentage, other1, other2 } = data;

    const parsedDelivery = isNaN(parseFloat(deliveryCharge)) ? 0 : parseFloat(deliveryCharge);
    const parsedTax = isNaN(parseFloat(taxPercentage)) ? 0 : parseFloat(taxPercentage);
    const parsedOther1 = isNaN(parseFloat(other1)) ? 0 : parseFloat(other1);
    const parsedOther2 = isNaN(parseFloat(other2)) ? 0 : parseFloat(other2);

    const existing = await prisma.settings.findFirst();
    if (existing) {
      const updated = await prisma.settings.update({
        where: { id: existing.id },
        data: {
          deliveryCharge: parsedDelivery,
          taxPercentage: parsedTax,
          other1: parsedOther1,
          other2: parsedOther2,
        },
      });
      return NextResponse.json(updated);
    }

    const newSetting = await prisma.settings.create({
      data: {
        deliveryCharge: parsedDelivery,
        taxPercentage: parsedTax,
        other1: parsedOther1,
        other2: parsedOther2,
      },
    });

    return NextResponse.json(newSetting);
  } catch (error) {
    console.error('Error creating settings:', error);
    return NextResponse.json(
      {
        message: 'Failed to create settings',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { deliveryCharge, taxPercentage, other1, other2 } = data;

    const parsedDelivery = isNaN(parseFloat(deliveryCharge)) ? 0 : parseFloat(deliveryCharge);
    const parsedTax = isNaN(parseFloat(taxPercentage)) ? 0 : parseFloat(taxPercentage);
    const parsedOther1 = isNaN(parseFloat(other1)) ? 0 : parseFloat(other1);
    const parsedOther2 = isNaN(parseFloat(other2)) ? 0 : parseFloat(other2);

    const existing = await prisma.settings.findFirst();
    if (existing) {
      const updated = await prisma.settings.update({
        where: { id: existing.id },
        data: {
          deliveryCharge: parsedDelivery,
          taxPercentage: parsedTax,
          other1: parsedOther1,
          other2: parsedOther2,
        },
      });
      return NextResponse.json(updated);
    }

    const created = await prisma.settings.create({
      data: {
        deliveryCharge: parsedDelivery,
        taxPercentage: parsedTax,
        other1: parsedOther1,
        other2: parsedOther2,
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      {
        message: 'Failed to update settings',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);

    await prisma.settings.delete({
      where: { id },
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
