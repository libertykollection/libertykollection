const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({ include: { subcategories: true } });
  console.log('CATEGORIES:', JSON.stringify(cats.map(c => ({ id: c.id, name: c.name, slug: c.slug, subs: c.subcategories.map(s => s.slug) })), null, 2));
  
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true } });
  console.log('USERS:', users);
  
  const products = await prisma.product.findMany({ select: { id: true, name: true, price: true, subcategorySlug: true } });
  console.log('PRODUCTS COUNT:', products.length, products.map(p => ({ id: p.id, name: p.name })));
  
  const sliders = await prisma.slider.findMany();
  console.log('SLIDERS:', sliders);
  
  const orders = await prisma.order.findMany();
  console.log('ORDERS COUNT:', orders.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
