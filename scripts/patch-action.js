const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

const regex = /export async function actualizarHorasDetallePropio\(detalleId: number, horas: number\) \{\s*return await prisma\.planEstablecimientoDet\.update\(\{\s*where: \{ id: detalleId \},\s*data: \{ horas \}\s*\}\);\s*\}/;
const replacement = `export async function actualizarHorasDetallePropio(detalleId: number, horas: number, grupos?: number | null) {
  return await prisma.planEstablecimientoDet.update({
    where: { id: detalleId },
    data: { horas, grupos: grupos !== undefined ? grupos : undefined }
  });
}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/app/actions.ts', code);
console.log('Action updated');
