import { NextResponse } from 'next/server';
import { sendOrderConfirmation } from '../../util/sendOrderConfirmation';
import prisma from '../../util/prisma';

export async function POST(request) {
  try {
    const { email, name, orderId } = await request.json();
    console.log('Received order confirmation request:', { email, name, orderId });

    // Fetch order details by orderId to ensure it exists and get correct total
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      console.error(`Order not found for confirmation: ${orderId}`);
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const items = order.orderItems;
    if (!items || items.length === 0) {
      console.error(`No items found in order: ${orderId}`);
      return NextResponse.json({ message: 'Invalid order items' }, { status: 400 });
    }

    // Use the utility function to send the email
    // Note: Passing the full order object for detailed breakdown
    await sendOrderConfirmation(email, orderId, order);

    return NextResponse.json({ message: 'Order confirmation email sent successfully' });

  } catch (error) {
    console.error('Error in sendOrderConfirmation route:', error);
    return NextResponse.json({
      message: 'Failed to send order confirmation email',
      error: error.message
    }, { status: 500 });
  }
}
