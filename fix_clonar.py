import sys

with open('src/app/actions.ts', 'r', encoding='utf-8') as f:
    code = f.read()

old_logic = """  // Obtener si el colegio es JEC
  const estab = await prisma.establecimiento.findUnique({ where: { esedSec: establecimientoId } });
  const esJec = estab?.esJec || false;

  // Crear la cabecera del plan propio
  const planPropio = await prisma.planEstablecimiento.create({
    data: {
      establecimientoId,
      codPlanBase,
      nombre,
      detalles: {
        create: planBase.detalles.map(det => ({"""

new_logic = """  // Obtener si el colegio es JEC
  const estab = await prisma.establecimiento.findUnique({ where: { esedSec: establecimientoId } });
  const esJec = estab?.esJec || false;

  // Obtener tipos de enseñanza autorizados
  const tiposAutorizados = await prisma.establecimientoTipoEnsenanza.findMany({
    where: { establecimientoId }
  });
  const tiposPermitidos = new Set(tiposAutorizados.map((t: any) => t.tienCod));

  const detallesFiltrados = planBase.detalles.filter((det: any) => {
    if (tiposPermitidos.size > 0 && !tiposPermitidos.has(det.tienCod)) {
      return false;
    }
    return true;
  });

  // Crear la cabecera del plan propio
  const planPropio = await prisma.planEstablecimiento.create({
    data: {
      establecimientoId,
      codPlanBase,
      nombre,
      detalles: {
        create: detallesFiltrados.map((det: any) => ({"""

code = code.replace(old_logic, new_logic)

with open('src/app/actions.ts', 'w', encoding='utf-8') as f:
    f.write(code)

print("done clonar logic")
