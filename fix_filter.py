import sys

with open('src/app/actions.ts', 'r', encoding='utf-8') as f:
    code = f.read()

old_logic = """  const esJec = planPropio.establecimiento.esJec || false;
  
    // Insertar cada detalle nuevo
    for (const det of planBase.detalles) {"""

new_logic = """  const esJec = planPropio.establecimiento.esJec || false;
  
    // Obtener los Tipos de Enseñanza autorizados para este colegio
    const tiposAutorizados = await prisma.establecimientoTipoEnsenanza.findMany({
      where: { establecimientoId: planPropio.establecimiento.esedSec }
    });
    const tiposPermitidos = new Set(tiposAutorizados.map(t => t.tienCod));
  
    // Insertar cada detalle nuevo
    for (const det of planBase.detalles) {
      // Filtrar automáticamente: si el colegio tiene tipos configurados, solo clonamos los que le corresponden.
      if (tiposPermitidos.size > 0 && !tiposPermitidos.has(det.tienCod)) {
        continue;
      }"""

code = code.replace(old_logic, new_logic)

with open('src/app/actions.ts', 'w', encoding='utf-8') as f:
    f.write(code)

print("done filter logic")
