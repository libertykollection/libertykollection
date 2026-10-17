const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'theitxprts@gmail.com';
  const rawPass = '786ninja';
  const hash = await bcrypt.hash(rawPass, 10);
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const updated = await prisma.user.update({
      where: { email },
      data: {
        password: hash,
        role: 'ADMIN',
        emailVerified: true,
        name: 'TheITXprts Admin'
      }
    });
    console.log('✓ Successfully updated user to ADMIN:', updated.id, updated.email, updated.role);
  } else {
    const created = await prisma.user.create({
      data: {
        email,
        password: hash,
        role: 'ADMIN',
        name: 'TheITXprts Admin',
        emailVerified: true,
        city: 'Lahore',
        phoneno: '+923001234567'
      }
    });
    console.log('✓ Successfully created new ADMIN user:', created.id, created.email, created.role);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
