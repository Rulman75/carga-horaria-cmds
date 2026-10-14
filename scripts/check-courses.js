const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const cursos = await prisma.establecimientoCursoLetra.findMany({ 
    where: { establecimientoId: 47 }
  });
  console.log('All Cursos en CEIA:', cursos.map(c => `${c.tienCod} | ${c.grteCod} | ${c.letra}`));
}
main();
