import { NextResponse } from 'next/server';
import prisma from '../../util/prisma';
// Create a new blog record
export async function POST(request) {
  try {
    const data = await request.json();
    const { title, description } = data;
console.log(
  "data received: ",data
);
    // Create a new blog record in the database
    const newBlog = await prisma.blogcategories.create({
      data: {
        title,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(newBlog);
  } catch (error) {
    console.error('Error Creating Blog Record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Fetch all blog records
export async function GET() {
  try {
    const blogs = await prisma.Blogcategories.findMany();
    console.log("blogs are :", blogs);
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
