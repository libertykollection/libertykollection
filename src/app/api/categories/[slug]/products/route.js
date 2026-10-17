import { NextResponse } from 'next/server';
import prisma from '../../../../util/prisma';

export async function GET(request, { params }) {
    const { slug } = await params;

    if (!slug) {
        return NextResponse.json(
            { message: 'Category slug is required', status: false },
            { status: 400 }
        );
    }

    try {
        // 1. Fetch the category by slug
        const category = await prisma.category.findUnique({
            where: { slug },
            include: {
                subcategories: {
                    select: {
                        slug: true
                    }
                }
            }
        });

        if (!category) {
            return NextResponse.json(
                { message: 'Category not found', status: false },
                { status: 404 }
            );
        }

        // 2. Get all subcategory slugs for this category
        const subcategorySlugs = category.subcategories.map(sub => sub.slug);

        if (subcategorySlugs.length === 0) {
            return NextResponse.json({
                status: true,
                data: [],
                message: 'No subcategories found for this category'
            });
        }

        // 3. Fetch all products whose subcategory is in this category
        const products = await prisma.product.findMany({
            where: {
                subcategorySlug: {
                    in: subcategorySlugs
                }
            },
            include: {
                images: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            status: true,
            categoryName: category.name,
            data: products
        });

    } catch (error) {
        console.error('Error fetching category products:', error);
        return NextResponse.json(
            { message: 'Failed to fetch products', status: false, error: error.message },
            { status: 500 }
        );
    }
}
