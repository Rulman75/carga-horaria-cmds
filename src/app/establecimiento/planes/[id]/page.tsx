"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getPlanPropio, 
  actualizarHorasDetallePropio, 
  eliminarDetallePropio, 
  getPlanesEstudio, 
  importarPlanBaseAPropio,
  getAllAsignaturas,
  agregarAsignaturaIndividualPropio
} from '../../../actions';
import Link from 'next/link';

export default function PlanEstablecimientoDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'decreto' | 'individual'>('individual');
  
  // Data for modal
  const [planesBase, setPlanesBase] = useState<any[]>([]);
  const [todasAsignaturas, setTodasAsignaturas] = useState<any[]>([]);
  const [importando, setImportando] = useState(false);

  // Form selections for Decreto
  const [planBaseSeleccionado, setPlanBaseSeleccionado] = useState('');
  
  // Form selections for Individual Subject
  const [asigTienCod, setAsigTienCod] = useState<number | ''>('');
  const [asigGrteCod, setAsigGrteCod] = useState<number | ''>('');
  const [asigCod, setAsigCod] = useState('');

  // Search filter for subjects
  const [searchAsig, setSearchAsig] = useState('');

  // Optimistic UI for hours editing
  const [editingId, setEditingId] = useState<number | null>(null);

  // Helper para asignaturas que siempre son especialistas (incluso en 1°-4°)
  const isEspecialistaAsig = (fila: any) => {
    return fila?.esEspecialistaSiempre === true;
  };


  const [editValue, setEditValue] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    const data = await getPlanPropio(parseInt(id as string));
    setPlan(data);
    
    const bases = await getPlanesEstudio();
    setPlanesBase(bases);

    const asigs = await getAllAsignaturas();
    setTodasAsignaturas(asigs);
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleEdit = (detId: number, currentHoras: number) => {
    setEditingId(detId);
    setEditValue(currentHoras.toString());
  };

  const handleSaveHoras = async (detId: number) => {
    const num = parseFloat(editValue);
    if (isNaN(num)) return;
    
    setPlan({
      ...plan,
      detalles: plan.detalles.map((d: any) => d.id === detId ? { ...d, horas: num } : d)
    });
    setEditingId(null);
    await actualizarHorasDetallePropio(detId, num);
  };

  const handleEliminarColumna = async (tienCod: number, grteCod: number) => {
    if (!confirm("¿Eliminar este nivel/curso completo de la malla?")) return;
    
    const detallesABorrar = plan.detalles.filter((d: any) => d.grteCod === grteCod && d.tienCod === tienCod);
    
    setPlan({
      ...plan,
      detalles: plan.detalles.filter((d: any) => !(d.grteCod === grteCod && d.tienCod === tienCod))
    });

    for (const d of detallesABorrar) {
      await eliminarDetallePropio(d.id);
    }
  };

  const handleEliminarFila = async (asigCodStr: string, tienCod: number) => {
    if (!confirm("¿Eliminar esta asignatura completa de este nivel?")) return;
    
    const detallesABorrar = plan.detalles.filter((d: any) => d.codAsignatura === asigCodStr && d.tienCod === tienCod);
    
    setPlan({
      ...plan,
      detalles: plan.detalles.filter((d: any) => !(d.codAsignatura === asigCodStr && d.tienCod === tienCod))
    });

    for (const d of detallesABorrar) {
      await eliminarDetallePropio(d.id);
    }
  };

  const handleImportarDecreto = async () => {
    if (!planBaseSeleccionado) {
      alert("Selecciona un decreto base.");
      return;
    }
    
    setImportando(true);
    try {
      await importarPlanBaseAPropio(parseInt(id as string), parseInt(planBaseSeleccionado));
      setShowModal(false);
      await loadData();
    } catch (error) {
      alert("Error al importar el decreto.");
      console.error(error);
    }
    setImportando(false);
  };

  const handleAgregarIndividual = async () => {
    if (asigTienCod === '' || asigGrteCod === '' || !asigCod) {
      alert("Por favor, selecciona Tipo de Enseñanza, Curso y Asignatura.");
      return;
    }

    setImportando(true);
    try {
      await agregarAsignaturaIndividualPropio(
        parseInt(id as string),
        asigTienCod,
        asigGrteCod,
        asigCod
      );
      setShowModal(false);
      setAsigTienCod('');
      setAsigGrteCod('');
      setAsigCod('');
      setSearchAsig('');
      await loadData();
    } catch (error) {
      alert("Error al agregar la asignatura.");
      console.error(error);
    }
    setImportando(false);
  };

  // --------------------------------------------------------
  // MATRIX CALCULATION
  // --------------------------------------------------------
  const matricesPorTipo = useMemo(() => {
    if (!plan || !plan.detalles) return [];

    const dotacionCursos = plan.establecimiento?.grados || [];

    const tipos = new Map<number, any>();
    plan.detalles.forEach((d: any) => {
      if (!tipos.has(d.tienCod) && d.tipoEnsenanza) {
        tipos.set(d.tienCod, d.tipoEnsenanza);
      }
    });

    const result = Array.from(tipos.values()).map(tipo => {
      const detallesTipo = plan.detalles.filter((d: any) => d.tienCod === tipo.tienCod);
      
      const gradosMap = new Map<number, any>();
      detallesTipo.forEach((d: any) => {
        if (!gradosMap.has(d.grteCod) && d.grado) {
          const dot = dotacionCursos.find((c:any) => c.tienCod === tipo.tienCod && c.grteCod === d.grteCod);
          gradosMap.set(d.grteCod, { ...d.grado, cantidadCursos: dot ? dot.cantidadCursos : 0 });
        }
      });
      const columnas = Array.from(gradosMap.values()).sort((a, b) => a.grteCod - b.grteCod);

      const asigMap = new Map<string, any>();
      detallesTipo.forEach((d: any) => {
        if (!asigMap.has(d.codAsignatura) && d.asignatura) {
          asigMap.set(d.codAsignatura, d.asignatura);
        }
      });
      const filas = Array.from(asigMap.values()).sort((a, b) => a.asigDescripcion.localeCompare(b.asigDescripcion));

      const matrizDatos = new Map<string, any>();
      detallesTipo.forEach((d: any) => {
        matrizDatos.set(`${d.codAsignatura}-${d.grteCod}`, d);
      });

      // Determinar si los grados son generalistas (1-4, grteCod <= 40) o especialistas (5+, grteCod > 40)
      // Un bloque es generalista si TODOS sus grados son <= 40
      const esGeneralista = columnas.length > 0 && columnas.every((c: any) => c.grteCod <= 40);

      return {
        tipo,
        columnas,
        filas,
        matrizDatos,
        esGeneralista
      };
    });

    return result.sort((a, b) => a.tipo.tienCod - b.tipo.tienCod);
  }, [plan]);


  if (loading) return <div className="p-10 text-center text-gray-500">Cargando malla del plan...</div>;
  if (!plan) return <div className="p-10 text-center text-red-500">Plan no encontrado.</div>;

  // Derive unique Tipos and Grados available in the current matrix to populate the Individual dropdown
  const uniqueTiposEnsenanza = matricesPorTipo.map(m => m.tipo);
  const selectedMatrixForForm = matricesPorTipo.find(m => m.tipo.tienCod === asigTienCod);
  const availableGradesForForm = selectedMatrixForForm ? selectedMatrixForForm.columnas : [];

  const filteredAsignaturas = todasAsignaturas.filter(a => 
    a.asigDescripcion.toLowerCase().includes(searchAsig.toLowerCase()) || 
    a.asigCod.toLowerCase().includes(searchAsig.toLowerCase())
  ).slice(0, 50);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-[#e2e8f0] shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/establecimiento/planes" className="text-gray-400 hover:text-[#016098] transition-colors">
              ← Volver
            </Link>
            <h1 className="text-2xl font-bold text-[#1e293b]">{plan.nombre}</h1>
          </div>
          <p className="text-sm text-gray-500">Haz clic en las celdas numéricas para editar las horas.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          + Agregar a la Malla
        </button>
      </div>

      <div className="flex flex-col gap-8 pb-10">
        {matricesPorTipo.map((matriz, idx) => {
          
          let totalHorasNivel = 0;
          let totalHorasRealesNivel = 0;

          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden w-max min-w-full">
              <div className="p-4 border-b border-[#e2e8f0] bg-[#016098] text-white flex justify-between items-center">
                <h3 className="font-bold text-lg">{matriz.tipo.tienDescripcion}</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-[#f8fafc] text-[#64748b]">
                    <tr>
                      <th className="px-4 py-3 font-bold border-b border-r border-[#e2e8f0] bg-white sticky left-0 z-10 w-64 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        Asignatura
                      </th>
                      {matriz.columnas.map(col => (
                        <th key={col.grteCod} className="px-4 py-3 font-semibold border-b border-r border-[#e2e8f0] text-center min-w-[100px] group relative">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span>{col.grteDescrip}</span>
                            <button 
                              onClick={() => handleEliminarColumna(matriz.tipo.tienCod, col.grteCod)}
                              className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                              title="Eliminar Curso Completo"
                            >
                              🗑️
                            </button>
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 font-bold border-b border-l-2 border-l-[#016098] border-[#e2e8f0] text-center min-w-[120px] bg-sky-50 text-[#016098]">
                        Total Hrs Esp.
                      </th>
                      <th className="px-4 py-3 font-bold border-b border-r border-[#e2e8f0] text-center min-w-[120px] bg-emerald-50 text-emerald-800">
                        Docentes Esp.
                      </th>
                    </tr>
                  </thead>
                  
                  <tbody>
                    {matriz.filas.map((fila, fIdx) => {
                      let sumaFila = 0;
                      
                      return (
                        <tr key={fila.asigCod} className={`${fIdx % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfc]'} group`}>
                          <td className="px-4 py-3 font-semibold text-[#1e293b] border-b border-r border-[#e2e8f0] sticky left-0 z-10 bg-inherit shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] flex justify-between items-center">
                            <span className="truncate pr-2">{fila.asigDescripcion}</span>
                            <button 
                              onClick={() => handleEliminarFila(fila.asigCod, matriz.tipo.tienCod)}
                              className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              title="Eliminar Asignatura"
                            >
                              🗑️
                            </button>
                          </td>
                          {matriz.columnas.map(col => {
                            const cellData = matriz.matrizDatos.get(`${fila.asigCod}-${col.grteCod}`);
                            // Solo sumar en Total Horas los grados especialistas (5°+)
                            if (cellData && (col.grteCod > 40 || isEspecialistaAsig(fila))) sumaFila += (cellData.horas * (col.cantidadCursos || 0));

                            return (
                              <td key={col.grteCod} className="border-b border-r border-[#e2e8f0] text-center p-0 align-middle">
                                {cellData ? (
                                  <div className="w-full h-full min-h-[48px] flex items-center justify-center hover:bg-[#e0f2fe] transition-colors">
                                    {editingId === cellData.id ? (
                                      <div className="flex items-center justify-center p-1">
                                        <input 
                                          type="number"
                                          step="0.5"
                                          className="w-16 h-8 border-2 border-[#0369a1] rounded text-center font-bold text-[#0369a1] focus:outline-none"
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          autoFocus
                                          onKeyDown={(e) => e.key === 'Enter' && handleSaveHoras(cellData.id)}
                                          onBlur={() => handleSaveHoras(cellData.id)}
                                        />
                                      </div>
                                    ) : (
                                      <div 
                                        className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-2"
                                        onClick={() => handleEdit(cellData.id, cellData.horas)}
                                      >
                                        <span className={`text-lg font-bold ${cellData.horas > 0 ? 'text-[#016098]' : 'text-red-400'}`}>
                                          {cellData.horas}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="w-full h-full min-h-[48px] bg-gray-50 flex items-center justify-center text-gray-300 text-xs">-</div>
                                )}
                              </td>
                            );
                          })}
                          <td className="border-b border-l-2 border-l-[#016098] border-[#e2e8f0] text-center align-middle bg-sky-50 font-bold text-[#016098] p-2">
                            <span className="text-lg">{sumaFila}</span> <span className="text-xs font-normal">hrs</span>
                          </td>
                          {(() => {
                            // Solo sumar horas de grados especialistas (5°+, grteCod > 40)
                            let sumaEsp = 0;
                            matriz.columnas.forEach((col: any) => {
                              if (col.grteCod > 40 || isEspecialistaAsig(fila)) {
                                const cd = matriz.matrizDatos.get(`${fila.asigCod}-${col.grteCod}`);
                                if (cd) sumaEsp += (cd.horas * (col.cantidadCursos || 0));
                              }
                            });
                            return (
                              <td className="border-b border-r border-[#e2e8f0] text-center align-middle bg-emerald-50 font-bold text-emerald-700 p-2">
                                {sumaEsp > 0 ? (
                                  <span>{(sumaEsp / 28.6).toFixed(1)} <span className="text-xs font-normal">Doc.</span></span>
                                ) : (
                                  <span className="text-gray-300">-</span>
                                )}
                              </td>
                            );
                          })()}
                        </tr>
                      );
                    })}
                  </tbody>
                  
                  {/* FOOTER TOTALS */}
                  <tfoot className="bg-[#f1f5f9] font-bold text-[#1e293b]">
                    <tr>
                      <td className="px-4 py-3 border-r border-[#e2e8f0] text-right sticky left-0 bg-[#f1f5f9] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        Horas del Plan Base (Por Nivel)
                      </td>
                      {matriz.columnas.map(col => {
                        let sumaColumna = 0;
                        matriz.filas.forEach(f => {
                          const cData = matriz.matrizDatos.get(`${f.asigCod}-${col.grteCod}`);
                          if (cData) sumaColumna += cData.horas;
                        });
                        totalHorasNivel += sumaColumna;
                        return (
                          <td key={`total-${col.grteCod}`} className="px-4 py-3 border-r border-[#e2e8f0] text-center text-[#016098] text-lg">
                            {sumaColumna}
                          </td>
                        );
                      })}
                      <td colSpan={2} className="px-4 py-3 border-l-2 border-l-[#016098] border-[#e2e8f0] text-center bg-[#e0f2fe] text-[#0369a1] text-xl">
                        {totalHorasNivel} hrs base
                      </td>
                    </tr>
                    
                    <tr className="bg-[#f8fafc] text-gray-500 text-xs">
                      <td className="px-4 py-2 border-r border-[#e2e8f0] text-right sticky left-0 bg-[#f8fafc] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        Dotación de Cursos
                      </td>
                      {matriz.columnas.map(col => (
                        <td key={`dot-${col.grteCod}`} className="px-4 py-2 border-r border-[#e2e8f0] text-center">
                          x {col.cantidadCursos} cursos
                        </td>
                      ))}
                      <td colSpan={2} className="px-4 py-2 border-l-2 border-l-[#016098] border-[#e2e8f0] bg-sky-50 text-center"></td>
                    </tr>

                    <tr className="bg-[#016098] text-white">
                      <td className="px-4 py-4 border-r border-[#016098] text-right uppercase tracking-wider text-xs sticky left-0 bg-[#016098] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        Total Horas Docentes Requeridas
                      </td>
                      {matriz.columnas.map(col => {
                        let sumaColumna = 0;
                        matriz.filas.forEach(f => {
                          const cData = matriz.matrizDatos.get(`${f.asigCod}-${col.grteCod}`);
                          if (cData) sumaColumna += cData.horas;
                        });
                        const real = sumaColumna * (col.cantidadCursos || 0);
                        totalHorasRealesNivel += real;
                        
                        return (
                          <td key={`real-${col.grteCod}`} className="px-4 py-4 border-r border-[#014d7a] text-center text-xl">
                            {real}
                          </td>
                        );
                      })}
                      <td colSpan={2} className="px-4 py-4 border-l-2 border-l-[#0369a1] text-center text-2xl bg-[#0369a1]">
                        {totalHorasRealesNivel} <span className="text-sm font-normal">hrs reales</span>
                      </td>
                    </tr>
                    
                    {/* Row 4: Docentes Generalistas (1°-4°) */}
                    <tr className="bg-amber-50 text-amber-900 border-t-2 border-amber-300">
                      <td className="px-4 py-2 border-r border-[#e2e8f0] text-right sticky left-0 bg-amber-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <div className="text-sm font-bold">Docentes Generalistas (1°-4°)</div>
                        <div className="text-[10px] font-normal text-amber-700">* 1 docente = 1 curso (imparte todas las asignaturas)</div>
                      </td>
                      {(() => {
                        let totalGen = 0;
                        return (<>
                          {matriz.columnas.map((col: any) => {
                            if (col.grteCod <= 40) {
                              // Sumar todas las horas de asignaturas hacia abajo en esta columna
                              let sumaColumna = 0;
                              matriz.filas.forEach((f: any) => {
                                // NO sumar asignaturas especialistas en el total de horas del generalista
                                if (!isEspecialistaAsig(f)) {
                                  const cData = matriz.matrizDatos.get(`${f.asigCod}-${col.grteCod}`);
                                  if (cData) sumaColumna += cData.horas;
                                }
                              });
                              const cursos = col.cantidadCursos || 0;
                              totalGen += cursos;
                              return (
                                <td key={`gen-${col.grteCod}`} className="px-4 py-2 border-r border-[#e2e8f0] text-center">
                                  <div className="text-sm font-bold text-amber-800">{sumaColumna} hrs/curso</div>
                                  <div className="text-xs text-amber-600">x {cursos} cursos = <span className="font-bold">{cursos} doc.</span></div>
                                </td>
                              );
                            }
                            return (
                              <td key={`gen-${col.grteCod}`} className="px-4 py-2 border-r border-[#e2e8f0] text-center text-gray-300">-</td>
                            );
                          })}
                          <td colSpan={2} className="px-4 py-2 border-l-2 border-l-[#016098] border-[#e2e8f0] text-center bg-amber-100 text-amber-800 font-bold text-lg">
                            {totalGen} Generalistas
                          </td>
                        </>);
                      })()}
                    </tr>

                    {/* Row 5: Docentes Especialistas */}
                    <tr className="bg-emerald-50 text-emerald-900 border-t-2 border-emerald-300">
                      <td className="px-4 py-2 border-r border-[#e2e8f0] text-right sticky left-0 bg-emerald-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <div className="text-sm font-bold">Docentes Especialistas</div>
                        <div className="text-[10px] font-normal text-emerald-700">* Proporción 65/35 (28.6 hrs lectivas por docente)</div>
                      </td>
                      {matriz.columnas.map((col: any) => (
                        <td key={`esp-${col.grteCod}`} className="px-4 py-2 border-r border-[#e2e8f0] text-center text-gray-300"></td>
                      ))}
                      {(() => {
                        // Sumar la columna "Docentes Esp." de cada fila (solo grados 5°+)
                        let totalEsp = 0;
                        matriz.filas.forEach((fila: any) => {
                          let sumaFilaEsp = 0;
                          matriz.columnas.forEach((col: any) => {
                            if (col.grteCod > 40 || isEspecialistaAsig(fila)) {
                              const cd = matriz.matrizDatos.get(`${fila.asigCod}-${col.grteCod}`);
                              if (cd) sumaFilaEsp += (cd.horas * (col.cantidadCursos || 0));
                            }
                          });
                          totalEsp += sumaFilaEsp / 28.6;
                        });
                        return (
                          <td colSpan={2} className="px-4 py-2 border-l-2 border-l-[#016098] border-[#e2e8f0] text-center bg-emerald-100 text-emerald-800 font-bold text-lg">
                            {totalEsp.toFixed(1)} Especialistas
                          </td>
                        );
                      })()}
                    </tr>

                  </tfoot>
                </table>
              </div>
            </div>
          );
        })}

        {matricesPorTipo.length === 0 && (
          <div className="bg-white p-10 rounded-xl border border-[#e2e8f0] text-center text-gray-500">
            El plan clonado no contenía ninguna asignatura.
          </div>
        )}

        {/* GRAND TOTAL DEL ESTABLECIMIENTO */}
        {matricesPorTipo.length > 0 && (
          <div className="bg-[#016098] rounded-xl shadow-lg border border-[#014d7a] p-6 text-white mt-4 mb-8 mx-2 shrink-0">
            <h2 className="text-xl font-bold mb-4 border-b border-[#014d7a] pb-2 text-center md:text-left">Resumen Global del Plan de Estudio</h2>
            
            {(() => {
              let granTotalReales = 0;
              let totalGeneralistas = 0;
              let totalEspecialistas = 0;
              
              matricesPorTipo.forEach(m => {
                // Generalistas: sumar cantidadCursos de grados 1°-4°
                m.columnas.forEach((col: any) => {
                  let sumaCol = 0;
                  m.filas.forEach((f: any) => {
                    const cData = m.matrizDatos.get(`${f.asigCod}-${col.grteCod}`);
                    if (cData) sumaCol += cData.horas;
                  });
                  granTotalReales += sumaCol * (col.cantidadCursos || 0);
                  
                  if (col.grteCod <= 40) {
                    totalGeneralistas += (col.cantidadCursos || 0);
                  }
                });
                
                // Especialistas: sumar docentes por fila (grados 5°+ o asignaturas siempre especialistas)
                m.filas.forEach((fila: any) => {
                  let sumaFilaEsp = 0;
                  m.columnas.forEach((col: any) => {
                    if (col.grteCod > 40 || isEspecialistaAsig(fila)) {
                      const cd = m.matrizDatos.get(`${fila.asigCod}-${col.grteCod}`);
                      if (cd) sumaFilaEsp += (cd.horas * (col.cantidadCursos || 0));
                    }
                  });
                  totalEspecialistas += sumaFilaEsp / 28.6;
                });
              });
              
              const granTotalDocentes = totalGeneralistas + totalEspecialistas;

              return (
                <div className="flex flex-col md:flex-row gap-6 items-center justify-around py-2">
                  <div className="text-center">
                    <div className="text-sm text-sky-200 uppercase tracking-widest font-semibold mb-1">Total Horas Reales</div>
                    <div className="text-4xl font-black">{granTotalReales} <span className="text-xl font-medium">hrs</span></div>
                  </div>
                  <div className="hidden md:block w-px h-16 bg-[#014d7a]"></div>
                  <div className="text-center">
                    <div className="text-sm text-amber-300 uppercase tracking-widest font-semibold mb-1">Generalistas (1°-4°)</div>
                    <div className="text-3xl font-black text-amber-400">{totalGeneralistas}</div>
                    <div className="text-[10px] text-sky-200 mt-1">1 docente por curso</div>
                  </div>
                  <div className="hidden md:block w-px h-16 bg-[#014d7a]"></div>
                  <div className="text-center">
                    <div className="text-sm text-emerald-300 uppercase tracking-widest font-semibold mb-1">Especialistas</div>
                    <div className="text-3xl font-black text-emerald-400">{totalEspecialistas.toFixed(1)}</div>
                    <div className="text-[10px] text-sky-200 mt-1">Contratos 44 hrs (65/35)</div>
                  </div>
                  <div className="hidden md:block w-px h-16 bg-[#014d7a]"></div>
                  <div className="text-center border-2 border-white/30 rounded-xl p-4">
                    <div className="text-sm text-white uppercase tracking-widest font-semibold mb-1">Total Docentes</div>
                    <div className="text-5xl font-black text-white">{granTotalDocentes.toFixed(1)}</div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>

      {/* MODAL PARA AGREGAR ASIGNATURAS / PLANES */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc]">
              <div>
                <h2 className="text-xl font-bold text-[#1e293b]">Agregar a la Malla</h2>
                <p className="text-sm text-gray-500 mt-1">Inserta un decreto completo o una asignatura específica.</p>
              </div>
              <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                <button 
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${modalTab === 'individual' ? 'bg-[#016098] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  onClick={() => setModalTab('individual')}
                >
                  Asignatura Extra
                </button>
                <button 
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${modalTab === 'decreto' ? 'bg-[#016098] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  onClick={() => setModalTab('decreto')}
                >
                  Decreto Completo
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {modalTab === 'decreto' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mb-4 text-sm text-amber-800">
                    Al importar un decreto completo, todas sus asignaturas y horas se añadirán a tu plan actual. Ideal para fusionar Enseñanza Básica con Media, o primer ciclo con segundo ciclo.
                  </div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Selecciona el Decreto a Anexar</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#016098] focus:ring-1 focus:ring-[#016098]"
                    value={planBaseSeleccionado}
                    onChange={(e) => setPlanBaseSeleccionado(e.target.value)}
                  >
                    <option value="">Seleccione un decreto base...</option>
                    {planesBase.map(pb => (
                      <option key={pb.codPlan} value={pb.codPlan}>
                        Decreto {pb.codPlan} - {pb.nombrePlan}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {modalTab === 'individual' && (
                <div className="space-y-5">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Enseñanza</label>
                      <select 
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#016098]"
                        value={asigTienCod}
                        onChange={(e) => {
                          setAsigTienCod(Number(e.target.value));
                          setAsigGrteCod(''); // reset grade
                        }}
                      >
                        <option value="">Seleccione...</option>
                        {uniqueTiposEnsenanza.map(t => (
                          <option key={t.tienCod} value={t.tienCod}>{t.tienDescripcion}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Curso Destino</label>
                      <select 
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#016098]"
                        value={asigGrteCod}
                        onChange={(e) => setAsigGrteCod(Number(e.target.value))}
                        disabled={!asigTienCod}
                      >
                        <option value="">Seleccione...</option>
                        {availableGradesForForm.map((g: any) => (
                          <option key={g.grteCod} value={g.grteCod}>{g.grteDescrip}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Asignatura</label>
                    <input 
                      type="text"
                      placeholder="Buscar por nombre o código..."
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm mb-2 focus:outline-none focus:border-[#016098]"
                      value={searchAsig}
                      onChange={(e) => setSearchAsig(e.target.value)}
                    />
                    
                    <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto custom-scrollbar">
                      {filteredAsignaturas.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">No se encontraron asignaturas.</div>
                      ) : (
                        <div className="flex flex-col">
                          {filteredAsignaturas.map(a => (
                            <label key={a.asigCod} className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 ${asigCod === a.asigCod ? 'bg-sky-50' : ''}`}>
                              <input 
                                type="radio" 
                                name="asignatura" 
                                className="w-4 h-4 text-[#016098]"
                                checked={asigCod === a.asigCod}
                                onChange={() => setAsigCod(a.asigCod)}
                              />
                              <span className="text-sm text-gray-800 font-medium">{a.asigDescripcion}</span>
                              <span className="text-xs text-gray-400 ml-auto">Cód: {a.asigCod}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              
              {modalTab === 'decreto' ? (
                <button 
                  onClick={handleImportarDecreto}
                  disabled={importando}
                  className="bg-[#39BABD] hover:bg-[#2b9698] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                >
                  {importando ? 'Importando...' : 'Importar y Fusionar'}
                </button>
              ) : (
                <button 
                  onClick={handleAgregarIndividual}
                  disabled={importando}
                  className="bg-[#016098] hover:bg-[#014d7a] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                >
                  {importando ? 'Agregando...' : 'Agregar Asignatura'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
