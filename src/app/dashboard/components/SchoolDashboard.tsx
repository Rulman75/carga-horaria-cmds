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
      <h2 className="text-2xl font-bold text-[#016098]">Dashboard del Establecimiento</h2>
      
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
    </div>
  );
}
