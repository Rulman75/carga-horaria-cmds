'use client';

import React, { useState, useEffect } from 'react';
import { getDocentesEstablecimiento, updateDocenteHoras } from '../../actions';
import * as XLSX from 'xlsx';

export default function DocentesPage() {
  const [docentes, setDocentes] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editHoras, setEditHoras] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDocentes();
  }, []);

  const loadDocentes = () => {
    const estId = Number(localStorage.getItem('selectedEstablecimientoId')) || 2;
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
      'HRS EXTENSION': d.horasExtension,
      'HRS PIE': d.horasPie,
      'HRS SEP': d.horasSep,
      'HRS GREMIAL': d.horasGremial,
      'HRS SIPPE': d.horasSippe,
      'HRS EXTRAESCOLAR': d.horasExtraescolar,
      'TOTAL JORNADA': d.totalJornada
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Docentes");
    XLSX.writeFile(workbook, "Listado_Docentes.xlsx");
  };

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
          <button className="bg-[#39BABD] hover:bg-[#2b9799] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
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
                <th className="px-4 py-3 text-center">Hrs Extensión</th>
                <th className="px-4 py-3 text-center">Hrs PIE</th>
                <th className="px-4 py-3 text-center">Hrs SEP</th>
                <th className="px-4 py-3 text-center">Hrs Gremial</th>
                <th className="px-4 py-3 text-center">Hrs SIPPE</th>
                <th className="px-4 py-3 text-center">Hrs Extrescolar</th>
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
                  <td className="px-4 py-3 text-center text-gray-600">{docente.horasExtension || '-'}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{docente.horasPie || '-'}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{docente.horasSep || '-'}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{docente.horasGremial || '-'}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{docente.horasSippe || '-'}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{docente.horasExtraescolar || '-'}</td>
                  <td className="px-4 py-3 text-center font-bold text-[#39BABD]">{docente.totalJornada || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    {editingId === docente.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleSave(docente.id)}
                          disabled={loading}
                          className="text-green-600 hover:text-green-800 font-medium text-xs">Guardar</button>
                        <button 
                          onClick={() => setEditingId(null)}
                          disabled={loading}
                          className="text-gray-500 hover:text-gray-700 font-medium text-xs">Cancelar</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleEdit(docente)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs underline">Editar Titular</button>
                    )}
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
    </div>
  );
}