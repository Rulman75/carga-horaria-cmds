import sys
import json

with open('src/app/config/planes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Instead of doing complex grouping in JSX, we can do it in the render loop.
# Right now we have:
# <table className="w-full text-sm text-left">
#   <thead className="text-xs text-[#64748b] uppercase bg-[#f1f5f9] sticky top-0 shadow-sm">
#     ...
#   </thead>
#   <tbody>
#     {plan.detalles?.map((det: any) => (
#       <tr key={det.id} ...>
#         ...
#       </tr>
#     ))}
#   </tbody>
# </table>

old_table = """<div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#64748b] uppercase bg-[#f1f5f9] sticky top-0 shadow-sm">
              <tr>
                <th className="px-6 py-4">Cód. Asig</th>
                <th className="px-6 py-4">Nombre Asignatura</th>
                <th className="px-6 py-4">Formación</th>
                <th className="px-6 py-4 text-center">Obligatoria</th>
                <th className="px-6 py-4 text-right">Horas CJ</th>
                <th className="px-6 py-4 text-right">Horas SJ</th>
              </tr>
            </thead>
            <tbody>
              {plan.detalles?.map((det: any) => (
                <tr key={det.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors">
                  <td className="px-6 py-4 font-mono text-[#64748b] text-xs">{det.codAsignatura}</td>
                  <td className="px-6 py-4 font-bold text-[#1e293b]">{det.asignatura?.asigDescripcion || 'Desconocida'}</td>
                  <td className="px-6 py-4 text-[#64748b]">{det.formacion}</td>
                  <td className="px-6 py-4 text-center">
                    {det.obligatoria === 'SI' ? (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">SÍ</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">{det.obligatoria || 'NO'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-[#016098]">{det.horasCJ}</td>
                  <td className="px-6 py-4 text-right font-bold text-[#016098]">{det.horasSJ}</td>
                </tr>
              ))}
              {(!plan.detalles || plan.detalles.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#94a3b8]">
                    No se encontraron asignaturas para este plan de estudio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>"""

new_table = """<div className="flex-1 overflow-auto bg-gray-50 p-4">
          {(() => {
            if (!plan.detalles || plan.detalles.length === 0) {
              return (
                <div className="p-8 text-center text-[#94a3b8] bg-white rounded-xl border border-dashed border-gray-300">
                  No se encontraron asignaturas para este plan de estudio.
                </div>
              );
            }

            // Group by Grado
            const grouped = new Map<string, any[]>();
            plan.detalles.forEach((det: any) => {
              const gradoStr = det.grado ? det.grado.grteDescrip : 'Sin Grado';
              if (!grouped.has(gradoStr)) grouped.set(gradoStr, []);
              grouped.get(gradoStr)!.push(det);
            });

            return Array.from(grouped.entries()).map(([gradoName, asignaturas]) => (
              <div key={gradoName} className="mb-8 bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden">
                <div className="bg-[#f1f5f9] px-6 py-3 border-b border-[#e2e8f0]">
                  <h4 className="font-bold text-[#1e293b]">{gradoName}</h4>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-[#64748b] uppercase bg-white border-b border-[#e2e8f0]">
                    <tr>
                      <th className="px-6 py-3">Cód. Asig</th>
                      <th className="px-6 py-3">Nombre Asignatura</th>
                      <th className="px-6 py-3">Formación</th>
                      <th className="px-6 py-3 text-center">Obligatoria</th>
                      <th className="px-6 py-3 text-right">Horas CJ</th>
                      <th className="px-6 py-3 text-right">Horas SJ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asignaturas.map((det: any) => (
                      <tr key={det.id} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc] transition-colors">
                        <td className="px-6 py-3 font-mono text-[#64748b] text-xs w-24">{det.codAsignatura}</td>
                        <td className="px-6 py-3 font-bold text-[#1e293b]">{det.asignatura?.asigDescripcion || 'Desconocida'}</td>
                        <td className="px-6 py-3 text-[#64748b] w-32">{det.formacion}</td>
                        <td className="px-6 py-3 text-center w-24">
                          {det.obligatoria === 'SI' ? (
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">SÍ</span>
                          ) : (
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">{det.obligatoria || 'NO'}</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right font-bold text-[#016098] w-24">{det.horasCJ}</td>
                        <td className="px-6 py-3 text-right font-bold text-[#016098] w-24">{det.horasSJ}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ));
          })()}
        </div>"""

code = code.replace(old_table, new_table)

with open('src/app/config/planes/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("done page")
