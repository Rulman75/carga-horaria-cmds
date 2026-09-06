'use client';

import React, { useState, useEffect } from 'react';
import { getDocentesEstablecimiento, updateDocenteHoras } from '../../actions';

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

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[#016098]">Registro de Docentes</h1>
        <button className="bg-[#39BABD] hover:bg-[#2b9799] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Agregar Docente
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <p className="text-[#64748b] text-sm">
            Administración de docentes y sus horas de titularidad. (Todos por defecto tienen 44 hrs hasta que las ajustes)
          </p>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#64748b] uppercase bg-[#f1f5f9] sticky top-0 shadow-sm z-10">
              <tr>
                <th className="px-6 py-4">RUT</th>
                <th className="px-6 py-4">Docente</th>
                <th className="px-6 py-4 text-center">Hrs. Titular</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {docentes.map(docente => (
                <tr key={docente.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors">
                  <td className="px-6 py-4 font-mono text-[#64748b]">{docente.rut}</td>
                  <td className="px-6 py-4 font-bold text-[#1e293b]">
                    {docente.apellidos}, {docente.nombres}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editingId === docente.id ? (
                      <input 
                        type="number" 
                        min="1" 
                        max="44" 
                        value={editHoras} 
                        onChange={(e) => setEditHoras(Number(e.target.value))}
                        className="w-20 px-2 py-1 border rounded text-center focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                    ) : (
                      <span className="bg-[#e0f2fe] text-[#016098] px-3 py-1 rounded-full text-xs font-semibold">
                        {docente.horasTitular} Hrs
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editingId === docente.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleSave(docente.id)}
                          disabled={loading}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Guardar
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          disabled={loading}
                          className="text-gray-500 hover:text-gray-700 font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleEdit(docente)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Editar Hrs
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {docentes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#94a3b8]">
                    No hay docentes registrados.
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
