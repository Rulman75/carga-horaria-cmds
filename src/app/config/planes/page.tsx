'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPlanesEstudio } from '../../actions';

export default function PlanesPage() {
  const [planes, setPlanes] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    getPlanesEstudio().then(setPlanes);
  }, []);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[#016098]">Planes de Estudio (Decretos)</h1>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <p className="text-[#64748b] text-sm">
            Listado de decretos y planes de estudio extraídos automáticamente del sistema.
          </p>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#64748b] uppercase bg-[#f1f5f9] sticky top-0 shadow-sm">
              <tr>
                <th className="px-6 py-4">Decreto</th>
                <th className="px-6 py-4">Nombre Plan</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Cant. Asignaturas</th>
              </tr>
            </thead>
            <tbody>
              {planes.map(plan => (
                <tr 
                  key={plan.codPlan} 
                  onClick={() => router.push(`/config/planes/${plan.codPlan}`)}
                  className="border-b border-[#e2e8f0] hover:bg-[#e0f2fe] transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-bold text-[#1e293b]">Decreto {plan.codPlan}</td>
                  <td className="px-6 py-4 text-[#334155] font-medium">{plan.nombrePlan}</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {plan.estadoPlan || 'VIGENTE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#64748b]">
                    {plan._count?.detalles || 0} asignaturas registradas
                  </td>
                </tr>
              ))}
              {planes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#94a3b8]">
                    Cargando planes de estudio...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
