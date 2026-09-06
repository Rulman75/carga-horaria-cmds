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
          
          <div className="mt-8">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">Accesos Directos de Administración</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Link href="/config/establecimientos" className="group bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-[#016098] hover:shadow-md transition-all flex items-center gap-4 cursor-pointer">
                 <div className="bg-blue-50 p-4 rounded-full text-[#016098] group-hover:bg-[#016098] group-hover:text-white transition-colors">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                 </div>
                 <div>
                   <h4 className="font-bold text-gray-800 text-lg group-hover:text-[#016098]">Mantenedor de Establecimientos</h4>
                   <p className="text-sm text-gray-500 mt-1">Gestione colegios, liceos y asigne niveles educativos.</p>
                 </div>
               </Link>

               <Link href="/config/asignaturas" className="group bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-amber-500 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer">
                 <div className="bg-amber-50 p-4 rounded-full text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                 </div>
                 <div>
                   <h4 className="font-bold text-gray-800 text-lg group-hover:text-amber-600">Mantenedor de Asignaturas</h4>
                   <p className="text-sm text-gray-500 mt-1">Cree y edite asignaturas regulares, especialistas y JEC.</p>
                 </div>
               </Link>
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
