with open('src/app/actions.ts', 'a', encoding='utf-8') as f:
    f.write('''
export async function getPlanPropio(id: number) {
  return await prisma.planEstablecimiento.findUnique({
    where: { id },
    include: {
      planBase: true,
      detalles: {
        include: { asignatura: true, tipoEnsenanza: true, grado: true },
        orderBy: [
          { tienCod: 'asc' },
          { grteCod: 'asc' },
          { codAsignatura: 'asc' }
        ]
      }
    }
  });
}

export async function actualizarHorasDetallePropio(detalleId: number, horas: number) {
  return await prisma.planEstablecimientoDet.update({
    where: { id: detalleId },
    data: { horas }
  });
}

export async function eliminarDetallePropio(detalleId: number) {
  return await prisma.planEstablecimientoDet.delete({
    where: { id: detalleId }
  });
}
''')
