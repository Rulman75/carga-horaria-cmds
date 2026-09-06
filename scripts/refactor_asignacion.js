const fs = require('fs');

let c = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

c = c.replace('import { getDocentes, getGrados, getAsignaturasPorGrado }', 'import { getDocentes, getGrados, getAsignaturasPropiasPorGrado }');

c = c.replace(
`  useEffect(() => {
    if (gradoSeleccionado) {
      const [tienCod, grteCod] = gradoSeleccionado.split('-');
      getAsignaturasPorGrado(Number(tienCod), Number(grteCod)).then(setDetallesPlan);
    } else {
      setDetallesPlan([]);
    }
  }, [gradoSeleccionado]);`,
`  useEffect(() => {
    if (gradoSeleccionado) {
      const establecimientoId = 2; // Hardcoded multi-tenant
      const [tienCod, grteCod] = gradoSeleccionado.split('-');
      getAsignaturasPropiasPorGrado(establecimientoId, Number(tienCod), Number(grteCod)).then(setDetallesPlan);
    } else {
      setDetallesPlan([]);
    }
  }, [gradoSeleccionado]);`
);

c = c.replace(
`  const handleAsignar = (det: any) => {
    // Definir si es lectiva
    // En el nuevo modelo: det.formacion puede ser 'General', 'Ambito Libre Disposicion', etc.
    const esLectiva = ['General', 'Ambito Libre Disposicion'].includes(det.formacion) || det.obligatoria === 'SI';
    
    setCargas([...cargas, {
      id: Math.random().toString(),
      codAsignatura: det.codAsignatura,
      nombre: det.asignatura?.asigDescripcion || 'Desconocida',
      horas: (det.horasCJ || 0) + (det.horasSJ || 0), // Sumar ambas por ahora o separarlas
      tipoCarga: esLectiva ? 'LECTIVA' : 'NO_LECTIVA'
    }]);
  };`,
`  const handleAsignar = (det: any) => {
    const esLectiva = ['General', 'Ambito Libre Disposicion'].includes(det.formacion) || det.obligatoria === 'SI';
    
    setCargas([...cargas, {
      id: Math.random().toString(),
      codAsignatura: det.codAsignatura,
      nombre: det.asignatura?.asigDescripcion || 'Desconocida',
      horas: det.horas || 0, 
      tipoCarga: esLectiva ? 'LECTIVA' : 'NO_LECTIVA'
    }]);
  };`
);

c = c.replace(
`                      <p className="text-xs text-[#64748b]">CJ: {det.horasCJ} Hrs | SJ: {det.horasSJ} Hrs • {det.formacion} (Obligatoria: {det.obligatoria})</p>`,
`                      <p className="text-xs text-[#64748b]">{det.horas} Hrs • {det.formacion} (Obligatoria: {det.obligatoria}) {det.esPropio && <span className="text-amber-500 font-bold ml-1">★ Propia</span>}</p>`
);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', c);
