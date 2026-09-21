const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function run() {
  console.log('Migrando contraseñas a bcrypt...');
  const users = await prisma.usuario.findMany();
  for (const u of users) {
    if (!u.password.startsWith('$2a$') && !u.password.startsWith('$2b$')) {
      console.log(`Hasheando contraseña para: ${u.email}`);
      const hash = await bcrypt.hash(u.password, 10);
      await prisma.usuario.update({
        where: { id: u.id },
        data: { password: hash }
      });
    } else {
      console.log(`Contraseña de ${u.email} ya está hasheada.`);
    }
  }
  console.log('Migración completada.');
}

run().catch(console.error).finally(() => prisma.$disconnect());
