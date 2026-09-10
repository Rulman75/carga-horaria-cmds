import sys

with open('src/app/carga/matriz-clasica/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. First row of thead: <th colSpan={2} className="bg-gray-300 border border-[#cbd5e1]"></th>
code = code.replace('<th colSpan={2} className="bg-gray-300 border border-[#cbd5e1]"></th>', '<th colSpan={3} className="bg-gray-300 border border-[#cbd5e1]"></th>')

# 2. Second row of thead:
old_thead_row2 = """              <th className="px-2 py-1 border border-[#cbd5e1] text-center bg-gray-300 font-bold" rowSpan={2}>TOTAL ASIGNADO<br/>(Crono)</th>
              <th className="px-2 py-1 border border-[#cbd5e1] text-center bg-gray-300" rowSpan={2}>BALANCE<br/>(Faltan/Sobran)</th>
            </tr>"""
new_thead_row2 = """              <th className="px-2 py-1 border border-[#cbd5e1] text-center bg-gray-300 font-bold" rowSpan={2}>TOTAL ASIGNADO<br/>(Crono)</th>
              <th className="px-2 py-1 border border-[#cbd5e1] text-center bg-gray-300 border-r-2 border-r-slate-400" rowSpan={2}>BALANCE<br/>(Faltan/Sobran)</th>
              <th className="px-4 py-1 border border-[#cbd5e1] text-left bg-gray-100" rowSpan={2}>OBSERVACIONES</th>
            </tr>"""
code = code.replace(old_thead_row2, new_thead_row2)

# 3. tbody
old_tbody_td = """                  <td className={`px-2 py-2 text-center font-bold ${balance === 0 ? 'text-green-600' : balance > 0 ? 'text-orange-500' : 'text-red-600'}`}>
                    {balance === 0 ? 'OK' : balance > 0 ? `Faltan ${Math.round(balance)}` : `Sobran ${Math.abs(balance)}`}
                  </td>
                </tr>"""
new_tbody_td = """                  <td className={`px-2 py-2 text-center font-bold border-r-2 border-[#cbd5e1] ${balance === 0 ? 'text-green-600' : balance > 0 ? 'text-orange-500' : 'text-red-600'}`}>
                    {balance === 0 ? 'OK' : balance > 0 ? `Faltan ${Math.round(balance)}` : `Sobran ${Math.abs(balance)}`}
                  </td>
                  <td className="px-4 py-2 text-left text-[11px] text-gray-700 max-w-[200px] break-words whitespace-normal border-r border-[#cbd5e1]">
                    {doc.establecimientos?.[0]?.observacionCarga || ''}
                  </td>
                </tr>"""
code = code.replace(old_tbody_td, new_tbody_td)

with open('src/app/carga/matriz-clasica/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("done")
