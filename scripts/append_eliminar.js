import fs from 'fs';

const code = `
export async function eliminarPlanPropio(planId: number) {
  // Primero eliminar los detalles (si no hay cascade deletion configurado)
  await prisma.planEstablecimientoDet.deleteMany({
    where: { planEstablecimientoId: planId }
  });
  
  // Luego eliminar el plan
  await prisma.planEstablecimiento.delete({
    where: { id: planId }
  });
}
`;

fs.appendFileSync('src/app/actions.ts', code);
