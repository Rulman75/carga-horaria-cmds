'use client';

import React, { useState, useEffect } from 'react';
import { 
  getDocentesEstablecimiento, 
  getGradosEstablecimiento, 
  getAsignaturasPropiasPorGrado, 
  getCargasEstablecimiento, 
  saveCargasHorarias, 
  getActividadesNoLectivas, 
  getTablaConversion,
  getActividadesExtracurriculares,
  getConfiguracionGlobal,
  getEstablecimientoConfig,
  getTodasAsignaturas,
  getTodosDetallesPlanEstablecimiento
} from '../../actions';

interface CargaEnUI {
  id?: string;
  dbId?: number;
  planEstablecimientoId: number;
  
  // Lectiva
  tienCod?: number;
  grteCod?: number;
  codAsignatura?: string;
  letraCurso?: string;
  
  // No Lectiva
  actividadNoLectivaId?: number;
  
  // Extracurricular
  actividadExtracurricularId?: number;
  
  financiamiento?: string;
  nombre: string;
  horas: number;
  tipoCarga: 'LECTIVA' | 'NO_LECTIVA' | 'EXTRACURRICULAR';
  eliminada?: boolean;
}

export default function AsignacionCargaPage() {
  const [ESTABLECIMIENTO_ID, setEstablecimientoId] = useState<number | null>(null);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [grados, setGrados] = useState<any[]>([]);
  const [estConfig, setEstConfig] = useState<any>(null);
  const [detallesPlan, setDetallesPlan] = useState<any[]>([]);
  const [actividadesNL, setActividadesNL] = useState<any[]>([]);
  const [actividadesExt, setActividadesExt] = useState<any[]>([]);
  const [tablaConversion, setTablaConversion] = useState<any[]>([]);
  const [configGlobal, setConfigGlobal] = useState<any>(null);
  const [todasCargas, setTodasCargas] = useState<any[]>([]);
  const [todosLosDetalles, setTodosLosDetalles] = useState<any[]>([]);
  
  const [modoAsignacion, setModoAsignacion] = useState<'GENERALISTA' | 'ESPECIALISTA'>('GENERALISTA');
  const [todasAsignaturas, setTodasAsignaturas] = useState<any[]>([]);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('');

  const [docenteSeleccionado, setDocenteSeleccionado] = useState('');
  const [observacionCarga, setObservacionCarga] = useState('');
  
  const [tipoEnsenanzaSeleccionado, setTipoEnsenanzaSeleccionado] = useState('');
  const [gradoSeleccionado, setGradoSeleccionado] = useState('');
  
  const [anlSeleccionada, setAnlSeleccionada] = useState('');
  const [extSeleccionada, setExtSeleccionada] = useState('');
  const [finanSeleccionado, setFinanSeleccionado] = useState('Normal');
  const [horasManual, setHorasManual] = useState(1);
  
  const [activeTab, setActiveTab] = useState<'LECTIVA' | 'NO_LECTIVA' | 'EXTRACURRICULAR'>('LECTIVA');
  const [cargas, setCargas] = useState<CargaEnUI[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const estId = Number(localStorage.getItem('selectedEstablecimientoId')) || 2;
    setEstablecimientoId(estId);
    getDocentesEstablecimiento(estId).then(setDocentes);
    getGradosEstablecimiento(estId).then(setGrados);
    getCargasEstablecimiento(estId).then(setTodasCargas);
    
    getActividadesNoLectivas().then(setActividadesNL);
    getActividadesExtracurriculares().then(setActividadesExt);
    getTablaConversion().then(setTablaConversion);
    getConfiguracionGlobal().then(setConfigGlobal);
    getEstablecimientoConfig(Number(estId)).then(setEstConfig);
    getTodasAsignaturas().then(setTodasAsignaturas);
    getTodosDetallesPlanEstablecimiento(Number(estId)).then(setTodosLosDetalles);
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
      const doc = docentes.find(d => d && d.id && d.id.toString() === docenteSeleccionado);
      setObservacionCarga(doc?.establecimientos?.[0]?.observacionCarga || '');
      const dbCargas = todasCargas.filter(c => c && c.docenteId && c.docenteId.toString() === docenteSeleccionado);
      setCargas(dbCargas.map(c => {
        let nombre = '';
        if (c.tipoCarga === 'LECTIVA') {
          nombre = c.asignatura?.asigDescripcion || 'Lectiva';
          if (c.letraCurso) nombre += ` (${c.letraCurso})`;
          if (c.financiamiento && c.financiamiento !== 'Normal') nombre += ` [${c.financiamiento}]`;
        }
        else if (c.tipoCarga === 'NO_LECTIVA') nombre = c.actividadNoLectiva?.descripcion || 'No Lectiva';
        else if (c.tipoCarga === 'EXTRACURRICULAR') nombre = c.actividadExtracurricular?.descripcion || 'Extracurricular';
        
        return {
          dbId: c.id,
          planEstablecimientoId: c.planEstablecimientoId,
          tienCod: c.tienCod || undefined,
          grteCod: c.grteCod || undefined,
          codAsignatura: c.asignaturaCod || undefined,
          actividadNoLectivaId: c.actividadNoLectivaId || undefined,
          actividadExtracurricularId: c.actividadExtracurricularId || undefined,
          financiamiento: c.financiamiento || undefined,
          letraCurso: c.letraCurso || undefined,
          nombre: nombre,
          horas: c.horasAllocadas,
          tipoCarga: (c.tipoCarga as any) || 'LECTIVA'
        };
      }));
    } else {
      setCargas([]);
    }
  }, [docenteSeleccionado, todasCargas]);

  const formatCronoDecimal = (cronoDecimal: number) => {
    if (!cronoDecimal) return '0 H';
    const h = Math.floor(cronoDecimal);
    const m = Math.round((cronoDecimal - h) * 60);
    if (h > 0 && m > 0) return h + ' H ' + m + ' MIN';
    if (h > 0) return h + ' H';
    if (m > 0) return m + ' MIN';
    return '0 H';
  };

  const parseCronoToDecimal = (str: string) => {
    if (!str) return 0;
    const [h, m] = str.split(':').map(Number);
    return h + (m / 60);
  };

  const docenteSeleccionadoObj = docentes.find(d => d && d.id && d.id.toString() === docenteSeleccionado);
  const cargasVivas = cargas.filter(c => !c.eliminada);
  
  const horasLectivasAsignadas = cargasVivas.filter(c => c.tipoCarga === 'LECTIVA').reduce((sum, c) => sum + c.horas, 0);
  const horasNoLectivasAsignadas = cargasVivas.filter(c => c.tipoCarga === 'NO_LECTIVA').reduce((sum, c) => sum + c.horas, 0);
  const horasExtraAsignadas = cargasVivas.filter(c => c.tipoCarga === 'EXTRACURRICULAR').reduce((sum, c) => sum + c.horas, 0);
  
  // Matemáticas de Límites
  const totalHorasContrato = docenteSeleccionadoObj?.totalDefinitivo || docenteSeleccionadoObj?.totalJornada || docenteSeleccionadoObj?.horasTitular || 0;
  const colacion = totalHorasContrato >= 30 ? 2 : 1;
  const baseAsignable = Math.max(0, totalHorasContrato - colacion);
  
  const conversionData = tablaConversion.find((t: any) => t.jornadaSemanal === baseAsignable);
  
  const maxLectivasPedagogicas = conversionData ? conversionData.lectivasPedagogicas : Math.floor(baseAsignable * 0.65 * 1.3333);
  const maxNoLectivasDecimal = conversionData ? parseCronoToDecimal(conversionData.noLectivasCronologicas) : (baseAsignable * 0.35);
  const maxNoLectivasStr = conversionData ? conversionData.noLectivasCronologicas : `${Math.floor(baseAsignable*0.35)}:00`;

  const currentConversionData = tablaConversion.find((t: any) => t.lectivasPedagogicas === horasLectivasAsignadas);
  const recreoDecimal = currentConversionData ? parseCronoToDecimal(currentConversionData.recreoCronologicas) : 0;
  
  const pctLectivas = Math.min(100, (horasLectivasAsignadas / maxLectivasPedagogicas) * 100) || 0;
  const pctNoLectivas = Math.min(100, (horasNoLectivasAsignadas / maxNoLectivasDecimal) * 100) || 0;

  // Planificación rule
  const maxPlanificacionDecimal = maxNoLectivasDecimal * 0.4;
  const planificacionActual = cargasVivas
    .filter(c => c.tipoCarga === 'NO_LECTIVA')
    .filter(c => {
      const anl = actividadesNL.find(a => a.id === c.actividadNoLectivaId);
      return anl?.esPlanificacion;
    })
    .reduce((sum, c) => sum + c.horas, 0);

  const getGradoNombre = (tienCod?: number | null, grteCod?: number | null) => {
    if (!tienCod || !grteCod) return 'Global';
    const g = grados.find(x => x.tienCod === tienCod && x.grteCod === grteCod);
    return g ? `${g.grteDescrip || 'Grado'} (${g.tipoEnsenanza?.tienDescripcion || ''})` : 'Global';
  };

  const ensenanzasUnicas = Array.from(new Set(grados.map(g => g.tienCod)))
    .map(tienCod => grados.find(g => g.tienCod === tienCod)?.tipoEnsenanza)
    .filter(Boolean);

  const getLetras = (cantidad: number) => {
    return Array.from({ length: cantidad }, (_, i) => String.fromCharCode(65 + i));
  };

  const handleAsignarLectiva = (det: any, letra?: string) => {
    setCargas([...cargas, {
      id: Math.random().toString(),
      planEstablecimientoId: det.planEstablecimientoId,
      tienCod: det.tienCod,
      grteCod: det.grteCod,
      codAsignatura: det.codAsignatura,
      letraCurso: letra,
      financiamiento: finanSeleccionado === 'Normal' ? undefined : finanSeleccionado,
      nombre: det.asignatura?.asigDescripcion + (letra ? ` (${letra})` : '') + (finanSeleccionado !== 'Normal' ? ` [${finanSeleccionado}]` : ''),
      horas: det.horas,
      tipoCarga: 'LECTIVA'
    }]);
  };

  const handleAsignarNoLectiva = () => {
    if (!anlSeleccionada) return;
    const anlInfo = actividadesNL.find(a => a.id.toString() === anlSeleccionada);
    
    if (anlInfo?.esPlanificacion) {
      if (planificacionActual + horasManual > maxPlanificacionDecimal) {
        alert(`No puedes exceder el 40% de horas de planificación. Límite: ${maxPlanificacionDecimal.toFixed(1)} hrs. Actual: ${planificacionActual}`);
        return;
      }
    }

    const planId = detallesPlan[0]?.planEstablecimientoId || todasCargas[0]?.planEstablecimientoId || 1; 

    setCargas([...cargas, {
      id: Math.random().toString(),
      planEstablecimientoId: planId,
      actividadNoLectivaId: Number(anlSeleccionada),
      financiamiento: finanSeleccionado === 'Normal' ? undefined : finanSeleccionado,
      nombre: anlInfo?.descripcion + (finanSeleccionado !== 'Normal' ? ` (${finanSeleccionado})` : ''),
      horas: horasManual,
      tipoCarga: 'NO_LECTIVA'
    }]);
    setHorasManual(1);
    setAnlSeleccionada('');
  };

  const handleAsignarExtracurricular = () => {
    if (!extSeleccionada) return;
    const extInfo = actividadesExt.find(a => a.id.toString() === extSeleccionada);
    const planId = detallesPlan[0]?.planEstablecimientoId || todasCargas[0]?.planEstablecimientoId || 1; 

    setCargas([...cargas, {
      id: Math.random().toString(),
      planEstablecimientoId: planId,
      actividadExtracurricularId: Number(extSeleccionada),
      financiamiento: finanSeleccionado === 'Normal' ? undefined : finanSeleccionado,
      nombre: extInfo?.descripcion + (finanSeleccionado !== 'Normal' ? ` (${finanSeleccionado})` : ''),
      horas: horasManual,
      tipoCarga: 'EXTRACURRICULAR'
    }]);
    setHorasManual(1);
    setExtSeleccionada('');
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

  const handleCambiarHoras = (index: number, delta: number) => {
    const newCargas = [...cargas];
    const nuevaHora = newCargas[index].horas + delta;
    if (nuevaHora > 0) {
      newCargas[index].horas = nuevaHora;
      setCargas(newCargas);
    }
  };

  const handleGuardar = async () => {
    if (!docenteSeleccionado) return;
    setSaving(true);
    try {
      const payloads = cargas.filter(c => !c.eliminada);
      await saveCargasHorarias(Number(docenteSeleccionado), payloads, ESTABLECIMIENTO_ID || undefined, observacionCarga);
      alert('Carga guardada correctamente');
      loadTodasCargas();
    } catch (e) {
      alert('Error guardando carga');
    }
    setSaving(false);
  };

  
  const printCertificado = () => {
    if (!docenteSeleccionadoObj) {
      alert('Por favor selecciona un docente primero.');
      return;
    }
    
    const estName = estConfig?.esedDescripcion || 'Establecimiento Educativo';
    const directorName = estConfig?.nombreDirector || 'Director(a)';
    
    const totalJornadaSema = (horasLectivasAsignadas * 45 / 60) + recreoDecimal + horasNoLectivasAsignadas;
    const asigTotal = totalJornadaSema + horasExtraAsignadas + colacion;
    
    const formatTime = (cronoDecimal: number) => {
      if (!cronoDecimal) return '0 H';
      const h = Math.floor(cronoDecimal);
      const m = Math.round((cronoDecimal - h) * 60);
      if (h > 0 && m > 0) return h + ' H ' + m + ' MIN';
      if (h > 0) return h + ' H';
      if (m > 0) return m + ' MIN';
      return '0 H';
    };

    const html = `
    <html>
      <head>
        <title>Certificado - ${docenteSeleccionadoObj.apellidos}</title>
        <style>
          body { font-family: 'Arial', sans-serif; padding: 40px; line-height: 1.5; color: #000; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; }
          th, td { border: 1px solid #000; padding: 10px; font-size: 13px; text-align: left; }
          th { background-color: #f3f4f6; }
          .center { text-align: center; }
          .font-bold { font-weight: bold; }
          .title { font-size: 18px; font-weight: bold; text-align: center; text-transform: uppercase; text-decoration: underline; margin-bottom: 5px; }
          .subtitle { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 30px; }
          .section { font-weight: bold; font-size: 16px; margin-top: 30px; margin-bottom: 10px; text-decoration: underline; }
          .flex { display: flex; justify-content: space-between; margin-top: 100px; }
          .signature { width: 40%; text-align: center; border-top: 1px solid #000; padding-top: 5px; font-size: 14px; }
          @media print { @page { margin: 20mm; } }
        </style>
      </head>
      
      <body>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <img src="${window.location.origin}/logo.png" alt="Logo CMDS" style="height: 70px; object-fit: contain;" />
          <div style="text-align: right; font-size: 12px; color: #666; font-weight: bold;">
             Corporación Municipal de Desarrollo Social<br/>
             Antofagasta
          </div>
        </div>
        <div class="title">Formulario de Conocimiento y Aceptación de Carga Horaria Docente</div>

        <div class="subtitle">Año Escolar 2027</div>

        <div class="section">I. Antecedentes del Docente</div>
        <table>
          <tr><td width="30%"><strong>Nombre Completo:</strong></td><td>${docenteSeleccionadoObj.nombres} ${docenteSeleccionadoObj.apellidos}</td></tr>
          <tr><td><strong>RUT:</strong></td><td>${docenteSeleccionadoObj.rut}</td></tr>
          <tr><td><strong>Establecimiento Educativo:</strong></td><td>${estName}</td></tr>
          <tr><td><strong>Tipo de Contrato:</strong></td><td>${totalHorasContrato} horas cronológicas</td></tr>
        </table>

        <div class="section">II. Detalle de Carga Horaria (Año Escolar 2027)</div>
        <p style="font-size: 14px;">Se detalla a continuación la distribución de las horas cronológicas asignadas para el presente periodo escolar, de acuerdo con la normativa vigente:</p>
        
        <table>
          <tr><th colspan="3" class="center">DESCRIPCIÓN HORAS LECTIVAS</th></tr>
          <tr style="background-color: #fff;">
            <td class="center font-bold" width="20%">CURSO</td>
            <td class="center font-bold">ASIGNATURA</td>
            <td class="center font-bold" width="20%">HORAS</td>
          </tr>
          ` + cargasVivas.filter(c => c.tipoCarga === 'LECTIVA').map(c => 
            "<tr><td class='center'>" + getGradoNombre(c.tienCod, c.grteCod) + (c.letraCurso ? " " + c.letraCurso : "") + "</td>" +
            "<td class='center'>" + (todasAsignaturas.find(a => a.asigCod === c.codAsignatura)?.asigDescripcion || c.nombre) + "</td>" +
            "<td class='center'>" + c.horas + "</td></tr>"
          ).join('') + `
          <tr style="background-color: #f3f4f6; font-weight: bold;">
            <td colspan="2" style="text-align: right;">HORAS PEDAGÓGICAS (LECTIVAS / AULA)</td>
            <td class="center">${Math.round(horasLectivasAsignadas)}</td>
          </tr>
          <tr style="background-color: #f3f4f6; font-weight: bold;">
            <td colspan="2" style="text-align: right;">HORAS CRONOLÓGICAS LECTIVAS</td>
            <td class="center">${formatTime(horasLectivasAsignadas * 45 / 60)}</td>
          </tr>
        </table>

        <table>
          <tr><th colspan="2" class="center">DESCRIPCIÓN HORAS NO LECTIVAS</th></tr>
          ` + cargasVivas.filter(c => c.tipoCarga === 'NO_LECTIVA').map(c => 
            "<tr><td>" + c.nombre + "</td>" +
            "<td class='center' width='30%'>" + formatTime(c.horas) + "</td></tr>"
          ).join('') + `
          <tr style="background-color: #f3f4f6; font-weight: bold;">
            <td style="text-align: right;">TOTAL HORAS NO LECTIVAS</td>
            <td class="center" width="30%">${formatTime(horasNoLectivasAsignadas)}</td>
          </tr>
        </table>


          <table>
            <tr><th colspan="2" class="center">CÁLCULO HORAS CRONOLÓGICAS CONTRATO</th></tr>
          <tr>
            <td>HORAS CRONOLÓGICAS LECTIVAS</td>
            <td class="center" width="30%">${formatTime(horasLectivasAsignadas * 45 / 60)}</td>
          </tr>
          ` + cargasVivas.filter(c => c.tipoCarga === 'EXTRACURRICULAR').map(c => 
            "<tr><td>HORAS CRONOLÓGICAS " + c.nombre.toUpperCase() + "</td>" +
            "<td class='center'>" + formatTime(c.horas) + "</td></tr>"
          ).join('') + `
          <tr>
            <td>HORAS CRONOLÓGICAS RECREO</td>
            <td class="center">${formatTime(recreoDecimal)}</td>
          </tr>
          <tr>
            <td>HORAS CRONOLÓGICAS NO LECTIVAS</td>
            <td class="center">${formatTime(horasNoLectivasAsignadas)}</td>
          </tr>
          ` + (colacion > 0 ? `<tr>
            <td>DERECHO A COLACIÓN</td>
            <td class="center">${formatTime(colacion)}</td>
          </tr>` : '') + `
          <tr style="background-color: #e5e7eb; font-weight: bold;">
            <td style="text-align: right;">TOTAL HORAS CONTRATO</td>
            <td class="center">${Math.ceil(asigTotal)} H</td>
          </tr>
        </table>

        <div class="section">III. Declaración de Aceptación</div>
        <p style="font-size: 14px; text-align: justify;">Mediante la firma del presente documento, declaro haber sido informado(a) detalladamente de mi carga horaria lectiva y no lectiva para el año escolar 2027 en el establecimiento indicado. Comprendo que esta distribución se ajusta a mi contrato de trabajo y a la planificación operativa del establecimiento.</p>

        <p style="font-size: 14px; margin-top: 40px;">En Antofagasta, a ____ de ______________ de 202__.</p>

        <div class="flex">
          <div class="signature">
            <strong>${docenteSeleccionadoObj.nombres} ${docenteSeleccionadoObj.apellidos}</strong><br/>
            Docente<br/>
            RUT: ${docenteSeleccionadoObj.rut}
          </div>
          <div class="signature">
            <strong>${directorName}</strong><br/>
            Director(a)<br/>
            Timbre Institucional
          </div>
        </div>
      </body>
    </html>
    `;
    
    const printWindow = window.open('', '', 'width=800,height=900');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-[#016098]">Asignación de Carga</h1>
          <div className="flex gap-2">
            <button 
              onClick={printCertificado}
              disabled={!docenteSeleccionado}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Generar Certificado PDF
            </button>
            <button 
          onClick={handleGuardar}
          disabled={saving || !docenteSeleccionado}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Carga'}
          </button>
          </div>
        </div>

      <div className="flex-1 flex flex-col gap-6">
        
        {/* Header Docente */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-4 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          <div className="w-full lg:w-1/4 xl:w-[20%] shrink-0">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Seleccionar Docente</label>
            <select 
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
              value={docenteSeleccionado}
              onChange={(e) => {
                setDocenteSeleccionado(e.target.value);
                setTipoEnsenanzaSeleccionado('');
                setGradoSeleccionado('');
              }}
            >
              <option value="">-- Buscar Docente --</option>
              {docentes.map(d => (
                <option key={d.id} value={d.id}>{d.apellidos}, {d.nombres}</option>
              ))}
            </select>
          </div>
          
          {docenteSeleccionadoObj && (
            <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 lg:border-l lg:pl-6 border-gray-200 w-full">
              <div className="flex flex-col justify-center min-w-[120px] shrink-0">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Horas Contrato</span>
                <span className="text-lg font-bold text-[#016098] leading-none mb-1">{totalHorasContrato} hrs crono</span>
                <span className="text-[10px] text-gray-500 font-medium">Titularidad: {docenteSeleccionadoObj.horasTitular || 0} hrs</span>
              </div>
              
              <div className="flex-1 md:border-l md:pl-6 border-gray-200 flex flex-col justify-center gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-[#39BABD]">Aula + JEC (Máx: {maxLectivasPedagogicas} ped)</span>
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

              <div className="w-full md:w-auto xl:w-[40%] shrink-0 md:border-l md:pl-6 border-gray-200 flex flex-col justify-center">
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
                  
                  <div className="bg-[#f8fafc] border border-gray-200 rounded p-2 text-[9px] text-gray-600 flex-1 w-full grid grid-cols-2 gap-x-2 gap-y-1">
                    <div className="flex justify-between"><span>HA:</span> <span className="font-semibold text-gray-800">{formatCronoDecimal(horasLectivasAsignadas * 45 / 60)}</span></div>
                    <div className="flex justify-between"><span>Recreo:</span> <span className="font-semibold text-gray-800">{formatCronoDecimal(recreoDecimal)}</span></div>
                    {horasNoLectivasAsignadas > 0 && <div className="flex justify-between"><span>HNL:</span> <span className="font-semibold text-gray-800">{formatCronoDecimal(horasNoLectivasAsignadas)}</span></div>}
                    {horasExtraAsignadas > 0 && <div className="flex justify-between"><span>HE:</span> <span className="font-semibold text-gray-800">{formatCronoDecimal(horasExtraAsignadas)}</span></div>}
                    {colacion > 0 && <div className="flex justify-between"><span>Colación:</span> <span className="font-semibold text-gray-800">{formatCronoDecimal(colacion)}</span></div>}
                    <div className="flex justify-between col-span-2 mt-1 pt-1 border-t border-gray-200 text-[#016098] font-bold">
                      <span>TOTAL EXACTO:</span>
                      <span>{formatCronoDecimal(((horasLectivasAsignadas * 45 / 60) + recreoDecimal) + horasNoLectivasAsignadas + horasExtraAsignadas + colacion)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 h-full min-h-[400px]">
          <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] flex flex-col overflow-hidden">
            <div className="flex border-b border-[#e2e8f0] bg-gray-50">
              <button 
                className={`flex-1 py-3 text-xs font-semibold text-center transition-colors ${activeTab === 'LECTIVA' ? 'bg-[#f0f9ff] text-[#016098] border-b-2 border-[#016098]' : 'text-gray-500 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('LECTIVA')}
              >
                1. Lectivas (Aula/JEC)
              </button>
              <button 
                className={`flex-1 py-3 text-xs font-semibold text-center transition-colors ${activeTab === 'NO_LECTIVA' ? 'bg-[#fffbeb] text-[#d97706] border-b-2 border-[#d97706]' : 'text-gray-500 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('NO_LECTIVA')}
              >
                2. No Lectivas
              </button>
              <button 
                className={`flex-1 py-3 text-xs font-semibold text-center transition-colors ${activeTab === 'EXTRACURRICULAR' ? 'bg-[#f3e8ff] text-[#7e22ce] border-b-2 border-[#7e22ce]' : 'text-gray-500 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('EXTRACURRICULAR')}
              >
                3. Extracurricular
              </button>
            </div>
            
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeTab === 'LECTIVA' && (
                <>
                  <div className="p-4 border-b border-gray-100 bg-[#f8fafc] grid grid-cols-2 gap-3">
                     {/* Toggle Mode */}
                     <div className="col-span-2 flex justify-center mb-2">
                       <div className="bg-white border rounded-lg p-1 inline-flex shadow-sm">
                         <button 
                           onClick={() => { setModoAsignacion('GENERALISTA'); setAsignaturaSeleccionada(''); setGradoSeleccionado(''); setTipoEnsenanzaSeleccionado(''); }}
                           className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${modoAsignacion === 'GENERALISTA' ? 'bg-[#016098] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                         >
                           Modo Generalista
                         </button>
                         <button 
                           onClick={() => { setModoAsignacion('ESPECIALISTA'); setAsignaturaSeleccionada(''); setGradoSeleccionado(''); setTipoEnsenanzaSeleccionado(''); }}
                           className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${modoAsignacion === 'ESPECIALISTA' ? 'bg-[#016098] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                         >
                           Modo Especialista
                         </button>
                       </div>
                     </div>
                     {modoAsignacion === 'GENERALISTA' ? (
                       <>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Tipo de Enseñanza {grados.length === 0 ? '(0 grados)' : `(${ensenanzasUnicas.length} tipos)`}
                            </label>
                            <select 
                              className="w-full border border-gray-300 rounded p-1.5 text-sm"
                              value={tipoEnsenanzaSeleccionado}
                              onChange={e => {
                                setTipoEnsenanzaSeleccionado(e.target.value);
                                setGradoSeleccionado('');
                              }}
                            >
                              <option value="">-- Seleccionar --</option>
                              {ensenanzasUnicas.map(e => e && e.tienCod ? (
                                <option key={e.tienCod} value={e.tienCod}>{e.tienDescripcion}</option>
                              ) : null)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Grado</label>
                            <select 
                              className="w-full border border-gray-300 rounded p-1.5 text-sm"
                              value={gradoSeleccionado}
                              onChange={e => setGradoSeleccionado(e.target.value)}
                              disabled={!tipoEnsenanzaSeleccionado}
                            >
                              <option value="">-- Seleccionar --</option>
                              {grados.filter(g => g && g.tienCod && g.tienCod.toString() === tipoEnsenanzaSeleccionado).map(g => (
                                <option key={`${g.tienCod}-${g.grteCod}`} value={`${g.tienCod}-${g.grteCod}`}>
                                  {g.grteDescrip || 'Grado'}
                                </option>
                              ))}
                            </select>
                          </div>
                       </>
                     ) : (
                       <div className="col-span-2">
                         <label className="block text-xs font-semibold text-gray-600 mb-1">Asignatura</label>
                         <select
                           className="w-full border border-gray-300 rounded p-1.5 text-sm"
                           value={asignaturaSeleccionada}
                           onChange={e => setAsignaturaSeleccionada(e.target.value)}
                         >
                           <option value="">-- Seleccionar Asignatura --</option>
                           {Array.from(new Set(todosLosDetalles.map(d => d.codAsignatura)))
                             .map(cod => todasAsignaturas.find(a => a.asigCod === cod))
                             .filter(Boolean)
                             .sort((a, b) => a.asigDescripcion.localeCompare(b.asigDescripcion))
                             .map(a => (
                             <option key={a.asigCod} value={a.asigCod}>{a.asigDescripcion}</option>
                           ))}
                         </select>
                       </div>
                     )}
                  </div>

                  <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                    {modoAsignacion === 'GENERALISTA' ? (
                      detallesPlan.length === 0 ? (
                        <div className="text-center text-[#94a3b8] mt-10">Seleccione un grado para ver el plan de estudio.</div>
                      ) : (
                        <div className="space-y-3">
                          {detallesPlan.map(det => {
                            const gInfo = grados.find(g => g.tienCod === det.tienCod && g.grteCod === det.grteCod);
                            const cursos = gInfo?.cantidadCursos || 1;
                            const totalDisp = det.horas * cursos;
                            const letras = getLetras(cursos);
                            
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
                              <div key={det.id} className="flex justify-between items-center p-3 border border-[#e2e8f0] rounded-lg hover:border-[#016098] transition-colors bg-white shadow-sm">
                                <div>
                                  <p className="font-medium text-[#1e293b] text-sm">{det.asignatura?.asigDescripcion}</p>
                                  <p className="text-xs text-[#64748b]">{det.horas} Pedagógicas/curso • {det.formacion}</p>
                                  <div className="mt-1 text-xs font-bold text-[#016098]">
                                    Disp: {restantes} / {totalDisp} hrs ped
                                  </div>
                                </div>
                                <div className="flex gap-1 flex-wrap justify-end max-w-[200px]">
                                  {letras.map(l => {
                                    const assignedToMe = cargasVivas.some(c => 
                                      c.codAsignatura === det.codAsignatura && 
                                      c.tienCod === det.tienCod && 
                                      c.grteCod === det.grteCod && 
                                      c.letraCurso === l
                                    );
                                    
                                    return (
                                      <button 
                                        key={l}
                                        onClick={() => handleAsignarLectiva(det, l)}
                                        disabled={!docenteSeleccionado || restantes < det.horas || assignedToMe}
                                        className={`px-2 py-1 rounded text-xs font-bold transition-colors ${assignedToMe ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-[#016098] hover:text-white disabled:opacity-50 disabled:hover:bg-gray-100 disabled:hover:text-gray-700'}`}
                                        title={assignedToMe ? "Ya asignado a este docente" : "Asignar"}
                                      >
                                        Asignar {l}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )
                    ) : (
                      !asignaturaSeleccionada ? (
                        <div className="text-center text-[#94a3b8] mt-10">Seleccione una asignatura para ver los cursos.</div>
                      ) : (
                        <div className="space-y-3">
                          {todosLosDetalles
                            .filter(d => d.codAsignatura === asignaturaSeleccionada)
                            .map(det => {
                            const gInfo = grados.find(g => g.tienCod === det.tienCod && g.grteCod === det.grteCod);
                            if (!gInfo) return null;
                            const cursos = gInfo.cantidadCursos || 1;
                            const totalDisp = det.horas * cursos;
                            const letras = getLetras(cursos);
                            
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
                              <div key={det.id} className="flex justify-between items-center p-3 border border-[#e2e8f0] rounded-lg hover:border-[#016098] transition-colors bg-white shadow-sm">
                                <div>
                                  <p className="font-medium text-[#1e293b] text-sm">{gInfo.grteDescrip} ({gInfo.tipoEnsenanza?.tienDescripcion})</p>
                                  <p className="text-xs text-[#64748b]">{det.horas} Pedagógicas/curso • {det.formacion}</p>
                                  <div className="mt-1 text-xs font-bold text-[#016098]">
                                    Disp: {restantes} / {totalDisp} hrs ped
                                  </div>
                                </div>
                                <div className="flex gap-1 flex-wrap justify-end max-w-[200px]">
                                  {letras.map(l => {
                                    const assignedToMe = cargasVivas.some(c => 
                                      c.codAsignatura === det.codAsignatura && 
                                      c.tienCod === det.tienCod && 
                                      c.grteCod === det.grteCod && 
                                      c.letraCurso === l
                                    );
                                    
                                    return (
                                      <button 
                                        key={l}
                                        onClick={() => handleAsignarLectiva(det, l)}
                                        disabled={!docenteSeleccionado || restantes < det.horas || assignedToMe}
                                        className={`px-2 py-1 rounded text-xs font-bold transition-colors ${assignedToMe ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-[#016098] hover:text-white disabled:opacity-50 disabled:hover:bg-gray-100 disabled:hover:text-gray-700'}`}
                                        title={assignedToMe ? "Ya asignado a este docente" : "Asignar"}
                                      >
                                        Asignar {l}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )
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
                        <option key={a.id} value={a.id}>{a.descripcion} {a.esPlanificacion ? '(Planificación)' : ''}</option>
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
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Horas Cronológicas a Asignar</label>
                    <input 
                      type="number" 
                      min="1"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                      value={horasManual}
                      onChange={e => setHorasManual(parseInt(e.target.value) || 1)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Se miden en horas reales de 60 mins.</p>
                  </div>

                  <div className="mt-4">
                    <button 
                      onClick={handleAsignarNoLectiva}
                      disabled={!docenteSeleccionado || !anlSeleccionada}
                      className="w-full bg-[#F59E0B] hover:bg-[#d97706] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Agregar Actividad
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'EXTRACURRICULAR' && (
                <div className="p-6 flex flex-col gap-4 h-full bg-[#f8fafc]">
                  <div className="bg-purple-100 text-purple-800 p-3 rounded-lg text-xs font-medium mb-2 border border-purple-200">
                    Estas actividades no entran en la proporción 65/35.
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Actividad Extracurricular</label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                      value={extSeleccionada}
                      onChange={e => setExtSeleccionada(e.target.value)}
                    >
                      <option value="">-- Seleccionar Actividad --</option>
                      {actividadesExt.map(a => (
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
                      <option value="Normal">Normal</option>
                      <option value="SEP">SEP</option>
                      <option value="PIE">PIE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Horas a Asignar</label>
                    <input 
                      type="number" 
                      min="1"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                      value={horasManual}
                      onChange={e => setHorasManual(parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="mt-4">
                    <button 
                      onClick={handleAsignarExtracurricular}
                      disabled={!docenteSeleccionado || !extSeleccionada}
                      className="w-full bg-[#7e22ce] hover:bg-[#6b21a8] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Agregar Extracurricular
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
            <div className="p-4 bg-gray-50 border-b border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Observaciones Globales (se imprimirán en el certificado)</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm h-16 resize-none"
                  placeholder="Ingrese observaciones..."
                  value={observacionCarga}
                  onChange={(e) => setObservacionCarga(e.target.value)}
                  disabled={!docenteSeleccionado}
                />
              </div>
              <div className="flex-1 overflow-auto p-4 custom-scrollbar">
              {!docenteSeleccionado ? (
                 <div className="text-center text-[#94a3b8] mt-10">Seleccione un docente primero.</div>
              ) : (
                <div className="space-y-2">
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg border-gray-300 bg-gray-50 text-gray-700">
                    <div>
                      <p className="font-medium text-sm">Derecho a Colación</p>
                      <p className="text-xs opacity-75">Global</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold opacity-90">{colacion} Crono</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-200 text-gray-800">
                          COLACIÓN
                        </span>
                      </div>
                    </div>
                    <button disabled className="text-gray-400 px-3 py-1 rounded text-sm font-medium cursor-not-allowed">
                      Fijo
                    </button>
                  </div>
                  {cargasVivas.length === 0 && (
                    <div className="text-center text-[#94a3b8] mt-4 py-4 border-t border-dashed border-gray-200">
                      Aún no tiene horas de docencia o actividades asignadas.
                    </div>
                  )}
                  {cargas.map((carga, index) => {
                    if (carga.eliminada) return null;
                    const color = carga.tipoCarga === 'LECTIVA' ? 'border-[#bae6fd] bg-[#f0f9ff] text-[#016098]' : 
                                  carga.tipoCarga === 'NO_LECTIVA' ? 'border-[#fef08a] bg-[#fffbeb] text-[#d97706]' : 
                                  'border-purple-200 bg-purple-50 text-purple-700';
                    const badge = carga.tipoCarga === 'LECTIVA' ? 'bg-[#e0f2fe] text-[#39BABD]' : 
                                  carga.tipoCarga === 'NO_LECTIVA' ? 'bg-[#fef3c7] text-[#F59E0B]' : 
                                  'bg-purple-200 text-purple-800';

                    return (
                      <div key={index} className={`flex justify-between items-center p-3 border rounded-lg ${color}`}>
                        <div>
                          <p className="font-medium text-sm">
                            {carga.nombre}
                          </p>
                          <p className="text-xs opacity-75">
                            {carga.tipoCarga === 'LECTIVA' ? `${getGradoNombre(carga.tienCod, carga.grteCod)} ${carga.letraCurso || ''}`.trim() : (carga.financiamiento ? `Financiamiento: ${carga.financiamiento}` : 'Global')}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 bg-white rounded px-1 py-0.5 border border-gray-200 shadow-sm">
                              <button 
                                onClick={() => handleCambiarHoras(index, -1)}
                                className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-xs font-bold text-gray-600 transition-colors"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold opacity-90 w-5 text-center">{carga.horas}</span>
                              <button 
                                onClick={() => handleCambiarHoras(index, 1)}
                                className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-xs font-bold text-gray-600 transition-colors"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-xs font-bold opacity-90">{carga.tipoCarga === 'LECTIVA' ? 'Ped' : 'Crono'}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${badge}`}>
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
    </div>
  );
}
