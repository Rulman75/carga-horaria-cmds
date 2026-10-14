const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

const regex = /const otherH = todasCargas[\s\S]*?\.reduce\(\(sum, c\) => sum \+ c\.horasAllocadas, 0\);/g;

const replacement = `const otherCargas = todasCargas
          .filter(c => c.docenteId.toString() !== docenteSeleccionado && c.tienCod === det.tienCod && c.grteCod === det.grteCod && c.asignaturaCod === det.codAsignatura && c.letraCurso === l && ((c.esDesdoble ? (c.grupoDesdoble||'GRUPO').toUpperCase().trim() : 'DEFAULT') === groupKey));
      const otherH = otherCargas.reduce((sum, c) => sum + c.horasAllocadas, 0);
      
      const nombresDocentes = otherCargas.map(c => {
         const d = docentes.find(doc => doc.id === c.docenteId);
         return d ? \`\${d.nombres} \${d.apellidos}\` : 'Otro Docente';
      });
      const docentesAsignadosUnicos = Array.from(new Set(nombresDocentes));`;

code = code.replace(regex, replacement);

const tooltipRegex = /title=\{assignedToMe \? "Ya asignado a este docente" : letterIsFull \? "Letra sin horas disponibles" : "Asignar"\}/g;

const tooltipReplacement = `title={assignedToMe ? "Ya asignado a este docente" : letterIsFull ? \`Letra sin horas disponibles (Asignado a: \${docentesAsignadosUnicos.join(', ')})\` : (docentesAsignadosUnicos.length > 0 ? \`Asignar (Horas parciales en: \${docentesAsignadosUnicos.join(', ')})\` : "Asignar")}`;

code = code.replace(tooltipRegex, tooltipReplacement);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
