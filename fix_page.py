import sys
with open('src/app/carga/asignacion/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix HTML
code = code.replace("<table>\n            </table>", "")

# Remove one textarea
ui_new = """<div className="p-4 bg-gray-50 border-b border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Observaciones Globales (se imprimirán en el certificado)</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm h-16 resize-none"
                  placeholder="Ingrese observaciones..."
                  value={observacionCarga}
                  onChange={(e) => setObservacionCarga(e.target.value)}
                  disabled={!docenteSeleccionado}
                />
              </div>
              <div className="flex-1 overflow-auto p-4 custom-scrollbar">"""

ui_old = """<div className="flex-1 overflow-auto p-4 custom-scrollbar">"""

# We want to replace the first occurrence of ui_new back with ui_old, since we only want it ONCE.
code = code.replace(ui_new, ui_old, 1)

with open('src/app/carga/asignacion/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("fixed page")
