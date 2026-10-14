const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

const oldStr = `<div className="mt-1 flex justify-between text-[10px]">
                    <span className="text-gray-500 italic">Max. proporcional (referencia):</span>
                    <span className={\`font-bold \${horasNoLectivasAsignadas > maxNoLectivasPropDecimal ? 'text-red-500' : 'text-gray-500'}\`}>{maxNoLectivasPropStr} {horasNoLectivasAsignadas > maxNoLectivasPropDecimal && '(Excedido)'}</span>
                  </div>`;

const newStr = `<div className="mt-1.5 flex justify-between text-xs">
                    <span className="text-gray-600 font-semibold">Máx. proporcional (referencia):</span>
                    <span className={\`font-bold \${horasNoLectivasAsignadas > maxNoLectivasPropDecimal ? 'text-red-500' : 'text-[#64748b]'}\`}>{maxNoLectivasPropStr ? maxNoLectivasPropStr.replace(':', ' H ') + ' MIN' : '0 H 00 MIN'} {horasNoLectivasAsignadas > maxNoLectivasPropDecimal && '(Excedido)'}</span>
                  </div>`;

code = code.replace(oldStr, newStr);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
