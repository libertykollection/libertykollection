import { NextResponse } from 'next/server';
import prisma from '../../util/prisma';

export async function GET(request) {
  // Log the request URL for debugging purposes
  console.log('Request URL:', request.url);

  // Extract searchParams from the URL
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId'); // Extract productId from query parameters

  // Log the extracted productId to check if it's being captured correctly
  console.log('Extracted productId:', productId);

  if (!productId) {
    console.log('No productId found in the query parameters.');
    return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
  }

  try {
    // Fetch reviews for the given productId
    const reviews = await prisma.review.findMany({
      where: {
        productId: Number(productId),
      },
      include: {
        product: true,
      },
    });

    // Log the fetched reviews to verify the query results
    console.log('Fetched reviews:', reviews);

    return NextResponse.json({ reviews });
  } catch (error) {
    // Log the error if something goes wrong
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ message: 'Failed to fetch reviews' }, { status: 500 });
  }
}
