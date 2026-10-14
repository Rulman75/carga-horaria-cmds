const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUpdate() {
   // Let's grab the first docente with an observation
   const doc = await prisma.docenteEstablecimiento.findFirst({
      where: { observacionCarga: { not: null } }
   });
   console.log("Before:", doc);
   
   // Now let's do exactly what the action does!
   const observacionCarga = ""; // empty string!
   
   await prisma.docenteEstablecimiento.update({
      where: { docenteId_establecimientoId: { docenteId: doc.docenteId, establecimientoId: doc.establecimientoId } },
      data: { observacionCarga: observacionCarga || null }
   });
   
   const docAfter = await prisma.docenteEstablecimiento.findFirst({
      where: { docenteId: doc.docenteId, establecimientoId: doc.establecimientoId }
   });
   console.log("After:", docAfter);
   
   // Revert
   await prisma.docenteEstablecimiento.update({
      where: { docenteId_establecimientoId: { docenteId: doc.docenteId, establecimientoId: doc.establecimientoId } },
      data: { observacionCarga: doc.observacionCarga }
   });
}

testUpdate().catch(console.error).finally(() => prisma.$disconnect());
