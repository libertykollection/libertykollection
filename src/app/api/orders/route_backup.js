import { NextResponse } from 'next/server';
import prisma from '../../util/prisma';
import jwt from 'jsonwebtoken';
// import { sendOrderConfirmation } from '../../util/sendOrderConfirmation';
// import { sendOrderConfirmation } from '@/app/util/sendOrderConfirmation';


const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

export async function GET() {
  try {
    // Fetch orders along with order items and products
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: {
                  take: 1 // Take only the first image
                }
              }
            }
          },
        },
      },
    });

    // Fetch user information for each order
    const ordersWithUserDetails = await Promise.all(
      orders.map(async (order) => {
        let user = null;
        if (order.userId) { // Only fetch user if userId is present
          user = await prisma.user.findUnique({
            where: { id: order.userId },
            select: { id: true, name: true },
          });
        }
        return {
          ...order,
          user: user || null, // Set user to null if not found
        };
      })
    );

    return NextResponse.json(ordersWithUserDetails);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Parse the request body only once
    const data = await request.json();
    const {
      userId,
      shippingAddress,
      paymentMethod,
      items,
      total,
      discount = 0,
      tax,
      netTotal,
      deliveryCharge,
      extraDeliveryCharge,
      couponCode = null,
      paymentInfo = null,
      paymentId = null // Handle either paymentInfo or paymentId
    } = data;

    if (!items || items.length === 0 || !total || !netTotal) {
      return NextResponse.json({ message: 'Invalid order data', status: false }, { status: 400 });
    }

    const finalPaymentInfo = paymentInfo || (paymentId ? { id: paymentId } : null);
    const parsedUserId = (userId && !isNaN(parseInt(userId))) ? parseInt(userId) : null;

    console.log('Received order data:', { ...data, userId: parsedUserId, finalPaymentInfo });

    // Start a transaction to ensure stock validation and order creation happen atomically
    const createdOrder = await prisma.$transaction(async (tx) => {
      // 1. Validate Stock
      for (const item of items) {
        const productId = parseInt(item.productId);
        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found.`);
        }

        if (product.stock < (item.quantity || 1)) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }
      }

      const order = await tx.order.create({
        data: {
          userId: parsedUserId,
          total: Number(total) || 0,
          discount: Number(discount) || 0,
          tax: Number(tax) || 0,
          deliveryCharge: Number(deliveryCharge) || 0,
          extraDeliveryCharge: Number(extraDeliveryCharge) || 0,
          netTotal: Number(netTotal) || 0,
          status: 'PENDING',
          stockDeducted: true,
          recipientName: shippingAddress.recipientName || 'N/A',
          streetAddress: shippingAddress.streetAddress || '',
          apartmentSuite: shippingAddress.apartmentSuite || null,
          city: shippingAddress.city || 'N/A',
          state: shippingAddress.state || 'N/A',
          zip: shippingAddress.zip || 'N/A',
          country: shippingAddress.country || 'Pakistan',
          phoneNumber: shippingAddress.phoneNumber || 'N/A',
          email: shippingAddress.email || 'N/A',
          paymentMethod: paymentMethod || 'Unknown',
          paymentInfo: finalPaymentInfo,
          couponCode,
          orderItems: {
            create: items.map(item => ({
              productId: parseInt(item.productId),
              quantity: Number(item.quantity) || 1,
              price: Number(item.price) || 0,
              selectedColor: item.selectedColor || null,
              selectedSize: item.selectedSize || null,
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      // 3. Deduct Stock - Aggregate quantities by productId to avoid duplicate updates
      const stockUpdates = {};
      for (const item of items) {
        const productId = parseInt(item.productId);
        const quantity = Number(item.quantity) || 1;

        if (stockUpdates[productId]) {
          stockUpdates[productId] += quantity;
        } else {
          stockUpdates[productId] = quantity;
        }
      }

      // Perform stock deduction for each unique product in parallel
      await Promise.all(
        Object.entries(stockUpdates).map(([productId, totalQuantity]) =>
          tx.product.update({
            where: { id: parseInt(productId) },
            data: {
              stock: {
                decrement: totalQuantity,
              },
            },
          })
        )
      );

      return order;
    });

    return NextResponse.json(
      { message: 'Order placed successfully', data: createdOrder, status: true },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json({
      message: 'Failed to place order',
      error: error.message,
      status: false
    }, { status: 500 });
  }
}


// export async function POST(request) {
//   try {
//     const data = await request.json();
//     const {
//       userId,
//       shippingAddress,
//       paymentMethod,
//       items,
//       total,
//       discount = 0,
//       tax,
//       netTotal,
//       deliveryCharge, // Add delivery charge
//       extraDeliveryCharge, // Add extra delivery charge
//       couponCode = null
//     } = data;

//     const paymentInfo = paymentMethod === 'Credit Card' ? data.paymentInfo : null;

//     if (!items || items.length === 0 || !total || !netTotal) {
//       return NextResponse.json({ message: 'Invalid order data', status: false }, { status: 400 });
//     }

//     // Create the order
//     const createdOrder = await prisma.order.create({
//       data: {
//         userId: userId || null,
//         total,
//         discount,
//         tax,
//         deliveryCharge, // Save delivery charge
//         extraDeliveryCharge, // Save extra delivery charge
//         netTotal,
//         status: 'PENDING',
//         recipientName: shippingAddress.recipientName,
//         streetAddress: shippingAddress.streetAddress,
//         apartmentSuite: shippingAddress.apartmentSuite || null,
//         city: shippingAddress.city,
//         state: shippingAddress.state,
//         zip: shippingAddress.zip,
//         country: shippingAddress.country,
//         phoneNumber: shippingAddress.phoneNumber,
//         email: shippingAddress.email,
//         paymentMethod,
//         paymentInfo: paymentMethod === 'Credit Card' ? JSON.stringify(paymentInfo) : null,
//         couponCode,
//         orderItems: {
//           create: items.map(item => ({
//             productId: item.productId,
//             quantity: item.quantity || 1,
//             price: item.price,
//             selectedColor: item.selectedColor || null,
//             selectedSize: item.selectedSize || null,
//           })),
//         },
//       },
//       include: {
//         orderItems: {
//           include: {
//             product: true,
//           },
//         },
//       },
//     });

//     return NextResponse.json({ message: 'Order placed successfully', data: createdOrder, status: true }, { status: 200 });

//   } catch (error) {
//     console.error('Error placing order:', error);
//     return NextResponse.json({ message: 'Failed to place order', error: error.message, status: false }, { status: 500 });
//   }
// }





// Uncomment and update the PUT and DELETE methods as needed

// export async function PUT(request) {
//   try {
//     const { id, total, status, orderItems, shippingAddress, paymentMethod, paymentInfo } = await request.json();

//     const updatedOrder = await prisma.order.update({
//       where: {
//         id: parseInt(id),
//       },
//       data: {
//         status,
//         paymentMethod,
//         paymentInfo: paymentMethod === 'Credit Card' ? JSON.stringify(paymentInfo) : null,
//         updatedAt: new Date(),
//       },
//     });

//     return NextResponse.json(updatedOrder);
//   } catch (error) {
//     console.error('Error updating order:', error);
//     return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
//   }
// }

// export async function DELETE(request) {
//   try {
//     const { id } = await request.json();
//     const deletedOrder = await prisma.order.delete({
//       where: {
//         id: parseInt(id),
//       },
//     });

//     return NextResponse.json(deletedOrder);
//   } catch (error) {
//     console.error('Error deleting order:', error);
//     return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
//   }
// }
