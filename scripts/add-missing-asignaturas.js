const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMissingAsignaturas() {
  await prisma.asignatura.upsert({
    where: { asigCod: '27-HF1' },
    update: {},
    create: {
      asigCod: '27-HF1',
      asigDescripcion: 'HABILIDADES FUNCIONALES'
    }
  });
  await prisma.asignatura.upsert({
    where: { asigCod: '27-HL1' },
    update: {},
    create: {
      asigCod: '27-HL1',
      asigDescripcion: 'HABILIDADES LINGÜÍSTICAS'
    }
  });
  await prisma.asignatura.upsert({
    where: { asigCod: '27-HS1' },
    update: {},
    create: {
      asigCod: '27-HS1',
      asigDescripcion: 'HABILIDADES SOCIALES'
    }
  });
  console.log('Asignaturas agregadas.');
}

addMissingAsignaturas().then(() => prisma.$disconnect());
