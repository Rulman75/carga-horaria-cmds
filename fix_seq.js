const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixSeq() {
  const tables = [
    'Usuario', 'Establecimiento', 'TipoEnsenanza', 'Grado', 'Asignatura',
    'Docente', 'PlanEstudioEnc', 'PlanEstudioDet', 'PlanEstablecimiento',
    'PlanEstablecimientoDet', 'ActividadNoLectiva', 'CargaHoraria', 'TablaConversion'
  ];
  
  for (const t of tables) {
    try {
      await prisma.$executeRawUnsafe(`SELECT setval('"${t}_id_seq"', COALESCE((SELECT MAX(id)+1 FROM "${t}"), 1), false);`);
      console.log('Fixed sequence for', t);
    } catch(e) {
      console.log('No sequence for', t);
    }
  }
}
fixSeq().then(() => process.exit(0));
