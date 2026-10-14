const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

code = code.replace(/matriz\.matrizDatos\.get\(`\$\{f\.asigCod\}-\$\{col\.grteCod\}`\)/g, "matriz.matrizDatos.get(`${f.asigCod}-${f._especialidad || 'NONE'}-${col.grteCod}`)");
code = code.replace(/matriz\.matrizDatos\.get\(`\$\{fila\.asigCod\}-\$\{col\.grteCod\}`\)/g, "matriz.matrizDatos.get(`${fila.asigCod}-${fila._especialidad || 'NONE'}-${col.grteCod}`)");
code = code.replace(/m\.matrizDatos\.get\(`\$\{f\.asigCod\}-\$\{col\.grteCod\}`\)/g, "m.matrizDatos.get(`${f.asigCod}-${f._especialidad || 'NONE'}-${col.grteCod}`)");
code = code.replace(/m\.matrizDatos\.get\(`\$\{fila\.asigCod\}-\$\{col\.grteCod\}`\)/g, "m.matrizDatos.get(`${fila.asigCod}-${fila._especialidad || 'NONE'}-${col.grteCod}`)");

fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
