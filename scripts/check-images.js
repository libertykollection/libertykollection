const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: { images: true }
  });
  for (const p of products) {
    console.log(`ID: ${p.id} | Name: ${p.name}`);
    console.log(`  Images (${p.images.length}):`, p.images.map(i => ({ id: i.id, url: i.url })));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
