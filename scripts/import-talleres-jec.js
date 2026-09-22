const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const prisma = new PrismaClient();

const parseBoolean = (val) => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    return val.toUpperCase().trim() === 'TRUE';
  }
  return false;
};

async function main() {
  const filePath = 'C:/Users/rhormazabal/.gemini/antigravity/scratch/carga-horaria-cmds/Tablas/TALLERES_JEC_CMDS_EDUCA.xlsx';
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  console.log(`Leídas ${data.length} filas del archivo Excel.`);

  let inserted = 0;
  let skipped = 0;

  for (const row of data) {
    if (!row['ASIG_COD']) continue;

    const asigCod = row['ASIG_COD'].toString().trim();
    const asigDescripcion = row['ASIG_DESCRIPCION'] ? row['ASIG_DESCRIPCION'].toString().trim() : '';
    const esEspecialistaSiempre = parseBoolean(row['esEspecialistaSiempre']);
    const esTallerJec = parseBoolean(row['esTallerJec']);
    const asigTipo = row['AsigTipo'] ? row['AsigTipo'].toString().trim() : null;

    try {
      await prisma.asignatura.upsert({
        where: { asigCod: asigCod },
        update: {
          asigDescripcion,
          esEspecialistaSiempre,
          esTallerJec,
          asigTipo
        },
        create: {
          asigCod,
          asigDescripcion,
          esEspecialistaSiempre,
          esTallerJec,
          asigTipo
        }
      });
      inserted++;
    } catch (err) {
      console.error(`Error procesando ${asigCod}:`, err.message);
    }
  }

  console.log(`Proceso completado. Registros actualizados/insertados: ${inserted}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
