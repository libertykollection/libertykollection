import { NextResponse } from 'next/server';
import prisma from '../../../util/prisma';

// Get category by slug (GET /api/categories/[slug])
export async function GET(request, { params }) {
  const { slug } = await params;  // Use slug instead of id

  if (!slug) {
    return NextResponse.json(
      { message: 'Slug is required', status: false },
      { status: 400 }
    );
  }

  try {
    // Fetch the category by its slug
    const category = await prisma.category.findUnique({
      where: { slug }, // Query using slug instead of id
    });

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found', status: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: true, data: category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { message: 'Failed to fetch category', status: false, error: error.message },
      { status: 500 }
    );
  }
}


export async function PUT(request, { params }) {
  try {
    // Extract slug from params
    const { slug } = await params;

    // If slug is undefined, return an error
    if (!slug) {
      return NextResponse.json(
        { message: 'Slug is required', status: false },
        { status: 400 }
      );
    }

    // Extract the request body data
    const { name, imageUrl, meta_title, meta_description, meta_keywords } = await request.json();

    // Check if the category with the given slug exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: 'Category not found', status: false },
        { status: 404 }
      );
    }

    // Update the category with the provided slug
    const updatedCategory = await prisma.category.update({
      where: { slug },  // Ensure that the slug is passed to the 'where' clause
      data: {
        name,
        imageUrl,
        meta_title,          // Update meta title
        meta_description,    // Update meta description
        meta_keywords,       // Update meta keywords
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      {
        message: 'Failed to update category',
        status: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Delete a category by slug (DELETE /api/categories/[slug])
export async function DELETE(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { message: 'Slug is required', status: false },
        { status: 400 }
      );
    }

    // Check if the category with the given slug exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: 'Category not found', status: false },
        { status: 404 }
      );
    }

    await prisma.category.delete({
      where: { slug },  // Ensure slug is used for deletion
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      {
        message: 'Failed to delete category',
        status: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
