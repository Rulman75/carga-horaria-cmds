'use client';

import React, { useState, useEffect } from 'react';
import { getDocentesEstablecimiento, getCargasEstablecimiento } from '../../actions';

export default function MatrizClasicaPage() {
  const [docentes, setDocentes] = useState<any[]>([]);
  const [cargas, setCargas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const estId = Number(localStorage.getItem('selectedEstablecimientoId')) || 2;
      const [docs, car] = await Promise.all([
        getDocentesEstablecimiento(estId),
        getCargasEstablecimiento(estId)
      ]);
      setDocentes(docs);
      setCargas(car);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando sábana clásica...</div>;
  }

  // 1. Obtener lista única de asignaturas y ANL (columnas)
  const asignaturasMap = new Map<string, { cod: string, desc: string, esJec: boolean }>();
  const anlMap = new Map<string, { cod: string, desc: string, finan: string }>();
  
  cargas.forEach(c => {
    if (c.tipoCarga === 'LECTIVA' && c.asignaturaCod) {
      asignaturasMap.set(c.asignaturaCod, {
        cod: c.asignaturaCod,
        desc: c.asignatura?.asigDescripcion || c.asignaturaCod,
        esJec: c.asignatura?.esTallerJec || false
      });
    } else if (c.tipoCarga === 'NO_LECTIVA' && c.actividadNoLectivaId) {
      const k = `${c.actividadNoLectivaId}-${c.financiamiento || 'Normal'}`;
      anlMap.set(k, {
        cod: k,
        desc: c.actividadNoLectiva?.descripcion || 'No Lectiva',
        finan: c.financiamiento || 'Normal'
      });
    }
  });
  
  const asignaturasBase = Array.from(asignaturasMap.values()).filter(a => !a.esJec).sort((a, b) => a.desc.localeCompare(b.desc));
  const asignaturasJec = Array.from(asignaturasMap.values()).filter(a => a.esJec).sort((a, b) => a.desc.localeCompare(b.desc));
  const anlColumnas = Array.from(anlMap.values()).sort((a, b) => a.desc.localeCompare(b.desc));

  // 2. Agrupar cargas por docente y por asignatura
  const resumenPorDocente = new Map<number, any>();
  
  docentes.forEach(d => {
    resumenPorDocente.set(d.id, {
      id: d.id,
      rut: d.rut,
      nombres: d.nombres,
      apellidos: d.apellidos,
      horasTitular: d.horasTitular,
      asignaturas: {} as Record<string, number>,
      anls: {} as Record<string, number>,
      lectivas: 0,
      noLectivas: 0
    });
  });

  cargas.forEach(c => {
    const doc = resumenPorDocente.get(c.docenteId);
    if (doc) {
      const h = c.horasAllocadas || 0;
      if (c.tipoCarga === 'LECTIVA') {
        doc.lectivas += h;
        if (c.asignaturaCod) {
          if (!doc.asignaturas[c.asignaturaCod]) {
            doc.asignaturas[c.asignaturaCod] = 0;
          }
          doc.asignaturas[c.asignaturaCod] += h;
        }
      } else {
        doc.noLectivas += h;
        if (c.actividadNoLectivaId) {
          const k = `${c.actividadNoLectivaId}-${c.financiamiento || 'Normal'}`;
          if (!doc.anls[k]) doc.anls[k] = 0;
          doc.anls[k] += h;
        }
      }
    }
  });

  const docentesArray = Array.from(resumenPorDocente.values());

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden">
      <div className="p-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#016098]">Sábana Clásica (Por Asignatura y Actividad)</h1>
          <p className="text-sm text-gray-500">Vista consolidada similar a la matriz Excel tradicional</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          🖨️ Imprimir / Exportar
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar relative bg-[#f8fafc]">
        <table className="w-full text-sm text-left border-collapse" style={{ minWidth: 'max-content' }}>
          <thead className="text-xs text-[#1e293b] uppercase bg-[#e2e8f0] sticky top-0 z-20 shadow-sm">
            <tr>
              {/* Frozen columns */}
              <th className="px-4 py-3 border border-[#cbd5e1] bg-[#e2e8f0] sticky left-0 z-30 min-w-[250px]" rowSpan={2}>Docente</th>
              <th className="px-3 py-3 border border-[#cbd5e1] text-center bg-[#e2e8f0] sticky left-[250px] z-30 min-w-[90px]" rowSpan={2}>Hrs Titular<br/><span className="text-[9px]">(Cronológicas)</span></th>
              
              {/* Asignaturas Base */}
              {asignaturasBase.length > 0 && (
                <th colSpan={asignaturasBase.length} className="px-4 py-2 border border-[#cbd5e1] text-center bg-[#dbeafe] text-[#1e40af]">Horas Docencia Aula</th>
              )}
              <th className="px-2 py-2 border border-[#cbd5e1] text-center bg-[#bfdbfe] text-[#1e40af]" rowSpan={2}>TOTAL HORAS<br/>DOCENCIA AULA</th>

              {/* JEC */}
              {asignaturasJec.length > 0 && (
                <th colSpan={asignaturasJec.length} className="px-4 py-2 border border-[#cbd5e1] text-center bg-[#dcfce7] text-[#166534]">Talleres JEC</th>
              )}
              <th className="px-2 py-2 border border-[#cbd5e1] text-center bg-[#bbf7d0] text-[#166534]" rowSpan={2}>TOTAL<br/>HORAS JEC</th>

              {/* Total Aula */}
              <th className="px-2 py-2 border border-[#cbd5e1] text-center bg-[#93c5fd] text-[#1e3a8a] font-bold" rowSpan={2}>TOTAL HORAS<br/>AULA</th>

              {/* ANLs */}
              {anlColumnas.length > 0 && (
                <th colSpan={anlColumnas.length} className="px-4 py-2 border border-[#cbd5e1] text-center bg-[#fef3c7] text-[#d97706]">35% Horas No Lectivas</th>
              )}
              <th className="px-2 py-2 border border-[#cbd5e1] text-center bg-[#fde68a] text-[#b45309] font-bold" rowSpan={2}>TOTAL HRS.<br/>NO LECTIVAS</th>

              {/* Balance */}
              <th className="px-2 py-2 border border-[#cbd5e1] text-center bg-[#e2e8f0] text-gray-700" rowSpan={2}>Faltan/<br/>Sobran (Ped.)</th>
            </tr>
            <tr>
              {asignaturasBase.map(asig => (
                <th key={asig.cod} className="px-2 py-2 border border-[#cbd5e1] bg-white text-center font-semibold text-[10px] w-20 whitespace-normal align-bottom" title={asig.desc}>
                  <div className="w-16 mx-auto truncate">{asig.desc}</div>
                </th>
              ))}
              
              {asignaturasJec.map(asig => (
                <th key={asig.cod} className="px-2 py-2 border border-[#cbd5e1] bg-white text-center font-semibold text-[10px] w-20 whitespace-normal align-bottom" title={asig.desc}>
                  <div className="w-16 mx-auto truncate">{asig.desc}</div>
                </th>
              ))}

              {anlColumnas.map(anl => (
                <th key={anl.cod} className="px-2 py-2 border border-[#cbd5e1] bg-amber-50 text-center font-semibold text-[10px] w-20 whitespace-normal align-bottom" title={`${anl.desc} (${anl.finan})`}>
                  <div className="w-16 mx-auto truncate">{anl.desc}</div>
                  <div className="text-[8px] text-amber-700 bg-amber-100 rounded mt-1">{anl.finan}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {docentesArray.map((doc, idx) => {
              let sumBase = 0;
              asignaturasBase.forEach(a => sumBase += (doc.asignaturas[a.cod] || 0));
              let sumJec = 0;
              asignaturasJec.forEach(a => sumJec += (doc.asignaturas[a.cod] || 0));
              
              const totalAula = sumBase + sumJec;
              const totalNoLectivas = doc.noLectivas;
              const totalAsignadoPedagogico = totalAula + totalNoLectivas;
              
              const maxPed = Math.floor(doc.horasTitular * (60/45));
              const diferencia = maxPed - totalAsignadoPedagogico;
              const tieneCarga = totalAsignadoPedagogico > 0;
              
              return (
                <tr key={doc.id} className={`bg-white hover:bg-[#f1f5f9] transition-colors ${!tieneCarga ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-2 border border-[#e2e8f0] sticky left-0 bg-white z-10 whitespace-nowrap">
                    <div className="font-bold text-[#0f172a]">{doc.apellidos}, {doc.nombres}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{doc.rut}</div>
                  </td>
                  <td className="px-3 py-2 border border-[#e2e8f0] text-center font-bold sticky left-[250px] bg-white z-10">
                    {doc.horasTitular}
                  </td>
                  
                  {asignaturasBase.map(asig => {
                    const horas = doc.asignaturas[asig.cod] || 0;
                    return <td key={asig.cod} className={`px-2 py-2 border border-[#e2e8f0] text-center ${horas > 0 ? 'font-bold text-[#016098] bg-[#f0f9ff]' : 'text-gray-300'}`}>{horas > 0 ? horas : '-'}</td>;
                  })}
                  <td className="px-2 py-2 border border-[#e2e8f0] text-center font-bold bg-[#bfdbfe] text-[#1e40af]">{sumBase > 0 ? sumBase : '-'}</td>

                  {asignaturasJec.map(asig => {
                    const horas = doc.asignaturas[asig.cod] || 0;
                    return <td key={asig.cod} className={`px-2 py-2 border border-[#e2e8f0] text-center ${horas > 0 ? 'font-bold text-[#166534] bg-[#dcfce7]' : 'text-gray-300'}`}>{horas > 0 ? horas : '-'}</td>;
                  })}
                  <td className="px-2 py-2 border border-[#e2e8f0] text-center font-bold bg-[#bbf7d0] text-[#166534]">{sumJec > 0 ? sumJec : '-'}</td>
                  
                  <td className="px-2 py-2 border border-[#e2e8f0] text-center font-bold bg-[#93c5fd] text-[#1e3a8a] text-base">{totalAula > 0 ? totalAula : '-'}</td>

                  {anlColumnas.map(anl => {
                    const horas = doc.anls[anl.cod] || 0;
                    return <td key={anl.cod} className={`px-2 py-2 border border-[#e2e8f0] text-center ${horas > 0 ? 'font-bold text-[#d97706] bg-[#fef3c7]' : 'text-amber-200 bg-amber-50/20'}`}>{horas > 0 ? horas : '-'}</td>;
                  })}
                  <td className="px-2 py-2 border border-[#e2e8f0] text-center font-bold bg-[#fde68a] text-[#b45309]">{totalNoLectivas > 0 ? totalNoLectivas : '-'}</td>
                  
                  <td className={`px-2 py-2 border border-[#e2e8f0] text-center font-bold ${
                    diferencia === 0 ? 'text-green-600' : 
                    diferencia > 0 ? 'text-orange-500' : 'text-red-600'
                  }`}>
                    {diferencia === 0 ? 'OK' : (diferencia > 0 ? `Faltan ${diferencia}` : `Sobran ${Math.abs(diferencia)}`)}
                  </td>
                </tr>
              );
            })}
          </tbody>
</table>
        {cargas.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            Aún no hay asignaturas ni cargas configuradas en este establecimiento para construir la matriz.
          </div>
        )}
      </div>
    </div>
  );
}
