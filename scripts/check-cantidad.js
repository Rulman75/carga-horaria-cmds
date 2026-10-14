const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const grados = await prisma.establecimientoGrado.findMany({ 
    where: { establecimientoId: 47, cantidadCursos: { gt: 0 } }
  });
  console.log('Grados con cantidadCursos > 0:', grados.map(g => `${g.tienCod} | ${g.grteCod} | Cursos: ${g.cantidadCursos}`));
}
main();
