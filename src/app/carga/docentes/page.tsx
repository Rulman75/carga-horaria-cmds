'use client';

import React, { useState, useEffect } from 'react';
import { getDocentesEstablecimiento, updateDocenteHoras, createOrUpdateDocente, deleteDocente, getCargaDocenteUnico, getTablaConversion } from '../../actions';
import * as XLSX from 'xlsx';

export default function DocentesPage() {
const parseCronoToDecimal = (cronoVal: string | number) => {
  if (!cronoVal) return 0;
  if (typeof cronoVal === 'number') return cronoVal;
  const parts = cronoVal.toString().split(':');
  if (parts.length === 2) {
    return parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60;
  }
  return Number(cronoVal);
};

const formatCronoDecimal = (decimal: number) => {
  const horas = Math.floor(decimal);
  const mins = Math.round((decimal - horas) * 60);
  if (mins === 60) return `${horas + 1}:00`;
  return `${horas}:${mins.toString().padStart(2, '0')}`;
};
  const [docentes, setDocentes] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editHoras, setEditHoras] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [establecimientoId, setEstablecimientoId] = useState<number>(2);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ rut: '', nombres: '', apellidoPaterno: '', apellidoMaterno: '', horasTitular: 44, contrato: 'TITULAR' });

  const [showCargaModal, setShowCargaModal] = useState(false);
  const [cargaDocente, setCargaDocente] = useState<any[]>([]);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState<any>(null);
  
  const [tablaConversion, setTablaConversion] = useState<any[]>([]);
  const [docenteCargaObs, setDocenteCargaObs] = useState('');

  useEffect(() => {
    const estId = Number(localStorage.getItem('selectedEstablecimientoId')) || 2;
    setEstablecimientoId(estId);
    loadDocentes(estId);
    getTablaConversion().then(setTablaConversion);
  }, []);

  const loadDocentes = (estId: number = establecimientoId) => {
    getDocentesEstablecimiento(estId).then(setDocentes);
  };

  const handleEdit = (doc: any) => {
    setEditingId(doc.id);
    setEditHoras(doc.horasTitular || 44);
  };

  const handleSave = async (id: number) => {
    setLoading(true);
    try {
      await updateDocenteHoras(id, editHoras);
      setEditingId(null);
      loadDocentes();
    } catch (e) {
      alert('Error al guardar las horas del docente');
    }
    setLoading(false);
  };

  const handleAddDocente = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOrUpdateDocente(establecimientoId, addForm);
      setShowAddModal(false);
      setAddForm({ rut: '', nombres: '', apellidoPaterno: '', apellidoMaterno: '', horasTitular: 44, contrato: 'TITULAR' });
      loadDocentes();
    } catch (e: any) {
      alert(e.message || 'Error agregando docente');
    }
  };

  const handleDeleteDocente = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas desvincular a este docente del establecimiento?')) return;
    try {
      const res: any = await deleteDocente(id, establecimientoId);
      if (res.error) {
        alert(res.error);
      } else {
        loadDocentes();
      }
    } catch (e) {
      alert('Error eliminando docente');
    }
  };

  const handleVerCarga = async (doc: any) => {
    setDocenteSeleccionado(doc);
    const estRels = doc.establecimientos || [];
    const rel = estRels.find((r: any) => r.establecimientoId === establecimientoId);
    setDocenteCargaObs(rel?.observacionCarga || '');
    
    const cargas = await getCargaDocenteUnico(doc.id, establecimientoId);
    setCargaDocente(cargas);
    setShowCargaModal(true);
  };

  const exportToExcel = () => {
    const dataToExport = docentes.map(d => ({
      'RUT': d.rut,
      'NOMBRES': d.nombres,
      'APELLIDO PATERNO': d.apellidoPaterno,
      'APELLIDO MATERNO': d.apellidoMaterno,
      'CONTRATO': d.contrato,
      'INICIO CONTRATO': d.inicioContrato ? new Date(d.inicioContrato).toLocaleDateString('es-CL') : '',
      'TERMINO CONTRATO': d.terminoContrato ? new Date(d.terminoContrato).toLocaleDateString('es-CL') : '',
      'HRS TITULAR': d.horasTitular,
      'HRS CONTRATO': d.horasContrato,
      'TOTAL JORNADA': d.totalJornada
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Docentes");
    XLSX.writeFile(workbook, "Listado_Docentes.xlsx");
  };

  let horasLectivasAsignadas = 0;
  let horasNoLectivasAsignadas = 0;
  let horasExtraAsignadas = 0;
  
  let maxLectivasPedagogicas = 0;
  let maxNoLectivasStr = '0:00';
  let maxNoLectivasDecimal = 0;
  let recreoDecimal = 0;
  let pctLectivas = 0;
  let pctNoLectivas = 0;
  
  let totalHorasContrato = 0;
  let colacion = 0;
  
  if (showCargaModal && docenteSeleccionado) {
    horasLectivasAsignadas = cargaDocente.filter(c => c.tipoCarga === 'LECTIVA').reduce((sum, c) => sum + (c.horasAllocadas || c.horas || 0), 0);
    horasNoLectivasAsignadas = cargaDocente.filter(c => c.tipoCarga === 'NO_LECTIVA').reduce((sum, c) => sum + (c.horasAllocadas || c.horas || 0), 0);
    horasExtraAsignadas = cargaDocente.filter(c => c.tipoCarga === 'EXTRACURRICULAR').reduce((sum, c) => sum + (c.horasAllocadas || c.horas || 0), 0);
    
    totalHorasContrato = docenteSeleccionado?.totalDefinitivo || docenteSeleccionado?.totalJornada || docenteSeleccionado?.horasTitular || 0;
    colacion = totalHorasContrato >= 30 ? 2 : 1;
    const baseAsignable = Math.max(0, totalHorasContrato - colacion);
    
    const conversionData = tablaConversion.find((t: any) => t.jornadaSemanal === baseAsignable);
    
    maxLectivasPedagogicas = conversionData ? conversionData.lectivasPedagogicas : Math.floor(baseAsignable * (65/45));
    maxNoLectivasStr = conversionData ? conversionData.noLectivasCronologicas : `${Math.floor(baseAsignable*0.35)}:00`;
    maxNoLectivasDecimal = parseCronoToDecimal(maxNoLectivasStr);

    const currentConversionData = tablaConversion.find((t: any) => t.lectivasPedagogicas === horasLectivasAsignadas);
    recreoDecimal = currentConversionData ? parseCronoToDecimal(currentConversionData.recreoCronologicas) : 0;
    
    pctLectivas = Math.min(100, (horasLectivasAsignadas / maxLectivasPedagogicas) * 100) || 0;
    pctNoLectivas = Math.min(100, (horasNoLectivasAsignadas / maxNoLectivasDecimal) * 100) || 0;
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[#016098]">Registro de Docentes</h1>
        <div className="flex gap-2">
          <button 
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Exportar Excel
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#39BABD] hover:bg-[#2b9799] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Agregar Docente
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <p className="text-[#64748b] text-sm">
            Administración de docentes y sus horas. Vista detallada según base de datos corporativa.
          </p>
        </div>
        
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-[#64748b] uppercase bg-[#f1f5f9] sticky top-0 shadow-sm z-10 whitespace-nowrap">
              <tr>
                <th className="px-4 py-3">RUT</th>
                <th className="px-4 py-3">Nombres</th>
                <th className="px-4 py-3">Ape. Paterno</th>
                <th className="px-4 py-3">Ape. Materno</th>
                <th className="px-4 py-3 text-center">Contrato</th>
                <th className="px-4 py-3 text-center">Hrs Titular</th>
                <th className="px-4 py-3 text-center">Hrs Contrato</th>
                <th className="px-4 py-3 text-center">Total Jornada</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {docentes.map(docente => (
                <tr key={docente.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors whitespace-nowrap">
                  <td className="px-4 py-3 font-mono text-xs text-[#64748b]">{docente.rut}</td>
                  <td className="px-4 py-3 font-medium text-[#1e293b]">{docente.nombres}</td>
                  <td className="px-4 py-3 text-[#1e293b]">{docente.apellidoPaterno}</td>
                  <td className="px-4 py-3 text-[#1e293b]">{docente.apellidoMaterno}</td>
                  <td className="px-4 py-3 text-center text-xs">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                      {docente.contrato || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-[#016098]">
                    {editingId === docente.id ? (
                      <input 
                        type="number" 
                        min="1" 
                        max="44" 
                        value={editHoras} 
                        onChange={(e) => setEditHoras(Number(e.target.value))}
                        className="w-16 px-1 py-1 border rounded text-center focus:outline-none focus:border-blue-500 font-normal"
                        autoFocus
                      />
                    ) : (
                      docente.horasTitular
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{docente.horasContrato || '-'}</td>
                  <td className="px-4 py-3 text-center font-bold text-[#39BABD]">{docente.totalJornada || '-'}</td>
                  <td className="px-4 py-3 text-center w-48">
                    <div className="flex justify-center items-center gap-2">
                      {editingId === docente.id ? (
                        <>
                          <button onClick={() => handleSave(docente.id)} className="text-green-600 hover:text-green-800 text-xs font-bold">Guardar</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700 text-xs">Cancelar</button>
                        </>
                      ) : (
                        <button onClick={() => handleEdit(docente)} className="text-blue-600 hover:text-blue-800 text-xs font-medium bg-blue-50 px-2 py-1 rounded">Editar Horas</button>
                      )}
                      
                      <button onClick={() => handleVerCarga(docente)} className="text-emerald-600 hover:text-emerald-800 text-xs font-medium bg-emerald-50 px-2 py-1 rounded">Ver Carga</button>
                      <button onClick={() => handleDeleteDocente(docente.id)} className="text-red-600 hover:text-red-800 text-xs font-medium bg-red-50 px-2 py-1 rounded">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {docentes.length === 0 && (
                <tr>
                  <td colSpan={15} className="px-6 py-8 text-center text-[#94a3b8]">No hay docentes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[400px]">
            <h2 className="text-xl font-bold text-[#016098] mb-4">Agregar Docente</h2>
            <form onSubmit={handleAddDocente} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">RUT</label>
                <input required type="text" value={addForm.rut} onChange={e => setAddForm({...addForm, rut: e.target.value})} className="w-full border p-2 rounded text-sm" placeholder="12345678-9" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nombres</label>
                <input required type="text" value={addForm.nombres} onChange={e => setAddForm({...addForm, nombres: e.target.value})} className="w-full border p-2 rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Apellido Paterno</label>
                <input required type="text" value={addForm.apellidoPaterno} onChange={e => setAddForm({...addForm, apellidoPaterno: e.target.value})} className="w-full border p-2 rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Apellido Materno</label>
                <input type="text" value={addForm.apellidoMaterno} onChange={e => setAddForm({...addForm, apellidoMaterno: e.target.value})} className="w-full border p-2 rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo Contrato</label>
                <select value={addForm.contrato} onChange={e => setAddForm({...addForm, contrato: e.target.value})} className="w-full border p-2 rounded text-sm">
                  <option value="TITULAR">TITULAR</option>
                  <option value="CONTRATA">CONTRATA</option>
                  <option value="REEMPLAZO">REEMPLAZO</option>
                  <option value="SEP">SEP</option>
                  <option value="PIE">PIE</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Horas Titular</label>
                <input required type="number" min="1" max="44" value={addForm.horasTitular} onChange={e => setAddForm({...addForm, horasTitular: Number(e.target.value)})} className="w-full border p-2 rounded text-sm" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#016098] text-white rounded-lg text-sm font-medium">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCargaModal && docenteSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[800px] max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start mb-4 border-b pb-3">
              <div>
                <h2 className="text-xl font-bold text-[#016098]">Resumen de Carga Horaria</h2>
                <p className="text-sm text-gray-600">{docenteSeleccionado.nombres} {docenteSeleccionado.apellidos}</p>
              </div>
              <button onClick={() => setShowCargaModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
            </div>
            
            <div className="overflow-y-auto flex-1 flex flex-col gap-4 p-1">
              
              <div className="flex flex-col md:flex-row gap-6 p-4 border rounded-xl bg-white shadow-sm">
                <div className="flex-1 flex flex-col justify-center gap-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-[#39BABD]">Aula + JEC (Mx: {maxLectivasPedagogicas} ped)</span>
                      <span className={`font-bold ${horasLectivasAsignadas > maxLectivasPedagogicas ? 'text-red-500' : 'text-[#64748b]'}`}>{Math.round(horasLectivasAsignadas)} / {Math.round(maxLectivasPedagogicas)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-1.5 rounded-full transition-all duration-500 ${horasLectivasAsignadas > maxLectivasPedagogicas ? 'bg-red-500' : 'bg-[#39BABD]'}`} style={{ width: `${Math.min(100, pctLectivas)}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-[#F59E0B]">No Lectivas (Max Crono: {maxNoLectivasStr})</span>
                      <span className={`font-bold ${horasNoLectivasAsignadas > maxNoLectivasDecimal ? 'text-red-500' : 'text-[#64748b]'}`}>{horasNoLectivasAsignadas} / {maxNoLectivasDecimal.toFixed(1)} hrs</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-1.5 rounded-full transition-all duration-500 ${horasNoLectivasAsignadas > maxNoLectivasDecimal ? 'bg-red-500' : 'bg-[#F59E0B]'}`} style={{ width: `${Math.min(100, pctNoLectivas)}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto xl:w-[45%] shrink-0 md:border-l md:pl-6 border-gray-200 flex flex-col justify-center">
                  <div className="flex flex-col sm:flex-row xl:items-center gap-4">
                    <div className="shrink-0">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Total Asignado (Aprox)</span>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold ${((horasLectivasAsignadas * 45 / 60) + recreoDecimal) + horasNoLectivasAsignadas + horasExtraAsignadas + colacion > totalHorasContrato ? 'text-red-500' : 'text-green-600'}`}>
                          {Math.ceil(((horasLectivasAsignadas * 45 / 60) + recreoDecimal) + horasNoLectivasAsignadas + horasExtraAsignadas + colacion)} H
                        </span>
                        <span className="text-xs font-medium text-gray-400">/ {totalHorasContrato} hrs</span>
                      </div>
                    </div>
                    
                    <div className="bg-[#f8fafc] border border-gray-200 rounded text-[9px] text-gray-600 flex-1 w-full flex flex-col">
                      <div className="flex justify-between border-b border-gray-100 p-1.5 px-2"><span>HA:</span> <span className="font-semibold text-gray-800">{formatCronoDecimal(horasLectivasAsignadas * 45 / 60)}</span></div>
                      <div className="flex justify-between border-b border-gray-100 p-1.5 px-2"><span>Recreo:</span> <span className="font-semibold text-gray-800">{formatCronoDecimal(recreoDecimal)}</span></div>
                      {horasNoLectivasAsignadas > 0 && <div className="flex justify-between border-b border-gray-100 p-1.5 px-2"><span>HNL:</span> <span className="font-semibold text-gray-800">{formatCronoDecimal(horasNoLectivasAsignadas)}</span></div>}
                      {horasExtraAsignadas > 0 && <div className="flex justify-between border-b border-gray-100 p-1.5 px-2"><span>HE:</span> <span className="font-semibold text-gray-800">{formatCronoDecimal(horasExtraAsignadas)}</span></div>}
                      {colacion > 0 && <div className="flex justify-between border-b border-gray-100 p-1.5 px-2"><span>Colacin:</span> <span className="font-semibold text-gray-800">{formatCronoDecimal(colacion)}</span></div>}
                      <div className="flex justify-between p-1.5 px-2 bg-gray-50 text-[#016098] font-bold rounded-b">
                        <span>TOTAL EXACTO:</span>
                        <span>{formatCronoDecimal(((horasLectivasAsignadas * 45 / 60) + recreoDecimal) + horasNoLectivasAsignadas + horasExtraAsignadas + colacion)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {docenteCargaObs && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3">
                  <span className="text-xs font-bold text-amber-800 uppercase block mb-1">Observaciones / Nombramientos:</span>
                  <p className="text-sm text-amber-900 whitespace-pre-wrap">{docenteCargaObs}</p>
                </div>
              )}

              <div className="border rounded-lg bg-gray-50 p-2">
                <h3 className="text-sm font-bold text-[#1e293b] mb-2 px-1">Detalle de Asignaciones</h3>
                {cargaDocente.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-8">No tiene carga asignada en este establecimiento.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {cargaDocente.map(c => {
                       let text = '';
                       let horas = c.horas || c.horasAllocadas || 0;
                       if (c.tipoCarga === 'LECTIVA') text = c.asignatura?.asigDescripcion || 'Asignatura';
                       if (c.tipoCarga === 'NO_LECTIVA') text = c.actividadNoLectiva?.descripcion || 'No Lectiva';
                       if (c.tipoCarga === 'EXTRACURRICULAR') text = c.actividadExtracurricular?.descripcion || 'Extracurricular';
                       
                       return (
                        <li key={c.id} className="bg-white p-3 border rounded shadow-sm flex justify-between items-center">
                          <div>
                            {c.tipoCarga === 'LECTIVA' && (
                              <span className="text-sm font-medium text-[#1e293b]">📚 {text} - {c.grado?.grado?.grteDescrip || ''} {c.letraCurso || ''}</span>
                            )}
                            {c.tipoCarga === 'NO_LECTIVA' && (
                              <span className="text-sm font-medium text-amber-700">📝 {text}</span>
                            )}
                            {c.tipoCarga === 'EXTRACURRICULAR' && (
                              <span className="text-sm font-medium text-emerald-700">⭐ {text}</span>
                            )}
                            <p className="text-xs text-gray-500 mt-1 uppercase">Origen: {c.financiamientoOrigen || 'Normal'}</p>
                          </div>
                          <span className="bg-gray-100 px-2 py-1 rounded font-bold text-[#016098] text-xs">{horas} Hrs</span>
                        </li>
                       );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}