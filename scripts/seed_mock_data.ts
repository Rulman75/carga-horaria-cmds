import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create an ADMIN user
  await prisma.usuario.upsert({
    where: { email: 'admin@cmds.cl' },
    update: {},
    create: {
      email: 'admin@cmds.cl',
      nombre: 'Administrador CMDS',
      password: 'admin',
      rol: 'ADMIN',
    },
  });

  // Create an ESTABLECIMIENTO user for A-16 (esedSec = 2)
  await prisma.usuario.upsert({
    where: { email: 'a16@cmds.cl' },
    update: { establecimientoId: 2, rol: 'ESTABLECIMIENTO' },
    create: {
      email: 'a16@cmds.cl',
      nombre: 'Director A-16',
      password: 'admin',
      rol: 'ESTABLECIMIENTO',
      establecimientoId: 2,
    },
  });

  // Set A-16 as JEC = true
  await prisma.establecimiento.update({
    where: { esedSec: 2 },
    data: { esJec: true }
  });

  // Create some "EstablecimientoGrado" (Dotación de Cursos) for A-16
  // We will just add some dummy courses for grade 10 (1st grade basic) and 20 (2nd grade)
  // assuming tienCod = 110 (Basica), grteCod = 10 and 20 exist.
  const grados = await prisma.grado.findMany({ take: 3 });
  
  for (const grado of grados) {
    await prisma.establecimientoGrado.upsert({
      where: {
        establecimientoId_tienCod_grteCod: {
          establecimientoId: 2,
          tienCod: grado.tienCod,
          grteCod: grado.grteCod
        }
      },
      update: { cantidadCursos: 3 },
      create: {
        establecimientoId: 2,
        tienCod: grado.tienCod,
        grteCod: grado.grteCod,
        cantidadCursos: 3
      }
    });
  }

  console.log("Mock users and A-16 config seeded!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
