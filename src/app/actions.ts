'use server';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  __cmdsCache?: Map<string, { data: any; expiresAt: number }>;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();
globalForPrisma.prisma = prisma;

const memoryCache =
  globalForPrisma.__cmdsCache ?? new Map<string, { data: any; expiresAt: number }>();
globalForPrisma.__cmdsCache = memoryCache;

async function getCached<T>(key: string, fetcher: () => Promise<T>, ttlMs = 300_000): Promise<T> {
  const now = Date.now();
  const entry = memoryCache.get(key);
  if (entry && entry.expiresAt > now) {
    return entry.data as T;
  }
  const data = await fetcher();
  memoryCache.set(key, { data, expiresAt: now + ttlMs });
  return data;
}

function invalidateCache(...keys: string[]) {
  for (const k of keys) {
    memoryCache.delete(k);
  }
}

async function verificarEstablecimientoNoBloqueado(establecimientoId?: number | null) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'cmds2026_super_secret_key');
      const { payload } = await jose.jwtVerify(token, secret);
      if (payload.rol === 'ADMIN') return; // Los administradores siempre pueden modificar
      const targetEstId = establecimientoId || (payload.establecimientoId as number | undefined);
      if (targetEstId) {
        const est = await prisma.establecimiento.findUnique({
          where: { esedSec: Number(targetEstId) },
          select: { bloqueado: true }
        });
        if (est?.bloqueado) {
          throw new Error(
            'El proceso de carga horaria de este establecimiento ha sido cerrado y bloqueado por Administración. No se permiten modificaciones.'
          );
        }
      }
    }
  } catch (err: any) {
    if (err?.message?.includes('cerrado y bloqueado')) {
      throw err;
    }
  }
}

export async function toggleBloqueoEstablecimiento(establecimientoId: number, bloqueado: boolean) {
  const res = await prisma.establecimiento.update({
    where: { esedSec: establecimientoId },
    data: { bloqueado }
  });
  invalidateCache('establecimientos');
  return res;
}

export async function getDocentes() {
  return await prisma.docente.findMany({ orderBy: { apellidos: 'asc' } });
}

export async function getTiposEnsenanza() {
  return await getCached('tipos-ensenanza', () =>
    prisma.tipoEnsenanza.findMany({
      orderBy: { tienDescripcion: 'asc' }
    })
  );
}

export async function getGrados() {
  return await getCached('grados-base', () =>
    prisma.grado.findMany({
      include: { tipoEnsenanza: true },
      orderBy: [{ tienCod: 'asc' }, { grteCod: 'asc' }]
    })
  );
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
          tipoEnsenanza: true,
          grado: true
        },
        orderBy: [{ tienCod: 'asc' }, { grteCod: 'asc' }, { codAsignatura: 'asc' }]
      }
    }
  });
}

export async function getEstablecimientos() {
  return await getCached('establecimientos', () =>
    prisma.establecimiento.findMany({
      orderBy: {
        esedDescripcion: 'asc'
      }
    })
  );
}

export async function updatePlanEstudioEstado(codPlan: number, nuevoEstado: string) {
  return await prisma.planEstudioEnc.update({
    where: { codPlan },
    data: { estadoPlan: nuevoEstado }
  });
}

