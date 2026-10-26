'use client';
import React, { useEffect, useState } from 'react';
import { getSchoolAnalytics } from '../../actions';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function SchoolDashboard({ estId }: { estId: number }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getSchoolAnalytics(estId).then(setData);
  }, [estId]);

  if (!data) return <div className="p-8 text-center text-gray-500">Cargando métricas del establecimiento...</div>;

  const pctAsignado = Math.round((data.docentesAsignados / data.totalDocentes) * 100) || 0;
  
  const jecData = [
    { name: 'Plan Base', horas: data.totalBaseAsignadas },
    { name: 'Talleres JEC', horas: data.totalJecAsignadas }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-bold text-[#016098]">Dashboard: {data.establecimientoNombre}</h2>
        <button 
          onClick={() => window.print()}
          className="bg-[#016098] text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Imprimir / PDF
        </button>
      </div>
      <h2 className="text-2xl font-bold text-[#016098] hidden print:block mb-4">Dashboard: {data.establecimientoNombre}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Termómetro */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center">
          <h3 className="text-gray-500 font-semibold mb-4 text-center">Progreso de Asignación (UTP)</h3>
          <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-[12px] border-gray-100">
            <span className="text-3xl font-bold text-[#016098]">{pctAsignado}%</span>
          </div>
          <p className="text-sm mt-4 text-gray-600">{data.docentesAsignados} de {data.totalDocentes} docentes con carga</p>
        </div>

        {/* Balance */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col justify-center">
          <h3 className="text-gray-500 font-semibold mb-4 text-center">Balance Horario</h3>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm text-gray-500">Contratadas (Aprox)</span>
            <span className="text-lg font-bold text-gray-800">{data.totalHorasContrato} hrs</span>
          </div>
          <div className="flex justify-between items-end mb-4">
            <span className="text-sm text-gray-500">Asignadas (Crono)</span>
            <span className="text-lg font-bold text-gray-800">{data.totalHorasAsignadas} hrs</span>
          </div>
          <div className="border-t pt-4 flex justify-between items-end">
            <span className="text-sm font-bold text-gray-700">Horas Ociosas / Déficit</span>
            <span className={`text-2xl font-bold ${data.horasOciosas > 0 ? 'text-orange-500' : 'text-green-600'}`}>
              {data.horasOciosas} hrs
            </span>
          </div>
        </div>

        {/* JEC vs Base */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h3 className="text-gray-500 font-semibold mb-4 text-center">Esfuerzo Curricular (Pedagógico)</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jecData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="horas" fill="#016098" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <h3 className="text-gray-500 font-semibold mb-1">
          Estado de Aceptación y Rechazo de Carga Horaria por Tipo de Contrato
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Considera únicamente a los docentes con carga horaria asignada ({data.resumenResolucion?.totalConCarga || 0} docentes).
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
        <h3 className="text-gray-500 font-semibold mb-4">Distribución Extracurricular</h3>
        {data.chartExtra.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.chartExtra} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {data.chartExtra.map((entry: any, index: number) => (
                    <Cell key={`cell-\${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-10">No hay actividades extracurriculares asignadas aún.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow border border-gray-100 mt-6">
        <h3 className="text-gray-500 font-semibold mb-4">Avance de Cobertura Curricular (Horas Pedagógicas)</h3>
        {data.subjectProgress && data.subjectProgress.length > 0 ? (
          <div className="space-y-4">
            {data.subjectProgress.map((sub: any, idx: number) => {
              const pct = sub.needed > 0 ? Math.min(100, Math.round((sub.assigned / sub.needed) * 100)) : 0;
              const color = pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-500';
              return (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-700">{sub.name}</span>
                    <span className="text-gray-500">{sub.assigned} / {sub.needed} hrs asignadas</span>
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
  );
}

