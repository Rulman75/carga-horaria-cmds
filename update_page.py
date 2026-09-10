import sys

with open('src/app/carga/asignacion/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add state
state_old = "const [docenteSeleccionado, setDocenteSeleccionado] = useState('');"
state_new = "const [docenteSeleccionado, setDocenteSeleccionado] = useState('');\n  const [observacionCarga, setObservacionCarga] = useState('');"
code = code.replace(state_old, state_new)

# Update doc select effect
eff_old = """if (docenteSeleccionado) {
      const dbCargas = todasCargas.filter(c => c && c.docenteId && c.docenteId.toString() === docenteSeleccionado);"""
eff_new = """if (docenteSeleccionado) {
      const doc = docentes.find(d => d && d.id && d.id.toString() === docenteSeleccionado);
      setObservacionCarga(doc?.establecimientos?.[0]?.observacionCarga || '');
      const dbCargas = todasCargas.filter(c => c && c.docenteId && c.docenteId.toString() === docenteSeleccionado);"""
code = code.replace(eff_old, eff_new)

# Update handleGuardar
save_old = "await saveCargasHorarias(Number(docenteSeleccionado), payloads);"
save_new = "await saveCargasHorarias(Number(docenteSeleccionado), payloads, ESTABLECIMIENTO_ID || undefined, observacionCarga);"
code = code.replace(save_old, save_new)

# Add UI textarea
ui_old = """<div className="flex-1 overflow-auto p-4 custom-scrollbar">"""
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
code = code.replace(ui_old, ui_new)

# Add to certificate (printCertificado)
# The string to search is exactly: <tr><th colspan="2" class="center">CÁLCULO HORAS CRONOLÓGICAS CONTRATO</th></tr>
cert_old = '<tr><th colspan="2" class="center">CÁLCULO HORAS CRONOLÓGICAS CONTRATO</th></tr>'
cert_new = """</table>
          ` + (observacionCarga ? `
          <div class="section" style="margin-top: 15px;">III. Observaciones</div>
          <p style="font-size: 14px; margin-bottom: 20px;">${observacionCarga}</p>
          ` : '') + `
          <table>
            <tr><th colspan="2" class="center">CÁLCULO HORAS CRONOLÓGICAS CONTRATO</th></tr>"""

code = code.replace(cert_old, cert_new)

with open('src/app/carga/asignacion/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("page.tsx updated")
