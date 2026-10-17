const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@store2u.ca';
  const password = 'admin123';
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      console.log('User with this email already exists.');
    } else {
      const user = await prisma.user.create({
        data: {
          email: email,
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN',
          emailVerified: true, // Auto-verify admin
        },
      });
      console.log('Admin user created successfully:', user);
    }
  } catch (e) {
    console.error('Error creating admin user:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
