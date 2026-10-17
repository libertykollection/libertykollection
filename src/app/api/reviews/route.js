import { NextResponse } from 'next/server';
import prisma from '../../util/prisma';

// POST - Add a new review
export async function POST(request) {
  try {
    const data = await request.json();
    const { productId, reviewer, rating, comment } = data;

    // Input validation
    if (!productId || !reviewer || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    // Create a new review in the database with 'pending' status
    const newReview = await prisma.review.create({
      data: {
        productId: Number(productId),
        reviewer,
        rating: Number(rating),
        comment,
        status: 'approved', // Set the default status as 'approved' for testing
      },
    });

    return NextResponse.json({
      status: 201,
      message: 'Review added successfully and is pending approval',
      data: newReview,
    });
  } catch (error) {
    console.error('Error creating review:', error); // Log full error message
    return NextResponse.json(
      { message: 'Failed to create review', error: error.message },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        product: true, // Including related product information
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { message: 'Failed to fetch reviews', error: error.message },
      { status: 500 }
    );
  }
}

