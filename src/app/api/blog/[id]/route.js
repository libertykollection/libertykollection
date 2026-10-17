import { NextResponse } from 'next/server';
import prisma from '../../../util/prisma';


// GET a single blog by ID
export async function GET(request, { params }) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
  }

  try {
    const blog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// UPDATE a blog by ID
export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const { title, description, image,meta_title,
      meta_description, category,meta_focusKeyword,
      web_slug, } = data;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
    }

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        title,
        description,
        image,
        category,
        meta_title,
      meta_description,
      meta_focusKeyword,
      web_slug,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    if (error.code === 'P2025') { // Prisma specific error when record not found
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
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
    const deletedBlog = await prisma.blog.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    if (error.code === 'P2025') { // Prisma specific error when record not found
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
