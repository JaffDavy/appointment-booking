import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('george1000', 10);

  const provider = await prisma.user.upsert({
    where: { email: 'kevin@gmail.com' },
    update: {},
    create: {
      email: 'kevin@gmail.com',
      name: 'Dr. Kevin',
      password_hash: hashedPassword,
      role: 'provider',
    },
  });

  console.log({ seededProvider: provider });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());