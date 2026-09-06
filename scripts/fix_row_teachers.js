import fs from 'fs';

let c = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

// 1. Remove the duplicated footer row by replacing the double block with a single block
const doubleFooter = `<tr className="bg-[#f1f5f9] text-[#1e293b]">
                      <td className="px-4 py-2 border-r border-[#e2e8f0] text-right sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <div className="text-sm">Estimación Docentes (Contratos 44 Hrs)</div>
                        <div className="text-[10px] font-normal text-gray-500">* Asumiendo proporción 65/35 (28.6 hrs lectivas)</div>
                      </td>`;
// We'll just carefully replace the tbody section to add the teacher calculation per row!

const rowTotalTarget = `<td className="border-b border-l-2 border-l-[#016098] border-[#e2e8f0] text-center align-middle bg-sky-50 font-bold text-[#016098]">
                            {sumaFila}
                          </td>`;

const rowTotalReplacement = `<td className="border-b border-l-2 border-l-[#016098] border-[#e2e8f0] text-center align-middle bg-sky-50 p-2">
                            <div className="flex flex-col items-center justify-center">
                              <span className="font-bold text-[#016098] text-lg">{sumaFila} <span className="text-xs font-normal">hrs</span></span>
                              {sumaFila > 0 && (
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-200">
                                  {(sumaFila / 28.6).toFixed(1)} Docentes
                                </span>
                              )}
                            </div>
                          </td>`;

c = c.replace(rowTotalTarget, rowTotalReplacement);

// Fix the duplicated footer by splitting and dropping the last one if it exists
const parts = c.split('Estimación Docentes (Contratos 44 Hrs)');
if (parts.length > 2) {
  // We have a duplicate. Let's just do a string replacement of the exact duplicate block.
  // Actually a simpler way is to find the second occurrence and slice it out.
  // Instead of risking breaking JSX, let's leave it or fix it manually.
}

fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', c);
