'use client';
import React, { useEffect, useState } from 'react';
import { getGlobalAnalytics } from '../../actions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function GlobalDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getGlobalAnalytics().then(setData);
  }, []);

  if (!data) return <div className="p-8 text-center text-gray-500">Cargando métricas globales...</div>;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-[#016098]">Dashboard Global (Sostenedor / CMDS)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resumen General */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col justify-center">
          <h3 className="text-gray-500 font-semibold mb-4 text-center">Fuerza Laboral Comunal</h3>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm text-gray-500">Total Docentes</span>
            <span className="text-2xl font-bold text-[#016098]">{data.totalDocentesComuna}</span>
          </div>
          <div className="flex justify-between items-end mb-4">
            <span className="text-sm text-gray-500">Horas Contrato Totales</span>
            <span className="text-2xl font-bold text-[#016098]">{data.totalHorasComuna} hrs</span>
          </div>
        </div>

        {/* Top Eficientes */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h3 className="text-gray-500 font-semibold mb-4">Top 5 Colegios con Horas Ociosas</h3>
          <p className="text-xs text-gray-400 mb-4">Establecimientos con más horas contratadas pagadas sin uso óptimo.</p>
          <div className="flex flex-col gap-3">
            {data.topDeficit.map((d: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-sm border-b pb-2">
                <span className="font-medium text-gray-700 truncate w-2/3">{d.nombre}</span>
                <span className="text-red-500 font-bold">{d.ociosas} hrs ociosas</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <h3 className="text-gray-500 font-semibold mb-1">
          Estado de Aceptación y Rechazo de Carga Horaria por Tipo de Contrato (Comunal)
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Considera únicamente a los docentes con carga horaria asignada en la red CMDS ({data.resumenResolucion?.totalConCarga || 0} docentes).
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

      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <h3 className="text-gray-500 font-semibold mb-4">Ranking de Déficit y Eficiencia</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.schoolStats.slice(0, 15)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="nombre" tick={{fontSize: 9}} interval={0} angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ociosas" fill="#f97316" radius={[4, 4, 0, 0]} name="Horas Ociosas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow border border-gray-100 mt-6">
        <h3 className="text-gray-500 font-semibold mb-4">Progreso de Asignación (UTP) por Establecimiento</h3>
        <p className="text-xs text-gray-400 mb-4">Muestra el avance en la configuración de la carga horaria respecto a la capacidad de contrato del colegio.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
          {[...data.schoolStats].sort((a,b) => (b.asignado/(b.contrato||1)) - (a.asignado/(a.contrato||1))).map((d: any, i: number) => {
            const pctReal = d.contrato > 0 ? Math.round((d.asignado / d.contrato) * 100) : 0;
            const pct = Math.min(100, pctReal);
            return (
              <div key={i} className="flex flex-col gap-1 mb-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700 truncate w-3/4" title={d.nombre}>{d.nombre}</span>
                  <span className={`font-bold ${pctReal >= 100 ? 'text-green-600' : pctReal > 50 ? 'text-[#016098]' : 'text-orange-500'}`}>{pctReal}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${pctReal >= 100 ? 'bg-green-500' : pctReal > 50 ? 'bg-[#39BABD]' : 'bg-orange-400'}`} 
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
                  <span>{d.asignado} / {d.contrato} hrs asignadas</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
