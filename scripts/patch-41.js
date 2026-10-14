const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

const search = `"<td class='center'>" + (todasAsignaturas.find(a => a.asigCod === c.codAsignatura)?.asigDescripcion || c.nombre) + "</td>" +`;
const replace = `"<td class='center'>" + (todasAsignaturas.find(a => a.asigCod === c.codAsignatura)?.asigDescripcion || c.nombre) + (c.especialidad ? \` (\${c.especialidad})\` : "") + "</td>" +`;

code = code.replace(search, replace);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
