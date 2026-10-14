const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');
code += `

export async function updateEspecialidadAsignaturaPropia(
  planPropioId: number,
  codAsignatura: string,
  oldEspecialidad: string | null,
  newEspecialidad: string | null
) {
  await prisma.planEstablecimientoDet.updateMany({
    where: {
      planEstablecimientoId: planPropioId,
      codAsignatura,
      especialidad: oldEspecialidad
    },
    data: {
      especialidad: newEspecialidad
    }
  });
}
`;
fs.writeFileSync('src/app/actions.ts', code);
