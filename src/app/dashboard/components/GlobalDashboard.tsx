'use client';
import React, { useEffect, useState } from 'react';
import { getGlobalAnalytics } from '../../actions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type TabGlobal = 'COLEGIOS' | 'RESOLUCIONES' | 'DOTACION_NORMATIVA' | 'FINANCIAMIENTO' | 'TODOS';

export default function GlobalDashboard() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabGlobal>('COLEGIOS');

  useEffect(() => {
    getGlobalAnalytics().then(setData);
  }, []);

  if (!data) return <div className="p-8 text-center text-gray-500">Cargando métricas globales...</div>;

  const showSection = (tab: TabGlobal) => activeTab === 'TODOS' || activeTab === tab;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 print:hidden">
        <h2 className="text-2xl font-bold text-[#016098]">Dashboard Global (Sostenedor / CMDS)</h2>
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

      {/* Tarjetas KPI Ejecutivas Comunales (Siempre visibles) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase text-gray-400">Fuerza Laboral Comunal</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-[#016098]">{data.totalDocentesComuna}</span>
            <span className="text-xs text-gray-500 font-medium">docentes en red</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-3 pt-2 border-t border-gray-100">
            <span className="text-gray-500">Horas Contrato Totales:</span>
            <span className="font-bold text-[#016098]">{data.totalHorasComuna} hrs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border border-gray-100 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase text-gray-400">Estado de Cierre Colegios</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-slate-800">
              🔒 {data.estadoCierreColegios?.cerrados || 0} cerrados
            </span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              🔓 {data.estadoCierreColegios?.enProceso || 0} abiertos
            </span>
          </div>
          <span className="text-[11px] text-gray-500 mt-3 pt-2 border-t border-gray-100 block">
            De {data.estadoCierreColegios?.totalConDotacion || 0} establecimientos con dotación
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border border-gray-100 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase text-gray-400">Aceptación Comunal (Firmas)</span>
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
          <span className="text-xs font-bold uppercase text-gray-400">Bolsa Comunal Vacantes (NN)</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-amber-600">
              {data.vacantesResumen?.totalVacantes || 0} vacantes
            </span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {data.vacantesResumen?.horasContratoVacantes || 0} hrs
            </span>
          </div>
          <span className="text-[11px] text-gray-500 mt-3 pt-2 border-t border-gray-100 block">
            En {data.vacantesResumen?.porEstablecimiento?.length || 0} establecimientos CMDS
          </span>
        </div>
      </div>

      {/* Selector de Temas (Tabs) */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-2 print:hidden">
        <button
          onClick={() => setActiveTab('COLEGIOS')}
          className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
            activeTab === 'COLEGIOS'
              ? 'bg-[#016098] text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          🏫 Avance y Eficiencia por Colegio
        </button>
        <button
          onClick={() => setActiveTab('RESOLUCIONES')}
          className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
            activeTab === 'RESOLUCIONES'
              ? 'bg-[#016098] text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          ✍️ Resoluciones y Rechazos (Firmas)
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
          💰 Financiamiento Comunal
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

      {/* TEMA 2: RESOLUCIONES Y RECHAZOS */}
      {showSection('RESOLUCIONES') && (
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h3 className="text-gray-700 font-bold mb-1">
              Estado de Aceptación y Rechazo de Carga Horaria por Tipo de Contrato (Comunal)
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Considera únicamente a los docentes con carga horaria asignada en la red CMDS (
              {data.resumenResolucion?.totalConCarga || 0} docentes).
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

          {/* Alerta de Establecimientos con Rechazos */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h3 className="text-gray-700 font-bold mb-1">
              Alerta de Establecimientos con Rechazos de Carga Horaria (❌)
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Listado directo de establecimientos donde al menos un docente rechazó su propuesta de carga horaria.
            </p>
            {data.estadoCierreColegios?.colegiosConRechazos &&
            data.estadoCierreColegios.colegiosConRechazos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-red-50 border-y border-red-200 text-xs uppercase text-red-900">
                      <th className="py-2 px-3 font-bold">Establecimiento</th>
                      <th className="py-2 px-3 text-center font-bold">Docentes con Carga</th>
                      <th className="py-2 px-3 text-center font-bold text-red-700">❌ Rechazos</th>
                      <th className="py-2 px-3 text-center font-bold text-green-700">✅ Aceptados</th>
                      <th className="py-2 px-3 text-center font-bold text-amber-700">⏳ Pendientes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.estadoCierreColegios.colegiosConRechazos.map((c: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-red-50/30">
                        <td className="py-2 px-3 font-semibold text-gray-800">{c.nombre}</td>
                        <td className="py-2 px-3 text-center font-bold">{c.docentesConCarga}</td>
                        <td className="py-2 px-3 text-center font-extrabold text-red-600">{c.rechazados}</td>
                        <td className="py-2 px-3 text-center font-semibold text-green-700">{c.aceptados}</td>
                        <td className="py-2 px-3 text-center font-semibold text-amber-600">{c.pendientes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center text-emerald-800 text-sm font-medium">
                ✅ Actualmente no existen rechazos de carga horaria registrados en ningún establecimiento.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TEMA 3: DOTACIÓN, VACANTES Y LEY 20.903 */}
      {showSection('DOTACION_NORMATIVA') && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h3 className="text-gray-700 font-bold mb-1">Semáforo Comunal de Cuadratura Docente</h3>
              <p className="text-xs text-gray-400 mb-4">
                Estado de cuadratura de los {data.totalDocentesComuna} registros docentes de la comuna.
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
                  <span className="text-[11px] text-amber-600 block">Con horas sin uso</span>
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

            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h3 className="text-gray-700 font-bold mb-1">Salud Normativa Comunal Ley 20.903 (65/35)</h3>
              <p className="text-xs text-gray-400 mb-4">
                Evaluación sobre los {data.resumenResolucion?.totalConCarga || 0} docentes con carga activa.
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
                    {data.normativaResumen?.incumplePlanificacion || 0} con déficit
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
                    {data.normativaResumen?.excedeTopeNoLectivo || 0} excedidos
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h3 className="text-gray-700 font-bold mb-1">
              Bolsa Comunal de Vacantes (NN) por Establecimiento (Necesidad de Contratación RR.HH.)
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Resumen de establecimientos que mantienen vacantes (NN) pendientes de reemplazo por un docente real.
            </p>
            {data.vacantesResumen?.porEstablecimiento && data.vacantesResumen.porEstablecimiento.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-amber-50 border-y border-amber-200 text-xs uppercase text-amber-900">
                      <th className="py-2 px-3 font-bold">Establecimiento</th>
                      <th className="py-2 px-3 text-center font-bold">Cantidad Vacantes (NN)</th>
                      <th className="py-2 px-3 text-center font-bold">Horas Totales Vacantes</th>
                      <th className="py-2 px-3 text-center font-bold">Horas con Carga Armada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.vacantesResumen.porEstablecimiento.map((v: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-amber-50/30">
                        <td className="py-2 px-3 font-semibold text-gray-800">{v.establecimiento}</td>
                        <td className="py-2 px-3 text-center font-bold text-amber-700">{v.cantidadVacantes}</td>
                        <td className="py-2 px-3 text-center font-semibold">{v.horasContrato} hrs</td>
                        <td className="py-2 px-3 text-center font-bold text-[#016098]">{v.horasAsignadas} hrs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                No existen vacantes (NN) registradas en la red comunal.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TEMA 4: FINANCIAMIENTO COMUNAL */}
      {showSection('FINANCIAMIENTO') && (
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h3 className="text-gray-700 font-bold mb-1">
            Distribución Comunal por Fuente de Financiamiento (Subvención General, SEP, PIE)
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Consolidado comunal de horas en ficha docente vs horas asignadas en cargas horarias por fuente de
            financiamiento.
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

      {/* TEMA 1: AVANCE Y EFICIENCIA POR COLEGIO */}
      {showSection('COLEGIOS') && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h3 className="text-gray-700 font-bold mb-1">Top 5 Colegios con Horas Ociosas</h3>
              <p className="text-xs text-gray-400 mb-4">
                Establecimientos con más horas contratadas pagadas pendientes de asignación.
              </p>
              <div className="flex flex-col gap-3">
                {data.topDeficit.map((d: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="font-medium text-gray-700 truncate w-2/3">{d.nombre}</span>
                    <span className="text-red-500 font-bold">{d.ociosas} hrs ociosas</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h3 className="text-gray-700 font-bold mb-4">Ranking de Déficit y Eficiencia</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.schoolStats.slice(0, 15)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="nombre" tick={{ fontSize: 9 }} interval={0} angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="ociosas" fill="#f97316" radius={[4, 4, 0, 0]} name="Horas Ociosas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h3 className="text-gray-700 font-bold mb-1">Progreso de Asignación (UTP) y Firmas por Establecimiento</h3>
            <p className="text-xs text-gray-400 mb-4">
              Muestra el avance en la configuración de la carga horaria, estado de bloqueo y resoluciones de docentes por
              colegio.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-h-[460px] overflow-y-auto custom-scrollbar pr-2">
              {[...data.schoolStats]
                .sort((a, b) => b.asignado / (b.contrato || 1) - a.asignado / (a.contrato || 1))
                .map((d: any, i: number) => {
                  const pctReal = d.contrato > 0 ? Math.round((d.asignado / d.contrato) * 100) : 0;
                  const pct = Math.min(100, pctReal);
                  return (
                    <div key={i} className="flex flex-col gap-1 mb-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-700 truncate w-3/4" title={d.nombre}>
                          {d.bloqueado ? '🔒 ' : ''}
                          {d.nombre}
                        </span>
                        <span
                          className={`font-bold ${
                            pctReal >= 100 ? 'text-green-600' : pctReal > 50 ? 'text-[#016098]' : 'text-orange-500'
                          }`}
                        >
                          {pctReal}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            pctReal >= 100 ? 'bg-green-500' : pctReal > 50 ? 'bg-[#39BABD]' : 'bg-orange-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-500 mt-0.5">
                        <span className="font-medium">
                          {d.docentesConCarga} de {d.totalDocentes} docentes con carga
                          {d.docentesConCarga > 0 && (
                            <span className="ml-2 text-[9px] text-gray-400">
                              (✅ {d.aceptados || 0} | ❌ {d.rechazados || 0} | ⏳ {d.pendientes || 0})
                            </span>
                          )}
                        </span>
                        <span>
                          {d.asignado} / {d.contrato} hrs asignadas
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
