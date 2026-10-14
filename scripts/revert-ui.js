const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

const regexUI = /<div className="flex justify-between text-xs mb-1">\s*<span className="font-medium text-\[#F59E0B\]">No Lectivas \(Max Prop: \{maxNoLectivasStr\}\)<\/span>\s*<span className=\{\`font-bold \$\{horasNoLectivasAsignadas > maxNoLectivasDecimal \? 'text-red-500' : 'text-\[#64748b\]'\}\`\}>\{formatCronoDecimal\(horasNoLectivasAsignadas\)\} \/ \{formatCronoDecimal\(maxNoLectivasDecimal\)\}<\/span>\s*<\/div>\s*<div className="w-full bg-gray-100 rounded-full h-1\.5 overflow-hidden">\s*<div className=\{\`h-1\.5 rounded-full transition-all duration-500 \$\{horasNoLectivasAsignadas > maxNoLectivasDecimal \? 'bg-red-500' : 'bg-\[#F59E0B\]'\}\`\} style=\{\{ width: \`\$\{Math\.min\(100, pctNoLectivas\)\}\%\` \}\}>\s*<\/div>\s*<\/div>/m;

const replUI = `<div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-[#F59E0B]">No Lectivas (Max Contrato: {maxNoLectivasStr})</span>
                    <span className={\`font-bold \${horasNoLectivasAsignadas > maxNoLectivasDecimal ? 'text-red-500' : 'text-[#64748b]'}\`}>{formatCronoDecimal(horasNoLectivasAsignadas)} / {formatCronoDecimal(maxNoLectivasDecimal)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className={\`h-1.5 rounded-full transition-all duration-500 \${horasNoLectivasAsignadas > maxNoLectivasDecimal ? 'bg-red-500' : 'bg-[#F59E0B]'}\`} style={{ width: \`\${Math.min(100, pctNoLectivas)}%\` }}></div>
                  </div>
                  <div className="mt-1 flex justify-between text-[10px]">
                    <span className="text-gray-500 italic">Max. proporcional (referencia):</span>
                    <span className={\`font-bold \${horasNoLectivasAsignadas > maxNoLectivasPropDecimal ? 'text-red-500' : 'text-gray-500'}\`}>{maxNoLectivasPropStr} {horasNoLectivasAsignadas > maxNoLectivasPropDecimal && '(Excedido)'}</span>
                  </div>`;

code = code.replace(regexUI, replUI);
fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
