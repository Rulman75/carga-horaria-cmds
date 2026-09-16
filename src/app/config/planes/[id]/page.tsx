'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPlanEstudio } from '../../../actions';

export default function PlanEstudioDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [plan, setPlan] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (id) {
      getPlanEstudio(Number(id)).then(data => {
        setPlan(data);
        setCargando(false);
      });
    }
  }, [id]);

  if (cargando) {
    return <div className="p-8 text-center text-gray-500">Cargando detalle del plan...</div>;
  }

  if (!plan) {
    return <div className="p-8 text-center text-red-500">Plan de estudio no encontrado.</div>;
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      
      {/* Header y Botón Volver */}
      <div className="flex justify-between items-start">
        <div>
          <button 
            onClick={() => router.back()}
            className="text-sm font-medium text-[#016098] hover:underline mb-2 flex items-center gap-1"
          >
            ← Volver a Planes
          </button>
          <h1 className="text-2xl font-semibold text-[#016098]">Decreto {plan.codPlan}</h1>
          <h2 className="text-lg text-gray-600">{plan.nombrePlan}</h2>
        </div>
      </div>

      {/* Info extra */}
      <div className="flex gap-4 mb-2">
        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
          Tipo: {plan.tipo || 'Desconocido'}
        </span>
      </div>

      {/* Tabla de Asignaturas */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex justify-between items-center">
          <h3 className="font-semibold text-[#1e293b]">Malla Curricular / Asignaturas</h3>
          <span className="text-sm text-gray-500 font-medium">{plan.detalles?.length || 0} asignaturas</span>
        </div>
        
        <div className="flex-1 overflow-auto bg-gray-50 p-4">
          {(() => {
            if (!plan.detalles || plan.detalles.length === 0) {
              return (
                <div className="p-8 text-center text-[#94a3b8] bg-white rounded-xl border border-dashed border-gray-300">
                  No se encontraron asignaturas para este plan de estudio.
                </div>
              );
            }

              // Group by Tipo Enseñanza and Grado
              const grouped = new Map<string, any[]>();
              plan.detalles.forEach((det: any) => {
                const tipoStr = det.tipoEnsenanza ? det.tipoEnsenanza.tienDescripcion : 'Sin Tipo';
                const gradoStr = det.grado ? det.grado.grteDescrip : 'Sin Grado';
                const groupKey = `${tipoStr} | ${gradoStr}`;
                if (!grouped.has(groupKey)) grouped.set(groupKey, []);
                grouped.get(groupKey)!.push(det);
              });

            return Array.from(grouped.entries()).map(([gradoName, asignaturas]) => (
              <div key={gradoName} className="mb-8 bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden">
                <div className="bg-[#f1f5f9] px-6 py-3 border-b border-[#e2e8f0]">
                  <h4 className="font-bold text-[#1e293b]">{gradoName}</h4>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-[#64748b] uppercase bg-white border-b border-[#e2e8f0]">
                    <tr>
                      <th className="px-6 py-3">Cód. Asig</th>
                      <th className="px-6 py-3">Nombre Asignatura</th>
                      <th className="px-6 py-3">Formación</th>
                      <th className="px-6 py-3 text-center">Obligatoria</th>
                      <th className="px-6 py-3 text-right">Horas CJ</th>
                      <th className="px-6 py-3 text-right">Horas SJ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asignaturas.map((det: any) => (
                      <tr key={det.id} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc] transition-colors">
                        <td className="px-6 py-3 font-mono text-[#64748b] text-xs w-24">{det.codAsignatura}</td>
                        <td className="px-6 py-3 font-bold text-[#1e293b]">{det.asignatura?.asigDescripcion || 'Desconocida'}</td>
                        <td className="px-6 py-3 text-[#64748b] w-32">{det.formacion}</td>
                        <td className="px-6 py-3 text-center w-24">
                          {det.obligatoria === 'SI' ? (
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">SÍ</span>
                          ) : (
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">{det.obligatoria || 'NO'}</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right font-bold text-[#016098] w-24">{det.horasCJ}</td>
                        <td className="px-6 py-3 text-right font-bold text-[#016098] w-24">{det.horasSJ}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}
