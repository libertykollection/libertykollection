


import { NextResponse } from "next/server";
import prisma from "../../../util/prisma";

export async function GET(request, { params }) {
  try {
    const { id: rawId } = await Promise.resolve(params);
    const id = parseInt(rawId, 10);
    const getbranches = await prisma.Branches.findUnique({
      where: { id },
    });
    return NextResponse.json(getbranches);
  } catch (error) {
    console.log("Error fetching branches :", error);
    return NextResponse.error("Internal Server Error", 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const { id: rawId } = await Promise.resolve(params);
    const id = parseInt(rawId, 10);
    const body = await request.json();
    const updatebranches = await prisma.Branches.update({
      where: { id },
      data: {
        title: body.title,
        address: body.address,
        city: body.city,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(updatebranches);
  } catch (error) {
    console.log("Error updating branches :", error);
    return NextResponse.error("Internal Server Error", 500);
  }
}


export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    const deletedBranches = await prisma.Branches.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json(deletedBranches);
  } catch (error) {
    console.error('Error deleting branches:', error);
    return NextResponse.json(
      {
        message: 'Failed to delete branch',
        status: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
