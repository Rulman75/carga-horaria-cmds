'use client';

import React, { useState, useEffect } from 'react';
import { getTodasAsignaturas, updateAsignaturaEspecialista, updateAsignaturaJec, updateAsignaturaNombre, createAsignatura, deleteAsignatura } from '../../actions';

export default function MantenedorAsignaturasPage() {
  const [asignaturas, setAsignaturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form para nueva asignatura
  const [nuevoCod, setNuevoCod] = useState('');
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCod, setEditingCod] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await getTodasAsignaturas();
    setAsignaturas(data);
    setLoading(false);
  };

  const handleToggleEspecialista = async (asigCod: string, currentValue: boolean) => {
    try {
      setAsignaturas(asignaturas.map(a => 
        a.asigCod === asigCod ? { ...a, esEspecialistaSiempre: !currentValue } : a
      ));
      await updateAsignaturaEspecialista(asigCod, !currentValue);
    } catch (e) {
      alert('Error al actualizar la asignatura');
      loadData();
    }
  };
  
  const handleToggleJec = async (asigCod: string, currentValue: boolean) => {
    try {
      setAsignaturas(asignaturas.map(a => 
        a.asigCod === asigCod ? { ...a, esTallerJec: !currentValue } : a
      ));
      await updateAsignaturaJec(asigCod, !currentValue);
    } catch (e) {
      alert('Error al actualizar la asignatura');
      loadData();
    }
  };

  
  const startEditing = (asig: any) => {
    setEditingCod(asig.asigCod);
    setEditValue(asig.asigDescripcion);
  };

  const saveEdit = async (asigCod: string) => {
    if (!editValue.trim()) return;
    try {
      setAsignaturas(asignaturas.map(a => 
        a.asigCod === asigCod ? { ...a, asigDescripcion: editValue } : a
      ));
      setEditingCod(null);
      await updateAsignaturaNombre(asigCod, editValue);
    } catch (e) {
      alert('Error al actualizar el nombre');
      loadData();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoCod.trim() || !nuevaDesc.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createAsignatura(nuevoCod.trim().toUpperCase(), nuevaDesc.trim().toUpperCase());
      setNuevoCod('');
      setNuevaDesc('');
      loadData();
    } catch (e) {
      alert('Error al crear. Es posible que el código ya exista.');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (asigCod: string) => {
    if (confirm(`¿Estás seguro de eliminar la asignatura ${asigCod}?`)) {
      try {
        await deleteAsignatura(asigCod);
        loadData();
      } catch (e) {
        alert('No se puede eliminar la asignatura porque está siendo utilizada en algún Plan de Estudio o Carga Horaria.');
      }
    }
  };

  const filteredAsignaturas = asignaturas.filter(a => 
    a.asigDescripcion.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.asigCod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#016098]">Mantenedor de Asignaturas</h1>
          <p className="text-sm text-gray-500 mt-1">Crea nuevas asignaturas o marca cuáles son impartidas por especialistas.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-6">
        <form onSubmit={handleCreate} className="flex gap-4 items-end">
          <div className="w-48">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Código</label>
            <input 
              type="text" 
              placeholder="Ej. TALL-ROB"
              className="w-full border border-gray-300 rounded-lg p-2 uppercase focus:outline-none focus:border-[#016098] focus:ring-1 focus:ring-[#016098]"
              value={nuevoCod}
              onChange={(e) => setNuevoCod(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
            <input 
              type="text" 
              placeholder="Ej. TALLER DE ROBÓTICA"
              className="w-full border border-gray-300 rounded-lg p-2 uppercase focus:outline-none focus:border-[#016098] focus:ring-1 focus:ring-[#016098]"
              value={nuevaDesc}
              onChange={(e) => setNuevaDesc(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={isSubmitting || !nuevoCod || !nuevaDesc}
            className="bg-[#016098] hover:bg-[#014d7a] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Agregar Asignatura
          </button>
        </form>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex justify-between items-center">
          <input 
            type="text" 
            placeholder="Buscar por código o nombre..." 
            className="border border-[#e2e8f0] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#016098] w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando asignaturas...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#64748b] uppercase bg-[#f1f5f9] sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="px-6 py-4 w-32">Código</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4 text-center w-48">¿Especialista Siempre?</th>
                  <th className="px-6 py-4 text-center w-48">¿Es Taller JEC?</th>
                  <th className="px-6 py-4 text-right w-32">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAsignaturas.map(asig => (
                  <tr key={asig.asigCod} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors">
                    <td className="px-6 py-4 font-mono text-[#64748b] font-medium">{asig.asigCod}</td>
                    <td className="px-6 py-4 font-medium text-[#1e293b]">
                      {editingCod === asig.asigCod ? (
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            className="border border-gray-300 rounded px-2 py-1 flex-1 text-sm focus:outline-none focus:border-[#016098]"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(asig.asigCod)}
                            autoFocus
                          />
                          <button onClick={() => saveEdit(asig.asigCod)} className="text-green-600 hover:text-green-800 p-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          </button>
                          <button onClick={() => setEditingCod(null)} className="text-red-600 hover:text-red-800 p-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <span>{asig.asigDescripcion}</span>
                          <button onClick={() => startEditing(asig)} className="text-gray-400 hover:text-[#016098] opacity-0 group-hover:opacity-100 transition-opacity" title="Editar nombre">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={asig.esEspecialistaSiempre}
                          onChange={() => handleToggleEspecialista(asig.asigCod, asig.esEspecialistaSiempre)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#39BABD]"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={asig.esTallerJec}
                          onChange={() => handleToggleJec(asig.asigCod, asig.esTallerJec)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F59E0B]"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(asig.asigCod)}
                        className="text-red-600 hover:text-red-800 font-medium text-xs px-3 py-1 rounded border border-red-200 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredAsignaturas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-[#94a3b8]">
                      No se encontraron asignaturas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
