import { NextResponse } from 'next/server';
import prisma from '../../util/prisma';
import { sendOrderConfirmation } from '../../util/sendOrderConfirmation';

export async function POST(request) {
    try {
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
            paymentId = null
        } = data;

        if (!items || items.length === 0 || !total || !netTotal) {
            return NextResponse.json({ message: 'Invalid order data', status: false }, { status: 400 });
        }

        const finalPaymentInfo = paymentInfo || (paymentId ? { id: paymentId } : null);
        const parsedUserId = (userId && !isNaN(parseInt(userId))) ? parseInt(userId) : null;

        console.log('Received order data:', { ...data, userId: parsedUserId, finalPaymentInfo });

        const stockUpdates = {};

        // 1. Validate Stock & Prepare Updates
        for (const item of items) {
            const productId = parseInt(item.productId);

            if (isNaN(productId)) {
                console.error('Invalid productId for item:', item);
                throw new Error(`Invalid product ID: ${item.productId}. Please ensure cart items have valid product IDs.`);
            }

            const product = await prisma.product.findUnique({
                where: { id: productId },
            });

            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found.`);
            }

            // Skip stock check for digital
            if (product.productType !== 'digital') {
                if (product.stock < (Number(item.quantity) || 1)) {
                    throw new Error(`Insufficient stock for product: ${product.name}`);
                }

                // Add to stockUpdates only if tangible
                const quantity = Number(item.quantity) || 1;
                if (stockUpdates[productId]) {
                    stockUpdates[productId] += quantity;
                } else {
                    stockUpdates[productId] = quantity;
                }
            }
        }

        // 2. Create Order with OrderItems
        const order = await prisma.order.create({
            data: {
                userId: parsedUserId,
                total: Number(total) || 0,
                discount: Number(discount) || 0,
                tax: Number(tax) || 0,
                deliveryCharge: Number(deliveryCharge) || 0,
                extraDeliveryCharge: Number(extraDeliveryCharge) || 0,
                netTotal: Number(netTotal) || 0,
                status: (paymentMethod === 'Cash on Delivery' || paymentMethod === 'COD') ? 'PENDING' : 'PAID',
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
                paymentInfo: finalPaymentInfo ? JSON.stringify(finalPaymentInfo) : null,
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

        // 3. Deduct Stock (Tangible Only)
        await Promise.all(
            Object.entries(stockUpdates).map(([productId, totalQuantity]) =>
                prisma.product.update({
                    where: { id: parseInt(productId) },
                    data: {
                        stock: {
                            decrement: totalQuantity,
                        },
                    },
                })
            )
        );

        // 4. Send Confirmation Email
        if (shippingAddress.email && shippingAddress.email !== 'N/A') {
            try {
                await sendOrderConfirmation(
                    shippingAddress.email,
                    order.id,
                    order
                );
            } catch (emailErr) {
                console.warn('Suppressing email error to save order:', emailErr);
            }
        }

        return NextResponse.json(
            { message: 'Order placed successfully', data: order, status: true },
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

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                orderItems: {
                    include: {
                        product: {
                            include: {
                                images: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Manually fetch users to avoid schema relation missing error (500)
        const userIds = Array.from(new Set(orders.map(o => o.userId).filter(id => id !== null)));
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } }
        });

        const ordersWithUsers = orders.map(order => ({
            ...order,
            user: users.find(u => u.id === order.userId) || null
        }));

        return NextResponse.json(ordersWithUsers, { status: 200 });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ message: 'Failed to fetch orders', error: error.message }, { status: 500 });
    }
}
