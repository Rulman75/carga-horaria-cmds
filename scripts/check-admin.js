const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function check() {
  const admin = await prisma.usuario.findUnique({ where: { email: 'admin@cmds.cl' } });
  if (admin) {
    const isCmds2027 = await bcrypt.compare('Cmds2027', admin.password);
    console.log('Admin password is Cmds2027:', isCmds2027);
  }
}
check().finally(() => prisma.$disconnect());
