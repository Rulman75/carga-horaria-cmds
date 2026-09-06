const fs = require('fs');

function updateFile(path, oldStr, newStr) {
  let c = fs.readFileSync(path, 'utf8');
  c = c.replace(oldStr, newStr);
  fs.writeFileSync(path, c);
}

// 1. Config page
let c1 = fs.readFileSync('src/app/establecimiento/config/page.tsx', 'utf8');
c1 = c1.replace('const establecimientoId = 2;', 'const [establecimientoId, setEstablecimientoId] = useState<number | null>(null);');
c1 = c1.replace('const config = await getEstablecimientoConfig(establecimientoId);', `
      const estId = Number(localStorage.getItem('selectedEstablecimientoId')) || 2;
      setEstablecimientoId(estId);
      const config = await getEstablecimientoConfig(estId);
`);
c1 = c1.replace('if (!guardando) {', 'if (!guardando && establecimientoId) {');
fs.writeFileSync('src/app/establecimiento/config/page.tsx', c1);


// 2. Planes page
let c2 = fs.readFileSync('src/app/establecimiento/planes/page.tsx', 'utf8');
c2 = c2.replace('const establecimientoId = 2;', 'const [establecimientoId, setEstablecimientoId] = useState<number | null>(null);');
c2 = c2.replace('const planes = await getPlanesPropios(establecimientoId);', `
      const estId = Number(localStorage.getItem('selectedEstablecimientoId')) || 2;
      setEstablecimientoId(estId);
      const planes = await getPlanesPropios(estId);
`);
c2 = c2.replace('await clonarPlanEstudioBase(planBaseSeleccionado, establecimientoId);', 'if (establecimientoId) await clonarPlanEstudioBase(planBaseSeleccionado, establecimientoId);');
fs.writeFileSync('src/app/establecimiento/planes/page.tsx', c2);


// 3. Asignacion page
let c3 = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');
c3 = c3.replace('const ESTABLECIMIENTO_ID = 2; // Hardcoded multi-tenant', 'const [ESTABLECIMIENTO_ID, setEstablecimientoId] = useState<number | null>(null);');
c3 = c3.replace(`  useEffect(() => {
    getDocentesEstablecimiento(ESTABLECIMIENTO_ID).then(setDocentes);
    getGradosEstablecimiento(ESTABLECIMIENTO_ID).then(setGrados);
    loadTodasCargas();
  }, []);`, `  useEffect(() => {
    const estId = Number(localStorage.getItem('selectedEstablecimientoId')) || 2;
    setEstablecimientoId(estId);
    getDocentesEstablecimiento(estId).then(setDocentes);
    getGradosEstablecimiento(estId).then(setGrados);
    getCargasEstablecimiento(estId).then(setTodasCargas);
  }, []);`);
c3 = c3.replace(`  const loadTodasCargas = () => {
    getCargasEstablecimiento(ESTABLECIMIENTO_ID).then(setTodasCargas);
  };`, `  const loadTodasCargas = () => {
    if (ESTABLECIMIENTO_ID) getCargasEstablecimiento(ESTABLECIMIENTO_ID).then(setTodasCargas);
  };`);
// In useEffect [gradoSeleccionado]
c3 = c3.replace(`      getAsignaturasPropiasPorGrado(ESTABLECIMIENTO_ID, Number(tienCod), Number(grteCod)).then(setDetallesPlan);`, `      if (ESTABLECIMIENTO_ID) getAsignaturasPropiasPorGrado(ESTABLECIMIENTO_ID, Number(tienCod), Number(grteCod)).then(setDetallesPlan);`);
fs.writeFileSync('src/app/carga/asignacion/page.tsx', c3);


// 4. Matriz page
let c4 = fs.readFileSync('src/app/carga/matriz/page.tsx', 'utf8');
c4 = c4.replace('const ESTABLECIMIENTO_ID = 2; // Hardcoded multi-tenant', '');
c4 = c4.replace(`  useEffect(() => {
    async function loadData() {
      const [docs, grads, car] = await Promise.all([
        getDocentesEstablecimiento(ESTABLECIMIENTO_ID),
        getGradosEstablecimiento(ESTABLECIMIENTO_ID),
        getCargasEstablecimiento(ESTABLECIMIENTO_ID)
      ]);`, `  useEffect(() => {
    async function loadData() {
      const estId = Number(localStorage.getItem('selectedEstablecimientoId')) || 2;
      const [docs, grads, car] = await Promise.all([
        getDocentesEstablecimiento(estId),
        getGradosEstablecimiento(estId),
        getCargasEstablecimiento(estId)
      ]);`);
fs.writeFileSync('src/app/carga/matriz/page.tsx', c4);
