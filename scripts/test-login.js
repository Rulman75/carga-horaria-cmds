const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testLogin() {
  const user = await prisma.usuario.findUnique({ where: { email: 'admin@cmds.cl' } });
  if (!user) return console.log('Admin not found');
  console.log('Admin Hash:', user.password);
  
  const isValid = await bcrypt.compare('admin', user.password);
  const isValid2 = await bcrypt.compare('Cmds2027', user.password);
  console.log('Matches admin? ', isValid);
  console.log('Matches Cmds2027? ', isValid2);
}
testLogin().finally(() => prisma.$disconnect());
