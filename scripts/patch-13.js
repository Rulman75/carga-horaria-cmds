const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

// Fix handleEliminarFila
code = code.replace(
  /const handleEliminarFila = async \(asigCodStr: string, tienCod: number\) => \{/,
  "const handleEliminarFila = async (asigCodStr: string, tienCod: number, especialidad: string | null = null) => {"
);

code = code.replace(
  /const detallesABorrar = plan\.detalles\.filter\(\(d: any\) => d\.codAsignatura === asigCodStr && d\.tienCod === tienCod\);/,
  "const detallesABorrar = plan.detalles.filter((d: any) => d.codAsignatura === asigCodStr && d.tienCod === tienCod && (d.especialidad || null) === (especialidad || null));"
);

code = code.replace(
  /detalles: plan\.detalles\.filter\(\(d: any\) => !\(d\.codAsignatura === asigCodStr && d\.tienCod === tienCod\)\)/,
  "detalles: plan.detalles.filter((d: any) => !(d.codAsignatura === asigCodStr && d.tienCod === tienCod && (d.especialidad || null) === (especialidad || null)))"
);

// Fix the cell mapping!
code = code.replace(
  /const cellData = matriz\.matrizDatos\.get\(\`\$\{fila\.asigCod\}-\$\{col\.grteCod\}\`\);/g,
  "const cellData = matriz.matrizDatos.get(`${fila.asigCod}-${fila._especialidad || 'NONE'}-${col.grteCod}`);"
);

fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
