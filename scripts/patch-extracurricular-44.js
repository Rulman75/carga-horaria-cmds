const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

const replacement = `onChange={e => {
  const val = e.target.value;
  setExtSeleccionada(val);
  const extInfo = actividadesExt.find(a => a.id.toString() === val);
  if (extInfo) {
    const desc = extInfo.descripcion.toLowerCase().trim();
    const roles44 = ['director', 'jefe utp', 'curriculista', 'evaluador', 'orientador', 'convivencia escolar', 'inspector general', 'coordinador tp', 'producción', 'produccion', 'informática', 'informatica'];
    if (roles44.some(r => desc.includes(r))) {
      setHorasManual(44);
    } else {
      setHorasManual(1);
    }
  }
}}`;

code = code.replace(/onChange=\{e => setExtSeleccionada\(e\.target\.value\)\}/, replacement);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
