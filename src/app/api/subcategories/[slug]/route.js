import { NextResponse } from 'next/server';
import prisma from '../../../util/prisma';  // Ensure Prisma is correctly set up

// Helper function to generate slugs
const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

// Get subcategories by category slug
export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { message: 'Slug is required', status: false },
        { status: 400 }
      );
    }

    // Fetch the category by slug first
    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      return NextResponse.json(
        { message: `Category with slug "${slug}" not found`, status: false },
        { status: 404 }
      );
    }

    // Fetch subcategories by categoryId
    const subcategories = await prisma.subcategory.findMany({
      where: { categoryId: category.id },
    });

    if (!subcategories || subcategories.length === 0) {
      return NextResponse.json(
        { message: `No subcategories found for category "${slug}"`, status: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: true, data: subcategories });
  } catch (error) {
    console.error('Error in fetching subcategories:', error.message);
    return NextResponse.json(
      { message: 'Failed to fetch subcategories', status: false, error: error.message },
      { status: 500 }
    );
  }
}


// Update subcategory by slug
// export async function PUT(request, { params }) {
//   try {
//     const { slug } = params;
//     const { name, categoryId, imageUrl, meta_title, meta_description, meta_keywords } = await request.json();

//     // Validate if subcategory exists
//     const subcategory = await prisma.subcategory.findUnique({
//       where: { slug },
//     });

//     if (!subcategory) {
//       return NextResponse.json({
//         message: `Subcategory with slug "${slug}" not found`,
//         status: false,
//       }, { status: 404 });
//     }

//     // Ensure categoryId is valid
//     const category = await prisma.category.findUnique({
//       where: { id: parseInt(categoryId, 10) },
//     });

//     if (!category) {
//       return NextResponse.json({
//         message: 'Category not found',
//         status: false,
//       }, { status: 404 });
//     }

//     // Check for slug uniqueness
//     const existingSlug = await prisma.subcategory.findUnique({
//       where: { slug: generateSlug(name) },
//     });

//     if (existingSlug && existingSlug.id !== subcategory.id) {
//       return NextResponse.json({
//         message: 'Slug already exists for another subcategory',
//         status: false,
//       }, { status: 400 });
//     }

//     // Update subcategory
//     const updatedSubcategory = await prisma.subcategory.update({
//       where: { slug },
//       data: {
//         name,
//         slug: generateSlug(name),  // Update slug
//         categoryId: parseInt(categoryId, 10),
//         imageUrl,
//         meta_title,
//         meta_description,
//         meta_keywords,
//         updatedAt: new Date(),
//       },
//     });

//     return NextResponse.json({
//       status: true,
//       message: 'Subcategory updated successfully',
//       data: updatedSubcategory,
//     });
//   } catch (error) {
//     console.error('Error updating subcategory:', error);
//     return NextResponse.json(
//       {
//         message: 'Failed to update subcategory',
//         status: false,
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

export async function PUT(request, { params }) {
  try {
    const { slug } = await params;
    const { name, categoryId, imageUrl, meta_title, meta_description, meta_keywords } = await request.json();

    // Update subcategory by slug
    const updatedSubcategory = await prisma.subcategory.update({
      where: { slug },
      data: {
        name,
        slug: generateSlug(name),  // Update slug
        categoryId: parseInt(categoryId, 10),
        imageUrl,
        meta_title,
        meta_description,
        meta_keywords,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      status: true,
      message: 'Subcategory updated successfully',
      data: updatedSubcategory,
    });
  } catch (error) {
    console.error('Error updating subcategory:', error); // Log the error
    return NextResponse.json(
      {
        message: 'Failed to update subcategory',
        status: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}


// Delete subcategory by slug
export async function DELETE(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { message: 'Slug is required', status: false },
        { status: 400 }
      );
    }

    // Validate if subcategory exists
    const subcategory = await prisma.subcategory.findUnique({
      where: { slug },
    });

    if (!subcategory) {
      return NextResponse.json({
        message: `Subcategory with slug "${slug}" not found`,
        status: false,
      }, { status: 404 });
    }

    // Delete subcategory
    const deletedSubcategory = await prisma.subcategory.delete({
      where: { slug },
    });

    return NextResponse.json({
      status: 200,
      message: 'Subcategory deleted successfully',
      data: deletedSubcategory,
    });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json(
      {
        message: 'Failed to delete subcategory',
        status: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
