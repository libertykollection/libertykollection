import { NextResponse } from 'next/server';
import prisma from '../../util/prisma';
const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}




// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const categoryId = searchParams.get('categoryId');

//   try {
//     const subcategories = await prisma.subcategory.findMany({
//       where: {
//         categoryId: parseInt(categoryId, 10)
//       },
//       include: {
//         category: true,
//       },
//     });

//     return NextResponse.json(subcategories);
//   } catch (error) {
//     console.error('Error fetching subcategories:', error);
//     return NextResponse.json(
//       {
//         message: 'Failed to fetch subcategories',
//         status: false,
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const subcategoryId = searchParams.get('subcategoryId');

//   try {
//     if (!subcategoryId) {
//       return NextResponse.json({ message: 'Subcategory ID is required' }, { status: 400 });
//     }

//     const products = await prisma.product.findMany({
//       where: {
//         subcategoryId: parseInt(subcategoryId, 10),
//       },
//       include: {
//         images: true, // Include related images
//       },
//     });

//     return NextResponse.json(products);
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     return NextResponse.json(
//       { message: 'Failed to fetch products', status: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }

export async function GET() {
  try {
    const subcategories = await prisma.subcategory.findMany({
      include: {
        category: true,
      },
    });

    return NextResponse.json({ status: true, data: subcategories });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch subcategories',
        status: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}



// export async function GET() {
//   try {
//     const subcategories = await prisma.subcategory.findMany({
//       include: {
//         products: true,
//       },
//     });

//     // Log subcategories and their related products to the terminal
//     subcategories.forEach(subcategory => {
//       console.log(`Subcategory ${subcategory.id}: ${subcategory.name}`);
//       subcategory.products.forEach(product => {
//         console.log(`  Product ${product.id}: ${product.name}`);
//       });
//     });

//     return NextResponse.json(subcategories);
//   } catch (error) {
//     console.error('Error fetching subcategories and products:', error);
//     return NextResponse.json(
//       {
//         message: 'Failed to fetch subcategories and products',
//         status: false,
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }



export async function POST(request) {
  try {
    const { name, categoryId, imageUrl, meta_title, meta_description, meta_keywords } = await request.json();
    const slug = generateSlug(name); // Generate slug from the name

    const newSubcategory = await prisma.subcategory.create({
      data: {
        name,
        slug,  // Save slug
        categoryId: parseInt(categoryId, 10),
        imageUrl,
        meta_title,
        meta_description,
        meta_keywords,
      },
    });

    return NextResponse.json({
      status: true,
      message: 'Subcategory created successfully',
      data: newSubcategory,
    });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    return NextResponse.json(
      {
        message: 'Failed to create subcategory',
        status: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id, 10);

    const deletedSubcategory = await prisma.subcategory.delete({
      where: { id },
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
