import { NextResponse } from 'next/server';
import prisma from '../../../util/prisma';
import { sendStatusUpdateEmail } from '../../../util/sendStatusUpdateEmail';
import nodemailer from 'nodemailer';

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: {
                  take: 1
                }
              }
            }
          },
        },
      },
    });

    if (!order) {
      console.log('Order not found');
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    console.log('Order Details:', order); // Log order details to the terminal
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, status, paymentMethod, paymentInfo } = await request.json();

    // Begin a transaction
    const updatedOrder = await prisma.$transaction(async (prisma) => {
      const order = await prisma.order.findUnique({
        where: { id: parseInt(id) },
        include: {
          orderItems: true, // Include order items to access product ID and quantity
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const activeStatuses = ['PAID', 'SHIPPED', 'CONFIRMED', 'COMPLETED'];
      const shouldDeduct = activeStatuses.includes(status) && !order.stockDeducted;
      const shouldRestore = status === 'CANCELLED' && order.stockDeducted;

      if (shouldDeduct) {
        // Decrease the stock quantity
        for (const item of order.orderItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      } else if (shouldRestore) {
        // Increase the stock quantity back
        for (const item of order.orderItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // Update the order status and other details
      return prisma.order.update({
        where: { id: parseInt(id) },
        data: {
          status,
          stockDeducted: shouldDeduct ? true : (shouldRestore ? false : order.stockDeducted),
          paymentMethod,
          paymentInfo: paymentMethod === 'Credit Card' ? JSON.stringify(paymentInfo) : null,
          updatedAt: new Date(),
        },
      });
    });

    // Send email on status change
    if (updatedOrder) {
      console.log(`[StatusUpdate] Triggering email for Order #${updatedOrder.id}. Initial email: ${updatedOrder.email}`);

      let targetEmail = updatedOrder.email;
      let targetName = updatedOrder.recipientName || 'Customer';

      // Robustness: Fallback to account email if order email is 'N/A' or missing
      if (!targetEmail || targetEmail === 'N/A') {
        if (updatedOrder.userId) {
          const user = await prisma.user.findUnique({ where: { id: updatedOrder.userId } });
          if (user?.email) {
            targetEmail = user.email;
            targetName = user.name || targetName;
            console.log(`[StatusUpdate] Using fallback User email: ${targetEmail}`);
          }
        }
      }

      if (targetEmail && targetEmail !== 'N/A') {
        await sendStatusUpdateEmail({
          email: targetEmail,
          name: targetName,
          orderId: updatedOrder.id,
          status: updatedOrder.status,
        });
      } else {
        console.warn(`[StatusUpdate] No valid email found for Order #${updatedOrder.id}`);
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}


export async function DELETE(request) {
  try {
    const { id } = await request.json();
    const deletedOrder = await prisma.order.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json(deletedOrder);
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
