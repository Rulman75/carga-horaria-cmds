const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

code = code.replace(
  /\`\$\{d\.tienCod\}-\$\{d\.grteCod\}-\$\{d\.codAsignatura\}\`/,
  "`${d.tienCod}-${d.grteCod}-${d.codAsignatura}-${d.especialidad || 'NONE'}`"
);

// We should also show the especialidad in the Especialista row header!
// Let's find: `const gInfo = grados.find...` -> then scroll down to the render of the grade name
const headerTarget = `<span className="font-bold text-[#1e293b]">{gInfo.grado?.grteDescrip}</span>`;
const headerRep = `<span className="font-bold text-[#1e293b]">{gInfo.grado?.grteDescrip} {det.especialidad && <span className="ml-2 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold tracking-widest uppercase">{det.especialidad}</span>}</span>`;
code = code.replace(headerTarget, headerRep);

// And we need to fix the filter when counting consumed hours for this block:
const filterTarget = `c.planEstablecimientoId === det.planEstablecimientoId &&
                                c.tienCod === det.tienCod &&
                                c.grteCod === det.grteCod &&
                                c.asignaturaCod === det.codAsignatura`;

const filterRep = `c.planEstablecimientoId === det.planEstablecimientoId &&
                                c.tienCod === det.tienCod &&
                                c.grteCod === det.grteCod &&
                                c.asignaturaCod === det.codAsignatura &&
                                (c.especialidad || null) === (det.especialidad || null)`;
code = code.replace(new RegExp(filterTarget.replace(/[.*+?^$|{}()[\\]\\\\]/g, '\\$&'), 'g'), filterRep);

// And also when creating a CargaHoraria, we need to pass `especialidad`!!
// We need to look for handleAsignarLectiva call in especialist and generalist views!

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
