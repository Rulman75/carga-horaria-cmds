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
    </div>
  );
}
