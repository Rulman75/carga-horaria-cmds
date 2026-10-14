const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

const regex = /\{letras\.map\(\(l: string\) => \{\s*const assignedToMe = cargasVivas\.some\(c => \s*c\.codAsignatura === det\.codAsignatura && \s*c\.tienCod === det\.tienCod && \s*c\.grteCod === det\.grteCod && \s*c\.letraCurso === l &&\s*\(\!esDesdobleUI \|\| c\.grupoDesdoble === \(grupoDesdobleUI \|\| 'Grupo'\)\)\s*\);\s*return \(\s*<button \s*key=\{l\}\s*onClick=\{\(\) => handleAsignarLectiva\(det, l\)\}\s*disabled=\{\!docenteSeleccionado \|\| \(\!esDesdobleUI && restantes < det\.horas\) \|\| assignedToMe\}\s*className=\{\`px-2 py-1 rounded text-xs font-bold transition-colors \$\{assignedToMe \? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-\[\#016098\] hover:text-white disabled:opacity-50 disabled:hover:bg-gray-100 disabled:hover:text-gray-700'\}\`\}\s*title=\{assignedToMe \? "Ya asignado a este docente" : "Asignar"\}\s*>\s*Asignar \{l\}\s*<\/button>\s*\);\s*\}\)\}/g;

const repl = `{letras.map((l: string) => {
    const assignedToMe = cargasVivas.some(c => 
      c.codAsignatura === det.codAsignatura && 
      c.tienCod === det.tienCod && 
      c.grteCod === det.grteCod && 
      c.letraCurso === l &&
      (!esDesdobleUI || c.grupoDesdoble === (grupoDesdobleUI || 'Grupo'))
    );
    
    const groupKey = esDesdobleUI ? (grupoDesdobleUI || 'Grupo').toUpperCase().trim() : 'DEFAULT';
    const myH = cargasVivas
        .filter(c => c.tienCod === det.tienCod && c.grteCod === det.grteCod && c.codAsignatura === det.codAsignatura && c.letraCurso === l && ((c.esDesdoble ? (c.grupoDesdoble||'GRUPO').toUpperCase().trim() : 'DEFAULT') === groupKey))
        .reduce((sum, c) => sum + c.horas, 0);
    const otherH = todasCargas
        .filter(c => c.docenteId.toString() !== docenteSeleccionado && c.tienCod === det.tienCod && c.grteCod === det.grteCod && c.asignaturaCod === det.codAsignatura && c.letraCurso === l && ((c.esDesdoble ? (c.grupoDesdoble||'GRUPO').toUpperCase().trim() : 'DEFAULT') === groupKey))
        .reduce((sum, c) => sum + c.horasAllocadas, 0);
    
    const letterIsFull = (myH + otherH) >= det.horas;

    return (
      <button 
        key={l}
        onClick={() => handleAsignarLectiva(det, l)}
        disabled={!docenteSeleccionado || (!esDesdobleUI && restantes < det.horas) || assignedToMe || letterIsFull}
        className={\`px-2 py-1 rounded text-xs font-bold transition-colors \${assignedToMe ? 'bg-green-100 text-green-700' : letterIsFull ? 'bg-red-50 text-red-500 cursor-not-allowed opacity-60' : 'bg-gray-100 text-gray-700 hover:bg-[#016098] hover:text-white disabled:opacity-50 disabled:hover:bg-gray-100 disabled:hover:text-gray-700'}\`}
        title={assignedToMe ? "Ya asignado a este docente" : letterIsFull ? "Letra sin horas disponibles" : "Asignar"}
      >
        Asignar {l}
      </button>
    );
  })}`;

code = code.replace(regex, repl);
fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
