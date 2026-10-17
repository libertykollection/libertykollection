const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const map = {
  187: '/products/serum.jpg',
  188: '/products/cream.jpg',
  189: '/products/cleanser.jpg',
  190: '/products/lipstick.jpg',
  191: '/products/foundation.jpg',
  192: '/products/eyeshadow.jpg',
  193: '/products/bodyoil.jpg',
  194: '/products/scrub.jpg',
  195: '/products/perfume.jpg'
};

async function main() {
  for (const [idStr, url] of Object.entries(map)) {
    const productId = parseInt(idStr, 10);
    await prisma.image.deleteMany({ where: { productId } });
    await prisma.image.create({
      data: { productId, url }
    });
    console.log('Updated product', productId, '->', url);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
