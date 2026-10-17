import prisma from '../../../util/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams?.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    const companyDetails = await prisma.companyDetails.findUnique({
      where: { id },
    });
    return NextResponse.json(companyDetails || {});
  } catch (error) {
    console.error('Error fetching company details:', error);
    return NextResponse.json({ error: 'Failed to fetch company details' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams?.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    const data = await req.json();
    const { name, description, headerImage, favIcon } = data;

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (description !== undefined) dataToUpdate.description = description;
    if (headerImage !== undefined) dataToUpdate.headerImage = headerImage;
    if (favIcon !== undefined) dataToUpdate.favIcon = favIcon;

    const updatedCompanyDetails = await prisma.companyDetails.update({
      where: { id },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedCompanyDetails);
  } catch (error) {
    console.error('Error updating company details:', error);
    return NextResponse.json({ error: 'Failed to update company details' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams?.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    await prisma.companyDetails.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Company details deleted successfully' });
  } catch (error) {
    console.error('Error deleting company details:', error);
    return NextResponse.json({ error: 'Failed to delete company details' }, { status: 500 });
  }
}
