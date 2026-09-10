'use server';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getDocentes() {
  return await prisma.docente.findMany({ orderBy: { apellidos: 'asc' } });
}

export async function getTiposEnsenanza() {
  return await prisma.tipoEnsenanza.findMany({
    orderBy: { tienDescripcion: 'asc' }
  });
}

export async function getGrados() {
  return await prisma.grado.findMany({ 
    include: { tipoEnsenanza: true },
    orderBy: [
      { tienCod: 'asc' },
      { grteCod: 'asc' }
    ]
  });
}

export async function getAsignaturasPorGrado(tienCod: number, grteCod: number) {
  // Retorna los detalles del plan para ese grado específico, con la info de la asignatura
  return await prisma.planEstudioDet.findMany({
    where: { 
      tienCod: tienCod,
      grteCod: grteCod 
    },
    include: { 
      asignatura: true, 
      planEnc: true 
    }
  });
}

export async function getPlanesEstudio() {
  return await prisma.planEstudioEnc.findMany({
    include: {
      _count: {
        select: { detalles: true }
      }
    },
    orderBy: {
      codPlan: 'asc'
    }
  });
}

export async function getPlanEstudio(codPlan: number) {
  return await prisma.planEstudioEnc.findUnique({
    where: { codPlan },
    include: {
      detalles: {
        include: {
          asignatura: true,
          tipoEnsenanza: true
        }
      }
    }
  });
}

export async function getEstablecimientos() {
  return await prisma.establecimiento.findMany({
    orderBy: {
      esedDescripcion: 'asc'
    }
  });
}

export async function updatePlanEstudioEstado(codPlan: number, nuevoEstado: string) {
  return await prisma.planEstudioEnc.update({
    where: { codPlan },
    data: { estadoPlan: nuevoEstado }
  });
}

export async function clonarPlanEstudioBase(establecimientoId: number, codPlanBase: number, nombre: string) {
  // Obtener el plan base con sus detalles
  const planBase = await prisma.planEstudioEnc.findUnique({
    where: { codPlan: codPlanBase },
    include: { detalles: true }
  });

  if (!planBase) throw new Error("Plan base no encontrado");

  // Obtener si el colegio es JEC
  const estab = await prisma.establecimiento.findUnique({ where: { esedSec: establecimientoId } });
  const esJec = estab?.esJec || false;

  // Crear la cabecera del plan propio
  const planPropio = await prisma.planEstablecimiento.create({
    data: {
      establecimientoId,
      codPlanBase,
      nombre,
      detalles: {
        create: planBase.detalles.map(det => ({
          tienCod: det.tienCod,
          grteCod: det.grteCod,
          codAsignatura: det.codAsignatura,
          // La magia: si es JEC usa horasCJ, si no horasSJ
          horas: esJec ? (det.horasCJ || 0) : (det.horasSJ || 0),
          obligatoria: det.obligatoria,
          formacion: det.formacion,
          esPropio: false
        }))
      }
    }
  });

  return planPropio;
}

