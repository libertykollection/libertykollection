import prisma from '../../../util/prisma';
import { NextResponse } from 'next/server';

// GET request handler
export async function GET(request, { params }) {
  const { slug } = params; // Get the slug from the route parameters

  if (!slug) {
    return NextResponse.json({ error: 'Subcategory slug is required.' }, { status: 400 });
  }

  try {
    // Fetch the subcategory using the slug
    const subcategory = await prisma.subcategory.findUnique({
      where: {
        slug: slug,
      },
      include: {
        products: {
          include: {
            images: true,
          },
        }, // Include associated products with images
      },
    });

    if (!subcategory) {
      return NextResponse.json({ error: 'Subcategory not found.' }, { status: 404 });
    }

    // Return the products associated with the found subcategory
    return NextResponse.json(subcategory.products, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // Disconnect from the database
  }
}
