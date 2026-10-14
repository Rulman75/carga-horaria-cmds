const fs = require('fs');

let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

// Replace the first sumaFilaEsp block
code = code.replace(
    /if \(cd\) sumaFilaEsp \+= \(cd\.horas \* \(col\.cantidadCursos \|\| 0\)\);/g,
    'if (cd) sumaFilaEsp += (cd.horas * (cd.grupos ?? col.cantidadCursos ?? 0));'
);

// Replace the granTotalReales calculation
const oldGranTotal = `                  let sumaCol = 0;
                  m.filas.forEach((f: any) => {
                    const cData = m.matrizDatos.get(\`\${f.asigCod}-\${f._especialidad || 'NONE'}-\${col.grteCod}\`);
                    if (cData) sumaCol += cData.horas;
                  });
                  granTotalReales += sumaCol * (col.cantidadCursos || 0);`;

const newGranTotal = `                  let sumaColReal = 0;
                  m.filas.forEach((f: any) => {
                    const cData = m.matrizDatos.get(\`\${f.asigCod}-\${f._especialidad || 'NONE'}-\${col.grteCod}\`);
                    if (cData) sumaColReal += (cData.horas * (cData.grupos ?? col.cantidadCursos ?? 0));
                  });
                  granTotalReales += sumaColReal;`;

code = code.replace(oldGranTotal, newGranTotal);

fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
console.log('Fixed page.tsx calculations.');
