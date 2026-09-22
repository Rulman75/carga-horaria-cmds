const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetAdmin() {
  const hash = await bcrypt.hash('Cmds2027', 10);
  await prisma.usuario.update({
    where: { email: 'admin@cmds.cl' },
    data: { password: hash, debeCambiarPassword: true }
  });
  console.log('Admin password updated to Cmds2027');
}
resetAdmin().finally(() => prisma.$disconnect());
