const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

const oldFunc = `const handleAsignarExtracurricular = () => {
    if (!extSeleccionada) return;
    const extInfo = actividadesExt.find(a => a.id.toString() === extSeleccionada);
    const planId = detallesPlan[0]?.planEstablecimientoId || todasCargas[0]?.planEstablecimientoId || 1; 

    setCargas([...cargas, {
      id: Math.random().toString(),
      planEstablecimientoId: planId,
      actividadExtracurricularId: Number(extSeleccionada),
      financiamiento: finanSeleccionado === 'Normal' ? undefined : finanSeleccionado,
      nombre: extInfo?.descripcion + (finanSeleccionado !== 'Normal' ? \` (\${finanSeleccionado})\` : ''),
      horas: horasManual,
      tipoCarga: 'EXTRACURRICULAR'
    }]);
    setHorasManual(1);
    setExtSeleccionada('');
  };`;

const newFunc = `const handleAsignarExtracurricular = () => {
    if (!extSeleccionada) return;
    const extId = Number(extSeleccionada);
    const extInfo = actividadesExt.find(a => a.id === extId);
    
    if (extInfo?.topeMaximo) {
      const horasOtrosDocentes = todasCargas
          .filter(c => c.actividadExtracurricularId === extId && c.docenteId && c.docenteId.toString() !== docenteSeleccionado)
          .reduce((sum, c) => sum + c.horasAllocadas, 0);
          
      const horasEsteDocente = cargasVivas
          .filter(c => c.actividadExtracurricularId === extId)
          .reduce((sum, c) => sum + c.horas, 0);
          
      const consumidas = horasOtrosDocentes + horasEsteDocente;
      
      if (consumidas + horasManual > extInfo.topeMaximo) {
          alert(\`Límite excedido. La actividad "\${extInfo.descripcion}" tiene un tope de \${extInfo.topeMaximo} hrs globales por colegio.\\n\\nYa se han asignado \${consumidas} hrs (incluyendo a otros docentes).\`);
          return;
      }
    }

    const planId = detallesPlan[0]?.planEstablecimientoId || todasCargas[0]?.planEstablecimientoId || 1; 

    setCargas([...cargas, {
      id: Math.random().toString(),
      planEstablecimientoId: planId,
      actividadExtracurricularId: extId,
      financiamiento: finanSeleccionado === 'Normal' ? undefined : finanSeleccionado,
      nombre: extInfo?.descripcion + (finanSeleccionado !== 'Normal' ? \` (\${finanSeleccionado})\` : ''),
      horas: horasManual,
      tipoCarga: 'EXTRACURRICULAR'
    }]);
    setHorasManual(1);
    setExtSeleccionada('');
  };`;

// Because of spacing/indentation, doing a straight replace might fail. Let's use regex block replacement.
const regex = /const handleAsignarExtracurricular = \(\) => \{[\s\S]*?tipoCarga: 'EXTRACURRICULAR'\s*\}\]\);\s*setHorasManual\(1\);\s*setExtSeleccionada\(''\);\s*\};/;

code = code.replace(regex, newFunc);
fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
