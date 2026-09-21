const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');

const prisma = new PrismaClient();

async function main() {
  const encFile = 'C:/Users/rhormazabal/.gemini/antigravity/scratch/carga-horaria-cmds/Tablas/PLAN_ESTUDIO_ENC.xlsx';
  const detFile = 'C:/Users/rhormazabal/.gemini/antigravity/scratch/carga-horaria-cmds/Tablas/PLAN_ESTUDIO_DET.xlsx';

  const planIdsToImport = [815, 577, 87, 83];

  console.log('Leyendo ENC...');
  const encWorkbook = XLSX.readFile(encFile);
  const encData = XLSX.utils.sheet_to_json(encWorkbook.Sheets[encWorkbook.SheetNames[0]]);

  console.log('Leyendo DET...');
  const detWorkbook = XLSX.readFile(detFile);
  const detData = XLSX.utils.sheet_to_json(detWorkbook.Sheets[detWorkbook.SheetNames[0]]);

  for (const planId of planIdsToImport) {
    const encRow = encData.find((row) => row.cod_plan === planId);
    if (!encRow) {
      console.log('Plan ' + planId + ' no encontrado en ENC, omitiendo.');
      continue;
    }

    console.log('Upserting plan ' + planId + ' - ' + encRow.Nomble_plan);
    await prisma.planEstudioEnc.upsert({
      where: { codPlan: planId },
      update: {
        nombrePlan: encRow.Nomble_plan?.toString(),
        estadoPlan: encRow.Estado_Plan?.toString(),
        tipo: encRow.Tipo?.toString()
      },
      create: {
        codPlan: planId,
        nombrePlan: encRow.Nomble_plan?.toString(),
        estadoPlan: encRow.Estado_Plan?.toString(),
        tipo: encRow.Tipo?.toString()
      }
    });

    const detRows = detData.filter((row) => row.Cod_Plan === planId);
    console.log('Encontrados ' + detRows.length + ' detalles para el plan ' + planId);

    await prisma.planEstudioDet.deleteMany({
      where: { codPlan: planId }
    });

    let inserted = 0;
    for (const d of detRows) {
      const codAsignaturaStr = d['Cod. Asignatura']?.toString();
      const asigExists = await prisma.asignatura.findUnique({ where: { asigCod: codAsignaturaStr } });
      if (!asigExists) {
        console.warn('  -> Asignatura ' + codAsignaturaStr + ' no existe, omitiendo.');
        continue;
      }

      const tienCod = Number(d['Tipos de Enseñanza']);
      const tienExists = await prisma.tipoEnsenanza.findUnique({ where: { tienCod } });
      if (!tienExists) {
        console.warn('  -> TipoEnsenanza ' + tienCod + ' no existe, omitiendo.');
        continue;
      }

      const grteCod = Number(d['Grados']);
      const gradoExists = await prisma.grado.findUnique({
        where: {
          tienCod_grteCod: { tienCod, grteCod }
        }
      });
      if (!gradoExists) {
         console.warn('  -> Grado tienCod:' + tienCod + ' grteCod:' + grteCod + ' no existe, omitiendo.');
         continue;
      }

      await prisma.planEstudioDet.create({
        data: {
          codPlan: planId,
          tienCod: tienCod,
          grteCod: grteCod,
          codAsignatura: codAsignaturaStr,
          horasCJ: Number(d.Horas_CJ) || 0,
          horasSJ: Number(d.Horas_SJ) || 0,
          obligatoria: d.Obligatoria?.toString(),
          formacion: d.Formacion?.toString()
        }
      });
      inserted++;
    }
    console.log('Insertados ' + inserted + ' detalles para el plan ' + planId);
  }

  console.log('Terminado.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