export async function clonarPlanEstudioBase(establecimientoId: number, codPlanBase: number, nombre: string) {
  await verificarEstablecimientoNoBloqueado(establecimientoId);
  // Obtener el plan base con sus detalles
  const planBase = await prisma.planEstudioEnc.findUnique({
    where: { codPlan: codPlanBase },
    include: { detalles: true }
  });

  if (!planBase) return { error: "Plan base no encontrado" };

  // Obtener tipos de enseñanza autorizados
  const tiposAutorizados = await prisma.establecimientoTipoEnsenanza.findMany({
    where: { establecimientoId }
  });
  const tiposPermitidos = new Set(tiposAutorizados.map((t: any) => t.tienCod));

  // Obtener la configuración de JEC por grado
  const estabGrados = await prisma.establecimientoGrado.findMany({
    where: { establecimientoId }
  });
  const isJecMap = new Map();
  for (const g of estabGrados) {
    if (g.cantidadCursos > 0) { isJecMap.set(`${g.tienCod}-${g.grteCod}`, g.esJec); }
  }

  const detallesFiltrados = planBase.detalles.filter((det: any) => {
    if (tiposPermitidos.size > 0 && !tiposPermitidos.has(det.tienCod)) {
      return false;
    }
    return true;
  });

  if (detallesFiltrados.length === 0) {
    return { error: "El decreto seleccionado no contiene asignaturas para los Tipos de Enseñanza que tu colegio tiene autorizados." };
  }

  // Crear la cabecera del plan propio
  const estab = await prisma.establecimiento.findUnique({ where: { esedSec: establecimientoId } });

  const planPropio = await prisma.planEstablecimiento.create({
    data: {
      establecimientoId,
      codPlanBase,
      nombre,
      detalles: {
        create: detallesFiltrados.reduce((acc: any[], det: any) => {
          const key = `${det.tienCod}-${det.grteCod}`;
          // Solo insertar si el colegio realmente tiene configurado este grado
          if (!isJecMap.has(key)) return acc;

          const esGradoJec = isJecMap.get(key);
          const horasFinales = esGradoJec ? (det.horasCJ || 0) : (det.horasSJ || 0);
          if (horasFinales > 0) {
            acc.push({
              tienCod: det.tienCod,
              grteCod: det.grteCod,
              codAsignatura: det.codAsignatura,
              horas: horasFinales,
              obligatoria: det.obligatoria,
              formacion: det.formacion,
              esPropio: false
            });
          }
          return acc;
        }, [])
      }
    }
  });

  return { success: true, planPropio };
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

export async function updateEstablecimientoConfig(establecimientoId: number, esJec: boolean, gradosData: {tienCod: number, grteCod: number, cantidadCursos: number, esJec: boolean}[], tiposData: number[], letrasData: any[] = [], especialidades: string[] = []) {
  await verificarEstablecimientoNoBloqueado(establecimientoId);
  // Solo actualiza JEC y grados.

  const estabOld = await prisma.establecimiento.findUnique({ where: { esedSec: establecimientoId } });
  
  await prisma.establecimiento.update({
    where: { esedSec: establecimientoId },
    data: { esJec, especialidades }
  });

  await Promise.all(gradosData.map(g => 
    prisma.establecimientoGrado.upsert({
      where: {
        establecimientoId_tienCod_grteCod: {
          establecimientoId,
          tienCod: g.tienCod,
          grteCod: g.grteCod
        }
      },
      update: { cantidadCursos: g.cantidadCursos, esJec: g.esJec },
      create: {
        establecimientoId,
        tienCod: g.tienCod,
        grteCod: g.grteCod,
        cantidadCursos: g.cantidadCursos,
        esJec: g.esJec
      }
    })
  ));

  // Si cambió la bandera JEC, recalcular las horas de todos los planes propios asociados a este establecimiento
  if (estabOld && estabOld.esJec !== esJec) {
    const planesPropios = await prisma.planEstablecimiento.findMany({
      where: { establecimientoId },
      include: {
        planBase: { include: { detalles: true } },
        detalles: { where: { esPropio: false } }
      }
    });

    const updates: Promise<any>[] = [];
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
            updates.push(prisma.planEstablecimientoDet.update({
              where: { id: detPropio.id },
              data: { horas: nuevasHoras }
            }));
          }
        }
      }
    }
        await Promise.all(updates);
    }

  // Sync letras
  if (letrasData && letrasData.length > 0) {
    await prisma.establecimientoCursoLetra.deleteMany({
      where: { establecimientoId }
    });
    await prisma.establecimientoCursoLetra.createMany({
      data: letrasData.map(l => ({
        establecimientoId,
        tienCod: l.tienCod,
        grteCod: l.grteCod,
        letra: l.letra,
        esJec: l.esJec,
        planEstablecimientoId: l.planEstablecimientoId || null
      }))
    });
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

export async function actualizarHorasDetallePropio(detalleId: number, horas: number, grupos?: number | null) {
  await verificarEstablecimientoNoBloqueado();
  if (horas <= 0) {
    const det = await prisma.planEstablecimientoDet.findUnique({
      where: { id: detalleId },
      include: { asignatura: true, grado: true }
    });
    if (det) {
      const cargaExistente = await prisma.cargaHoraria.findFirst({
        where: {
          planEstablecimientoId: det.planEstablecimientoId,
          tienCod: det.tienCod,
          grteCod: det.grteCod,
          asignaturaCod: det.codAsignatura,
          especialidad: det.especialidad || null,
          horasAllocadas: { gt: 0 }
        },
        include: { docente: true }
      });
      if (cargaExistente) {
        return {
          error: `No se puede dejar en 0 horas "${det.asignatura?.asigDescripcion || det.codAsignatura}" en ${det.grado?.grteDescrip || 'este curso'} porque ya tiene horas asignadas al docente ${cargaExistente.docente.nombres} ${cargaExistente.docente.apellidos}. Debe quitarle esa carga al docente primero.`
        };
      }
    }
  }
  return await prisma.planEstablecimientoDet.update({
    where: { id: detalleId },
    data: { horas, grupos: grupos !== undefined ? grupos : undefined }
  });
}

export async function eliminarDetallePropio(detalleId: number | number[]) {
  await verificarEstablecimientoNoBloqueado();
  const ids = Array.isArray(detalleId) ? detalleId : [detalleId];
  if (ids.length === 0) return { success: true };

  const detalles = await prisma.planEstablecimientoDet.findMany({
    where: { id: { in: ids } },
    include: { asignatura: true, grado: true }
  });

  for (const det of detalles) {
    const cargaExistente = await prisma.cargaHoraria.findFirst({
      where: {
        planEstablecimientoId: det.planEstablecimientoId,
        tienCod: det.tienCod,
        grteCod: det.grteCod,
        asignaturaCod: det.codAsignatura,
        especialidad: det.especialidad || null
      },
      include: { docente: true }
    });

    if (cargaExistente) {
      return {
        error: `No se puede eliminar "${det.asignatura?.asigDescripcion || det.codAsignatura}" en ${det.grado?.grteDescrip || 'este curso'} porque ya tiene horas asignadas al docente ${cargaExistente.docente.nombres} ${cargaExistente.docente.apellidos}. Debe quitarle esa carga al docente antes de eliminarla del plan.`
      };
    }
  }

  await prisma.planEstablecimientoDet.deleteMany({
    where: { id: { in: ids } }
  });

  return { success: true };
}

export async function importarPlanBaseAPropio(planPropioId: number, codPlanBase: number) {
  await verificarEstablecimientoNoBloqueado();
  // Obtener el plan base con sus detalles
  const planBase = await prisma.planEstudioEnc.findUnique({
    where: { codPlan: codPlanBase },
    include: { detalles: true }
  });

  if (!planBase) return { error: "Plan base no encontrado" };

  // Obtener si el colegio es JEC para saber qué horas traer
  const planPropio = await prisma.planEstablecimiento.findUnique({
    where: { id: planPropioId },
    include: { establecimiento: true }
  });
  
  if (!planPropio) return { error: "Plan propio no encontrado" };
  
  const esJec = planPropio.establecimiento.esJec || false;

  // Obtener los Tipos de Enseñanza autorizados para este colegio
  const tiposAutorizados = await prisma.establecimientoTipoEnsenanza.findMany({
    where: { establecimientoId: planPropio.establecimiento.esedSec }
  });
  const tiposPermitidos = new Set(tiposAutorizados.map((t: any) => t.tienCod));

  // Obtener la configuración de JEC por grado
  const estabGrados = await prisma.establecimientoGrado.findMany({
    where: { establecimientoId: planPropio.establecimiento.esedSec }
  });
  const isJecMap = new Map();
  for (const g of estabGrados) {
    if (g.cantidadCursos > 0) { isJecMap.set(`${g.tienCod}-${g.grteCod}`, g.esJec); }
  }

  let insertados = 0;
  // Insertar cada detalle nuevo
  for (const det of planBase.detalles) {
    // Filtrar automáticamente: si el colegio tiene tipos configurados, solo clonamos los que le corresponden.
    if (tiposPermitidos.size > 0 && !tiposPermitidos.has(det.tienCod)) {
      continue;
    }
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
      const key = `${det.tienCod}-${det.grteCod}`;
      // Solo insertar si el colegio realmente tiene configurado este grado
      if (!isJecMap.has(key)) continue;

      const esGradoJec = isJecMap.get(key);
      const horasFinales = esGradoJec ? (det.horasCJ || 0) : (det.horasSJ || 0);
      if (horasFinales === 0) continue;

      await prisma.planEstablecimientoDet.create({
        data: {
          planEstablecimientoId: planPropioId,
          tienCod: det.tienCod,
          grteCod: det.grteCod,
          codAsignatura: det.codAsignatura,
          horas: horasFinales,
          obligatoria: det.obligatoria,
          formacion: det.formacion,
          esPropio: false
        }
      });
      insertados++;
    }
  }

  if (insertados === 0) {
    return { error: "No se importó ninguna asignatura. Es posible que el decreto no aplique para los Tipos de Enseñanza autorizados en tu colegio, o que las asignaturas ya existieran." };
  }
  return { success: true };
}

