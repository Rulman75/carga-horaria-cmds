const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');

const prisma = new PrismaClient();

async function main() {
  console.log('Leyendo archivo DOCENTES.xls...');
  const wb = xlsx.readFile('../carga-horaria-cmds/Tablas/DOCENTES.xls');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(ws, { header: 1 });

  const rows = data.slice(1).filter(r => r[0]);

  console.log('Leídas ' + rows.length + ' filas.');

  const docentesMap = new Map();

  for (const r of rows) {
    const rutNum = r[0];
    const dv = r[1];
    const nombres = r[2] || '';
    const apePat = r[3] || '';
    const apeMat = r[4] || '';
    const esedSec = r[6];

    if (!docentesMap.has(rutNum)) {
      docentesMap.set(rutNum, {
        rut: rutNum + '-' + dv,
        nombres: nombres.trim(),
        apellidos: (apePat + ' ' + apeMat).trim(),
        establecimientos: new Set()
      });
    }

    if (esedSec) {
      docentesMap.get(rutNum).establecimientos.add(Number(esedSec));
    }
  }

  console.log('Encontrados ' + docentesMap.size + ' docentes únicos.');

  console.log('Limpiando tablas...');
  await prisma.cargaHoraria.deleteMany();
  await prisma.docenteEstablecimiento.deleteMany();
  await prisma.docente.deleteMany();

  console.log('Insertando docentes...');
  
  const validEsts = await prisma.establecimiento.findMany({select:{esedSec:true}});
  const validEstIds = new Set(validEsts.map(e => e.esedSec));

  let count = 0;
  for (const docente of docentesMap.values()) {
    const validDocenteEsts = Array.from(docente.establecimientos).filter(id => validEstIds.has(id));
    
    await prisma.docente.create({
      data: {
        rut: docente.rut,
        nombres: docente.nombres,
        apellidos: docente.apellidos,
        horasTitular: 44,
        establecimientos: {
          create: validDocenteEsts.map(estId => ({
            establecimientoId: estId
          }))
        }
      }
    });
    count++;
    if (count % 500 === 0) {
      console.log('Insertados ' + count + ' docentes...');
    }
  }

  console.log('Proceso completado. ' + count + ' docentes insertados.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
