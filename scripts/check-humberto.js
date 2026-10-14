const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const est = await prisma.establecimiento.findFirst({
    where: { esedDescripcion: { contains: 'HUMBERTO GONZALEZ' } },
    include: {
      grados: true,
      cursosLetra: true
    }
  });
  
  if (!est) {
    console.log('Not found');
    return;
  }
  
  console.log('Establecimiento:', est.esedDescripcion);
  
  const parvulos = est.grados.filter(g => g.tienCod === 10);
  console.log('Grados Parvularia:');
  for (const g of parvulos) {
      const l = est.cursosLetra.filter(x => x.tienCod === g.tienCod && x.grteCod === g.grteCod);
      console.log(`- tienCod: ${g.tienCod}, grteCod: ${g.grteCod}, cantidadCursos: ${g.cantidadCursos}, letras: ${l.map(x=>x.letra).join(', ')}`);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
