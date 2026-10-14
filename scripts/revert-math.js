const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

const regexMath = /const maxLectivasPedagogicas = conversionData \? conversionData\.lectivasPedagogicas \: Math\.floor\(baseAsignable \* 0\.65 \* 1\.3333\);[\s\S]*?const minPlanificacionDecimal = maxNoLectivasDecimal \* 0\.4;/m;
const replMath = `const maxLectivasPedagogicas = conversionData ? conversionData.lectivasPedagogicas : Math.floor(baseAsignable * 0.65 * 1.3333);
  const maxNoLectivasDecimal = conversionData ? parseCronoToDecimal(conversionData.noLectivasCronologicas) : (baseAsignable * 0.35);
  const maxNoLectivasStr = conversionData ? conversionData.noLectivasCronologicas : \`\${Math.floor(baseAsignable*0.35)}:00\`;

  const currentConversionData = tablaConversion.find((t: any) => t.lectivasPedagogicas === Math.round(horasLectivasAsignadas));
  const recreoDecimal = currentConversionData ? parseCronoToDecimal(currentConversionData.recreoCronologicas) : 0;
  
  const maxNoLectivasPropDecimal = currentConversionData ? parseCronoToDecimal(currentConversionData.noLectivasCronologicas) : 0;
  const maxNoLectivasPropStr = currentConversionData ? currentConversionData.noLectivasCronologicas : '0:00';
  
  const pctLectivas = Math.min(100, (horasLectivasAsignadas / (maxLectivasPedagogicas || 1)) * 100) || 0;
  const pctNoLectivas = Math.min(100, (horasNoLectivasAsignadas / (maxNoLectivasDecimal || 1)) * 100) || 0;

  // Planificacin rule
  const minPlanificacionDecimal = maxNoLectivasDecimal * 0.4;`;

code = code.replace(regexMath, replMath);
fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
