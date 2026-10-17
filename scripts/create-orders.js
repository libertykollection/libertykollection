const { PrismaClient, OrderStatus } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' } });
  const products = await prisma.product.findMany();
  
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  
  const paymentMethods = ['Cash on Delivery (COD)', 'Online Debit / Credit Card', 'JazzCash Instant', 'EasyPaisa Mobile Account'];
  const statuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.COMPLETED, OrderStatus.PAID];
  
  for (let i = 0; i < 15; i++) {
    const cust = users[i % users.length];
    const p1 = products[i % products.length];
    const p2 = products[(i + 7) % products.length];
    
    const q1 = (i % 2) + 1;
    const q2 = (i % 3 === 0) ? 1 : 0;
    
    let subtotal = p1.price * q1;
    let items = [{ productId: p1.id, quantity: q1, price: p1.price, selectedSize: '50 ml', selectedColor: 'Pure Gold' }];
    
    if (q2 > 0) {
      subtotal += p2.price * q2;
      items.push({ productId: p2.id, quantity: q2, price: p2.price, selectedSize: 'Full Size 15g', selectedColor: 'Nude Velvet' });
    }
    
    const discount = i % 3 === 0 ? Math.round(subtotal * 0.1) : 0;
    const delivery = subtotal > 5000 ? 0 : 250;
    const netTotal = subtotal - discount + delivery;
    
    const date = new Date();
    date.setDate(date.getDate() - (15 - i));
    
    await prisma.order.create({
      data: {
        userId: cust?.id || null,
        recipientName: cust?.name || 'Customer ' + (i + 1),
        email: cust?.email || 'customer' + i + '@example.com',
        phoneNumber: cust?.phoneno || '+92 300 1234567',
        streetAddress: cust?.city ? 'House #' + (12 + i) + ', Main Boulevard, ' + cust.city : 'Lahore, Pakistan',
        city: cust?.city || 'Lahore',
        state: 'Punjab',
        zip: '54000',
        country: 'Pakistan',
        paymentMethod: paymentMethods[i % paymentMethods.length],
        status: statuses[i % statuses.length],
        total: subtotal,
        discount: discount,
        deliveryCharge: delivery,
        netTotal: netTotal,
        createdAt: date,
        updatedAt: date,
        orderItems: { create: items }
      }
    });
  }
  console.log('✓ Successfully created 15 realistic orders linking to 52 products');
}

main().catch(console.error).finally(() => prisma.$disconnect());
