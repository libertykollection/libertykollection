import { NextResponse } from 'next/server';
import prisma from '../../../util/prisma';  // Assuming prisma is setup in your project

export async function GET(request, { params }) {
  const { slug } = params;  // Extract the slug from the parameters

  try {
    // Fetch the subcategory by slug and only select the 'name'
    const subcategory = await prisma.subcategory.findUnique({
      where: {
        slug: slug,  // Use the slug for the lookup
      },
      select: {
        name: true,
      },
    });

    if (!subcategory) {
      return NextResponse.json(
        { message: `Subcategory with slug "${slug}" not found`, status: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ name: subcategory.name, status: true });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch subcategory', error: error.message, status: false },
      { status: 500 }
    );
  }
}
