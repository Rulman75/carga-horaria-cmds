'use client';

import React, { useState, useEffect } from 'react';
import { getDocentesEstablecimiento, getGradosEstablecimiento, getCargasEstablecimiento } from '../../actions';

export default function MatrizCargaPage() {
  const [docentes, setDocentes] = useState<any[]>([]);
  const [grados, setGrados] = useState<any[]>([]);
  const [cargas, setCargas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const estId = Number(localStorage.getItem('selectedEstablecimientoId')) || 2;
      const [docs, grads, car] = await Promise.all([
        getDocentesEstablecimiento(estId),
        getGradosEstablecimiento(estId),
        getCargasEstablecimiento(estId)
      ]);
      setDocentes(docs);
      setGrados(grads);
      setCargas(car);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando sábana de carga...</div>;
  }

  // Agrupar cargas por docente y grado
  const matrizMap = new Map<number, Map<string, any[]>>();
  
  cargas.forEach(c => {
    if (!matrizMap.has(c.docenteId)) {
      matrizMap.set(c.docenteId, new Map());
    }
    const docMap = matrizMap.get(c.docenteId)!;
    
    // Si es no lectiva y no tiene grado, la agrupamos en una llave especial
    const gradoKey = (c.tienCod && c.grteCod) ? `${c.tienCod}-${c.grteCod}` : 'NO_LECTIVAS';
    
    if (!docMap.has(gradoKey)) {
      docMap.set(gradoKey, []);
    }
    docMap.get(gradoKey)!.push({
      asig: c.tipoCarga === 'LECTIVA' ? (c.asignatura?.asigDescripcion || 'Sin Nombre') : (c.actividadNoLectiva?.descripcion || 'No Lectiva'),
      horas: c.horasAllocadas,
      financiamiento: c.financiamiento
    });
  });

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[#016098]">Sábana de Carga Docente</h1>
        <button className="bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Exportar Excel
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] flex flex-col flex-1 overflow-hidden max-h-[calc(100vh-160px)]">
        <div className="overflow-auto custom-scrollbar flex-1 relative">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th scope="col" className="px-4 py-3 border-b border-r bg-gray-50 sticky left-0 z-20 shadow-[1px_0_0_0_#e2e8f0]">Docente</th>
                <th scope="col" className="px-4 py-3 border-b border-r min-w-[80px] text-center">Hrs. Titular</th>
                <th scope="col" className="px-4 py-3 border-b border-r min-w-[80px] text-center">Hrs. Asignadas</th>
                <th scope="col" className="px-4 py-3 border-b border-r min-w-[80px] text-center">Dif.</th>
                
                {grados.map(g => (
                  <th key={`${g.tienCod}-${g.grteCod}`} scope="col" className="px-4 py-3 border-b border-r min-w-[150px] whitespace-nowrap">
                    {g.grado?.tipoEnsenanza?.tienDescripcion?.replace('Enseñanza ', '')?.replace('Educación ', '')} <br/>
                    <span className="text-[#016098]">{g.grado?.grteDescrip}</span>
                  </th>
                ))}

                <th scope="col" className="px-4 py-3 border-b border-r min-w-[150px] whitespace-nowrap bg-amber-50">
                    <span className="text-[#d97706]">Actividades No Lectivas</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {docentes.map(docente => {
                const hrsTitular = docente.horasTitular || 0;
                
                // Calcular total asignado a este docente
                const docMap = matrizMap.get(docente.id);
                let totalAsignadas = 0;
                if (docMap) {
                  for (const [_, asignaturas] of docMap.entries()) {
                    totalAsignadas += asignaturas.reduce((sum, a) => sum + a.horas, 0);
                  }
                }
                
                const diferencia = hrsTitular - totalAsignadas;
                
                if (hrsTitular === 0 && totalAsignadas === 0) return null;

                return (
                  <tr key={docente.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 border-r font-medium text-gray-900 whitespace-nowrap sticky left-0 bg-white shadow-[1px_0_0_0_#e2e8f0] group-hover:bg-gray-50 z-10">
                      {docente.apellidos}, {docente.nombres}
                    </td>
                    <td className="px-4 py-3 border-r text-center font-bold text-gray-700">
                      {hrsTitular}
                    </td>
                    <td className="px-4 py-3 border-r text-center font-bold text-[#016098]">
                      {totalAsignadas}
                    </td>
                    <td className={`px-4 py-3 border-r text-center font-bold ${diferencia < 0 ? 'text-red-500' : (diferencia === 0 ? 'text-green-500' : 'text-amber-500')}`}>
                      {diferencia}
                    </td>

                    {grados.map(g => {
                      const gradoKey = `${g.tienCod}-${g.grteCod}`;
                      const asignaciones = docMap?.get(gradoKey) || [];
                      const totalCelda = asignaciones.reduce((sum, a) => sum + a.horas, 0);
                      
                      return (
                        <td key={gradoKey} className="px-4 py-2 border-r align-top">
                          {totalCelda > 0 ? (
                            <div className="flex flex-col gap-1">
                              <div className="text-xs font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded inline-block w-fit">
                                Total: {totalCelda} hrs
                              </div>
                              <ul className="text-[10px] text-gray-500 space-y-0.5 mt-1">
                                {asignaciones.map((a, i) => (
                                  <li key={i} className="flex justify-between items-center bg-blue-50 px-1 rounded">
                                    <span className="truncate max-w-[100px]" title={a.asig}>{a.asig.substring(0, 15)}...</span>
                                    <span className="font-semibold text-blue-700">{a.horas}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs">-</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Celda No Lectivas */}
                    <td className="px-4 py-2 border-r align-top bg-amber-50/30">
                      {(() => {
                        const asignaciones = docMap?.get('NO_LECTIVAS') || [];
                        const totalCelda = asignaciones.reduce((sum, a) => sum + a.horas, 0);
                        return totalCelda > 0 ? (
                          <div className="flex flex-col gap-1">
                            <div className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded inline-block w-fit">
                              Total: {totalCelda} hrs
                            </div>
                            <ul className="text-[10px] text-gray-500 space-y-0.5 mt-1">
                              {asignaciones.map((a, i) => (
                                <li key={i} className="flex justify-between items-center bg-amber-50 px-1 rounded">
                                  <span className="truncate max-w-[100px]" title={a.asig + (a.financiamiento ? ' - ' + a.financiamiento : '')}>
                                    {a.asig.substring(0, 15)}...
                                  </span>
                                  <span className="font-semibold text-amber-700">{a.horas}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">-</span>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
