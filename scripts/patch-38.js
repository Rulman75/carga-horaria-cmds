const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

// 1. Fix the dropdown
const t1 = `                             {Array.from(new Set(todosLosDetalles.map(d => d.codAsignatura)))
                               .map(cod => todasAsignaturas.find(a => a.asigCod === cod))
                               .filter(Boolean)
                               .sort((a, b) => a.asigDescripcion.localeCompare(b.asigDescripcion))
                               .map(a => (
                               <option key={a.asigCod} value={a.asigCod}>{a.asigDescripcion}</option>
                             ))}`;

const r1 = `                             {Array.from(new Map(todosLosDetalles.map(d => [\`\${d.codAsignatura}-\${d.especialidad || 'NONE'}\`, d])).values())
                               .map(d => {
                                 const a = todasAsignaturas.find(asig => asig.asigCod === d.codAsignatura);
                                 return a ? { ...a, _especialidad: d.especialidad } : null;
                               })
                               .filter(Boolean)
                               .sort((a, b) => a.asigDescripcion.localeCompare(b.asigDescripcion) || (a._especialidad || '').localeCompare(b._especialidad || ''))
                               .map(a => (
                               <option key={\`\${a.asigCod}-\${a._especialidad || 'NONE'}\`} value={\`\${a.asigCod}-\${a._especialidad || 'NONE'}\`}>
                                 {a.asigDescripcion} {a._especialidad ? \`(\${a._especialidad})\` : ''}
                               </option>
                             ))}`;

code = code.replace(t1, r1);

// 2. Fix the right panel filter for Especialista
const t2 = `                            {Array.from(new Map(todosLosDetalles.filter(d => d.codAsignatura === asignaturaSeleccionada).map(d => [\`\${d.tienCod}-\${d.grteCod}-\${d.codAsignatura}-\${d.especialidad || 'NONE'}\`, d])).values()).map((det: any) => {`;

const r2 = `                            {Array.from(new Map(todosLosDetalles.filter(d => \`\${d.codAsignatura}-\${d.especialidad || 'NONE'}\` === asignaturaSeleccionada).map(d => [\`\${d.tienCod}-\${d.grteCod}-\${d.codAsignatura}-\${d.especialidad || 'NONE'}\`, d])).values()).map((det: any) => {`;

code = code.replace(t2, r2);

// 3. Just to be safe, add the badge to the right panel row in Especialista as well
const t3 = `<p className="font-medium text-[#1e293b] text-sm">{gInfo.grteDescrip} ({gInfo.tipoEnsenanza?.tienDescripcion})</p>`;
const r3 = `<p className="font-medium text-[#1e293b] text-sm">{gInfo.grteDescrip} ({gInfo.tipoEnsenanza?.tienDescripcion}) {det.especialidad && <span className="ml-2 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold tracking-widest uppercase">{det.especialidad}</span>}</p>`;

code = code.replace(t3, r3);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
