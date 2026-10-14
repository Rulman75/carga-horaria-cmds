const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

const t = `text-sm">{det.asignatura?.asigDescripcion}</p>`;
const r = `text-sm">{det.asignatura?.asigDescripcion} {det.especialidad && <span className="ml-2 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold tracking-widest uppercase">{det.especialidad}</span>}</p>`;
code = code.replace(t, r);

code = code.replace(
  /c\.asignaturaCod === det\.codAsignatura\s*\)\);/g,
  `c.asignaturaCod === det.codAsignatura &&
                                (c.especialidad || null) === (det.especialidad || null)
                              ));`
);

code = code.replace(
  /c\.codAsignatura === det\.codAsignatura\s*\)\.reduce/g,
  `c.codAsignatura === det.codAsignatura &&
                                (c.especialidad || null) === (det.especialidad || null)
                              ).reduce`
);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