export async function eliminarPlanPropio(planId: number) {
  await verificarEstablecimientoNoBloqueado();

  const cargaExistente = await prisma.cargaHoraria.findFirst({
    where: { planEstablecimientoId: planId },
    include: { docente: true, asignatura: true }
  });

  if (cargaExistente) {
    return {
      error: `No se puede eliminar este plan porque ya tiene horas asignadas al docente ${cargaExistente.docente.nombres} ${cargaExistente.docente.apellidos}${cargaExistente.asignatura ? ` (${cargaExistente.asignatura.asigDescripcion})` : ''}. Debe quitar la carga horaria asociada antes de eliminar el plan.`
    };
  }

  // Primero eliminar los detalles (si no hay cascade deletion configurado)
  await prisma.planEstablecimientoDet.deleteMany({
    where: { planEstablecimientoId: planId }
  });
  
  // Luego eliminar el plan
  await prisma.planEstablecimiento.delete({
    where: { id: planId }
  });

  return { success: true };
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
  codAsignatura: string,
  categoria: string = 'BASE',
  especialidad: string | null = null
) {
  const existe = await prisma.planEstablecimientoDet.findFirst({
    where: {
      planEstablecimientoId: planPropioId,
      tienCod,
      grteCod,
      codAsignatura,
      especialidad
    }
  });

  if (!existe) {
    await prisma.planEstablecimientoDet.create({
      data: {
        planEstablecimientoId: planPropioId,
        tienCod,
        grteCod,
        codAsignatura,
        horas: 0,
        obligatoria: 'NO',
        formacion: 'General',
        esPropio: true,
        categoria,
        especialidad
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

  const letras = await prisma.establecimientoCursoLetra.findMany({
    where: { establecimientoId }
  });

  // Filtrar estrictamente solo los grados que tienen dotación de cursos asignada.
  const filtrados = estGrados.filter(eg => eg.cantidadCursos > 0);

  return filtrados.map(eg => ({
    ...eg.grado,
    cantidadCursos: eg.cantidadCursos,
    letrasCustom: letras.filter(l => l.tienCod === eg.tienCod && l.grteCod === eg.grteCod).map(l => l.letra)
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
  await verificarEstablecimientoNoBloqueado(establecimientoId);
  let fallbackPlanId: number | null = null;
  if (establecimientoId) {
    const firstPlan = await prisma.planEstablecimiento.findFirst({ where: { establecimientoId } });
    if (firstPlan) fallbackPlanId = firstPlan.id;
  }

  // Replace all assignments for this teacher
  await prisma.cargaHoraria.deleteMany({
    where: { docenteId }
  });
  
  if (cargas.length > 0) {
    await prisma.cargaHoraria.createMany({
      data: cargas.map(c => {
        // Fix para Extracurriculares/No lectivas que envian planId=1 cuando no hay seleccion
        let pid = c.planEstablecimientoId;
        if (pid === 1 && fallbackPlanId) pid = fallbackPlanId;
        
        return {
          docenteId,
          planEstablecimientoId: pid,
          tienCod: c.tienCod || null,
          grteCod: c.grteCod || null,
          asignaturaCod: c.codAsignatura || null,
          actividadNoLectivaId: c.actividadNoLectivaId || null,
          actividadExtracurricularId: c.actividadExtracurricularId || null,
          financiamiento: c.financiamiento || null,
          letraCurso: c.letraCurso || null,
          esDesdoble: c.esDesdoble || false,
          grupoDesdoble: c.grupoDesdoble || null,
          esCombinado: c.esCombinado || false,
          grupoCombinado: c.grupoCombinado || null,
          especialidad: c.especialidad || null,
          horasAllocadas: c.horas,
          tipoCarga: c.tipoCarga,
          observacion: ''
        };
      })
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
    where: { email },
    include: { establecimiento: true }
  });
  if (user && await bcrypt.compare(pass, user.password)) {
    const { password, establecimiento, ...safeUser } = user;
    
    // Generar JWT seguro
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'cmds2026_super_secret_key');
    const token = await new jose.SignJWT({ id: user.id, rol: user.rol, establecimientoId: user.establecimientoId })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('12h')
      .sign(secret);
    
    const cookieStore = await cookies();
    cookieStore.set('token', token, { httpOnly: true, path: '/' });

    return {
      ...safeUser,
      establecimientoNombre: establecimiento?.esedDescripcion || null,
      establecimientoBloqueado: establecimiento?.bloqueado || false
    };
  }
  return null;
}


export async function updateDocenteHoras(docenteId: number, horas: number) {
  await verificarEstablecimientoNoBloqueado();
  return await prisma.docente.update({
    where: { id: docenteId },
    data: { horasTitular: horas }
  });
}


export async function getTodasAsignaturas() {
  return await getCached('asignaturas', () =>
    prisma.asignatura.findMany({
      orderBy: { asigDescripcion: 'asc' }
    })
  );
}

export async function updateAsignaturaEspecialista(codAsignatura: string, esEspecialista: boolean) {
  const res = await prisma.asignatura.update({
    where: { asigCod: codAsignatura },
    data: { esEspecialistaSiempre: esEspecialista }
  });
  invalidateCache('asignaturas');
  return res;
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
      data: tienCods.map(t => ({
        establecimientoId,
        tienCod: t
      }))
    });
  }
  invalidateCache('establecimientos');
}

export async function getActividadesNoLectivas() {
  return await getCached('actividades-nl', () =>
    prisma.actividadNoLectiva.findMany({
      orderBy: { descripcion: 'asc' }
    })
  );
}

export async function createActividadNoLectiva(descripcion: string, esPlanificacion: boolean = false) {
  const res = await prisma.actividadNoLectiva.create({
    data: { descripcion, esPlanificacion }
  });
  invalidateCache('actividades-nl');
  return res;
}

export async function updateActividadNoLectiva(id: number, esPlanificacion: boolean) {
  const res = await prisma.actividadNoLectiva.update({
    where: { id },
    data: { esPlanificacion }
  });
  invalidateCache('actividades-nl');
  return res;
}

export async function deleteActividadNoLectiva(id: number) {
  const res = await prisma.actividadNoLectiva.delete({
    where: { id }
  });
  invalidateCache('actividades-nl');
  return res;
}

export async function createAsignatura(asigCod: string, asigDescripcion: string) {
  const res = await prisma.asignatura.create({
    data: { asigCod, asigDescripcion }
  });
  invalidateCache('asignaturas');
  return res;
}

export async function deleteAsignatura(asigCod: string) {
  const res = await prisma.asignatura.delete({
    where: { asigCod }
  });
  invalidateCache('asignaturas');
  return res;
}


export async function getTablaConversion() {
  return await getCached('tabla-conversion', () =>
    prisma.tablaConversion.findMany({
      orderBy: { jornadaSemanal: 'desc' }
    })
  );
}

export async function updateAsignaturaJec(asigCod: string, esTallerJec: boolean) {
  const res = await prisma.asignatura.update({
    where: { asigCod },
    data: { esTallerJec }
  });
  invalidateCache('asignaturas');
  return res;
}

export async function updateAsignaturaNombre(asigCod: string, asigDescripcion: string) {
  const res = await prisma.asignatura.update({
    where: { asigCod },
    data: { asigDescripcion }
  });
  invalidateCache('asignaturas');
  return res;
}

export async function getDashboardSummary(establecimientoId?: number) {
  if (establecimientoId) {
    const [docentes, config, grados] = await Promise.all([
      prisma.docenteEstablecimiento.count({ where: { establecimientoId } }),
      prisma.establecimiento.findUnique({ where: { esedSec: establecimientoId } }),
      prisma.establecimientoGrado.findMany({ where: { establecimientoId }, include: { grado: true } })
    ]);
    const totalCursos = grados.reduce((sum, g) => sum + g.cantidadCursos, 0);
    return { docentes, cursos: totalCursos, tipo: 'ESTABLECIMIENTO', nombre: config?.esedDescripcion || '' };
  } else {
    const [establecimientos, docentes, asignaturas] = await Promise.all([
      prisma.establecimiento.count(),
      prisma.docente.count(),
      prisma.asignatura.count()
    ]);
    return { establecimientos, docentes, asignaturas, tipo: 'GLOBAL' };
  }
}


// --- EXTRACURRICULARES ---
export async function getActividadesExtracurriculares() {
  return await getCached('actividades-ext', () =>
    prisma.actividadExtracurricular.findMany({
      orderBy: { descripcion: 'asc' }
    })
  );
}

export async function createActividadExtracurricular(descripcion: string, horasDefault?: number | null, topeMaximo?: number | null) {
  const res = await prisma.actividadExtracurricular.create({
    data: { descripcion, horasDefault: horasDefault || null, topeMaximo: topeMaximo || null }
  });
  invalidateCache('actividades-ext');
  return res;
}

export async function updateActividadExtracurricular(id: number, descripcion: string, horasDefault?: number | null, topeMaximo?: number | null) {
  const res = await prisma.actividadExtracurricular.update({
    where: { id },
    data: { descripcion, horasDefault: horasDefault || null, topeMaximo: topeMaximo || null }
  });
  invalidateCache('actividades-ext');
  return res;
}

export async function deleteActividadExtracurricular(id: number) {
  const res = await prisma.actividadExtracurricular.delete({
    where: { id }
  });
  invalidateCache('actividades-ext');
  return res;
}

// --- CONFIGURACION GLOBAL ---
export async function getConfiguracionGlobal() {
  return await getCached('config-global', async () => {
    let config = await prisma.configuracionGlobal.findFirst();
    if (!config) {
      config = await prisma.configuracionGlobal.create({
        data: { id: 1, horasColacion: 2, maxHorasPie: 3 }
      });
    }
    return config;
  });
}

export async function updateConfiguracionGlobal(horasColacion: number, maxHorasPie: number, porcentajeMinimoPlanificacion: number = 40) {
  const res = await prisma.configuracionGlobal.upsert({
    where: { id: 1 },
    update: { horasColacion, maxHorasPie, porcentajeMinimoPlanificacion },
    create: { id: 1, horasColacion, maxHorasPie, porcentajeMinimoPlanificacion }
  });
  invalidateCache('config-global');
  return res;
}

export async function getDashboardStats() {
  const [ests, rels] = await Promise.all([
    getEstablecimientos(),
    prisma.docenteEstablecimiento.findMany({
      include: { docente: true }
    })
  ]);

  const relsByEst = new Map<number, any[]>();
  for (const r of rels) {
    let list = relsByEst.get(r.establecimientoId);
    if (!list) {
      list = [];
      relsByEst.set(r.establecimientoId, list);
    }
    list.push(r);
  }

  const rows = ests
    .map(e => {
      const d = relsByEst.get(e.esedSec) || [];
      const totalHoras = d.reduce(
        (sum, r) =>
          sum + (r.docente.totalDefinitivo || r.docente.totalJornada || r.docente.horasTitular || 0),
        0
      );
      return {
        nombre: e.esedDescripcion,
        docentes: d.length,
        horas: totalHoras
      };
    })
    .filter(r => r.docentes > 0);

  return rows;
}

const parseCronoToDecimal = (crono: string) => {
  if (!crono) return 0;
  const parts = crono.split(':');
  if (parts.length !== 2) return 0;
  return parseInt(parts[0]) + parseInt(parts[1]) / 60;
};

export async function getSchoolAnalytics(establecimientoId: number) {
  const [est, tablaConversion, rels, cargas, planesDetalles] = await Promise.all([
    prisma.establecimiento.findUnique({ where: { esedSec: establecimientoId } }),
    getTablaConversion(),
    prisma.docenteEstablecimiento.findMany({
      where: { establecimientoId },
      include: { docente: true }
    }),
    prisma.cargaHoraria.findMany({
      where: { planEstablecimiento: { establecimientoId } },
      include: { asignatura: true, actividadExtracurricular: true }
    }),
    prisma.planEstablecimientoDet.findMany({
      where: { planEstablecimiento: { establecimientoId } },
      include: {
        asignatura: true,
        grado: {
          include: { establecimientoGrados: { where: { establecimientoId } } }
        }
      }
    })
  ]);

  const establecimientoNombre = est?.esedDescripcion || 'Establecimiento';
  const convByLectivas = new Map<number, any>();
  for (const row of tablaConversion) {
    convByLectivas.set(row.lectivasPedagogicas, row);
  }

  const subjectNeed: Record<string, { needed: number; assigned: number; name: string }> = {};

  planesDetalles.forEach(det => {
    const asig = det.asignatura?.asigDescripcion || 'Desconocida';
    const gInfo = det.grado?.establecimientoGrados?.[0];
    const cursos = gInfo?.cantidadCursos || 1;
    if (!subjectNeed[det.codAsignatura])
      subjectNeed[det.codAsignatura] = { needed: 0, assigned: 0, name: asig };
    subjectNeed[det.codAsignatura].needed += det.horas * (det.grupos ?? cursos);
  });

  const cargasByDocente = new Map<number, any[]>();
  cargas.forEach(c => {
    if (c.tipoCarga === 'LECTIVA' && c.asignaturaCod && subjectNeed[c.asignaturaCod]) {
      subjectNeed[c.asignaturaCod].assigned += c.horasAllocadas;
    }
    let list = cargasByDocente.get(c.docenteId);
    if (!list) {
      list = [];
      cargasByDocente.set(c.docenteId, list);
    }
    list.push(c);
  });

  const subjectProgress = Object.values(subjectNeed).sort((a, b) => b.needed - a.needed);

  let totalHorasContrato = 0;
  let totalHorasAsignadas = 0;
  let totalJecAsignadas = 0;
  let totalBaseAsignadas = 0;
  let docentesAsignados = 0;
  const extraDistribution: Record<string, number> = {};
  const contratoStatsMap: Record<
    string,
    { tipoContrato: string; totalConCarga: number; aceptados: number; rechazados: number; pendientes: number }
  > = {};
  let totalAceptados = 0;
  let totalRechazados = 0;
  let totalPendientes = 0;

  for (const rel of rels) {
    const doc = rel.docente;
    const contrato = doc.totalDefinitivo || doc.totalJornada || doc.horasTitular || 0;
    totalHorasContrato += contrato;

    const docCargas = cargasByDocente.get(doc.id) || [];
    let lectivasPed = 0;
    let anlCrono = 0;
    let extraCrono = 0;

    const combinados: Record<string, any[]> = {};
    docCargas.forEach(c => {
      if (c.tipoCarga === 'LECTIVA') {
        if (c.esCombinado && c.grupoCombinado) {
          const g = c.grupoCombinado.toUpperCase().trim();
          const asig = c.asignaturaCod || 'GEN';
          const key = `${asig}_${g}`;
          if (!combinados[key]) combinados[key] = [];
          combinados[key].push(c);
        } else {
          lectivasPed += c.horasAllocadas;
          if (c.asignatura?.esTallerJec) totalJecAsignadas += c.horasAllocadas;
          else totalBaseAsignadas += c.horasAllocadas;
        }
      } else if (c.tipoCarga === 'NO_LECTIVA') {
        anlCrono += c.horasAllocadas;
      } else if (c.tipoCarga === 'EXTRACURRICULAR') {
        extraCrono += c.horasAllocadas;
        const extraName = c.actividadExtracurricular?.descripcion || 'Otra Extra';
        extraDistribution[extraName] = (extraDistribution[extraName] || 0) + c.horasAllocadas;
      }
    });
    for (const g in combinados) {
      const maxC = combinados[g].reduce((prev: any, curr: any) =>
        prev.horasAllocadas > curr.horasAllocadas ? prev : curr
      );
      lectivasPed += maxC.horasAllocadas;
      if (maxC.asignatura?.esTallerJec) totalJecAsignadas += maxC.horasAllocadas;
      else totalBaseAsignadas += maxC.horasAllocadas;
    }

    const colacion = contrato >= 30 ? 2 : 1;
    let recreoDecimal = 0;
    if (lectivasPed > 0) {
      const row = convByLectivas.get(lectivasPed);
      if (row) {
        const [h, m] = row.recreoCronologicas.split(':').map(Number);
        recreoDecimal = h + m / 60;
      }
    }

    let asigTotal = 0;
    if (lectivasPed > 0 || anlCrono > 0 || extraCrono > 0) {
      asigTotal = (lectivasPed * 45) / 60 + recreoDecimal + anlCrono + extraCrono + colacion;
    }

    totalHorasAsignadas += asigTotal;

    if (docCargas.length > 0) {
      docentesAsignados++;
      const tipoContrato = (doc.contrato || doc.tipoContrato || 'SIN ESPECIFICAR').trim().toUpperCase();
      if (!contratoStatsMap[tipoContrato]) {
        contratoStatsMap[tipoContrato] = {
          tipoContrato,
          totalConCarga: 0,
          aceptados: 0,
          rechazados: 0,
          pendientes: 0
        };
      }
      contratoStatsMap[tipoContrato].totalConCarga++;
      const estado = (rel as any).estadoAceptacion || 'PENDIENTE';
      if (estado === 'ACEPTADO') {
        contratoStatsMap[tipoContrato].aceptados++;
        totalAceptados++;
      } else if (estado === 'RECHAZADO') {
        contratoStatsMap[tipoContrato].rechazados++;
        totalRechazados++;
      } else {
        contratoStatsMap[tipoContrato].pendientes++;
        totalPendientes++;
      }
    }
  }

  const chartExtra = Object.entries(extraDistribution).map(([name, value]) => ({ name, value }));

  return {
    establecimientoNombre,
    totalDocentes: rels.length,
    docentesAsignados,
    totalHorasContrato: Math.ceil(totalHorasContrato),
    totalHorasAsignadas: Math.ceil(totalHorasAsignadas),
    horasOciosas: Math.ceil(totalHorasContrato - totalHorasAsignadas),
    totalBaseAsignadas,
    totalJecAsignadas,
    chartExtra,
    subjectProgress,
    resolucionPorContrato: Object.values(contratoStatsMap)
      .sort((a, b) => b.totalConCarga - a.totalConCarga)
      .map(item => ({
        ...item,
        pctAceptados: item.totalConCarga > 0 ? Math.round((item.aceptados / item.totalConCarga) * 1000) / 10 : 0,
        pctRechazados: item.totalConCarga > 0 ? Math.round((item.rechazados / item.totalConCarga) * 1000) / 10 : 0,
        pctPendientes: item.totalConCarga > 0 ? Math.round((item.pendientes / item.totalConCarga) * 1000) / 10 : 0
      })),
    resumenResolucion: {
      totalConCarga: docentesAsignados,
      aceptados: totalAceptados,
      pctAceptados: docentesAsignados > 0 ? Math.round((totalAceptados / docentesAsignados) * 1000) / 10 : 0,
      rechazados: totalRechazados,
      pctRechazados: docentesAsignados > 0 ? Math.round((totalRechazados / docentesAsignados) * 1000) / 10 : 0,
      pendientes: totalPendientes,
      pctPendientes: docentesAsignados > 0 ? Math.round((totalPendientes / docentesAsignados) * 1000) / 10 : 0
    }
  };
}

export async function getGlobalAnalytics() {
  const [tablaConversion, ests, rels, cargas] = await Promise.all([
    getTablaConversion(),
    getEstablecimientos(),
    prisma.docenteEstablecimiento.findMany({ include: { docente: true } }),
    prisma.cargaHoraria.findMany()
  ]);

  const convByLectivas = new Map<number, any>();
  for (const row of tablaConversion) {
    convByLectivas.set(row.lectivasPedagogicas, row);
  }

  const relsByEst = new Map<number, any[]>();
  for (const r of rels) {
    let list = relsByEst.get(r.establecimientoId);
    if (!list) {
      list = [];
      relsByEst.set(r.establecimientoId, list);
    }
    list.push(r);
  }

  const cargasByDocente = new Map<number, any[]>();
  for (const c of cargas) {
    let list = cargasByDocente.get(c.docenteId);
    if (!list) {
      list = [];
      cargasByDocente.set(c.docenteId, list);
    }
    list.push(c);
  }

  const schoolStats = [];
  let totalDocentesComuna = 0;
  let totalHorasComuna = 0;
  let totalDocentesConCargaComuna = 0;
  let totalAceptadosComuna = 0;
  let totalRechazadosComuna = 0;
  let totalPendientesComuna = 0;
  const contratoStatsGlobalMap: Record<
    string,
    { tipoContrato: string; totalConCarga: number; aceptados: number; rechazados: number; pendientes: number }
  > = {};

  for (const est of ests) {
    const sRels = relsByEst.get(est.esedSec) || [];
    if (sRels.length === 0) continue;

    let estContrato = 0;
    let estAsignado = 0;
    let estDocentesConCarga = 0;
    let estAceptados = 0;
    let estRechazados = 0;
    let estPendientes = 0;

    for (const r of sRels) {
      const contrato =
        r.docente.totalDefinitivo || r.docente.totalJornada || r.docente.horasTitular || 0;
      estContrato += contrato;
      totalDocentesComuna++;
      totalHorasComuna += contrato;

      const docCargas = cargasByDocente.get(r.docente.id) || [];
      let lectPed = 0,
        noLect = 0,
        extra = 0;
      const combinadosRpt: Record<string, number[]> = {};
      for (const c of docCargas) {
        if (c.tipoCarga === 'LECTIVA') {
          if (c.esCombinado && c.grupoCombinado) {
            const g = c.grupoCombinado.toUpperCase().trim();
            const asig = c.asignaturaCod || 'GEN';
            const key = `${asig}_${g}`;
            if (!combinadosRpt[key]) combinadosRpt[key] = [];
            combinadosRpt[key].push(c.horasAllocadas);
          } else {
            lectPed += c.horasAllocadas;
          }
        }
        if (c.tipoCarga === 'NO_LECTIVA') noLect += c.horasAllocadas;
        if (c.tipoCarga === 'EXTRACURRICULAR') extra += c.horasAllocadas;
      }
      for (const g in combinadosRpt) {
        lectPed += Math.max(...combinadosRpt[g]);
      }

      const colacion = contrato >= 30 ? 2 : 1;
      let recreoDecimal = 0;
      if (lectPed > 0) {
        const row = convByLectivas.get(lectPed);
        if (row) recreoDecimal = parseCronoToDecimal(row.recreoCronologicas);
      }

      if (lectPed > 0 || noLect > 0 || extra > 0) {
        estAsignado += Math.ceil((lectPed * 45) / 60 + recreoDecimal + noLect + extra + colacion);
        estDocentesConCarga++;
        totalDocentesConCargaComuna++;

        const tipoContrato = (r.docente.contrato || r.docente.tipoContrato || 'SIN ESPECIFICAR')
          .trim()
          .toUpperCase();
        if (!contratoStatsGlobalMap[tipoContrato]) {
          contratoStatsGlobalMap[tipoContrato] = {
            tipoContrato,
            totalConCarga: 0,
            aceptados: 0,
            rechazados: 0,
            pendientes: 0
          };
        }
        contratoStatsGlobalMap[tipoContrato].totalConCarga++;

        const estado = (r as any).estadoAceptacion || 'PENDIENTE';
        if (estado === 'ACEPTADO') {
          contratoStatsGlobalMap[tipoContrato].aceptados++;
          totalAceptadosComuna++;
          estAceptados++;
        } else if (estado === 'RECHAZADO') {
          contratoStatsGlobalMap[tipoContrato].rechazados++;
          totalRechazadosComuna++;
          estRechazados++;
        } else {
          contratoStatsGlobalMap[tipoContrato].pendientes++;
          totalPendientesComuna++;
          estPendientes++;
        }
      }
    }

    schoolStats.push({
      nombre: est.esedDescripcion,
      contrato: estContrato,
      asignado: estAsignado,
      ociosas: estContrato - estAsignado,
      totalDocentes: sRels.length,
      docentesConCarga: estDocentesConCarga,
      aceptados: estAceptados,
      rechazados: estRechazados,
      pendientes: estPendientes
    });
  }

  schoolStats.sort((a, b) => b.ociosas - a.ociosas);

  const topDeficit = schoolStats.slice(0, 5);
  const topEfficient = schoolStats.slice(-5).reverse();

  return {
    totalDocentesComuna,
    totalHorasComuna,
    topDeficit,
    topEfficient,
    schoolStats,
    resolucionPorContrato: Object.values(contratoStatsGlobalMap)
      .sort((a, b) => b.totalConCarga - a.totalConCarga)
      .map(item => ({
        ...item,
        pctAceptados: item.totalConCarga > 0 ? Math.round((item.aceptados / item.totalConCarga) * 1000) / 10 : 0,
        pctRechazados: item.totalConCarga > 0 ? Math.round((item.rechazados / item.totalConCarga) * 1000) / 10 : 0,
        pctPendientes: item.totalConCarga > 0 ? Math.round((item.pendientes / item.totalConCarga) * 1000) / 10 : 0
      })),
    resumenResolucion: {
      totalConCarga: totalDocentesConCargaComuna,
      aceptados: totalAceptadosComuna,
      pctAceptados:
        totalDocentesConCargaComuna > 0
          ? Math.round((totalAceptadosComuna / totalDocentesConCargaComuna) * 1000) / 10
          : 0,
      rechazados: totalRechazadosComuna,
      pctRechazados:
        totalDocentesConCargaComuna > 0
          ? Math.round((totalRechazadosComuna / totalDocentesConCargaComuna) * 1000) / 10
          : 0,
      pendientes: totalPendientesComuna,
      pctPendientes:
        totalDocentesConCargaComuna > 0
          ? Math.round((totalPendientesComuna / totalDocentesConCargaComuna) * 1000) / 10
          : 0
    }
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

export async function sincronizarHorasDecreto(codPlanBase: number) {
  const planBase = await prisma.planEstudioEnc.findUnique({
    where: { codPlan: codPlanBase },
    include: { detalles: true }
  });
  if (!planBase) return { error: 'Plan base no encontrado' };

  const ests = await prisma.establecimiento.findMany();
  const estMap = new Map(ests.map((e: any) => [e.esedSec, e.esJec]));
  
  const eGrados = await prisma.establecimientoGrado.findMany();
  const jecMap = new Map();
  for (const g of eGrados) {
     jecMap.set(`${g.establecimientoId}-${g.tienCod}-${g.grteCod}`, g.esJec);
  }

  let actualizados = 0;
  for (const detBase of planBase.detalles) {
    const childDetails = await prisma.planEstablecimientoDet.findMany({
      where: {
        tienCod: detBase.tienCod,
        grteCod: detBase.grteCod,
        codAsignatura: detBase.codAsignatura,
        esPropio: false
      },
      include: { planEstablecimiento: true }
    });

    for (const cDet of childDetails) {
      const estId = cDet.planEstablecimiento.establecimientoId;
      const key = `${estId}-${cDet.tienCod}-${cDet.grteCod}`;
      const esGradoJec = jecMap.has(key) ? jecMap.get(key) : (estMap.get(estId) || false);
      const nuevasHoras = esGradoJec ? (detBase.horasCJ || 0) : (detBase.horasSJ || 0);
      
      if (cDet.horas !== nuevasHoras) {
        await prisma.planEstablecimientoDet.update({
          where: { id: cDet.id },
          data: { horas: nuevasHoras }
        });
        actualizados++;
      }
    }
  }
  return { success: true, actualizados };
}

// --- USUARIOS ---
export async function getUsuarios() {
  return await prisma.usuario.findMany({
    orderBy: { nombre: 'asc' },
    include: { establecimiento: true }
  });
}

export async function createUsuario(data: any) {
  if (data.password) data.password = await bcrypt.hash(data.password, 10);
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
  if (data.password) data.password = await bcrypt.hash(data.password, 10);
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

export async function updatePlanBaseDetHoras(detalleId: number, horasCJ: number, horasSJ: number) { return await prisma.planEstudioDet.update({ where: { id: detalleId }, data: { horasCJ, horasSJ } }); }

export async function createOrUpdateDocente(establecimientoId: number, data: { rut: string; nombres: string; apellidoPaterno: string; apellidoMaterno: string; horasTitular: number; contrato: string }) {
  let doc = await prisma.docente.findUnique({ where: { rut: data.rut } });
  if (!doc) {
    doc = await prisma.docente.create({
      data: {
        rut: data.rut,
        nombres: data.nombres,
        apellidos: `${data.apellidoPaterno} ${data.apellidoMaterno}`.trim(),
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno,
        horasTitular: data.horasTitular,
        contrato: data.contrato
      }
    });
  } else {
    doc = await prisma.docente.update({
      where: { rut: data.rut },
      data: {
        nombres: data.nombres,
        apellidos: `${data.apellidoPaterno} ${data.apellidoMaterno}`.trim(),
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno,
        horasTitular: data.horasTitular,
        contrato: data.contrato
      }
    });
  }
  
  await prisma.docenteEstablecimiento.upsert({
    where: {
      docenteId_establecimientoId: {
        docenteId: doc.id,
        establecimientoId
      }
    },
    update: {},
    create: {
      docenteId: doc.id,
      establecimientoId
    }
  });
  
  return doc;
}

export async function deleteDocente(docenteId: number, establecimientoId: number) {
  const cargas = await prisma.cargaHoraria.findFirst({
    where: { 
      docenteId,
      planEstablecimiento: { establecimientoId } 
    }
  });
  
  if (cargas) {
    return { error: 'El docente tiene carga horaria asignada en este establecimiento. Debe removerla antes de eliminarlo.' };
  }
  
  await prisma.docenteEstablecimiento.delete({
    where: {
      docenteId_establecimientoId: {
        docenteId,
        establecimientoId
      }
    }
  });
  
  return { success: true };
}

export async function getCargaDocenteUnico(docenteId: number, establecimientoId: number) {
  return await prisma.cargaHoraria.findMany({
    where: {
      docenteId,
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


export async function resetPassword(id: number) {
  const hash = await bcrypt.hash('Cmds2027', 10);
  return await prisma.usuario.update({
    where: { id },
    data: { password: hash, debeCambiarPassword: true }
  });
}

export async function changePassword(id: number, newPass: string) {
  const hash = await bcrypt.hash(newPass, 10);
  return await prisma.usuario.update({
    where: { id },
    data: { password: hash, debeCambiarPassword: false }
  });
}

export async function logoutUsuario() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}


export async function getCursosLetra(establecimientoId: number) {
  return await prisma.establecimientoCursoLetra.findMany({
    where: { establecimientoId }
  });
}


export async function updateEspecialidadAsignaturaPropia(
  planPropioId: number,
  codAsignatura: string,
  oldEspecialidad: string | null,
  newEspecialidad: string | null
) {
  await prisma.planEstablecimientoDet.updateMany({
    where: {
      planEstablecimientoId: planPropioId,
      codAsignatura,
      especialidad: oldEspecialidad
    },
    data: {
      especialidad: newEspecialidad
    }
  });
}

export async function crearDocenteComodin(
  establecimientoId: number,
  horasTitular: number,
  glosa?: string,
  contrato: string = 'VACANTE'
) {
  const est = await prisma.establecimiento.findUnique({
    where: { esedSec: establecimientoId }
  });
  const rbdPrefix = est?.esedCod || String(establecimientoId);

  const docentesEst = await prisma.docente.findMany({
    where: {
      establecimientos: { some: { establecimientoId } }
    }
  });

  // Buscar el mayor correlativo NN existente en este establecimiento
  let maxNum = 0;
  docentesEst.forEach(d => {
    const matchApellido = d.apellidoPaterno?.match(/^NN(\d+)$/i);
    if (matchApellido) {
      const n = parseInt(matchApellido[1], 10);
      if (n > maxNum) maxNum = n;
    }
    const matchRut = d.rut?.match(/^NN-[^-]+-(\d+)$/i);
    if (matchRut) {
      const n = parseInt(matchRut[1], 10);
      if (n > maxNum) maxNum = n;
    }
  });

  let nextNum = maxNum + 1;
  let rutComodin = `NN-${rbdPrefix}-${nextNum}`;

  // Asegurar que el RUT no exista globalmente
  while (await prisma.docente.findUnique({ where: { rut: rutComodin } })) {
    nextNum++;
    rutComodin = `NN-${rbdPrefix}-${nextNum}`;
  }

  const codigoNN = `NN${nextNum}`;
  const nombreFinal = glosa && glosa.trim() ? glosa.trim().toUpperCase() : 'POR ASIGNAR';
  const apellidoPaterno = codigoNN;
  const apellidoMaterno = 'VACANTE';

  const doc = await prisma.docente.create({
    data: {
      rut: rutComodin,
      nombres: nombreFinal,
      apellidoPaterno,
      apellidoMaterno,
      apellidos: `${apellidoPaterno} ${apellidoMaterno}`,
      horasTitular,
      contrato
    }
  });

  await prisma.docenteEstablecimiento.create({
    data: {
      docenteId: doc.id,
      establecimientoId
    }
  });

  return doc;
}

export async function reemplazarDocenteComodin(
  docenteComodinId: number,
  establecimientoId: number,
  data: {
    rut: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    horasTitular: number;
    contrato: string;
  }
) {
  const rutClean = data.rut.trim();
  const apellidosFull = `${data.apellidoPaterno} ${data.apellidoMaterno}`.trim();
  const existente = await prisma.docente.findUnique({ where: { rut: rutClean } });

  // Si el docente real ya existe en la BD (ej. trabaja en otro colegio de la CMDS)
  if (existente && existente.id !== docenteComodinId) {
    const relComodin = await prisma.docenteEstablecimiento.findUnique({
      where: {
        docenteId_establecimientoId: {
          docenteId: docenteComodinId,
          establecimientoId
        }
      }
    });

    await prisma.docenteEstablecimiento.upsert({
      where: {
        docenteId_establecimientoId: {
          docenteId: existente.id,
          establecimientoId
        }
      },
      update: {
        observacionCarga: relComodin?.observacionCarga || undefined
      },
      create: {
        docenteId: existente.id,
        establecimientoId,
        observacionCarga: relComodin?.observacionCarga || null
      }
    });

    // Traspasar todas las cargas de este establecimiento del comodín al docente real
    await prisma.cargaHoraria.updateMany({
      where: {
        docenteId: docenteComodinId,
        planEstablecimiento: { establecimientoId }
      },
      data: {
        docenteId: existente.id
      }
    });

    // Eliminar vínculo y registro del comodín
    await prisma.docenteEstablecimiento.deleteMany({
      where: { docenteId: docenteComodinId, establecimientoId }
    });
    const otrosVinculos = await prisma.docenteEstablecimiento.count({
      where: { docenteId: docenteComodinId }
    });
    if (otrosVinculos === 0) {
      await prisma.docente.delete({ where: { id: docenteComodinId } });
    }

    return existente;
  }

  // Si el RUT no existe aún, simplemente actualizamos el registro del comodín con los datos reales
  return await prisma.docente.update({
    where: { id: docenteComodinId },
    data: {
      rut: rutClean,
      nombres: data.nombres.trim().toUpperCase(),
      apellidoPaterno: data.apellidoPaterno.trim().toUpperCase(),
      apellidoMaterno: data.apellidoMaterno.trim().toUpperCase(),
      apellidos: apellidosFull.toUpperCase(),
      horasTitular: data.horasTitular,
      contrato: data.contrato
    }
  });
}

export async function convertirDocenteEnVacante(
  docenteId: number,
  establecimientoId: number,
  glosa?: string,
  desvincularSaliente: boolean = true
) {
  const docSaliente = await prisma.docente.findUnique({
    where: { id: docenteId }
  });
  if (!docSaliente) {
    throw new Error('Docente no encontrado');
  }

  const relSaliente = await prisma.docenteEstablecimiento.findUnique({
    where: {
      docenteId_establecimientoId: {
        docenteId,
        establecimientoId
      }
    }
  });

  const horasVacante =
    docSaliente.totalDefinitivo ||
    docSaliente.totalJornada ||
    docSaliente.horasTitular ||
    44;

  const glosaFinal =
    glosa && glosa.trim()
      ? glosa.trim().toUpperCase()
      : `REEMP. ${docSaliente.apellidoPaterno || docSaliente.nombres}`.trim().toUpperCase();

  // Crear el comodín NN en este establecimiento
  const nuevoComodin = await crearDocenteComodin(
    establecimientoId,
    horasVacante,
    glosaFinal,
    'VACANTE'
  );

  // Copiar observación de carga si existía
  if (relSaliente?.observacionCarga) {
    await prisma.docenteEstablecimiento.update({
      where: {
        docenteId_establecimientoId: {
          docenteId: nuevoComodin.id,
          establecimientoId
        }
      },
      data: {
        observacionCarga: relSaliente.observacionCarga
      }
    });
  }

  // Traspasar toda la carga horaria de este establecimiento al nuevo comodín NN
  await prisma.cargaHoraria.updateMany({
    where: {
      docenteId,
      planEstablecimiento: { establecimientoId }
    },
    data: {
      docenteId: nuevoComodin.id
    }
  });

  // Desvincular al docente saliente de este establecimiento si se solicitó
  if (desvincularSaliente) {
    await prisma.docenteEstablecimiento.deleteMany({
      where: {
        docenteId,
        establecimientoId
      }
    });
  } else if (relSaliente?.observacionCarga) {
    await prisma.docenteEstablecimiento.update({
      where: {
        docenteId_establecimientoId: {
          docenteId,
          establecimientoId
        }
      },
      data: { observacionCarga: null }
    });
  }

  return nuevoComodin;
}

export async function getDatosInicialesAsignacion(establecimientoId: number) {
  const [
    docentes,
    grados,
    todasCargas,
    actividadesNL,
    actividadesExt,
    tablaConversion,
    configGlobal,
    estConfig,
    todasAsignaturas,
    todosLosDetalles
  ] = await Promise.all([
    getDocentesEstablecimiento(establecimientoId),
    getGradosEstablecimiento(establecimientoId),
    getCargasEstablecimiento(establecimientoId),
    getActividadesNoLectivas(),
    getActividadesExtracurriculares(),
    getTablaConversion(),
    getConfiguracionGlobal(),
    getEstablecimientoConfig(establecimientoId),
    getTodasAsignaturas(),
    getTodosDetallesPlanEstablecimiento(establecimientoId)
  ]);

  return {
    docentes,
    grados,
    todasCargas,
    actividadesNL,
    actividadesExt,
    tablaConversion,
    configGlobal,
    estConfig,
    todasAsignaturas,
    todosLosDetalles
  };
}

export async function getDatosPostGuardado(establecimientoId: number) {
  const [todasCargas, docentes] = await Promise.all([
    getCargasEstablecimiento(establecimientoId),
    getDocentesEstablecimiento(establecimientoId)
  ]);
  return { todasCargas, docentes };
}

export async function getDatosSabanaClasica(establecimientoId: number) {
  const [
    docentes,
    cargas,
    grados,
    tablaConversion,
    catAnl,
    catExt,
    config
  ] = await Promise.all([
    getDocentesEstablecimiento(establecimientoId),
    getCargasEstablecimiento(establecimientoId),
    getGradosEstablecimiento(establecimientoId),
    getTablaConversion(),
    getActividadesNoLectivas(),
    getActividadesExtracurriculares(),
    getConfiguracionGlobal()
  ]);

  return {
    docentes,
    cargas,
    grados,
    tablaConversion,
    catAnl,
    catExt,
    config
  };
}

export async function getDatosDocentesPage(establecimientoId: number) {
  const [docentes, todasCargas, tablaConversion, estConfig] = await Promise.all([
    getDocentesEstablecimiento(establecimientoId),
    getCargasEstablecimiento(establecimientoId),
    getTablaConversion(),
    getEstablecimientoConfig(establecimientoId)
  ]);

  return { docentes, todasCargas, tablaConversion, estConfig };
}

export async function guardarResolucionCargaDocente(
  docenteId: number,
  establecimientoId: number,
  estadoAceptacion: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO',
  archivo?: { nombreArchivo: string; mimeType: string; archivoBase64: string } | null
) {
  await verificarEstablecimientoNoBloqueado(establecimientoId);

  const docExistente = await prisma.docenteDocumentoFirmado.findUnique({
    where: {
      docenteId_establecimientoId: { docenteId, establecimientoId }
    },
    select: { nombreArchivo: true }
  });

  if (estadoAceptacion === 'ACEPTADO' || estadoAceptacion === 'RECHAZADO') {
    if (!archivo?.archivoBase64 && !docExistente) {
      return {
        error:
          'Para declarar que el docente ACEPTÓ o RECHAZÓ la propuesta, es obligatorio adjuntar el formulario firmado.'
      };
    }
  }

  if (archivo?.archivoBase64) {
    await prisma.docenteDocumentoFirmado.upsert({
      where: {
        docenteId_establecimientoId: { docenteId, establecimientoId }
      },
      update: {
        nombreArchivo: archivo.nombreArchivo,
        mimeType: archivo.mimeType,
        archivoBase64: archivo.archivoBase64
      },
      create: {
        docenteId,
        establecimientoId,
        nombreArchivo: archivo.nombreArchivo,
        mimeType: archivo.mimeType,
        archivoBase64: archivo.archivoBase64
      }
    });
  } else if (estadoAceptacion === 'PENDIENTE' && docExistente) {
    await prisma.docenteDocumentoFirmado.delete({
      where: {
        docenteId_establecimientoId: { docenteId, establecimientoId }
      }
    });
  }

  const nombreFinal =
    estadoAceptacion === 'PENDIENTE'
      ? null
      : archivo?.nombreArchivo || docExistente?.nombreArchivo || null;

  await prisma.docenteEstablecimiento.update({
    where: {
      docenteId_establecimientoId: { docenteId, establecimientoId }
    },
    data: {
      estadoAceptacion,
      fechaAceptacion: estadoAceptacion === 'PENDIENTE' ? null : new Date(),
      nombreArchivoFirmado: nombreFinal
    }
  });

  return {
    success: true,
    estadoAceptacion,
    nombreArchivoFirmado: nombreFinal,
    fechaAceptacion: estadoAceptacion === 'PENDIENTE' ? null : new Date()
  };
}

export async function obtenerDocumentoFirmadoDocente(
  docenteId: number,
  establecimientoId: number
) {
  return await prisma.docenteDocumentoFirmado.findUnique({
    where: {
      docenteId_establecimientoId: { docenteId, establecimientoId }
    }
  });
}




