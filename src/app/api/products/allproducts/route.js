import prisma from "../../../util/prisma";
import { NextResponse } from 'next/server';

export async function GET() {
    try {
      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
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
  