const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

code = code.replace(
  /if \(!asigMap.has\(d\.codAsignatura\) && d\.asignatura\) \{/,
  "const rowKey = d.codAsignatura + '-' + (d.especialidad || 'NONE');\n          if (!asigMap.has(rowKey) && d.asignatura) {"
);

code = code.replace(
  /asigMap\.set\(d\.codAsignatura, \{/,
  "asigMap.set(rowKey, {"
);

code = code.replace(
  /_esPropio: d\.esPropio/,
  "_esPropio: d.esPropio,\n              _especialidad: d.especialidad"
);

code = code.replace(
  /matrizDatos\.set\(`\$\{d\.codAsignatura\}-\$\{d\.grteCod\}`,\s*d\);/,
  "matrizDatos.set(`${d.codAsignatura}-${d.especialidad || 'NONE'}-${d.grteCod}`, d);"
);

// We need to also patch the rendering of the cell and row keys!
code = code.replace(
  /const rowKey = fila\.asigCod;/,
  "const rowKey = fila.asigCod + '-' + (fila._especialidad || 'NONE');"
);

code = code.replace(
  /<tr key=\{fila\.asigCod\}/g,
  "<tr key={rowKey}"
);

code = code.replace(
  /<span className=\"truncate pr-2\">\{fila\.asigDescripcion\}<\/span>/g,
  `<span className="truncate pr-2">{fila.asigDescripcion} {fila._especialidad && <span className="ml-2 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold tracking-widest uppercase">{fila._especialidad}</span>}</span>`
);

code = code.replace(
  /const detalle = matriz\.matrizDatos\.get\(`\$\{fila\.asigCod\}-\$\{c\.grteCod\}`\);/g,
  "const detalle = matriz.matrizDatos.get(`${fila.asigCod}-${fila._especialidad || 'NONE'}-${c.grteCod}`);"
);

code = code.replace(
  /handleEliminarFila\(fila\.asigCod, matriz\.tipo\.tienCod\)/g,
  "handleEliminarFila(fila.asigCod, matriz.tipo.tienCod, fila._especialidad)"
);

fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
