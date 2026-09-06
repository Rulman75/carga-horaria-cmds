"use client";
import React, { useState, useEffect } from 'react';
import { getDashboardSummary } from './actions';
import Link from 'next/link';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminGlobal, setIsAdminGlobal] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const rbdStr = localStorage.getItem('selectedEstablecimientoId');
        
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.rol === 'ADMIN' && (!rbdStr || rbdStr === '')) {
            setIsAdminGlobal(true);
            const summary = await getDashboardSummary();
            setData(summary);
          } else {
            const id = rbdStr ? parseInt(rbdStr) : user.establecimientoId;
            const summary = await getDashboardSummary(id);
            setData(summary);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSummary();
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Cargando dashboard...</div>;
  if (!data) return <div className="p-8 text-gray-500">No se pudo cargar la información.</div>;

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="text-3xl font-semibold text-[#016098]">Dashboard</h1>
      
      {isAdminGlobal ? (
        <>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-2 rounded-r-lg">
            <h2 className="font-bold text-blue-800">Vista Global CMDS</h2>
            <p className="text-sm text-blue-600">Por favor, seleccione un Establecimiento en el menú lateral para gestionar sus cargas horarias.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 border-l-4 border-l-blue-500">
              <h3 className="text-sm font-medium text-gray-500">Total Establecimientos CMDS</h3>
              <p className="text-4xl font-bold text-[#016098] mt-2">{data.establecimientos}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 border-l-4 border-l-cyan-500">
              <h3 className="text-sm font-medium text-gray-500">Total Docentes Registrados</h3>
              <p className="text-4xl font-bold text-[#39BABD] mt-2">{data.docentes}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100 border-l-4 border-l-amber-500">
              <h3 className="text-sm font-medium text-gray-500">Asignaturas (Mantenedor)</h3>
              <p className="text-4xl font-bold text-amber-500 mt-2">{data.asignaturas}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
               <h3 className="font-bold text-gray-800 mb-2">Accesos Directos</h3>
               <div className="space-y-2">
                 <Link href="/config/establecimientos" className="block text-[#016098] hover:underline">Ir al Mantenedor de Establecimientos →</Link>
                 <Link href="/config/asignaturas" className="block text-[#016098] hover:underline">Ir al Mantenedor de Asignaturas →</Link>
               </div>
             </div>
          </div>
        </>
      ) : (
        <>
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-2 rounded-r-lg">
            <h2 className="font-bold text-green-800">Vista Establecimiento: {data.nombre}</h2>
            <p className="text-sm text-green-600">Mostrando información específica del establecimiento seleccionado.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 border-l-4 border-l-green-500">
              <h3 className="text-sm font-medium text-gray-500">Docentes en este colegio</h3>
              <p className="text-4xl font-bold text-[#016098] mt-2">{data.docentes}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-cyan-100 border-l-4 border-l-cyan-500">
              <h3 className="text-sm font-medium text-gray-500">Cursos Activos</h3>
              <p className="text-4xl font-bold text-[#39BABD] mt-2">{data.cursos}</p>
            </div>
          </div>
        </>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2e8f0] mt-4">
        <h2 className="text-xl font-semibold text-[#1e293b] mb-4">Bienvenido al Sistema de Carga Docente</h2>
        <p className="text-[#64748b]">
          Este sistema permite gestionar la asignación de horas lectivas y no lectivas de los docentes
          de la Corporación Municipal de Desarrollo Social (CMDS), dando cumplimiento a la Ley 20.903 de Carrera Docente.
        </p>
      </div>
    </div>
  );
}
