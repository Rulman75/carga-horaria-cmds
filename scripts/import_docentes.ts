import { PrismaClient } from '@prisma/client';
import * as xlsx from 'xlsx';

const prisma = new PrismaClient();

async function main() {
  console.log('Leyendo archivo DOCENTES.xls...');
  const wb = xlsx.readFile('../carga-horaria-cmds/Tablas/DOCENTES.xls');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(ws, { header: 1 }) as any[];

  // Skip header
  const rows = data.slice(1).filter(r => r[0]); // Ensure RUT exists

  console.log(`Leídas ${rows.length} filas.`);

  // Group by RUT
  const docentesMap = new Map<number, {
    rut: string;
    nombres: string;
    apellidos: string;
    establecimientos: Set<number>;
  }>();

  for (const r of rows) {
    const rutNum = r[0];
    const dv = r[1];
    const nombres = r[2] || '';
    const apePat = r[3] || '';
    const apeMat = r[4] || '';
    const esedSec = r[6];

    if (!docentesMap.has(rutNum)) {
      docentesMap.set(rutNum, {
        rut: `${rutNum}-${dv}`,
        nombres: nombres.trim(),
        apellidos: `${apePat} ${apeMat}`.trim(),
        establecimientos: new Set()
      });
    }

    if (esedSec) {
      docentesMap.get(rutNum)!.establecimientos.add(Number(esedSec));
    }
  }

  console.log(`Encontrados ${docentesMap.size} docentes únicos.`);

  console.log('Limpiando tablas...');
  await prisma.cargaHoraria.deleteMany();
  await prisma.docenteEstablecimiento.deleteMany();
  await prisma.docente.deleteMany();

  console.log('Insertando docentes...');
  
  // To avoid SQLite 'too many variables' error, we process in chunks, or sequentially
  let count = 0;
  for (const docente of docentesMap.values()) {
    await prisma.docente.create({
      data: {
        rut: docente.rut,
        nombres: docente.nombres,
        apellidos: docente.apellidos,
        horasTitular: 44, // Default para pruebas
        establecimientos: {
          create: Array.from(docente.establecimientos).map(estId => ({
            establecimientoId: estId
          }))
        }
      }
    });
    count++;
    if (count % 500 === 0) {
      console.log(`Insertados ${count} docentes...`);
    }
  }

  console.log(`Proceso completado. ${count} docentes insertados.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
