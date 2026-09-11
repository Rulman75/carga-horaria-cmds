import sys

with open('src/app/carga/asignacion/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_block = """                <div className="w-1/4 border-l pl-6 border-gray-200 flex flex-col justify-center">
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Total Asignado (Crono)</span>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${((horasLectivasAsignadas * 45 / 60) + recreoDecimal) + horasNoLectivasAsignadas + horasExtraAsignadas + colacion > totalHorasContrato ? 'text-red-500' : 'text-green-600'}`}>
                      {Math.round(((horasLectivasAsignadas * 45 / 60) + recreoDecimal) + horasNoLectivasAsignadas + horasExtraAsignadas + colacion)} H
                    </span>
                    <span className="text-xs font-medium text-gray-400">/ {totalHorasContrato} hrs</span>
                  </div>
                </div>"""

new_block = """                <div className="w-1/3 border-l pl-6 border-gray-200 flex flex-col justify-center">
                  <div className="flex items-start gap-4">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Total Asignado (Aprox)</span>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold ${((horasLectivasAsignadas * 45 / 60) + recreoDecimal) + horasNoLectivasAsignadas + horasExtraAsignadas + colacion > totalHorasContrato ? 'text-red-500' : 'text-green-600'}`}>
                          {Math.round(((horasLectivasAsignadas * 45 / 60) + recreoDecimal) + horasNoLectivasAsignadas + horasExtraAsignadas + colacion)} H
                        </span>
                        <span className="text-xs font-medium text-gray-400">/ {totalHorasContrato} hrs</span>
                      </div>
                    </div>
                    
                    <div className="bg-[#f8fafc] border border-gray-200 rounded p-2 text-[9px] text-gray-600 flex-1 grid grid-cols-2 gap-x-2 gap-y-1">
                      <div className="flex justify-between"><span>HA:</span> <span className="font-semibold text-gray-800">{formatCronoDecimal(horasLectivasAsignadas * 45 / 60)}</span></div>
                      <div className="flex justify-between"><span>Recreo:</span> <span className="font-semibold text-gray-800">{formatCronoDecimal(recreoDecimal)}</span></div>
                      {horasNoLectivasAsignadas > 0 && <div className="flex justify-between"><span>HNL:</span> <span className="font-semibold text-gray-800">{formatCronoDecimal(horasNoLectivasAsignadas)}</span></div>}
                      {horasExtraAsignadas > 0 && <div className="flex justify-between"><span>HE:</span> <span className="font-semibold text-gray-800">{formatCronoDecimal(horasExtraAsignadas)}</span></div>}
                      {colacion > 0 && <div className="flex justify-between"><span>Colación:</span> <span className="font-semibold text-gray-800">{formatCronoDecimal(colacion)}</span></div>}
                      <div className="flex justify-between col-span-2 mt-1 pt-1 border-t border-gray-200 text-[#016098] font-bold">
                        <span>TOTAL EXACTO:</span>
                        <span>{formatCronoDecimal(((horasLectivasAsignadas * 45 / 60) + recreoDecimal) + horasNoLectivasAsignadas + horasExtraAsignadas + colacion)}</span>
                      </div>
                    </div>
                  </div>
                </div>"""

# Ensure the parent class has enough space, maybe change `w-1/4` in the preceding div if needed, but flex should handle it.
# Actually, the container is a flex container:
# <div className="flex items-center gap-6 p-4">
#   <div className="flex-1 ...">
#   <div className="w-1/4 ...">
# If I change w-1/4 to w-1/3 it should balance well.

code = code.replace(old_block, new_block)

with open('src/app/carga/asignacion/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("done")
