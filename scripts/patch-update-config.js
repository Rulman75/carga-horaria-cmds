const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

code = code.replace(
  /export async function updateEstablecimientoConfig\(establecimientoId: number, esJec: boolean, gradosData: \{tienCod: number, grteCod: number, cantidadCursos: number, esJec: boolean\}\[\], tiposData: number\[\]\) \{/,
  `export async function updateEstablecimientoConfig(establecimientoId: number, esJec: boolean, gradosData: {tienCod: number, grteCod: number, cantidadCursos: number, esJec: boolean}[], tiposData: number[], letrasData: any[] = []) {`
);

const syncLetras = `
  // Sync letras
  if (letrasData && letrasData.length > 0) {
    await prisma.establecimientoCursoLetra.deleteMany({
      where: { establecimientoId }
    });
    await prisma.establecimientoCursoLetra.createMany({
      data: letrasData.map(l => ({
        establecimientoId,
        tienCod: l.tienCod,
        grteCod: l.grteCod,
        letra: l.letra,
        esJec: l.esJec,
        planEstablecimientoId: l.planEstablecimientoId || null
      }))
    });
  }
`;

// Insert before the last closing brace of updateEstablecimientoConfig
// Actually, it's safer to just inject it after the Promise.all(tiposData...)
code = code.replace(
  /prisma\.establecimientoTipoEnsenanza\.createMany\(\{[\s\S]*?\}\);\s*\}\s*\}/,
  `prisma.establecimientoTipoEnsenanza.createMany({
      data: tiposData.map(t => ({
        establecimientoId,
        tienCod: t
      }))
    });
  }
  ${syncLetras}
}`
);

fs.writeFileSync('src/app/actions.ts', code);
