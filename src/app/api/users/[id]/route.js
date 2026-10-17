import prisma from '../../../util/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id: paramId } = await params;
  const id = parseInt(paramId);
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Internal Server Error", status: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const { id: paramId } = await params;
  const id = parseInt(paramId);
  try {
    const data = await request.json();
    const { action } = data;

    let status;
    if (action === 'activate') {
      status = 1;
    } else if (action === 'deactivate') {
      status = 0;
    } else {
      // Allow other updates if needed, but primarily for status
      // If we are updating full profile, logic would be different.
      // Assuming this endpoint is mainly for status toggle based on previous code.
      // If 'data' has more fields, we might want to handle them.
      // But for now, let's keep it focused on status unless provided.
      if (data.status !== undefined) {
        status = data.status;
      } else {
        return NextResponse.json(
          { message: "Invalid action or missing status", status: false },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status: status, updatedAt: new Date() },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update user", status: false },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { id: paramId } = await params;
  const id = parseInt(paramId);
  try {
    // 1. Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ message: "User not found", status: false }, { status: 404 });
    }

    // 2. Check for dependencies (Orders)
    // Even if not explicitly related in Prisma schema, checking manually prevents orphaned data issues
    // and clarifies why deletion might fail if DB constraints exist.
    const userOrders = await prisma.order.findFirst({
      where: { userId: id }
    });

    if (userOrders) {
      return NextResponse.json(
        { message: "Cannot delete user: This user has associated orders. Please deactivate the account instead.", status: false },
        { status: 400 }
      );
    }

    const deleteUser = await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json({ message: "User deleted successfully", status: true, data: deleteUser });
  } catch (error) {
    console.error("Error deleting user:", error);
    // Check for specific Prisma error codes if needed (e.g., P2003 for foreign key constraint)
    if (error.code === 'P2003') {
      return NextResponse.json(
        { message: "Database Constraint Error: Cannot delete user due to related records.", status: false },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: error.message || "Internal Server Error", status: false },
      { status: 500 }
    );
  }
}
