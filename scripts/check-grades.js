const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const grados = await prisma.establecimientoGrado.findMany({ 
    where: { establecimientoId: 47, tienCod: 299 },
    include: { grado: true }
  });
  console.log('Grados 299 en CEIA:', grados.map(g => `${g.grteCod} - ${g.grado?.grteDescripcion}`));
}
main();
