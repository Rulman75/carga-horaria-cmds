const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

const regex = /\{todosLosDetalles\s*\.filter\(d => d\.codAsignatura === asignaturaSeleccionada\)\s*\.map\(det => \{\s*const gInfo = grados\.find/g;

const replacement = `{Array.from(new Map(todosLosDetalles.filter(d => d.codAsignatura === asignaturaSeleccionada).map(d => [\`\${d.tienCod}-\${d.grteCod}-\${d.codAsignatura}\`, d])).values()).map((det: any) => {
                            const gInfo = grados.find`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
