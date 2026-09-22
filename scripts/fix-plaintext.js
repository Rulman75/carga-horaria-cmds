const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function fix() {
  const users = await prisma.usuario.findMany();
  for (const u of users) {
    if (!u.password.startsWith('$2a$') && !u.password.startsWith('$2b$')) {
      console.log(`Fixing plaintext password for ${u.email}: ${u.password}`);
      const hash = await bcrypt.hash(u.password, 10);
      await prisma.usuario.update({
        where: { id: u.id },
        data: { password: hash }
      });
    }
  }
}
fix().finally(() => prisma.$disconnect());
