const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

const regex = /const maxLectivasPedagogicas = conversionData \? conversionData\.lectivasPedagogicas \: Math\.floor\(baseAsignable \* 0\.65 \* 1\.3333\);[\s\S]*?const minPlanificacionDecimal = maxNoLectivasDecimal \* 0\.4;/m;
const repl = `const maxLectivasPedagogicas = conversionData ? conversionData.lectivasPedagogicas : Math.floor(baseAsignable * 0.65 * 1.3333);
  const maxNoLectivasContrato = conversionData ? parseCronoToDecimal(conversionData.noLectivasCronologicas) : (baseAsignable * 0.35);

  const currentConversionData = tablaConversion.find((t: any) => t.lectivasPedagogicas === Math.round(horasLectivasAsignadas));
  const recreoDecimal = currentConversionData ? parseCronoToDecimal(currentConversionData.recreoCronologicas) : 0;
  
  const maxNoLectivasDecimal = currentConversionData ? parseCronoToDecimal(currentConversionData.noLectivasCronologicas) : 0;
  const maxNoLectivasStr = currentConversionData ? currentConversionData.noLectivasCronologicas : '0:00';
  
  const pctLectivas = Math.min(100, (horasLectivasAsignadas / (maxLectivasPedagogicas || 1)) * 100) || 0;
  const pctNoLectivas = maxNoLectivasDecimal > 0 ? Math.min(100, (horasNoLectivasAsignadas / maxNoLectivasDecimal) * 100) : (horasNoLectivasAsignadas > 0 ? 100 : 0);

  // Planificacin rule
  const minPlanificacionDecimal = maxNoLectivasDecimal * 0.4;`;

code = code.replace(regex, repl);
fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
