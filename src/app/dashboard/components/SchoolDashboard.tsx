'use client';
import React, { useEffect, useState } from 'react';
import { getSchoolAnalytics } from '../../actions';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

type TabTema = 'CURRICULAR' | 'RESOLUCIONES' | 'DOTACION_NORMATIVA' | 'FINANCIAMIENTO' | 'TODOS';

export default function SchoolDashboard({ estId }: { estId: number }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabTema>('CURRICULAR');

  useEffect(() => {
    getSchoolAnalytics(estId).then(setData);
  }, [estId]);

  if (!data) return <div className="p-8 text-center text-gray-500">Cargando métricas del establecimiento...</div>;

  const pctAsignado = Math.round((data.docentesAsignados / (data.totalDocentes || 1)) * 100) || 0;

  const jecData = [
    { name: 'Plan Base', horas: data.totalBaseAsignadas },
    { name: 'Talleres JEC', horas: data.totalJecAsignadas }
  ];

  const showSection = (tab: TabTema) => activeTab === 'TODOS' || activeTab === tab;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-[#016098]">Dashboard: {data.establecimientoNombre}</h2>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              data.establecimientoBloqueado
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {data.establecimientoBloqueado ? '🔒 Proceso Cerrado' : '🔓 En Proceso'}
          </span>
        </div>
        <button
          onClick={() => {
            setActiveTab('TODOS');
            setTimeout(() => window.print(), 150);
          }}
          className="bg-[#016098] text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Imprimir / PDF
        </button>
      </div>
      <h2 className="text-2xl font-bold text-[#016098] hidden print:block mb-2">
        Dashboard: {data.establecimientoNombre}
      </h2>

      {/* Tarjetas KPI Superiores (Siempre visibles) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase text-gray-400">Progreso de Asignación (UTP)</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-[#016098]">{pctAsignado}%</span>
            <span className="text-xs text-gray-500 font-medium">
              {data.docentesAsignados} / {data.totalDocentes} docentes
            </span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#016098] h-full rounded-full" style={{ width: `${Math.min(100, pctAsignado)}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border border-gray-100 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase text-gray-400">Balance Horario Semanal</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-gray-800">{data.totalHorasAsignadas} hrs</span>
            <span className="text-xs text-gray-500">de {data.totalHorasContrato} hrs contrato</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-3 pt-2 border-t border-gray-100">
            <span className="text-gray-500 font-medium">Horas Ociosas / Déficit:</span>
            <span className={`font-bold ${data.horasOciosas > 0 ? 'text-orange-500' : 'text-green-600'}`}>
              {data.horasOciosas} hrs
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border border-gray-100 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase text-gray-400">Aceptación de Carga (Firmas)</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-green-600">
              {data.resumenResolucion?.pctAceptados || 0}%
            </span>
            <span className="text-xs text-gray-500">
              ✅ {data.resumenResolucion?.aceptados || 0} | ❌ {data.resumenResolucion?.rechazados || 0} | ⏳{' '}
              {data.resumenResolucion?.pendientes || 0}
            </span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden flex">
            <div
              className="bg-green-500 h-full"
              style={{ width: `${data.resumenResolucion?.pctAceptados || 0}%` }}
            />
            <div
              className="bg-red-500 h-full"
              style={{ width: `${data.resumenResolucion?.pctRechazados || 0}%` }}
            />
            <div
              className="bg-amber-400 h-full"
              style={{ width: `${data.resumenResolucion?.pctPendientes || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border border-gray-100 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase text-gray-400">Vacantes (NN) por Cubrir</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-amber-600">
              {data.vacantesResumen?.totalVacantes || 0} vacantes
            </span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {data.vacantesResumen?.horasContratoVacantes || 0} hrs
            </span>
          </div>
          <span className="text-[11px] text-gray-500 mt-3 pt-2 border-t border-gray-100 block">
            {data.vacantesResumen?.vacantesConCarga || 0} con carga horaria ya armada
          </span>
        </div>
      </div>

      {/* Selector de Temas (Tabs) */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-2 print:hidden">
        <button
          onClick={() => setActiveTab('CURRICULAR')}
          className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
            activeTab === 'CURRICULAR'
              ? 'bg-[#016098] text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          📋 Cobertura Curricular
        </button>
        <button
          onClick={() => setActiveTab('RESOLUCIONES')}
          className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
            activeTab === 'RESOLUCIONES'
              ? 'bg-[#016098] text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          ✍️ Resoluciones y Firmas
        </button>
        <button
          onClick={() => setActiveTab('DOTACION_NORMATIVA')}
          className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
            activeTab === 'DOTACION_NORMATIVA'
              ? 'bg-[#016098] text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          ⚖️ Dotación, Vacantes y Ley 20.903
        </button>
        <button
          onClick={() => setActiveTab('FINANCIAMIENTO')}
          className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
            activeTab === 'FINANCIAMIENTO'
              ? 'bg-[#016098] text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          💰 Financiamiento (SEP / PIE / Normal)
        </button>
        <button
          onClick={() => setActiveTab('TODOS')}
          className={`ml-auto px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
            activeTab === 'TODOS'
              ? 'bg-slate-800 text-white shadow'
              : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          👁️ Ver Todos los Temas
        </button>
      </div>

      {/* TEMA 2: RESOLUCIONES Y FIRMAS POR TIPO DE CONTRATO */}
      {showSection('RESOLUCIONES') && (
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h3 className="text-gray-700 font-bold mb-1">
            Estado de Aceptación y Rechazo de Carga Horaria por Tipo de Contrato
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Considera únicamente a los docentes con carga horaria asignada ({data.resumenResolucion?.totalConCarga || 0}{' '}
            docentes).
          </p>

          {data.resumenResolucion && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-green-800 uppercase block">✅ Aceptaron</span>
                  <span className="text-2xl font-bold text-green-700">{data.resumenResolucion.aceptados}</span>
                </div>
                <span className="text-lg font-extrabold text-green-700 bg-green-100 px-2.5 py-1 rounded">
                  {data.resumenResolucion.pctAceptados}%
                </span>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-red-800 uppercase block">❌ Rechazaron</span>
                  <span className="text-2xl font-bold text-red-700">{data.resumenResolucion.rechazados}</span>
                </div>
                <span className="text-lg font-extrabold text-red-700 bg-red-100 px-2.5 py-1 rounded">
                  {data.resumenResolucion.pctRechazados}%
                </span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase block">⏳ Pendientes Firma</span>
                  <span className="text-2xl font-bold text-amber-700">{data.resumenResolucion.pendientes}</span>
                </div>
                <span className="text-lg font-extrabold text-amber-700 bg-amber-100 px-2.5 py-1 rounded">
                  {data.resumenResolucion.pctPendientes}%
                </span>
              </div>
            </div>
          )}

          {data.resolucionPorContrato && data.resolucionPorContrato.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-200 text-xs uppercase text-gray-600">
                    <th className="py-2.5 px-3 font-bold">Tipo Contrato</th>
                    <th className="py-2.5 px-3 text-center font-bold">Docentes con Carga</th>
                    <th className="py-2.5 px-3 text-center font-bold text-green-700">Aceptados (%)</th>
                    <th className="py-2.5 px-3 text-center font-bold text-red-700">Rechazados (%)</th>
                    <th className="py-2.5 px-3 text-center font-bold text-amber-700">Pendientes (%)</th>
                    <th className="py-2.5 px-3 font-bold w-48">Distribución</th>
                  </tr>
                </thead>
                <tbody>
                  {data.resolucionPorContrato.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-semibold text-gray-800">{row.tipoContrato}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#016098]">{row.totalConCarga}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-bold text-green-700">{row.aceptados}</span>{' '}
                        <span className="text-xs text-gray-500">({row.pctAceptados}%)</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-bold text-red-600">{row.rechazados}</span>{' '}
                        <span className="text-xs text-gray-500">({row.pctRechazados}%)</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-bold text-amber-600">{row.pendientes}</span>{' '}
                        <span className="text-xs text-gray-500">({row.pctPendientes}%)</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                          <div
                            className="bg-green-500 h-full"
                            style={{ width: `${row.pctAceptados}%` }}
                            title={`Aceptados: ${row.pctAceptados}%`}
                          />
                          <div
                            className="bg-red-500 h-full"
                            style={{ width: `${row.pctRechazados}%` }}
                            title={`Rechazados: ${row.pctRechazados}%`}
                          />
                          <div
                            className="bg-amber-400 h-full"
                            style={{ width: `${row.pctPendientes}%` }}
                            title={`Pendientes: ${row.pctPendientes}%`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Aún no hay docentes con carga horaria asignada.</p>
          )}
        </div>
      )}

      {/* TEMA 3: DOTACIÓN, VACANTES Y NORMATIVA LEY 20.903 */}
      {showSection('DOTACION_NORMATIVA') && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Semáforo de Cuadratura de Jornada */}
            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h3 className="text-gray-700 font-bold mb-1">Semáforo de Cuadratura de Jornada Docente</h3>
              <p className="text-xs text-gray-400 mb-4">
                Comparación entre la jornada contratada de cada docente y las horas totales asignadas.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-800 block">🟢 Jornada Exacta (100%)</span>
                  <span className="text-2xl font-extrabold text-emerald-700">
                    {data.cuadraturaJornada?.exactos || 0}
                  </span>
                  <span className="text-[11px] text-emerald-600 block">Docentes cuadrados</span>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-xs font-bold text-amber-800 block">🟡 Sub-asignados (Ociosas)</span>
                  <span className="text-2xl font-extrabold text-amber-700">
                    {data.cuadraturaJornada?.subAsignados || 0}
                  </span>
                  <span className="text-[11px] text-amber-600 block">Faltan horas por asignar</span>
                </div>
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <span className="text-xs font-bold text-red-800 block">🔴 Sobrecargados</span>
                  <span className="text-2xl font-extrabold text-red-700">
                    {data.cuadraturaJornada?.sobrecargados || 0}
                  </span>
                  <span className="text-[11px] text-red-600 block">Superan horas contrato</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <span className="text-xs font-bold text-gray-700 block">⚪ Sin Carga Asignada</span>
                  <span className="text-2xl font-extrabold text-gray-600">
                    {data.cuadraturaJornada?.sinCarga || 0}
                  </span>
                  <span className="text-[11px] text-gray-500 block">Pendientes de configurar</span>
                </div>
              </div>
            </div>

            {/* Cumplimiento Normativo Ley 20.903 */}
            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h3 className="text-gray-700 font-bold mb-1">Cumplimiento Normativo Ley 20.903 (65/35)</h3>
              <p className="text-xs text-gray-400 mb-4">
                Revisión automática sobre los {data.docentesAsignados} docentes con carga asignada.
              </p>
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg border border-gray-200 bg-slate-50 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-gray-700 uppercase block">
                      Mínimo Planificación ({data.normativaResumen?.pctExigido || 40}% de HNL)
                    </span>
                    <span className="text-xs text-gray-500">
                      Cumplen: <strong className="text-green-700">{data.normativaResumen?.cumplePlanificacion || 0}</strong>{' '}
                      | Bajo el mínimo:{' '}
                      <strong className="text-red-600">{data.normativaResumen?.incumplePlanificacion || 0}</strong>
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      (data.normativaResumen?.incumplePlanificacion || 0) === 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {(data.normativaResumen?.incumplePlanificacion || 0) === 0
                      ? '✅ 100% al día'
                      : `⚠️ ${data.normativaResumen?.incumplePlanificacion} con déficit`}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg border border-gray-200 bg-slate-50 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-gray-700 uppercase block">
                      Tope Legal Horas No Lectivas (Tabla Conversión)
                    </span>
                    <span className="text-xs text-gray-500">
                      Dentro del tope:{' '}
                      <strong className="text-green-700">{data.normativaResumen?.cumpleTopeNoLectivo || 0}</strong> |
                      Excedidos:{' '}
                      <strong className="text-red-600">{data.normativaResumen?.excedeTopeNoLectivo || 0}</strong>
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      (data.normativaResumen?.excedeTopeNoLectivo || 0) === 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {(data.normativaResumen?.excedeTopeNoLectivo || 0) === 0
                      ? '✅ Sin excesos'
                      : `🚨 ${data.normativaResumen?.excedeTopeNoLectivo} excedidos`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detalle de Vacantes NN */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h3 className="text-gray-700 font-bold mb-1">Bolsa de Vacantes (NN) y Necesidad de Contratación</h3>
            <p className="text-xs text-gray-400 mb-4">
              Detalle de cupos vacantes ({data.vacantesResumen?.totalVacantes || 0}) que requieren asignación de un
              docente titular o contrata.
            </p>
            {data.vacantesResumen?.listado && data.vacantesResumen.listado.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-amber-50 border-y border-amber-200 text-xs uppercase text-amber-900">
                      <th className="py-2 px-3 font-bold">Código Vacante</th>
                      <th className="py-2 px-3 font-bold">Glosa / Especialidad / Referencia</th>
                      <th className="py-2 px-3 text-center font-bold">Horas Vacante (Contrato)</th>
                      <th className="py-2 px-3 text-center font-bold">Horas Carga Armada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.vacantesResumen.listado.map((v: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-amber-50/30">
                        <td className="py-2 px-3 font-bold text-amber-800">{v.codigo}</td>
                        <td className="py-2 px-3 text-gray-700">{v.glosa}</td>
                        <td className="py-2 px-3 text-center font-semibold">{v.horasContrato} hrs</td>
                        <td className="py-2 px-3 text-center font-bold text-[#016098]">{v.horasAsignadas} hrs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                No existen vacantes (NN) registradas en este establecimiento.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TEMA 4: FINANCIAMIENTO */}
      {showSection('FINANCIAMIENTO') && (
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h3 className="text-gray-700 font-bold mb-1">
            Distribución por Fuente de Financiamiento (Subvención General, SEP, PIE)
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Comparativa entre las horas declaradas en la ficha de los docentes y las horas efectivamente asignadas en su
            carga horaria según financiamiento.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200 text-xs uppercase text-gray-600">
                  <th className="py-2.5 px-3 font-bold">Fuente de Financiamiento</th>
                  <th className="py-2.5 px-3 text-center font-bold">Docentes con Carga en el Fondo</th>
                  <th className="py-2.5 px-3 text-center font-bold">Horas en Ficha Docente</th>
                  <th className="py-2.5 px-3 text-center font-bold text-[#016098]">Horas Lectivas Asignadas (Ped.)</th>
                  <th className="py-2.5 px-3 text-center font-bold text-[#39BABD]">
                    Horas No Lectivas / Extra (Crono.)
                  </th>
                </tr>
              </thead>
              <tbody>
                {(data.financiamientoResumen || []).map((f: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 font-bold text-gray-800">{f.fondo}</td>
                    <td className="py-3 px-3 text-center font-semibold text-gray-700">{f.docentesConCarga}</td>
                    <td className="py-3 px-3 text-center font-bold text-gray-700">{f.horasFicha} hrs</td>
                    <td className="py-3 px-3 text-center font-bold text-[#016098]">{f.horasLectivasPed} hrs ped.</td>
                    <td className="py-3 px-3 text-center font-bold text-[#39BABD]">{f.horasNoLectivasCrono} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TEMA 1: COBERTURA CURRICULAR Y EXTRACURRICULAR */}
      {showSection('CURRICULAR') && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h3 className="text-gray-700 font-bold mb-4">Esfuerzo Curricular (Plan Base vs Talleres JEC)</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jecData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="horas" fill="#016098" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h3 className="text-gray-700 font-bold mb-4">Distribución Extracurricular</h3>
              {data.chartExtra.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.chartExtra}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        label
                      >
                        {data.chartExtra.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-16">
                  No hay actividades extracurriculares asignadas aún.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h3 className="text-gray-700 font-bold mb-4">Avance de Cobertura Curricular (Horas Pedagógicas)</h3>
            {data.subjectProgress && data.subjectProgress.length > 0 ? (
              <div className="space-y-4">
                {data.subjectProgress.map((sub: any, idx: number) => {
                  const pct = sub.needed > 0 ? Math.min(100, Math.round((sub.assigned / sub.needed) * 100)) : 0;
                  const color = pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-500';
                  return (
                    <div key={idx} className="flex flex-col gap-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-gray-700">{sub.name}</span>
                        <span className="text-gray-500">
                          {sub.assigned} / {sub.needed} hrs asignadas ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-10">No hay asignaturas en el plan de estudio.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
