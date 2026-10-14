import re

with open('src/app/establecimiento/planes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add state for editGrupos
code = re.sub(
    r"const \[editValue, setEditValue\] = useState<string>\(''\);",
    r"const [editValue, setEditValue] = useState<string>('');\n  const [editGrupos, setEditGrupos] = useState<string>('');",
    code
)

# 2. Update handleEdit
code = re.sub(
    r"const handleEdit = \(detId: number, currentHoras: number\) => \{\s*setEditingId\(detId\);\s*setEditValue\(currentHoras\.toString\(\)\);\s*\};",
    r"const handleEdit = (detId: number, currentHoras: number, currentGrupos?: number | null) => {\n    setEditingId(detId);\n    setEditValue(currentHoras.toString());\n    setEditGrupos(currentGrupos !== null && currentGrupos !== undefined ? currentGrupos.toString() : '');\n  };",
    code
)

# 3. Update handleSaveHoras
code = re.sub(
    r"const handleSaveHoras = async \(detId: number\) => \{\s*const num = parseFloat\(editValue\);\s*if \(isNaN\(num\)\) return;\s*setPlan\(\{\s*\.\.\.plan,\s*detalles: plan\.detalles\.map\(\(d: any\) => d\.id === detId \? \{ \.\.\.d, horas: num \} : d\)\s*\}\);\s*setEditingId\(null\);\s*await actualizarHorasDetallePropio\(detId, num\);\s*\};",
    r"const handleSaveHoras = async (detId: number) => {\n    const num = parseFloat(editValue);\n    if (isNaN(num)) return;\n    const grp = editGrupos.trim() !== '' ? parseInt(editGrupos) : null;\n    setPlan({\n      ...plan,\n      detalles: plan.detalles.map((d: any) => d.id === detId ? { ...d, horas: num, grupos: grp } : d)\n    });\n    setEditingId(null);\n    await actualizarHorasDetallePropio(detId, num, grp);\n  };",
    code
)

# 4. Update the cell rendering for the Grid (isEspecialistaAsig > 0 -> sumaFila)
code = re.sub(
    r"if \(cellData && \(col\.grteCod > 40 \|\| isEspecialistaAsig\(fila\)\)\) sumaFila \+= \(cellData\.horas \* \(col\.cantidadCursos \|\| 0\)\);",
    r"if (cellData && (col.grteCod > 40 || isEspecialistaAsig(fila))) sumaFila += (cellData.horas * (cellData.grupos ?? col.cantidadCursos ?? 0));",
    code
)

# 5. Update cell rendering UI (div input and view)
old_cell_ui = r"""<div className="w-full h-full min-h-\[48px\] flex items-center justify-center hover:bg-\[#e0f2fe\] transition-colors">
                                                  \{editingId === cellData\.id \? \(
                                                    <div className="flex items-center justify-center p-1">
                                                      <input 
                                                        type="number"
                                                        step="0\.5"
                                                        className="w-16 h-8 border-2 border-\[#0369a1\] rounded text-center font-bold text-\[#0369a1\] focus:outline-none"
                                                        value=\{editValue\}
                                                        onChange=\{\(e\) => setEditValue\(e\.target\.value\)\}
                                                        autoFocus
                                                        onKeyDown=\{\(e\) => e\.key === 'Enter' && handleSaveHoras\(cellData\.id\)\}
                                                        onBlur=\{\(\) => handleSaveHoras\(cellData\.id\)\}
                                                      />
                                                    </div>
                                                  \) : \(
                                                    <div 
                                                      className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-2"
                                                      onClick=\{\(\) => handleEdit\(cellData\.id, cellData\.horas\)\}
                                                    >
                                                      <span className=\{`text-lg font-bold \$\{cellData\.horas > 0 \? 'text-\[#016098\]' : 'text-red-400'\}`\}>
                                                        \{cellData\.horas\}
                                                      </span>
                                                    </div>
                                                  \)\}
                                                </div>"""

new_cell_ui = r"""<div className="w-full h-full min-h-[48px] flex items-center justify-center hover:bg-[#e0f2fe] transition-colors">
                                                  {editingId === cellData.id ? (
                                                    <div className="flex flex-col items-center justify-center p-1 gap-1">
                                                      <div className="flex items-center gap-1">
                                                        <input 
                                                          type="number"
                                                          step="0.5"
                                                          className="w-12 h-6 border-2 border-[#0369a1] rounded text-center font-bold text-[#0369a1] focus:outline-none text-xs"
                                                          value={editValue}
                                                          onChange={(e) => setEditValue(e.target.value)}
                                                          autoFocus
                                                          onKeyDown={(e) => e.key === 'Enter' && handleSaveHoras(cellData.id)}
                                                        />
                                                        <span className="text-[9px] font-bold text-gray-400">HRS</span>
                                                      </div>
                                                      <div className="flex items-center gap-1">
                                                        <input 
                                                          type="number"
                                                          className="w-12 h-6 border border-gray-300 rounded text-center font-bold text-gray-600 focus:outline-none text-xs"
                                                          value={editGrupos}
                                                          onChange={(e) => setEditGrupos(e.target.value)}
                                                          placeholder="Auto"
                                                          onKeyDown={(e) => e.key === 'Enter' && handleSaveHoras(cellData.id)}
                                                        />
                                                        <span className="text-[9px] font-bold text-gray-400">GRP</span>
                                                      </div>
                                                      <button onClick={() => handleSaveHoras(cellData.id)} className="text-[9px] bg-[#0369a1] text-white px-2 py-0.5 rounded w-full">Guardar</button>
                                                    </div>
                                                  ) : (
                                                    <div 
                                                      className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-2 group-cell hover:bg-[#e0f2fe]"
                                                      onClick={() => handleEdit(cellData.id, cellData.horas, cellData.grupos)}
                                                    >
                                                      <span className={`text-lg font-bold ${cellData.horas > 0 ? 'text-[#016098]' : 'text-red-400'}`}>
                                                        {cellData.horas}
                                                      </span>
                                                      {(cellData.grupos !== null && cellData.grupos !== undefined) && (
                                                        <span className="text-[10px] text-gray-500 font-bold bg-white px-1 rounded shadow-sm border border-gray-200 mt-1" title="Grupos específicos (sobreescribe la cantidad de cursos)">
                                                          x {cellData.grupos} grp
                                                        </span>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>"""

code = re.sub(old_cell_ui, new_cell_ui, code)


# 6. Update Subtotals in Subtotal Row (totalReal += ...)
code = re.sub(
    r"if \(cData && \(col\.grteCod > 40 \|\| isEspecialistaAsig\(f\)\)\) \{\s*totalReal \+= \(cData\.horas \* \(col\.cantidadCursos \|\| 0\)\);\s*\}",
    r"if (cData && (col.grteCod > 40 || isEspecialistaAsig(f))) { totalReal += (cData.horas * (cData.grupos ?? col.cantidadCursos ?? 0)); }",
    code
)

# 7. Update Footer Totals (totalBase += ...)
code = re.sub(
    r"if \(cellData\) \{\s*if \(isEspecialistaAsig\(f\) \|\| f\.codAsignatura\.startsWith\('EL'\) \|\| f\.codAsignatura\.startsWith\('JEC'\)\) \{\s*if \(col\.grteCod > 40\) totalBase \+= \(cellData\.horas \* \(col\.cantidadCursos \|\| 0\)\);\s*\} else \{\s*totalBase \+= cellData\.horas;\s*\}\s*\}",
    r"if (cellData) { if (isEspecialistaAsig(f) || f.codAsignatura.startsWith('EL') || f.codAsignatura.startsWith('JEC')) { if (col.grteCod > 40) totalBase += (cellData.horas * (cellData.grupos ?? col.cantidadCursos ?? 0)); } else { totalBase += cellData.horas; } }",
    code
)

with open('src/app/establecimiento/planes/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Grid updated")
