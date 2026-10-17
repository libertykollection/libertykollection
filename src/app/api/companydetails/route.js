import prisma from '../../util/prisma';
import { NextResponse } from 'next/server';


export async function GET() {
  try {
    const companyDetails = await prisma.companyDetails.findFirst();
    return NextResponse.json(companyDetails || {});
  } catch (error) {
    console.error('Error fetching company details:', error);
    return NextResponse.json({ error: 'Failed to fetch company details' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { name, description, headerImage, favIcon } = data;
    const newCompanyDetails = await prisma.companyDetails.create({
      data: {
        name: name || '',
        description: description || '',
        headerImage: headerImage || '',
        favIcon: favIcon || '',
      },
    });
    return NextResponse.json(newCompanyDetails, { status: 201 });
  } catch (error) {
    console.error('Error creating company details:', error);
    return NextResponse.json({ error: 'Failed to create company details' }, { status: 500 });
  }
}
