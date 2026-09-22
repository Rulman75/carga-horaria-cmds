const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

// 1. Add state
code = code.replace(
  /const \[finanSeleccionado, setFinanSeleccionado\] = useState\('Normal'\);/,
  `const [finanSeleccionado, setFinanSeleccionado] = useState('Normal');
  const [esDesdobleUI, setEsDesdobleUI] = useState(false);
  const [grupoDesdobleUI, setGrupoDesdobleUI] = useState('');`
);

// 2. Patch handleAsignarLectiva
code = code.replace(
  /letraCurso:\s*letra,/,
  `letraCurso: letra,
        esDesdoble: esDesdobleUI,
        grupoDesdoble: esDesdobleUI ? (grupoDesdobleUI || 'Grupo') : undefined,`
);

// 3. Patch name formatting to include desdoble
code = code.replace(
  /nombre:\s*det\.asignatura\?\.asigDescripcion \+ \(letra \? \` \(\$\{letra\}\)\` : ''\) \+ \(finanSeleccionado !== 'Normal' \? \` \[\$\{finanSeleccionado\}\]\` : ''\),/,
  `nombre: det.asignatura?.asigDescripcion + (letra ? \` (\${letra})\` : '') + (esDesdobleUI ? \` [\${grupoDesdobleUI || 'Grupo'}]\` : '') + (finanSeleccionado !== 'Normal' ? \` [\${finanSeleccionado}]\` : ''),`
);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
