const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.$queryRaw`SELECT data_type FROM information_schema.columns WHERE table_name = 'PlanEstablecimientoDet' AND column_name = 'horas';`;
  console.log('Postgres Type:', result);
}
main();
