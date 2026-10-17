import { NextResponse } from 'next/server';
import prisma from '../../../util/prisma';

// GET a single blog by ID
export async function GET(request, { params }) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
  }

  try {
    const blogcategory = await prisma.Blogcategories.findUnique({
      where: { id },
    });

    if (!blogcategory) {
      return NextResponse.json({ error: 'Blog category not found' }, { status: 404 });
    }

    return NextResponse.json(blogcategory);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// UPDATE a blog by ID
export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const { title, description } = data;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
    }

    const updatedBlogcategory = await prisma.Blogcategories.update({
      where: { id },
      data: {
        title,
        description,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedBlogcategory);
  } catch (error) {
    console.error('Error updating blog category:', error);
    if (error.code === 'P2025') { // Prisma specific error when record not found
      return NextResponse.json({ error: 'Blog category not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE a blog by ID
export async function DELETE(request, { params }) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
  }

  try {
    const deletedBlogcategory = await prisma.BlogCategories.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Blog category deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog category:', error);
    if (error.code === 'P2025') { // Prisma specific error when record not found
      return NextResponse.json({ error: 'Blog category not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
