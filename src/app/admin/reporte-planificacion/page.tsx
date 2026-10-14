'use client';

import React, { useState, useEffect } from 'react';
import {
  getEstablecimientos,
  getDocentesEstablecimiento,
  getCargasEstablecimiento,
  getTablaConversion,
  getConfiguracionGlobal,
} from '../../actions';

export default function ReportePlanificacionPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [establecimientos, setEstablecimientos] = useState<any[]>([]);
  const [establecimientoId, setEstablecimientoId] = useState<string>('');
  const [docentes, setDocentes] = useState<any[]>([]);
  const [cargas, setCargas] = useState<any[]>([]);
  const [tablaConversion, setTablaConversion] = useState<any[]>([]);
  const [configGlobal, setConfigGlobal] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'PARCIAL' | 'SIN_PLANIFICACION'>('TODOS');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    let rol = '';
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        rol = u.rol;
      } catch (e) {}
    }

    if (rol !== 'ADMIN') {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);
    const savedEstId = localStorage.getItem('selectedEstablecimientoId') || '';

    Promise.all([
      getEstablecimientos(),
      getTablaConversion(),
      getConfiguracionGlobal(),
    ]).then(([ests, tabla, config]) => {
      setEstablecimientos(ests);
      setTablaConversion(tabla);
      setConfigGlobal(config);

      const initialEst = savedEstId || (ests[0]?.esedSec ? String(ests[0].esedSec) : '');
      setEstablecimientoId(initialEst);
    });
  }, []);

  useEffect(() => {
    if (!isAdmin || !establecimientoId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const idNum = Number(establecimientoId);
    Promise.all([
      getDocentesEstablecimiento(idNum),
      getCargasEstablecimiento(idNum),
    ]).then(([docs, cgs]) => {
      setDocentes(docs);
      setCargas(cgs);
      setLoading(false);
    });
  }, [isAdmin, establecimientoId]);

  const parseCronoToDecimal = (str: string) => {
    if (!str) return 0;
    const [h, m] = str.split(':').map(Number);
    return h + m / 60;
  };

  const formatCronoDecimal = (cronoDecimal: number) => {
    if (!cronoDecimal || cronoDecimal <= 0) return '0 H';
    const h = Math.floor(cronoDecimal);
    const m = Math.round((cronoDecimal - h) * 60);
    if (h > 0 && m > 0) return `${h} H ${m} MIN`;
    if (h > 0) return `${h} H`;
    if (m > 0) return `${m} MIN`;
    return '0 H';
  };

  const calcularHorasLectivas = (cargasDocente: any[]) => {
    const lectivas = cargasDocente.filter((c) => c.tipoCarga === 'LECTIVA');
    let total = 0;
    const combinados: Record<string, number[]> = {};
    lectivas.forEach((c) => {
      if (c.esCombinado && c.grupoCombinado) {
        const g = c.grupoCombinado.toUpperCase().trim();
        const asig = c.asignaturaCod || 'GEN';
        const key = `${asig}_${g}`;
        if (!combinados[key]) combinados[key] = [];
        combinados[key].push(c.horasAllocadas);
      } else {
        total += c.horasAllocadas;
      }
    });
    for (const key in combinados) {
      total += Math.max(...combinados[key]);
    }
    return total;
  };

  if (isAdmin === false) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-sm border border-red-200 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Acceso Restringido</h2>
        <p className="text-sm text-gray-600">Este reporte es exclusivo para Administradores del sistema.</p>
      </div>
    );
  }

  const pctPlanificacion = configGlobal?.porcentajeMinimoPlanificacion ?? 40;
  const estActual = establecimientos.find((e) => String(e.esedSec) === establecimientoId);

  const filasReporte = docentes
    .map((doc) => {
      const cargasDoc = cargas.filter((c) => c.docenteId === doc.id);
      const horasContrato = doc.totalDefinitivo || doc.totalJornada || doc.horasTitular || 0;
      const horasLectivas = calcularHorasLectivas(cargasDoc);

      const convProp = tablaConversion.find((t: any) => t.lectivasPedagogicas === Math.round(horasLectivas));
      const maxNoLectivasPropStr = convProp ? convProp.noLectivasCronologicas : '0:00';
      const maxNoLectivasPropDecimal = convProp ? parseCronoToDecimal(convProp.noLectivasCronologicas) : 0;

      const minPlanificacionDecimal =
        Math.floor(Number((maxNoLectivasPropDecimal * (pctPlanificacion / 100) * 100).toFixed(6))) / 100;

      const totalNoLectivas = cargasDoc
        .filter((c) => c.tipoCarga === 'NO_LECTIVA')
        .reduce((sum, c) => sum + c.horasAllocadas, 0);

      const planificacionAsignada = cargasDoc
        .filter((c) => c.tipoCarga === 'NO_LECTIVA' && c.actividadNoLectiva?.esPlanificacion)
        .reduce((sum, c) => sum + c.horasAllocadas, 0);

      const pctReal =
        maxNoLectivasPropDecimal > 0
          ? Number(((planificacionAsignada / maxNoLectivasPropDecimal) * 100).toFixed(1))
          : 0;

      const deficit = Number((minPlanificacionDecimal - planificacionAsignada).toFixed(2));
      const incumple =
        horasLectivas > 0 &&
        minPlanificacionDecimal > 0 &&
        planificacionAsignada + 0.0001 < minPlanificacionDecimal;

      return {
        id: doc.id,
        rut: doc.rut,
        nombreCompleto: `${doc.apellidos}, ${doc.nombres}`,
        contrato: doc.contrato || 'No especificado',
        horasContrato,
        horasLectivas,
        maxNoLectivasPropStr,
        maxNoLectivasPropDecimal,
        totalNoLectivas: Number(totalNoLectivas.toFixed(2)),
        minPlanificacionDecimal,
        planificacionAsignada: Number(planificacionAsignada.toFixed(2)),
        pctReal,
        deficit,
        incumple,
      };
    })
    .filter((item) => item.incumple)
    .filter((item) => {
      if (filtroEstado === 'PARCIAL') return item.planificacionAsignada > 0;
      if (filtroEstado === 'SIN_PLANIFICACION') return item.planificacionAsignada === 0;
      return true;
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-[#016098]">
            Reporte de Cumplimiento de Planificación Docente
          </h1>
          <p className="text-sm text-gray-500">
            Docentes con horas de aula asignadas cuya planificación es inferior al{' '}
            <strong className="text-[#016098]">{pctPlanificacion}%</strong> de sus horas no lectivas proporcionales.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          disabled={filasReporte.length === 0}
          className="bg-[#016098] hover:bg-[#014976] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          Imprimir / Exportar PDF
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#e2e8f0] flex flex-col md:flex-row gap-4 items-end print:hidden">
        <div className="w-full md:w-1/2">
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
            Unidad Educativa (Establecimiento)
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:border-[#016098] focus:outline-none"
            value={establecimientoId}
            onChange={(e) => {
              setEstablecimientoId(e.target.value);
              localStorage.setItem('selectedEstablecimientoId', e.target.value);
            }}
          >
            <option value="">-- Seleccione Establecimiento --</option>
            {establecimientos.map((e) => (
              <option key={e.esedSec} value={e.esedSec}>
                {e.esedCod} - {e.esedDescripcion}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-1/2">
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
            Filtrar Situación
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroEstado('TODOS')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                filtroEstado === 'TODOS'
                  ? 'bg-[#016098] text-white border-[#016098]'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              Todos bajo el {pctPlanificacion}%
            </button>
            <button
              onClick={() => setFiltroEstado('PARCIAL')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                filtroEstado === 'PARCIAL'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              Con Planif. Parcial (&gt; 0 hrs)
            </button>
            <button
              onClick={() => setFiltroEstado('SIN_PLANIFICACION')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                filtroEstado === 'SIN_PLANIFICACION'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              Sin Planificación (0 hrs)
            </button>
          </div>
        </div>
      </div>

      {/* Encabezado para impresión */}
      <div className="hidden print:block mb-4 border-b pb-3">
        <h1 className="text-xl font-bold text-[#016098]">
          Reporte de Docentes Bajo el Mínimo de Planificación ({pctPlanificacion}%)
        </h1>
        <p className="text-sm font-semibold text-gray-700">
          Establecimiento: {estActual ? `${estActual.esedCod} - ${estActual.esedDescripcion}` : ''}
        </p>
      </div>

      {/* Resumen y Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex justify-between items-center">
          <span className="text-sm font-semibold text-[#1e293b]">
            {estActual ? `${estActual.esedCod} - ${estActual.esedDescripcion}` : 'Seleccione un establecimiento'}
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700">
            {filasReporte.length} docente(s) bajo el {pctPlanificacion}%
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500 text-sm">Cargando datos del establecimiento...</div>
        ) : filasReporte.length === 0 ? (
          <div className="p-10 text-center text-green-700 bg-green-50/40 text-sm font-medium">
            ¡Excelente! No se encontraron docentes con horas lectivas que estén por debajo del {pctPlanificacion}% de planificación en este filtro.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase">
                  <th className="p-3">Docente</th>
                  <th className="p-3">Contrato</th>
                  <th className="p-3 text-center">Hrs Aula (Ped)</th>
                  <th className="p-3 text-center">Máx. No Lectiva Prop.</th>
                  <th className="p-3 text-center">Mín. Planificación ({pctPlanificacion}%)</th>
                  <th className="p-3 text-center">Planificación Asignada</th>
                  <th className="p-3 text-center">% Actual</th>
                  <th className="p-3 text-center">Faltante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filasReporte.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-gray-800">{row.nombreCompleto}</div>
                      <div className="text-[11px] text-gray-500">RUT: {row.rut}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-700 uppercase">{row.contrato}</div>
                      <div className="text-[11px] text-gray-500">{row.horasContrato} hrs crono</div>
                    </td>
                    <td className="p-3 text-center font-bold text-[#016098]">
                      {Math.round(row.horasLectivas)} ped
                    </td>
                    <td className="p-3 text-center">
                      <div className="font-semibold text-gray-800">
                        {row.maxNoLectivasPropStr.replace(':', ' H ')} MIN
                      </div>
                      <div className="text-[10px] text-gray-400">
                        ({row.maxNoLectivasPropDecimal.toFixed(2)} hrs)
                      </div>
                    </td>
                    <td className="p-3 text-center bg-blue-50/40">
                      <div className="font-bold text-[#016098]">{row.minPlanificacionDecimal} hrs</div>
                      <div className="text-[10px] text-gray-500">
                        ({formatCronoDecimal(row.minPlanificacionDecimal)})
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div
                        className={`font-bold ${
                          row.planificacionAsignada === 0 ? 'text-red-600' : 'text-amber-600'
                        }`}
                      >
                        {row.planificacionAsignada} hrs
                      </div>
                      <div className="text-[10px] text-gray-500">
                        ({formatCronoDecimal(row.planificacionAsignada)})
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          row.planificacionAsignada === 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {row.pctReal}%
                      </span>
                    </td>
                    <td className="p-3 text-center bg-red-50/40">
                      <div className="font-bold text-red-600">-{row.deficit} hrs</div>
                      <div className="text-[10px] text-red-500">
                        (Faltan {formatCronoDecimal(row.deficit)})
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
