'use client';

import React, { useState, useEffect } from 'react';
import { getDocentesEstablecimiento, getGradosEstablecimiento, getAsignaturasPropiasPorGrado, getCargasEstablecimiento, saveCargasHorarias, getActividadesNoLectivas, getTablaConversion } from '../../actions';

interface CargaEnUI {
  id?: string;
  dbId?: number;
  planEstablecimientoId: number;
  // Para Lectivas
  tienCod?: number;
  grteCod?: number;
  codAsignatura?: string;
  // Para No Lectivas
  actividadNoLectivaId?: number;
  financiamiento?: string;
  
  nombre: string;
  horas: number;
  tipoCarga: 'LECTIVA' | 'NO_LECTIVA';
  eliminada?: boolean;
}

export default function AsignacionCargaPage() {
  const [docentes, setDocentes] = useState<any[]>([]);
  const [grados, setGrados] = useState<any[]>([]);
  const [detallesPlan, setDetallesPlan] = useState<any[]>([]);
  const [actividadesNL, setActividadesNL] = useState<any[]>([]);
  const [tablaConversion, setTablaConversion] = useState<any[]>([]);
  const [todasCargas, setTodasCargas] = useState<any[]>([]);
  
  const [docenteSeleccionado, setDocenteSeleccionado] = useState('');
  
  // Lectivas UI state
  const [tipoEnsenanzaSeleccionado, setTipoEnsenanzaSeleccionado] = useState('');
  const [gradoSeleccionado, setGradoSeleccionado] = useState('');
  
  // No Lectivas UI state
  const [anlSeleccionada, setAnlSeleccionada] = useState('');
  const [finanSeleccionado, setFinanSeleccionado] = useState('Normal');
  const [horasAnl, setHorasAnl] = useState(1);
  
  const [activeTab, setActiveTab] = useState<'LECTIVA' | 'NO_LECTIVA'>('LECTIVA');

  const [cargas, setCargas] = useState<CargaEnUI[]>([]);
  const [saving, setSaving] = useState(false);

  const [ESTABLECIMIENTO_ID, setEstablecimientoId] = useState<number | null>(null);

  const tiposEnsenanzaUnicos = Array.from(new Set(grados.map(g => g.tienCod))).map(tienCod => {
    return grados.find(g => g.tienCod === tienCod)?.tipoEnsenanza;
  }).filter(Boolean);
  
  const gradosFiltrados = tipoEnsenanzaSeleccionado 
    ? grados.filter(g => g.tienCod.toString() === tipoEnsenanzaSeleccionado)
    : [];

  useEffect(() => {
    const estId = Number(localStorage.getItem('selectedEstablecimientoId')) || 2;
    setEstablecimientoId(estId);
    getDocentesEstablecimiento(estId).then(setDocentes);
    getGradosEstablecimiento(estId).then(setGrados);
    getCargasEstablecimiento(estId).then(setTodasCargas);
    getActividadesNoLectivas().then(setActividadesNL);
      getTablaConversion().then(setTablaConversion);
  }, []);

  const loadTodasCargas = () => {
    if (ESTABLECIMIENTO_ID) getCargasEstablecimiento(ESTABLECIMIENTO_ID).then(setTodasCargas);
  };

  useEffect(() => {
    if (gradoSeleccionado) {
      const [tienCod, grteCod] = gradoSeleccionado.split('-');
      if (ESTABLECIMIENTO_ID) getAsignaturasPropiasPorGrado(ESTABLECIMIENTO_ID, Number(tienCod), Number(grteCod)).then(setDetallesPlan);
    } else {
      setDetallesPlan([]);
    }
  }, [gradoSeleccionado, ESTABLECIMIENTO_ID]);

  useEffect(() => {
    if (docenteSeleccionado) {
      const dbCargas = todasCargas.filter(c => c.docenteId.toString() === docenteSeleccionado);
      setCargas(dbCargas.map(c => ({
        dbId: c.id,
        planEstablecimientoId: c.planEstablecimientoId,
        tienCod: c.tienCod || undefined,
        grteCod: c.grteCod || undefined,
        codAsignatura: c.asignaturaCod || undefined,
        actividadNoLectivaId: c.actividadNoLectivaId || undefined,
        financiamiento: c.financiamiento || undefined,
        nombre: c.tipoCarga === 'LECTIVA' ? c.asignatura?.asigDescripcion : c.actividadNoLectiva?.descripcion,
        horas: c.horasAllocadas,
        tipoCarga: c.tipoCarga as 'LECTIVA' | 'NO_LECTIVA'
      })));
    } else {
      setCargas([]);
    }
  }, [docenteSeleccionado, todasCargas]);

  const handleAsignarLectiva = (det: any) => {
    if (!docenteSeleccionado) return;
    
    setCargas([...cargas, {
      id: Math.random().toString(),
      planEstablecimientoId: det.planEstablecimientoId,
      tienCod: det.tienCod,
      grteCod: det.grteCod,
      codAsignatura: det.codAsignatura,
      nombre: det.asignatura?.asigDescripcion,
      horas: det.horas,
      tipoCarga: 'LECTIVA'
    }]);
  };

  const handleAsignarNoLectiva = () => {
    if (!docenteSeleccionado || !anlSeleccionada || horasAnl <= 0) return;
    const anlInfo = actividadesNL.find(a => a.id.toString() === anlSeleccionada);
    // Asumimos un planEstablecimientoId default tomandolo del primer detalle si existe, o consultandolo.
    // Hack para la demo: tomamos planEstablecimientoId = cargas[0]?.planEstablecimientoId o de donde sea
    // Lo ideal es tener el ID del plan del establecimiento.
    const planId = detallesPlan[0]?.planEstablecimientoId || todasCargas[0]?.planEstablecimientoId || 1; 

    setCargas([...cargas, {
      id: Math.random().toString(),
      planEstablecimientoId: planId,
      actividadNoLectivaId: Number(anlSeleccionada),
      financiamiento: finanSeleccionado === 'Normal' ? undefined : finanSeleccionado,
      nombre: anlInfo?.descripcion + (finanSeleccionado !== 'Normal' ? ` (${finanSeleccionado})` : ''),
      horas: horasAnl,
      tipoCarga: 'NO_LECTIVA'
    }]);
    
    setAnlSeleccionada('');
    setHorasAnl(1);
  };

  const handleRemover = (index: number) => {
    const newCargas = [...cargas];
    if (newCargas[index].dbId) {
      newCargas[index].eliminada = true;
    } else {
      newCargas.splice(index, 1);
    }
    setCargas(newCargas);
  };

  const handleGuardar = async () => {
    if (!docenteSeleccionado) return;
    setSaving(true);
    try {
      const payloads = cargas.filter(c => !c.eliminada);
      await saveCargasHorarias(Number(docenteSeleccionado), payloads);
      alert('Carga guardada correctamente');
      loadTodasCargas();
    } catch (e) {
      alert('Error guardando carga');
    }
    setSaving(false);
  };

  const docenteSeleccionadoObj = docentes.find(d => d.id.toString() === docenteSeleccionado);
  const cargasVivas = cargas.filter(c => !c.eliminada);
  const horasLectivasAsignadas = cargasVivas.filter(c => c.tipoCarga === 'LECTIVA').reduce((sum, c) => sum + c.horas, 0);
  const horasNoLectivasAsignadas = cargasVivas.filter(c => c.tipoCarga === 'NO_LECTIVA').reduce((sum, c) => sum + c.horas, 0);
  
  const totalHorasContrato = docenteSeleccionadoObj?.horasTitular || 0;
  
  // Buscar en la tabla de conversión
  const conversionData = tablaConversion.find((t: any) => t.jornadaSemanal === totalHorasContrato);
  
  // Si encontramos la conversión, maxLectivas es el valor en horas pedagógicas. Si no, calculamos el 65% clásico.
  const maxLectivas = conversionData ? conversionData.lectivasPedagogicas : Math.floor(totalHorasContrato * 0.65 * 1.3333);
  // Para No Lectivas, si el colegio sigue asignando en bloques pedagógicos (lo más común), 
  // sobrarán bloques. Ej: 44 horas -> 58 bloques pedagógicos en total. 58 - 38 = 20 bloques no lectivos.
  const maxNoLectivas = conversionData ? Math.floor((totalHorasContrato * (60/45))) - conversionData.lectivasPedagogicas : Math.floor(totalHorasContrato * 0.35 * 1.3333);

  const pctLectivas = Math.min(100, (horasLectivasAsignadas / maxLectivas) * 100) || 0;
  const pctNoLectivas = Math.min(100, (horasNoLectivasAsignadas / maxNoLectivas) * 100) || 0;

  const getGradoNombre = (tienCod?: number | null, grteCod?: number | null) => {
    if (!tienCod || !grteCod) return 'Global (Sin Grado)';
    const g = grados.find(x => x.tienCod === tienCod && x.grteCod === grteCod);
    return g?.grteDescrip || '';
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#016098]">Asignación de Carga</h1>
          <p className="text-sm text-gray-500 mt-1">Distribuye horas lectivas y no lectivas para el docente seleccionado.</p>
        </div>
        <button 
          onClick={handleGuardar}
          disabled={saving || !docenteSeleccionado}
          className="bg-[#39BABD] hover:bg-[#2b9799] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Carga'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2e8f0] flex gap-4 items-center">
        <div className="w-1/4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Seleccionar Docente</label>
          <select 
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:border-[#016098] focus:ring-1 focus:ring-[#016098]"
            value={docenteSeleccionado}
            onChange={e => setDocenteSeleccionado(e.target.value)}
          >
            <option value="">-- Elija un docente --</option>
            {docentes.map(d => (
              <option key={d.id} value={d.id}>{d.apellidos}, {d.nombres}</option>
            ))}
          </select>
        </div>
        
        {docenteSeleccionadoObj && (
          <div className="flex-1 flex gap-6 ml-4 border-l pl-6 border-gray-200">
            <div className="flex flex-col justify-center">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Contrato</span>
              <span className="text-lg font-bold text-[#016098]">{docenteSeleccionadoObj.horasTitular} hrs crono</span>
            </div>
            
            <div className="flex-1 border-l pl-6 border-gray-200 flex flex-col justify-center gap-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#39BABD]">Lectivas (Máx: {maxLectivas} ped)</span>
                  <span className={`font-bold ${horasLectivasAsignadas > maxLectivas ? 'text-red-500' : 'text-[#64748b]'}`}>{horasLectivasAsignadas} / {maxLectivas}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${horasLectivasAsignadas > maxLectivas ? 'bg-red-500' : 'bg-[#39BABD]'}`} style={{ width: `${Math.min(100, pctLectivas)}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#F59E0B]">No Lectivas (Mín: {maxNoLectivas} ped)</span>
                  <span className="text-[#64748b] font-bold">{horasNoLectivasAsignadas} / {maxNoLectivas}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#F59E0B] h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, pctNoLectivas)}%` }}></div>
                </div>
              </div>
            </div>

            <div className="w-1/4 border-l pl-6 border-gray-200 flex flex-col justify-center">
              <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Asignado (Crono)</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${Math.round((horasLectivasAsignadas + horasNoLectivasAsignadas) * 45 / 60) > docenteSeleccionadoObj.horasTitular ? 'text-red-500' : 'text-green-600'}`}>
                  {Math.round((horasLectivasAsignadas + horasNoLectivasAsignadas) * 45 / 60)} hrs
                </span>
                <span className="text-xs font-medium text-gray-400">/ {docenteSeleccionadoObj.horasTitular}</span>
              </div>
              <span className="text-[10px] text-gray-400 mt-1">({horasLectivasAsignadas + horasNoLectivasAsignadas} bloques pedagógicos)</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 h-full min-h-[400px]">
        <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] flex flex-col overflow-hidden">
          <div className="flex border-b border-[#e2e8f0]">
            <button 
              className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${activeTab === 'LECTIVA' ? 'bg-[#f0f9ff] text-[#016098] border-b-2 border-[#016098]' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('LECTIVA')}
            >
              Horas Lectivas (Cursos/Talleres)
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${activeTab === 'NO_LECTIVA' ? 'bg-[#fffbeb] text-[#d97706] border-b-2 border-[#d97706]' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('NO_LECTIVA')}
            >
              Horas No Lectivas (Actividades)
            </button>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === 'LECTIVA' && (
              <>
                <div className="p-4 border-b border-gray-100 bg-[#f8fafc] grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de Enseñanza</label>
                    <select 
                      className="w-full border border-gray-300 rounded text-sm p-1.5"
                      value={tipoEnsenanzaSeleccionado}
                      onChange={e => {
                        setTipoEnsenanzaSeleccionado(e.target.value);
                        setGradoSeleccionado('');
                      }}
                    >
                      <option value="">-- Seleccionar --</option>
                      {tiposEnsenanzaUnicos.map((t: any) => (
                        <option key={t.tienCod} value={t.tienCod}>{t.tienDescripcion}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Grado</label>
                    <select 
                      className="w-full border border-gray-300 rounded text-sm p-1.5"
                      value={gradoSeleccionado}
                      onChange={e => setGradoSeleccionado(e.target.value)}
                      disabled={!tipoEnsenanzaSeleccionado}
                    >
                      <option value="">-- Seleccionar --</option>
                      {gradosFiltrados.map(g => (
                        <option key={`${g.tienCod}-${g.grteCod}`} value={`${g.tienCod}-${g.grteCod}`}>
                          {g.grteDescrip} ({g.cantidadCursos} cursos)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                  {!gradoSeleccionado ? (
                     <div className="text-center text-[#94a3b8] mt-10">Seleccione un grado.</div>
                  ) : detallesPlan.length === 0 ? (
                     <div className="text-center text-[#94a3b8] mt-10">No hay asignaturas en este plan.</div>
                  ) : (
                    <div className="space-y-2">
                      {detallesPlan.map(det => {
                        const gInfo = grados.find(g => g.tienCod === det.tienCod && g.grteCod === det.grteCod);
                        const cursos = gInfo?.cantidadCursos || 1;
                        const totalDisp = det.horas * cursos;
                        
                        const tomadasGlobal = todasCargas.filter(c => 
                          c.planEstablecimientoId === det.planEstablecimientoId &&
                          c.tienCod === det.tienCod &&
                          c.grteCod === det.grteCod &&
                          c.asignaturaCod === det.codAsignatura
                        ).reduce((sum, c) => sum + c.horasAllocadas, 0);

                        const asignadasEsteDocente = cargasVivas.filter(c => 
                          c.planEstablecimientoId === det.planEstablecimientoId &&
                          c.tienCod === det.tienCod &&
                          c.grteCod === det.grteCod &&
                          c.codAsignatura === det.codAsignatura
                        ).reduce((sum, c) => sum + c.horas, 0);

                        const tomadasOtros = tomadasGlobal - todasCargas.filter(c => 
                          c.docenteId.toString() === docenteSeleccionado &&
                          c.planEstablecimientoId === det.planEstablecimientoId &&
                          c.tienCod === det.tienCod &&
                          c.grteCod === det.grteCod &&
                          c.asignaturaCod === det.codAsignatura
                        ).reduce((sum, c) => sum + c.horasAllocadas, 0);

                        const tomadasReal = tomadasOtros + asignadasEsteDocente;
                        const restantes = totalDisp - tomadasReal;

                        return (
                          <div key={det.id} className="flex justify-between items-center p-3 border border-[#e2e8f0] rounded-lg hover:border-[#016098] transition-colors">
                            <div>
                              <p className="font-medium text-[#1e293b] text-sm">{det.asignatura?.asigDescripcion}</p>
                              <p className="text-xs text-[#64748b]">{det.horas} Hrs/curso • {det.formacion}</p>
                              <div className="mt-1 text-xs font-bold text-[#016098]">
                                Disp: {restantes} / {totalDisp} hrs
                              </div>
                            </div>
                            <button 
                              onClick={() => handleAsignarLectiva(det)}
                              disabled={!docenteSeleccionado || restantes < det.horas}
                              className="text-[#016098] hover:bg-[#e0f2fe] px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              Asignar {det.horas} hrs
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'NO_LECTIVA' && (
              <div className="p-6 flex flex-col gap-4 h-full bg-[#f8fafc]">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Actividad No Lectiva</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                    value={anlSeleccionada}
                    onChange={e => setAnlSeleccionada(e.target.value)}
                  >
                    <option value="">-- Seleccionar Actividad --</option>
                    {actividadesNL.map(a => (
                      <option key={a.id} value={a.id}>{a.descripcion}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Financiamiento / Origen</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                    value={finanSeleccionado}
                    onChange={e => setFinanSeleccionado(e.target.value)}
                  >
                    <option value="Normal">Normal (Sin financiamiento especial)</option>
                    <option value="SEP">SEP (Subvención Escolar Preferencial)</option>
                    <option value="PIE">PIE (Proyecto de Integración)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Horas a Asignar</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                    value={horasAnl}
                    onChange={e => setHorasAnl(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="mt-4">
                  <button 
                    onClick={handleAsignarNoLectiva}
                    disabled={!docenteSeleccionado || !anlSeleccionada}
                    className="w-full bg-[#F59E0B] hover:bg-[#d97706] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Agregar Actividad a Carga
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel Derecho: Carga VIVA del docente */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
            <h3 className="font-semibold text-[#1e293b]">Carga Actual del Docente</h3>
          </div>
          <div className="flex-1 overflow-auto p-4 custom-scrollbar">
            {!docenteSeleccionado ? (
               <div className="text-center text-[#94a3b8] mt-10">Seleccione un docente primero.</div>
            ) : cargasVivas.length === 0 ? (
               <div className="text-center text-[#94a3b8] mt-10">El docente no tiene carga asignada.</div>
            ) : (
              <div className="space-y-2">
                {cargas.map((carga, index) => {
                  if (carga.eliminada) return null;
                  const esLectiva = carga.tipoCarga === 'LECTIVA';
                  return (
                    <div key={index} className={`flex justify-between items-center p-3 border rounded-lg ${esLectiva ? 'border-[#bae6fd] bg-[#f0f9ff]' : 'border-[#fef08a] bg-[#fffbeb]'}`}>
                      <div>
                        <p className={`font-medium text-sm ${esLectiva ? 'text-[#016098]' : 'text-[#d97706]'}`}>
                          {carga.nombre}
                        </p>
                        <p className="text-xs text-gray-500">
                          {esLectiva ? getGradoNombre(carga.tienCod, carga.grteCod) : (carga.financiamiento ? `Financiamiento: ${carga.financiamiento}` : 'Global')}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-gray-600">{carga.horas} Hrs</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${esLectiva ? 'bg-[#e0f2fe] text-[#39BABD]' : 'bg-[#fef3c7] text-[#F59E0B]'}`}>
                            {carga.tipoCarga}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemover(index)}
                        className="text-red-500 hover:bg-red-50 px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        Quitar
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
