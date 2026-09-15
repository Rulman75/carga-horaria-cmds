import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando actualización de categorías...");

  const detalles = await prisma.planEstablecimientoDet.findMany({
    include: {
      asignatura: true
    }
  });

  let countDecreto = 0;
  let countTaller = 0;
  let countAdicional = 0;

  for (const det of detalles) {
    if (!det.esPropio) {
      // Viene de decreto
      if (det.categoria !== 'BASE') {
        await prisma.planEstablecimientoDet.update({
          where: { id: det.id },
          data: { categoria: 'BASE' }
        });
      }
      countDecreto++;
    } else {
      // Es propio
      if (det.asignatura.asigDescripcion.toUpperCase().includes('TALLER')) {
        await prisma.planEstablecimientoDet.update({
          where: { id: det.id },
          data: { categoria: 'JEC' }
        });
        countTaller++;
      } else {
        await prisma.planEstablecimientoDet.update({
          where: { id: det.id },
          data: { categoria: 'BASE' }
        });
        countAdicional++;
      }
    }
  }

  console.log(`Finalizado. Resultados:`);
  console.log(`- Decreto (Plan Base): ${countDecreto}`);
  console.log(`- JEC (Taller): ${countTaller}`);
  console.log(`- Adicional/Electiva: ${countAdicional}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
