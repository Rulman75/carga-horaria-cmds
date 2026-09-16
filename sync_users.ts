import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando creación/actualización de usuarios...");

  const establecimientos = await prisma.establecimiento.findMany();
  
  let creados = 0;
  let actualizados = 0;

  for (const est of establecimientos) {
    if (!est.esedDescCorta) continue;

    const email = `${est.esedDescCorta.toLowerCase()}@cmds-educacion.cl`;

    // Check if user already exists for this establecimiento
    const existingUser = await prisma.usuario.findFirst({
      where: { establecimientoId: est.esedSec }
    });

    if (existingUser) {
      await prisma.usuario.update({
        where: { id: existingUser.id },
        data: { email: email }
      });
      actualizados++;
    } else {
      // Check if email is somehow taken by someone else
      const existingEmail = await prisma.usuario.findUnique({
        where: { email }
      });
      if (!existingEmail) {
        await prisma.usuario.create({
          data: {
            email: email,
            nombre: `Director ${est.esedDescCorta}`,
            password: 'Cmds2027', // Default password
            rol: 'ESTABLECIMIENTO',
            establecimientoId: est.esedSec
          }
        });
        creados++;
      }
    }
  }

  console.log(`Finalizado. Creados: ${creados}, Actualizados (email): ${actualizados}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
