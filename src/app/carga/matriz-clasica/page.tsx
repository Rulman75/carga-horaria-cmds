'use client';
import React, { useState, useEffect } from 'react';
import { 
  getCargasEstablecimiento, 
  getDocentesEstablecimiento, 
  getGradosEstablecimiento,
  getActividadesNoLectivas,
  getActividadesExtracurriculares,
  getConfiguracionGlobal,
  getTablaConversion
} from '../../actions';

export default function SabanaClasicaPage() {
  const parseCronoToDecimal = (crono: string) => { if(!crono) return 0; const p = crono.split(':'); if(p.length !== 2) return 0; return parseInt(p[0]) + parseInt(p[1])/60; };
  const [ESTABLECIMIENTO_ID, setEstablecimientoId] = useState<number | null>(null);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [cargas, setCargas] = useState<any[]>([]);
  const [grados, setGrados] = useState<any[]>([]);
  const [tablaConversion, setTablaConversion] = useState<any[]>([]);
  const [catAnl, setCatAnl] = useState<any[]>([]);
  const [catExt, setCatExt] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const estId = Number(localStorage.getItem('selectedEstablecimientoId')) || 2;
    setEstablecimientoId(estId);
    getDocentesEstablecimiento(estId).then(setDocentes);
    getCargasEstablecimiento(estId).then(setCargas);
    getGradosEstablecimiento(estId).then(setGrados);
      getTablaConversion().then(setTablaConversion);
    getActividadesNoLectivas().then(setCatAnl);
    getActividadesExtracurriculares().then(setCatExt);
    getConfiguracionGlobal().then(setConfig);
  }, []);

  const docentesMap: Record<number, any> = {};
  
  // Inicializar docentes
  docentes.forEach(d => {
    const contrato = d.totalDefinitivo || d.totalJornada || d.horasTitular || 0;
    const colacion = contrato >= 30 ? (config?.horasColacion || 2) : 1;
    docentesMap[d.id] = {
      ...d,
      contrato,
      colacion,
      asignaturasBase: {},
      asignaturasJec: {},
      anls: {},
      extras: {},
      totalAnlCrono: 0,
      totalExtraCrono: 0
    };
  });

  const asignaturasBaseSet = new Set<string>();
  const asignaturasJecSet = new Set<string>();
  const anlSet = new Set<string>();
  const extSet = new Set<string>();

  cargas.forEach(c => {
    const d = docentesMap[c.docenteId];
    if (!d) return;

    if (c.tipoCarga === 'LECTIVA') {
      const isJec = c.asignatura?.esTallerJec || false;
      const asigDesc = c.asignatura?.asigDescripcion || 'Desconocida';
      
      const key = `${c.asignaturaCod}|${asigDesc}`;
      if (isJec) {
        asignaturasJecSet.add(key);
        d.asignaturasJec[key] = (d.asignaturasJec[key] || 0) + c.horasAllocadas;
      } else {
        asignaturasBaseSet.add(key);
        d.asignaturasBase[key] = (d.asignaturasBase[key] || 0) + c.horasAllocadas;
      }
    } else if (c.tipoCarga === 'NO_LECTIVA') {
      const anlDesc = c.actividadNoLectiva?.descripcion || 'No Lectiva';
      const finan = c.financiamiento || 'Normal';
      const key = `${c.actividadNoLectivaId}|${anlDesc}|${finan}`;
      anlSet.add(key);
      d.anls[key] = (d.anls[key] || 0) + c.horasAllocadas;
      d.totalAnlCrono += c.horasAllocadas;
    } else if (c.tipoCarga === 'EXTRACURRICULAR') {
      const extDesc = c.actividadExtracurricular?.descripcion || 'Extracurricular';
      const finan = c.financiamiento || 'Normal';
      const key = `${c.actividadExtracurricularId}|${extDesc}|${finan}`;
      extSet.add(key);
      d.extras[key] = (d.extras[key] || 0) + c.horasAllocadas;
      d.totalExtraCrono += c.horasAllocadas;
    }
  });

  const colsBase = Array.from(asignaturasBaseSet).map(x => ({ key: x, desc: x.split('|')[1] })).sort((a,b) => a.desc.localeCompare(b.desc));
  const colsJec = Array.from(asignaturasJecSet).map(x => ({ key: x, desc: x.split('|')[1] })).sort((a,b) => a.desc.localeCompare(b.desc));
  const colsAnl = Array.from(anlSet).map(x => {
    const p = x.split('|');
    return { key: x, desc: p[1], finan: p[2] };
  }).sort((a,b) => a.desc.localeCompare(b.desc));
  const colsExt = Array.from(extSet).map(x => {
    const p = x.split('|');
    return { key: x, desc: p[1], finan: p[2] };
  }).sort((a,b) => a.desc.localeCompare(b.desc));

  const docentesArray = Object.values(docentesMap).sort((a, b) => a.apellidos.localeCompare(b.apellidos));

  
  const exportarExcel = () => {
    const table = document.getElementById('sabana-table');
    if (!table) return;
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body>${table.outerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SabanaCarga.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    
      <div className="flex flex-col gap-6 h-full">
<style>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body, html { height: auto !important; overflow: visible !important; background: white !important; }
          aside, nav, .no-print { display: none !important; }
          main { height: auto !important; overflow: visible !important; width: 100% !important; padding: 0 !important; margin: 0 !important; }
          /* Reset parent flex containers that clip content */
          div[class*="flex h-screen"] { display: block !important; height: auto !important; overflow: visible !important; }
          .custom-scrollbar { overflow: visible !important; }
          table { width: 100% !important; page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          /* Avoid text colors disappearing in print mode */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          /* Un-stick elements so they flow properly across pages */
          th.sticky, td.sticky { position: static !important; }
          thead.sticky { position: static !important; }
        }
      `}</style>

      
      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-xl font-bold text-[#016098]">Sábana Clásica de Carga (Global)</h1>
          <p className="text-sm text-gray-500">Matriz en horas cronológicas y pedagógicas según corresponda.</p>
        </div>
        <button 
          onClick={exportarExcel}
          className="bg-[#107c41] hover:bg-[#0c5c30] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors mr-2"
        >
          Exportar Excel
        </button>
        <button 
          onClick={() => window.print()}
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
        >
          Imprimir / PDF
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar bg-[#f8fafc]">
        <table id="sabana-table" className="w-full text-sm text-left border-collapse" style={{ minWidth: 'max-content' }}>
          <thead className="text-[10px] text-[#1e293b] uppercase bg-[#e2e8f0] sticky top-0 z-20 shadow-sm">
            <tr>
              <th colSpan={3} className="bg-[#e2e8f0] sticky left-0 z-40 border border-[#cbd5e1]"></th>
              
              {(colsBase.length > 0 || colsJec.length > 0) && (
                <th colSpan={(colsBase.length > 0 ? colsBase.length + 1 : 0) + (colsJec.length > 0 ? colsJec.length + 1 : 0) + 2} className="px-4 py-1 border border-[#cbd5e1] text-center bg-blue-50 text-blue-900 border-r-2 border-r-slate-300 font-bold">
                  65% HORAS LECTIVAS
                </th>
              )}

              <th colSpan={colsAnl.length + 2} className="px-4 py-1 border border-[#cbd5e1] text-center bg-amber-50 text-amber-900 border-r-2 border-r-slate-300 font-bold">
                35% HORAS NO LECTIVAS
              </th>

              <th className="bg-[#e2e8f0] border border-[#cbd5e1] border-b-0"></th>

              {colsExt.length > 0 && (
                <th colSpan={colsExt.length + 1} className="px-4 py-1 border border-[#cbd5e1] text-center bg-purple-50 text-purple-900 border-r-2 border-r-slate-300 font-bold">
                  ACTIVIDADES EXTRACURRICULARES
                </th>
              )}

              <th colSpan={3} className="bg-gray-300 border border-[#cbd5e1]"></th>
            </tr>
            <tr>
              <th className="px-4 py-2 border border-[#cbd5e1] bg-[#e2e8f0] sticky left-0 z-30" rowSpan={2}>Docente</th>
              <th className="px-2 py-2 border border-[#cbd5e1] text-center bg-[#e2e8f0] sticky left-[250px] z-30" rowSpan={2}>Hrs.<br/>Contrato</th>
              <th className="px-2 py-2 border border-[#cbd5e1] text-center bg-[#e2e8f0] sticky left-[320px] z-30" rowSpan={2}>Derecho<br/>Colacin</th>
              
              {colsBase.length > 0 && <th colSpan={colsBase.length} className="px-4 py-1 border border-[#cbd5e1] text-center bg-white text-blue-700">PLAN DE ESTUDIO</th>}
              {colsBase.length > 0 && <th className="px-2 py-1 border border-[#cbd5e1] text-center bg-blue-100 text-blue-800" rowSpan={2}>TOTAL<br/>AULA</th>}

              {colsJec.length > 0 && <th colSpan={colsJec.length} className="px-4 py-1 border border-[#cbd5e1] text-center bg-white text-emerald-700">TALLERES JEC</th>}
              {colsJec.length > 0 && <th className="px-2 py-1 border border-[#cbd5e1] text-center bg-emerald-100 text-emerald-800" rowSpan={2}>TOTAL<br/>JEC</th>}
              {(colsBase.length > 0 || colsJec.length > 0) && <th className="px-2 py-1 border border-[#cbd5e1] text-center bg-teal-100 text-teal-800 font-bold" rowSpan={2}>TOTAL<br/>LECTIVAS</th>}
              {(colsBase.length > 0 || colsJec.length > 0) && <th className="px-2 py-1 border border-[#cbd5e1] text-center bg-teal-50 text-teal-900 border-r-2 border-r-slate-300" rowSpan={2}>RECREOS<br/>(Crono)</th>}

              <th className="px-2 py-1 border border-[#cbd5e1] text-center bg-orange-50 text-orange-800" rowSpan={2}>HRS. NL<br/>(Marco Legal)</th>
              {colsAnl.length > 0 && <th colSpan={colsAnl.length} className="px-4 py-1 border border-[#cbd5e1] text-center bg-white text-amber-700">HRS. NO LECTIVAS</th>}
              <th className="px-2 py-1 border border-[#cbd5e1] text-center bg-amber-100 text-amber-800 border-r-2 border-r-slate-300" rowSpan={2}>TOTAL<br/>NO LECTIVAS</th>

              <th className="px-2 py-1 border border-[#cbd5e1] text-center bg-slate-200 font-bold text-slate-800 border-r-2 border-r-slate-400" rowSpan={2}>TOTAL JORNADA<br/>SEMANAL (Crono)</th>

              {colsExt.length > 0 && <th colSpan={colsExt.length} className="px-4 py-1 border border-[#cbd5e1] text-center bg-white text-purple-700">ACTIVIDADES EXTRACURRICULARES</th>}
              {colsExt.length > 0 && <th className="px-2 py-1 border border-[#cbd5e1] text-center bg-purple-100 text-purple-800 border-r-2 border-r-slate-300" rowSpan={2}>TOTAL<br/>EXTRA</th>}

              <th className="px-2 py-1 border border-[#cbd5e1] text-center bg-gray-300 font-bold" rowSpan={2}>TOTAL ASIGNADO<br/>(Crono)</th>
              <th className="px-2 py-1 border border-[#cbd5e1] text-center bg-gray-300 border-r-2 border-r-slate-400" rowSpan={2}>BALANCE<br/>(Faltan/Sobran)</th>
              <th className="px-4 py-1 border border-[#cbd5e1] text-left bg-gray-100" rowSpan={2}>OBSERVACIONES</th>
            </tr>
            <tr>
              {colsBase.map(c => <th key={c.key} className="px-1 py-1 border border-[#cbd5e1] bg-white text-center w-8 align-bottom" title={c.desc}><div className="[writing-mode:vertical-rl] rotate-180 max-h-32 m-auto text-[11px] font-semibold text-gray-700 py-2 truncate">{c.desc}</div></th>)}
              {colsJec.map(c => <th key={c.key} className="px-1 py-1 border border-[#cbd5e1] bg-white text-center w-8 align-bottom" title={c.desc}><div className="[writing-mode:vertical-rl] rotate-180 max-h-32 m-auto text-[11px] font-semibold text-gray-700 py-2 truncate">{c.desc}</div></th>)}
              {colsAnl.map(c => (
                <th key={c.key} className="px-1 py-1 border border-[#cbd5e1] bg-white text-center w-8 align-bottom" title={c.desc}>
                  <div className="flex flex-col items-center justify-end h-32">
                    <div className="[writing-mode:vertical-rl] rotate-180 flex-1 text-[11px] font-semibold text-gray-700 truncate">{c.desc}</div>
                    <div className="text-[8px] bg-amber-100 mt-2 px-1 rounded truncate w-full" title={c.finan}>{c.finan.substring(0, 3)}</div>
                  </div>
                </th>
              ))}
              {colsExt.map(c => (
                <th key={c.key} className="px-1 py-1 border border-[#cbd5e1] bg-white text-center w-8 align-bottom" title={c.desc}>
                  <div className="flex flex-col items-center justify-end h-32">
                    <div className="[writing-mode:vertical-rl] rotate-180 flex-1 text-[11px] font-semibold text-gray-700 truncate">{c.desc}</div>
                    <div className="text-[8px] bg-purple-100 mt-2 px-1 rounded truncate w-full" title={c.finan}>{c.finan.substring(0, 3)}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {docentesArray.map(doc => {
              let sumBase = 0; colsBase.forEach(c => sumBase += doc.asignaturasBase[c.key] || 0);
              let sumJec = 0; colsJec.forEach(c => sumJec += doc.asignaturasJec[c.key] || 0);
              
              const totalAulaPed = sumBase + sumJec;
              const totalAnlCrono = doc.totalAnlCrono;
              const totalExtCrono = doc.totalExtraCrono;

              
              let anlMarcoCrono: number | string = '-';
              let recreoCrono: number | string = '-';
              let recreoDecimal = 0;
              if (totalAulaPed > 0) {
                const row = tablaConversion.find(r => r.lectivasPedagogicas === totalAulaPed);
                if (row) {
                  anlMarcoCrono = Math.round(parseCronoToDecimal(row.noLectivasCronologicas));
                  recreoCrono = Math.round(parseCronoToDecimal(row.recreoCronologicas));
                  recreoDecimal = parseCronoToDecimal(row.recreoCronologicas);
                  }
                }

                const totalJornadaSemanalCrono = Math.round((totalAulaPed * 45 / 60) + recreoDecimal) + totalAnlCrono;
                const asignadoCronoTotal = Math.round((totalAulaPed * 45 / 60) + recreoDecimal) + totalAnlCrono + totalExtCrono + doc.colacion;
                const balance = doc.contrato - asignadoCronoTotal;
                const hasData = asignadoCronoTotal > doc.colacion;

              return (
                <tr key={doc.id} className={`bg-white hover:bg-gray-50 border-b border-[#e2e8f0] ${!hasData ? 'opacity-40' : ''}`}>
                  <td className="px-4 py-2 sticky left-0 bg-white z-10 border-r border-[#e2e8f0] min-w-[250px]">
                    <div className="font-bold text-gray-800">{doc.apellidos}, {doc.nombres}</div>
                    <div className="text-[10px] text-gray-500">{doc.rut}</div>
                  </td>
                  <td className="px-2 py-2 text-center font-bold sticky left-[250px] bg-white z-10 border-r">{doc.contrato}</td>
                  <td className="px-2 py-2 text-center text-gray-500 sticky left-[320px] bg-white z-10 border-r bg-gray-50">{doc.colacion}</td>
                  
                  {colsBase.map(c => <td key={c.key} className="px-1 py-2 text-center border-r text-[#016098] font-medium">{doc.asignaturasBase[c.key] ? Math.round(doc.asignaturasBase[c.key]) : '-'}</td>)}
                  {colsBase.length > 0 && <td className="px-2 py-2 text-center font-bold bg-white text-blue-700 border-r">{sumBase ? Math.round(sumBase) : '-'}</td>}

                  {colsJec.map(c => <td key={c.key} className="px-1 py-2 text-center border-r text-[#166534] font-medium">{doc.asignaturasJec[c.key] ? Math.round(doc.asignaturasJec[c.key]) : '-'}</td>)}
                  {colsJec.length > 0 && <td className="px-2 py-2 text-center font-bold bg-emerald-100 text-emerald-800 border-r">{sumJec ? Math.round(sumJec) : '-'}</td>}
                  {(colsBase.length > 0 || colsJec.length > 0) && <td className="px-2 py-2 text-center font-bold bg-teal-50 text-teal-800 border-r">{totalAulaPed ? Math.round(totalAulaPed) : '-'}</td>}
                  {(colsBase.length > 0 || colsJec.length > 0) && <td className="px-2 py-2 text-center font-bold bg-teal-50 text-teal-900 border-r-2 border-r-slate-300 border-r">{recreoCrono}</td>}

                  <td className="px-2 py-2 text-center font-bold text-orange-700 border-r bg-orange-50">{anlMarcoCrono}</td>
                  {colsAnl.map(c => <td key={c.key} className="px-1 py-2 text-center border-r text-[#d97706] font-medium">{doc.anls[c.key] ? Math.round(doc.anls[c.key]) : '-'}</td>)}
                  <td className="px-2 py-2 text-center font-bold bg-white text-amber-700 border-r">{totalAnlCrono ? Math.round(totalAnlCrono) : '-'}</td>

                  <td className="px-2 py-2 text-center font-bold bg-slate-100 text-slate-800 border-r border-r-slate-400">{totalJornadaSemanalCrono ? Math.round(totalJornadaSemanalCrono) : '-'}</td>

                  {colsExt.map(c => <td key={c.key} className="px-1 py-2 text-center border-r text-[#7e22ce] font-medium">{doc.extras[c.key] ? Math.round(doc.extras[c.key]) : '-'}</td>)}
                  {colsExt.length > 0 && <td className="px-2 py-2 text-center font-bold bg-white text-purple-700 border-r">{totalExtCrono ? Math.round(totalExtCrono) : '-'}</td>}

                  <td className="px-2 py-2 text-center font-bold text-gray-800 bg-gray-100 border-r">{Math.round(asignadoCronoTotal)}</td>
                  <td className={`px-2 py-2 text-center font-bold border-r-2 border-[#cbd5e1] ${balance === 0 ? 'text-green-600' : balance > 0 ? 'text-orange-500' : 'text-red-600'}`}>
                    {balance === 0 ? 'OK' : balance > 0 ? `Faltan ${Math.round(balance)}` : `Sobran ${Math.abs(balance)}`}
                  </td>
                  <td className="px-4 py-2 text-left text-[11px] text-gray-700 max-w-[200px] break-words whitespace-normal border-r border-[#cbd5e1]">
                    {doc.establecimientos?.[0]?.observacionCarga || ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
