import fs from 'fs';

let c = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

// 1. Calculate Teachers per Row
const rowTotalTarget = `<td className="border-b border-l-2 border-l-[#016098] border-[#e2e8f0] text-center align-middle bg-sky-50 font-bold text-[#016098]">
                            {sumaFila}
                          </td>`;

const rowTotalReplacement = `<td className="border-b border-l-2 border-l-[#016098] border-[#e2e8f0] text-center align-middle bg-sky-50 p-2">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <span className="font-bold text-[#016098] text-lg">{sumaFila} <span className="text-xs font-normal">hrs</span></span>
                              {sumaFila > 0 && (
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200" title="Docentes de 44 hrs estimados (proporción 65/35)">
                                  {(sumaFila / 28.6).toFixed(1)} Doc.
                                </span>
                              )}
                            </div>
                          </td>`;

c = c.replace(rowTotalTarget, rowTotalReplacement);


// 2. Remove duplicated footer by using split
const parts = c.split('<div className="text-sm">Estimación Docentes (Contratos 44 Hrs)</div>');
if (parts.length > 2) {
  // Find where the first duplicate ends
  const blockStart = c.indexOf('<tr className="bg-[#f1f5f9] text-[#1e293b]">\n                      <td className="px-4 py-2 border-r border-[#e2e8f0] text-right sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">\n                        <div className="text-sm">Estimación Docentes (Contratos 44 Hrs)</div>');
  
  if (blockStart !== -1) {
    const nextBlockStart = c.indexOf('<tr className="bg-[#f1f5f9] text-[#1e293b]">\n                      <td className="px-4 py-2 border-r border-[#e2e8f0] text-right sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">\n                        <div className="text-sm">Estimación Docentes (Contratos 44 Hrs)</div>', blockStart + 100);
    
    if (nextBlockStart !== -1) {
       // We slice from beginning up to nextBlockStart (which keeps only one copy)
       const endOfDuplicate = c.indexOf('</tr>', nextBlockStart) + 5;
       c = c.substring(0, nextBlockStart) + c.substring(endOfDuplicate);
    }
  }
}

fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', c);
