import { NextResponse } from 'next/server';
import prisma from '../../../util/prisma';  // Ensure this path is correct based on your project structure

// Get subcategory details by slug
// export async function GET(request, { params }) {
//   try {
//     const { slug } = params; // Extract the slug from the URL parameters

//     // Validate the presence of the slug
//     if (!slug) {
//       return NextResponse.json(
//         { message: 'Slug is required', status: false },
//         { status: 400 }  // Bad request
//       );
//     }

//     // Fetch the specific subcategory by slug, including category if needed
//     const subcategory = await prisma.subcategory.findUnique({
//       where: { slug },  // Use the slug to find the subcategory
//       include: {
//         category: true, // Include category details if necessary
//       },
//     });

//     // If no subcategory is found, return a 404 response
//     if (!subcategory) {
//       return NextResponse.json(
//         { message: `Subcategory with slug "${slug}" not found`, status: false },
//         { status: 404 }  // Not found
//       );
//     }

//     // Successfully fetched the subcategory, return the data
//     return NextResponse.json({ status: true, data: subcategory });
//   } catch (error) {
//     console.error(`Error fetching subcategory with slug "${slug}":`, error.message);
    
//     // Return a 500 response for server-side errors
//     return NextResponse.json(
//       { message: 'Failed to fetch subcategory', status: false, error: error.message },
//       { status: 500 }  // Internal server error
//     );
//   }
// }


export async function GET(request, { params }) {
  try {
    const { slug } = await params; // Extract the slug from the URL parameters

    // Validate the presence of the slug
    if (!slug) {
      return NextResponse.json(
        { message: 'Slug is required', status: false },
        { status: 400 }  // Bad request
      );
    }

    // Fetch the specific subcategory by slug
    const subcategory = await prisma.subcategory.findUnique({
      where: { slug },  // Use the slug to find the subcategory
    });

    // If no subcategory is found, return a 404 response
    if (!subcategory) {
      return NextResponse.json(
        { message: `Subcategory with slug "${slug}" not found`, status: false },
        { status: 404 }  // Not found
      );
    }

    // Successfully fetched the subcategory, return the data
    return NextResponse.json({ status: true, data: subcategory });
  } catch (error) {
    console.error(`Error fetching subcategory with slug "${slug}":`, error.message);
    
    // Return a 500 response for server-side errors
    return NextResponse.json(
      { message: 'Failed to fetch subcategory', status: false, error: error.message },
      { status: 500 }  // Internal server error
    );
  }
}