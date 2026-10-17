import { NextResponse } from 'next/server';
import prisma from '../../../../util/prisma';
import pluralize from 'pluralize'; // Import the pluralize library

export async function GET(request, { params }) {
  const { id: search } = await params;

  if (!search) {
    return NextResponse.json(
      { message: 'Search query cannot be empty', status: false },
      { status: 400 }
    );
  }

  try {
    // Split the search query into keywords
    const keywords = search.split(/\s+/).filter(keyword => keyword.trim() !== '');

    // Search Terms (Singular/Plural)
    const searchTerms = new Set();
    keywords.forEach(keyword => {
      searchTerms.add(keyword);
      searchTerms.add(pluralize.singular(keyword));
      searchTerms.add(pluralize.plural(keyword));
    });
    const searchArray = Array.from(searchTerms);

    // 1. Search Products
    const productConditions = searchArray.map(term => `
      Product.name LIKE '%${term}%' 
      OR Product.description LIKE '%${term}%' 
      OR Product.subcategorySlug LIKE '%${term}%'
      OR Product.sku LIKE '%${term}%'
    `).join(' OR ');

    const productQuery = `
      SELECT 
        Product.id, 
        Product.slug,
        Product.name, 
        Product.description, 
        Product.price, 
        Product.discount, 
        Product.subcategorySlug,
        Product.stock,
        COALESCE(
          (SELECT JSON_ARRAYAGG(Image.url) FROM Image WHERE Image.productId = Product.id), 
          JSON_ARRAY()
        ) AS images
      FROM Product 
      WHERE (${productConditions})
    `;

    // 2. Search Categories
    // Using simple prisma findMany for categories as it's cleaner
    const categories = await prisma.category.findMany({
      where: {
        OR: searchArray.map(term => ({
          name: { contains: term } // Case insensitive in MySQL usually
        }))
      },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true
      },
      take: 5
    });

    const products = await prisma.$queryRawUnsafe(productQuery);
    const uniqueProducts = Array.from(new Map(products.map(product => [product.id, product])).values());

    return NextResponse.json({
      data: uniqueProducts,
      categories: categories, // Return categories separately
      status: true
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching search results:', error);
    return NextResponse.json(
      { message: 'Failed to fetch search results', error: error.message, status: false },
      { status: 500 }
    );
  }
}