export async function getPlanesPropios(establecimientoId: number) {
  return await prisma.planEstablecimiento.findMany({
    where: { establecimientoId },
    include: {
      planBase: true,
      _count: { select: { detalles: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getEstablecimientoConfig(establecimientoId: number) {
  return await prisma.establecimiento.findUnique({
    where: { esedSec: establecimientoId },
    include: {
      grados: {
        include: { grado: { include: { tipoEnsenanza: true } } }
      },
      tiposEnsenanza: {
        include: { tipoEnsenanza: true }
      }
    }
  });
}

export async function updateEstablecimientoConfig(establecimientoId: number, esJec: boolean, gradosData: {tienCod: number, grteCod: number, cantidadCursos: number}[], tiposData: number[]) {
  // Solo actualiza JEC y grados.

  const estabOld = await prisma.establecimiento.findUnique({ where: { esedSec: establecimientoId } });
  
  await prisma.establecimiento.update({
    where: { esedSec: establecimientoId },
    data: { esJec }
  });

  for (const g of gradosData) {
    await prisma.establecimientoGrado.upsert({
      where: {
        establecimientoId_tienCod_grteCod: {
          establecimientoId,
          tienCod: g.tienCod,
          grteCod: g.grteCod
        }
      },
      update: { cantidadCursos: g.cantidadCursos },
      create: {
        establecimientoId,
        tienCod: g.tienCod,
        grteCod: g.grteCod,
        cantidadCursos: g.cantidadCursos
      }
    });
  }

  // Si cambió la bandera JEC, recalcular las horas de todos los planes propios asociados a este establecimiento
  if (estabOld && estabOld.esJec !== esJec) {
    const planesPropios = await prisma.planEstablecimiento.findMany({
      where: { establecimientoId },
      include: {
        planBase: { include: { detalles: true } },
        detalles: { where: { esPropio: false } }
      }
    });

    for (const plan of planesPropios) {
      for (const detPropio of plan.detalles) {
        const baseDet = plan.planBase.detalles.find(d => 
          d.tienCod === detPropio.tienCod &&
          d.grteCod === detPropio.grteCod &&
          d.codAsignatura === detPropio.codAsignatura
        );
        
        if (baseDet) {
          const nuevasHoras = esJec ? (baseDet.horasCJ || 0) : (baseDet.horasSJ || 0);
          if (nuevasHoras !== detPropio.horas) {
            await prisma.planEstablecimientoDet.update({
              where: { id: detPropio.id },
              data: { horas: nuevasHoras }
            });
          }
        }
      }
    }
  }
}

export async function getPlanPropio(id: number) {
  return await prisma.planEstablecimiento.findUnique({
    where: { id },
    include: {
      planBase: true,
      establecimiento: {
        include: { grados: true }
      },
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

export async function importarPlanBaseAPropio(planPropioId: number, codPlanBase: number) {
  // Obtener el plan base con sus detalles
  const planBase = await prisma.planEstudioEnc.findUnique({
    where: { codPlan: codPlanBase },
    include: { detalles: true }
  });

  if (!planBase) throw new Error("Plan base no encontrado");

  // Obtener si el colegio es JEC para saber qué horas traer
  const planPropio = await prisma.planEstablecimiento.findUnique({
    where: { id: planPropioId },
    include: { establecimiento: true }
  });
  
  if (!planPropio) throw new Error("Plan propio no encontrado");
  
  const esJec = planPropio.establecimiento.esJec || false;

  // Insertar cada detalle nuevo
  for (const det of planBase.detalles) {
    // Verificar si ya existe para no duplicar (por asignatura y grado)
    const existe = await prisma.planEstablecimientoDet.findFirst({
      where: {
        planEstablecimientoId: planPropioId,
        tienCod: det.tienCod,
        grteCod: det.grteCod,
        codAsignatura: det.codAsignatura
      }
    });

    if (!existe) {
      await prisma.planEstablecimientoDet.create({
        data: {
          planEstablecimientoId: planPropioId,
          tienCod: det.tienCod,
          grteCod: det.grteCod,
          codAsignatura: det.codAsignatura,
          horas: esJec ? (det.horasCJ || 0) : (det.horasSJ || 0),
          obligatoria: det.obligatoria,
          formacion: det.formacion,
          esPropio: false
        }
      });
    }
  }
}

export async function eliminarPlanPropio(planId: number) {
  // Primero eliminar los detalles (si no hay cascade deletion configurado)
  await prisma.planEstablecimientoDet.deleteMany({
    where: { planEstablecimientoId: planId }
  });
  
  // Luego eliminar el plan
  await prisma.planEstablecimiento.delete({
    where: { id: planId }
  });
}

export async function getAllAsignaturas() {
  return await prisma.asignatura.findMany({
    orderBy: { asigDescripcion: 'asc' }
  });
}

export async function agregarAsignaturaIndividualPropio(
  planPropioId: number, 
  tienCod: number, 
  grteCod: number, 
  codAsignatura: string
) {
  // Check if exists
  const existe = await prisma.planEstablecimientoDet.findFirst({
    where: {
      planEstablecimientoId: planPropioId,
      tienCod,
      grteCod,
      codAsignatura
    }
  });

  if (!existe) {
    await prisma.planEstablecimientoDet.create({
      data: {
        planEstablecimientoId: planPropioId,
        tienCod,
        grteCod,
        codAsignatura,
        horas: 0, // Starts at 0 so they can edit it in the matrix
        obligatoria: 'NO',
        formacion: 'General',
        esPropio: true
      }
    });
  }
}


export async function getAsignaturasPropiasPorGrado(establecimientoId: number, tienCod: number, grteCod: number) {
  return await prisma.planEstablecimientoDet.findMany({
    where: { 
      tienCod,
      grteCod,
      planEstablecimiento: {
        establecimientoId
      }
    },
    include: { 
      asignatura: true,
      planEstablecimiento: true
    }
  });
}


export async function getDocentesEstablecimiento(establecimientoId: number) {
  return await prisma.docente.findMany({ 
    where: { establecimientos: { some: { establecimientoId } } },
    include: { establecimientos: { where: { establecimientoId } } },
    orderBy: { apellidos: 'asc' } 
  });
}

export async function getGradosEstablecimiento(establecimientoId: number) {
  const estGrados = await prisma.establecimientoGrado.findMany({
    where: { establecimientoId },
    include: { 
      grado: { include: { tipoEnsenanza: true } }
    },
    orderBy: [
      { tienCod: 'asc' },
      { grteCod: 'asc' }
    ]
  });
  // We need to return an object similar to what Grado model returns, 
  // but also including cantidadCursos could be useful.
  return estGrados.map(eg => ({
    ...eg.grado,
    cantidadCursos: eg.cantidadCursos
  }));
}


export async function getCargasEstablecimiento(establecimientoId: number) {
  return await prisma.cargaHoraria.findMany({
    where: {
      planEstablecimiento: { establecimientoId }
    },
    include: {
      asignatura: true,
      actividadNoLectiva: true,
      actividadExtracurricular: true,
      grado: { include: { tipoEnsenanza: true } }
    }
  });
}

export async function saveCargasHorarias(docenteId: number, cargas: any[], establecimientoId?: number, observacionCarga?: string) {
  // Replace all assignments for this teacher
  await prisma.cargaHoraria.deleteMany({
    where: { docenteId }
  });
  
  if (cargas.length > 0) {
    await prisma.cargaHoraria.createMany({
      data: cargas.map(c => ({
        docenteId,
        planEstablecimientoId: c.planEstablecimientoId,
        tienCod: c.tienCod || null,
        grteCod: c.grteCod || null,
        asignaturaCod: c.codAsignatura || null,
        actividadNoLectivaId: c.actividadNoLectivaId || null,
        actividadExtracurricularId: c.actividadExtracurricularId || null,
        financiamiento: c.financiamiento || null,
        letraCurso: c.letraCurso || null,
        horasAllocadas: c.horas,
        tipoCarga: c.tipoCarga,
        observacion: ''
      }))
    });
  }

  if (establecimientoId) {
    await prisma.docenteEstablecimiento.update({
      where: { docenteId_establecimientoId: { docenteId, establecimientoId } },
      data: { observacionCarga: observacionCarga || null }
    });
  }
}
export async function loginUsuario(email: string, pass: string) {
  const user = await prisma.usuario.findUnique({
    where: { email }
  });
  if (user && user.password === pass) {
    const { password, ...safeUser } = user;
    return safeUser;
  }
  return null;
}


export async function updateDocenteHoras(docenteId: number, horas: number) {
  return await prisma.docente.update({
    where: { id: docenteId },
    data: { horasTitular: horas }
  });
}


export async function getTodasAsignaturas() {
  return await prisma.asignatura.findMany({
    orderBy: { asigDescripcion: 'asc' }
  });
}

export async function updateAsignaturaEspecialista(codAsignatura: string, esEspecialista: boolean) {
  return await prisma.asignatura.update({
    where: { asigCod: codAsignatura },
    data: { esEspecialistaSiempre: esEspecialista }
  });
}


export async function getEstablecimientosConTipos() {
  return await prisma.establecimiento.findMany({
    orderBy: { esedSec: 'asc' },
    include: {
      tiposEnsenanza: {
        include: { tipoEnsenanza: true }
      }
    }
  });
}

export async function updateEstablecimientoTipos(establecimientoId: number, tienCods: number[]) {
  // Primero eliminamos los tipos actuales
  await prisma.establecimientoTipoEnsenanza.deleteMany({
    where: { establecimientoId }
  });
  
  // Insertamos los nuevos
  if (tienCods.length > 0) {
    await prisma.establecimientoTipoEnsenanza.createMany({
      data: tienCods.map(tienCod => ({
        establecimientoId,
        tienCod
      }))
    });
  }
}

export async function getActividadesNoLectivas() {
  return await prisma.actividadNoLectiva.findMany({
    orderBy: { descripcion: 'asc' }
  });
}

export async function createActividadNoLectiva(descripcion: string, esPlanificacion: boolean = false) {
  return await prisma.actividadNoLectiva.create({
    data: { descripcion, esPlanificacion }
  });
}

export async function updateActividadNoLectiva(id: number, esPlanificacion: boolean) {
  return await prisma.actividadNoLectiva.update({
    where: { id },
    data: { esPlanificacion }
  });
}

export async function deleteActividadNoLectiva(id: number) {
  return await prisma.actividadNoLectiva.delete({
    where: { id }
  });
}

export async function createAsignatura(asigCod: string, asigDescripcion: string) {
  return await prisma.asignatura.create({
    data: { asigCod, asigDescripcion }
  });
}

export async function deleteAsignatura(asigCod: string) {
  return await prisma.asignatura.delete({
    where: { asigCod }
  });
}


export async function getTablaConversion() {
  return await prisma.tablaConversion.findMany({
    orderBy: { jornadaSemanal: 'desc' }
  });
}

export async function updateAsignaturaJec(asigCod: string, esTallerJec: boolean) {
  return await prisma.asignatura.update({
    where: { asigCod },
    data: { esTallerJec }
  });
}

export async function updateAsignaturaNombre(asigCod: string, asigDescripcion: string) {
  return await prisma.asignatura.update({
    where: { asigCod },
    data: { asigDescripcion }
  });
}

export async function getDashboardSummary(establecimientoId?: number) {
  if (establecimientoId) {
    const docentes = await prisma.docenteEstablecimiento.count({ where: { establecimientoId } });
    const config = await prisma.establecimiento.findUnique({ where: { esedSec: establecimientoId } });
    const grados = await prisma.establecimientoGrado.findMany({ where: { establecimientoId }, include: { grado: true } });
    const totalCursos = grados.reduce((sum, g) => sum + g.cantidadCursos, 0);
    return { docentes, cursos: totalCursos, tipo: 'ESTABLECIMIENTO', nombre: config?.esedDescripcion || '' };
  } else {
    const establecimientos = await prisma.establecimiento.count();
    const docentes = await prisma.docente.count();
    const asignaturas = await prisma.asignatura.count();
    return { establecimientos, docentes, asignaturas, tipo: 'GLOBAL' };
  }
}


// --- EXTRACURRICULARES ---
export async function getActividadesExtracurriculares() {
  return await prisma.actividadExtracurricular.findMany({
    orderBy: { descripcion: 'asc' }
  });
}

export async function createActividadExtracurricular(descripcion: string) {
  return await prisma.actividadExtracurricular.create({
    data: { descripcion }
  });
}

export async function deleteActividadExtracurricular(id: number) {
  return await prisma.actividadExtracurricular.delete({
    where: { id }
  });
}

// --- CONFIGURACION GLOBAL ---
export async function getConfiguracionGlobal() {
  let config = await prisma.configuracionGlobal.findFirst();
  if (!config) {
    config = await prisma.configuracionGlobal.create({
      data: { id: 1, horasColacion: 2, maxHorasPie: 3 }
    });
  }
  return config;
}

export async function updateConfiguracionGlobal(horasColacion: number, maxHorasPie: number) {
  return await prisma.configuracionGlobal.upsert({
    where: { id: 1 },
    update: { horasColacion, maxHorasPie },
    create: { id: 1, horasColacion, maxHorasPie }
  });
}

export async function getDashboardStats() {
  const ests = await prisma.establecimiento.findMany({
    orderBy: { esedDescripcion: 'asc' }
  });
  const rels = await prisma.docenteEstablecimiento.findMany({
    include: { docente: true }
  });
  
  let rows = ests.map(e => {
    const d = rels.filter(r => r.establecimientoId === e.esedSec);
    const totalHoras = d.reduce((sum, r) => sum + (r.docente.totalDefinitivo || r.docente.totalJornada || r.docente.horasTitular || 0), 0);
    return {
      nombre: e.esedDescripcion,
      docentes: d.length,
      horas: totalHoras
    };
  }).filter(r => r.docentes > 0);
  
  return rows;
}



  const parseCronoToDecimal = (crono: string) => {
    if (!crono) return 0;
    const parts = crono.split(':');
    if (parts.length !== 2) return 0;
    return parseInt(parts[0]) + parseInt(parts[1]) / 60;
  };

export async function getSchoolAnalytics(establecimientoId: number) {
  const tablaConversion = await prisma.tablaConversion.findMany();
  // Get all teachers for this school
  const rels = await prisma.docenteEstablecimiento.findMany({
    where: { establecimientoId },
    include: { docente: true }
  });
  
  // Get all cargas for this school
  const cargas = await prisma.cargaHoraria.findMany({
    where: { planEstablecimiento: { establecimientoId } },
    include: { asignatura: true, actividadExtracurricular: true }
  });

  const planesDetalles = await prisma.planEstablecimientoDet.findMany({
    where: { planEstablecimiento: { establecimientoId } },
    include: { 
      asignatura: true, 
      grado: { 
        include: { establecimientoGrados: { where: { establecimientoId } } } 
      } 
    }
  });

  const subjectNeed: Record<string, { needed: number, assigned: number, name: string }> = {};

  planesDetalles.forEach(det => {
    const asig = det.asignatura?.asigDescripcion || 'Desconocida';
    const gInfo = det.grado?.establecimientoGrados?.[0];
    const cursos = gInfo?.cantidadCursos || 1;
    if (!subjectNeed[det.codAsignatura]) subjectNeed[det.codAsignatura] = { needed: 0, assigned: 0, name: asig };
    subjectNeed[det.codAsignatura].needed += (det.horas * cursos);
  });

  cargas.forEach(c => {
    if (c.tipoCarga === 'LECTIVA' && c.asignaturaCod && subjectNeed[c.asignaturaCod]) {
       subjectNeed[c.asignaturaCod].assigned += c.horasAllocadas;
    }
  });

  const subjectProgress = Object.values(subjectNeed).sort((a, b) => b.needed - a.needed);

  // Calculate metrics
  let totalHorasContrato = 0;
  let totalHorasAsignadas = 0;
  let totalJecAsignadas = 0;
  let totalBaseAsignadas = 0;
  let docentesAsignados = 0;
  let extraDistribution: Record<string, number> = {};

  for (const rel of rels) {
    const doc = rel.docente;
    const contrato = doc.totalDefinitivo || doc.totalJornada || doc.horasTitular || 0;
    totalHorasContrato += contrato;
    
    const docCargas = cargas.filter(c => c.docenteId === doc.id);
    let lectivasPed = 0;
    let anlCrono = 0;
    let extraCrono = 0;
    
    docCargas.forEach(c => {
      if (c.tipoCarga === 'LECTIVA') {
        lectivasPed += c.horasAllocadas;
        if (c.asignatura?.esTallerJec) totalJecAsignadas += c.horasAllocadas;
        else totalBaseAsignadas += c.horasAllocadas;
      } else if (c.tipoCarga === 'NO_LECTIVA') {
        anlCrono += c.horasAllocadas;
      } else if (c.tipoCarga === 'EXTRACURRICULAR') {
        extraCrono += c.horasAllocadas;
        const extraName = c.actividadExtracurricular?.descripcion || 'Otra Extra';
        extraDistribution[extraName] = (extraDistribution[extraName] || 0) + c.horasAllocadas;
      }
    });

    const colacion = contrato >= 30 ? 2 : 1;
    let recreoDecimal = 0;
    if (lectivasPed > 0) {
      const row = tablaConversion.find(r => r.lectivasPedagogicas === lectivasPed);
      if (row) {
         const [h, m] = row.recreoCronologicas.split(':').map(Number);
         recreoDecimal = h + (m / 60);
      }
    }
    
    let asigTotal = 0;
    if (lectivasPed > 0 || anlCrono > 0 || extraCrono > 0) {
      asigTotal = (lectivasPed * 45 / 60) + recreoDecimal + anlCrono + extraCrono + colacion;
    }
 
    totalHorasAsignadas += asigTotal;
    
    if (docCargas.length > 0) docentesAsignados++;
  }

  const chartExtra = Object.entries(extraDistribution).map(([name, value]) => ({ name, value }));

  return {
    totalDocentes: rels.length,
    docentesAsignados,
    totalHorasContrato: Math.round(totalHorasContrato),
    totalHorasAsignadas: Math.round(totalHorasAsignadas),
    horasOciosas: Math.round(totalHorasContrato - totalHorasAsignadas),
    totalBaseAsignadas,
    totalJecAsignadas,
    chartExtra,
    subjectProgress
  };
}

export async function getGlobalAnalytics() {
  const tablaConversion = await prisma.tablaConversion.findMany();
  const ests = await prisma.establecimiento.findMany({ orderBy: { esedDescripcion: 'asc' } });
  const rels = await prisma.docenteEstablecimiento.findMany({ include: { docente: true } });
  const cargas = await prisma.cargaHoraria.findMany();

  let schoolStats = [];
  let totalDocentesComuna = 0;
  let totalHorasComuna = 0;
  
  for (const est of ests) {
    const sRels = rels.filter(r => r.establecimientoId === est.esedSec);
    const sCargas = cargas.filter(c => c.planEstablecimientoId && est.esedSec === est.esedSec); // approximate by checking school later
    
    let estContrato = 0;
    let estAsignado = 0;
    
    sRels.forEach(r => {
      const contrato = r.docente.totalDefinitivo || r.docente.totalJornada || r.docente.horasTitular || 0;
      estContrato += contrato;
      totalDocentesComuna++;
      totalHorasComuna += contrato;
      
      const docCargas = cargas.filter(c => c.docenteId === r.docente.id);
      let lectPed = 0, noLect = 0, extra = 0;
      docCargas.forEach(c => {
        if(c.tipoCarga==='LECTIVA') lectPed += c.horasAllocadas;
        if(c.tipoCarga==='NO_LECTIVA') noLect += c.horasAllocadas;
        if(c.tipoCarga==='EXTRACURRICULAR') extra += c.horasAllocadas;
      });
      
      let colacion = contrato >= 30 ? 2 : 1;
      let recreoDecimal = 0;
      if (lectPed > 0) {
        const row = tablaConversion.find(r => r.lectivasPedagogicas === lectPed);
        if (row) recreoDecimal = parseCronoToDecimal(row.recreoCronologicas);
      }
      
      if (lectPed > 0 || noLect > 0 || extra > 0) {
        estAsignado += Math.round((lectPed * 45 / 60) + recreoDecimal) + noLect + extra + colacion;
      }

    });

    if (sRels.length > 0) {
      schoolStats.push({
        nombre: est.esedDescripcion,
        contrato: estContrato,
        asignado: estAsignado,
        ociosas: estContrato - estAsignado
      });
    }
  }

  // Sort by ociosas (Deficit vs Eficiencia)
  schoolStats.sort((a, b) => b.ociosas - a.ociosas);
  
  const topDeficit = schoolStats.slice(0, 5);
  const topEfficient = schoolStats.slice(-5).reverse();

  return {
    totalDocentesComuna,
    totalHorasComuna,
    topDeficit,
    topEfficient,
    schoolStats
  };
}

export async function getTodosDetallesPlanEstablecimiento(establecimientoId: number) {
  return await prisma.planEstablecimientoDet.findMany({
    where: { 
      planEstablecimiento: { establecimientoId }
    },
    include: { 
      asignatura: true,
      planEstablecimiento: true
    }
  });
}

// --- USUARIOS ---
export async function getUsuarios() {
  return await prisma.usuario.findMany({
    orderBy: { nombre: 'asc' },
    include: { establecimiento: true }
  });
}

export async function createUsuario(data: any) {
  return await prisma.usuario.create({
    data: {
      email: data.email,
      nombre: data.nombre,
      password: data.password,
      rol: data.rol,
      establecimientoId: data.establecimientoId || null
    }
  });
}

export async function updateUsuario(id: number, data: any) {
  return await prisma.usuario.update({
    where: { id },
    data: {
      email: data.email,
      nombre: data.nombre,
      password: data.password,
      rol: data.rol,
      establecimientoId: data.establecimientoId || null
    }
  });
}

export async function deleteUsuario(id: number) {
  return await prisma.usuario.delete({
    where: { id }
  });
}
