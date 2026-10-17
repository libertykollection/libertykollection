import { NextResponse } from 'next/server';
import prisma from '../../util/prisma';
import { revalidatePath } from 'next/cache';


export async function POST(request) {
  try {
    const {

      name,
      slug,
      description,
      price,
      stock,
      subcategorySlug,
      colors,
      sizes,
      discount,
      isTopRated,
      images, // Now it's a string or array of filenames
      meta_title,
      meta_description,
      meta_keywords,
      sku,
      productType,
      digitalData,
    } = await request.json();

    // Validate required fields
    if (!name || !slug || !description || !price || !subcategorySlug) {
      return NextResponse.json({
        status: false,
        message: "Missing required fields.",
      }, { status: 400 });
    }

    if (productType !== 'digital' && stock === undefined) {
      return NextResponse.json({
        status: false,
        message: "Stock is required for tangible products.",
      }, { status: 400 });
    }

    // Check for existing slug
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json({
        status: false,
        message: "Product with this slug already exists.",
      }, { status: 400 });
    }

    // Verify that subcategorySlug is not null or empty
    if (!subcategorySlug) {
      return NextResponse.json({
        status: false,
        message: "Subcategory slug is required.",
      }, { status: 400 });
    }

    // Handle images as a string or array of strings
    let imagesData;
    if (images) {
      // If it's a string, convert to an array for consistency
      const imageArray = Array.isArray(images) ? images : [images];
      imagesData = {
        create: imageArray.map(filename => ({ url: filename }))
      };
    }

    // Proceed to create the new product
    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        // Connect to the subcategory using the slug
        subcategory: { connect: { slug: subcategorySlug } },
        colors: colors ? JSON.stringify(colors) : null,
        sizes: sizes ? JSON.stringify(sizes) : null,
        discount: discount ? parseFloat(discount) : null,
        isTopRated: Boolean(isTopRated),
        images: imagesData, // Create images based on filenames
        meta_title,
        meta_description,
        meta_keywords,
        meta_keywords,
        sku,
        productType: productType || 'tangible',
        digitalData: digitalData ? JSON.stringify(digitalData) : null,
      },
      include: {
        images: true, // Optional: Include images in the response
      }
    });



    revalidatePath('/customer/pages/products');
    revalidatePath('/');

    return NextResponse.json({
      status: true,
      message: 'Product created successfully',
      data: newProduct,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      {
        message: 'Failed to create product',
        status: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}







// export async function GET() {
//   try {
//     const products = await prisma.$queryRaw`SELECT product.*, image.url FROM product INNER JOIN image ON image.productId = product.id group by  product.id`;
//     return NextResponse.json(products);
//   } catch (error) {
//     console.log('Error fetching products:', error);
//     return NextResponse.json(
//       { message: 'Failed to fetch products', error: error.message },
//       { status: 500 }
//     );
//   }
// }
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subcategorySlug = searchParams.get('subcategorySlug');

    const where = {};
    if (subcategorySlug) {
      where.subcategorySlug = subcategorySlug;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        images: true, // Include related images
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.log('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Failed to fetch products', error: error.message },
      { status: 500 }
    );
  }
}