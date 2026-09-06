const fs = require('fs');

let c = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

// 1. Add helper function
const helperFunc = `  // Helper para asignaturas que siempre son especialistas (incluso en 1°-4°)
  const isEspecialistaAsig = (nombre: string) => {
    if (!nombre) return false;
    const n = nombre.toUpperCase();
    return n.includes('RELIGIÓN') || 
           n.includes('RELIGION') || 
           n.includes('EDUCACIÓN FÍSICA') || 
           n.includes('EDUCACION FISICA') || 
           n.includes('INGLÉS') || 
           n.includes('INGLES');
  };\n\n`;
c = c.replace('const [editingId, setEditingId] = useState<number | null>(null);', 
              'const [editingId, setEditingId] = useState<number | null>(null);\n\n' + helperFunc);

// 2. Fix row 'Total Horas' (column header first)
c = c.replace('Total Hrs Esp. (5°+)', 'Total Hrs Esp.');
c = c.replace('Docentes Esp. (5°+)', 'Docentes Esp.');

// 3. Fix row 'Total Horas' (data cell)
c = c.replace('if (cellData && col.grteCod > 40) sumaFila += (cellData.horas * (col.cantidadCursos || 0));',
              'if (cellData && (col.grteCod > 40 || isEspecialistaAsig(fila.asigDescripcion))) sumaFila += (cellData.horas * (col.cantidadCursos || 0));');

// 4. Fix row 'Docentes Esp' (data cell)
c = c.replace('if (col.grteCod > 40) {',
              'if (col.grteCod > 40 || isEspecialistaAsig(fila.asigDescripcion)) {');

// 5. Fix generalist footer vertical sum
const oldGenSum = `                              matriz.filas.forEach((f: any) => {
                                const cData = matriz.matrizDatos.get(\`\${f.asigCod}-\${col.grteCod}\`);
                                if (cData) sumaColumna += cData.horas;
                              });`;
const newGenSum = `                              matriz.filas.forEach((f: any) => {
                                // NO sumar asignaturas especialistas en el total de horas del generalista
                                if (!isEspecialistaAsig(f.asigDescripcion)) {
                                  const cData = matriz.matrizDatos.get(\`\${f.asigCod}-\${col.grteCod}\`);
                                  if (cData) sumaColumna += cData.horas;
                                }
                              });`;
c = c.replace(oldGenSum, newGenSum);

// 6. Fix specialist footer calculation
const oldEspFooter = `                        matriz.filas.forEach((fila: any) => {
                          let sumaFilaEsp = 0;
                          matriz.columnas.forEach((col: any) => {
                            if (col.grteCod > 40) {
                              const cd = matriz.matrizDatos.get(\`\${fila.asigCod}-\${col.grteCod}\`);
                              if (cd) sumaFilaEsp += (cd.horas * (col.cantidadCursos || 0));
                            }
                          });
                          totalEsp += sumaFilaEsp / 28.6;
                        });`;
const newEspFooter = `                        matriz.filas.forEach((fila: any) => {
                          let sumaFilaEsp = 0;
                          matriz.columnas.forEach((col: any) => {
                            if (col.grteCod > 40 || isEspecialistaAsig(fila.asigDescripcion)) {
                              const cd = matriz.matrizDatos.get(\`\${fila.asigCod}-\${col.grteCod}\`);
                              if (cd) sumaFilaEsp += (cd.horas * (col.cantidadCursos || 0));
                            }
                          });
                          totalEsp += sumaFilaEsp / 28.6;
                        });`;
c = c.replace(oldEspFooter, newEspFooter);

// 7. Fix grand total tarjeton calculation
const oldGrandTotal = `                // Especialistas: sumar docentes por fila (solo grados 5°+)
                m.filas.forEach((fila: any) => {
                  let sumaFilaEsp = 0;
                  m.columnas.forEach((col: any) => {
                    if (col.grteCod > 40) {
                      const cd = m.matrizDatos.get(\`\${fila.asigCod}-\${col.grteCod}\`);
                      if (cd) sumaFilaEsp += (cd.horas * (col.cantidadCursos || 0));
                    }
                  });
                  totalEspecialistas += sumaFilaEsp / 28.6;
                });`;
const newGrandTotal = `                // Especialistas: sumar docentes por fila (grados 5°+ o asignaturas siempre especialistas)
                m.filas.forEach((fila: any) => {
                  let sumaFilaEsp = 0;
                  m.columnas.forEach((col: any) => {
                    if (col.grteCod > 40 || isEspecialistaAsig(fila.asigDescripcion)) {
                      const cd = m.matrizDatos.get(\`\${fila.asigCod}-\${col.grteCod}\`);
                      if (cd) sumaFilaEsp += (cd.horas * (col.cantidadCursos || 0));
                    }
                  });
                  totalEspecialistas += sumaFilaEsp / 28.6;
                });`;
c = c.replace(oldGrandTotal, newGrandTotal);


fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', c);
