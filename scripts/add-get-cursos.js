const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

const getCursos = `
export async function getCursosLetra(establecimientoId: number) {
  return await prisma.establecimientoCursoLetra.findMany({
    where: { establecimientoId }
  });
}
`;

if (!code.includes('getCursosLetra')) {
  code = code + '\n' + getCursos;
}

fs.writeFileSync('src/app/actions.ts', code);
