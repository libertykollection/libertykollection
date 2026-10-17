// import prisma from '../../../util/prisma';
import prisma from '../../../util/prisma';
// import prisma from '../../../util/prisma';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  const { name, phoneno, city, id } = await request.json(); // Extract id from request body

  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id) }, // Use the id provided in the request
      data: {
        name,
        phoneno,
        city,
      },
    });

    return NextResponse.json({ status: true, user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
