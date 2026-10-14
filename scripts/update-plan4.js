const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Reading Excel file...');
    const workbook = xlsx.readFile('C:/Users/rhormazabal/.gemini/antigravity/scratch/carga-horaria-cmds/Tablas/PLAN_ESTUDIO_DET_OPCION4.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`Found ${data.length} rows in Excel.`);

    console.log('Deleting existing PlanEstudioDet for codPlan = 4...');
    await prisma.planEstudioDet.deleteMany({
      where: { codPlan: 4 }
    });

    console.log('Inserting new PlanEstudioDet records...');
    const newRecords = data.map(row => ({
      codPlan: 4,
      tienCod: Number(row['Tipos de Enseñanza']),
      grteCod: Number(row['Grados']),
      codAsignatura: String(row['Cod. Asignatura']),
      horasCJ: row['Horas_CJ'] ? parseFloat(row['Horas_CJ']) : 0,
      horasSJ: row['Horas_SJ'] ? parseFloat(row['Horas_SJ']) : 0,
      obligatoria: row['Obligatoria'] ? String(row['Obligatoria']) : 'NO',
      formacion: row['Formacion'] ? String(row['Formacion']) : 'General'
    }));

    await prisma.planEstudioDet.createMany({
      data: newRecords
    });
    console.log('Successfully inserted new template records.');

    console.log('Finding schools that use codPlanBase = 4...');
    const planes = await prisma.planEstablecimiento.findMany({
      where: { codPlanBase: 4 },
      include: {
        establecimiento: true
      }
    });

    console.log(`Found ${planes.length} school plans to update.`);

    for (const plan of planes) {
      console.log(`Updating school plan ID ${plan.id} (Establecimiento ${plan.establecimientoId})...`);
      
      const estabGrados = await prisma.establecimientoGrado.findMany({
        where: { establecimientoId: plan.establecimientoId }
      });
      const isJecMap = new Map();
      for (const g of estabGrados) {
        isJecMap.set(`${g.tienCod}-${g.grteCod}`, g.esJec);
      }

      const existingDetalles = await prisma.planEstablecimientoDet.findMany({
        where: { planEstablecimientoId: plan.id }
      });

      for (const row of newRecords) {
        const tienCod = row.tienCod;
        const grteCod = row.grteCod;
        const codAsignatura = String(row.codAsignatura);

        const key = `${tienCod}-${grteCod}`;
        const esJec = isJecMap.has(key) ? isJecMap.get(key) : (plan.establecimiento.esJec || false);
        const horasFinales = esJec ? row.horasCJ : row.horasSJ;

        const existing = existingDetalles.find(d => 
          d.tienCod === tienCod && 
          d.grteCod === grteCod && 
          d.codAsignatura === codAsignatura &&
          d.esPropio === false
        );

        if (existing) {
          // Update
          await prisma.planEstablecimientoDet.update({
            where: { id: existing.id },
            data: {
              horas: horasFinales,
              obligatoria: row.obligatoria,
              formacion: row.formacion
            }
          });
        } else {
          // Check if the school is allowed to have this tipoEnseñanza
          // Wait, if it's not allowed, we shouldn't insert it.
          // Let's check if the school has ANY grade for this tienCod.
          const hasTien = estabGrados.some(g => g.tienCod === tienCod);
          if (hasTien) {
            await prisma.planEstablecimientoDet.create({
              data: {
                planEstablecimientoId: plan.id,
                tienCod: tienCod,
                grteCod: grteCod,
                codAsignatura: codAsignatura,
                horas: horasFinales,
                obligatoria: row.obligatoria,
                formacion: row.formacion,
                esPropio: false,
                categoria: "BASE"
              }
            });
          }
        }
      }
    }

    console.log('Update completed successfully!');
  } catch (err) {
    console.error('Error during update:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
