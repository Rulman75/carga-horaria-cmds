'use client';

import React, { useState, useEffect } from 'react';
import { getActividadesExtracurriculares, createActividadExtracurricular, updateActividadExtracurricular, deleteActividadExtracurricular } from '../../actions';

export default function MantenedorExtracurricularesPage() {
  const [actividades, setActividades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [nuevasHoras, setNuevasHoras] = useState<string>('');
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editHoras, setEditHoras] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await getActividadesExtracurriculares();
    setActividades(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaDesc.trim()) return;
    try {
      const horas = nuevasHoras ? parseFloat(nuevasHoras) : null;
      await createActividadExtracurricular(nuevaDesc.trim(), horas);
      setNuevaDesc('');
      setNuevasHoras('');
      loadData();
    } catch (e) {
      alert('Error al crear. Es posible que ya exista.');
    }
  };

  const handleEdit = (act: any) => {
    setEditingId(act.id);
    setEditDesc(act.descripcion);
    setEditHoras(act.horasDefault !== null ? act.horasDefault.toString() : '');
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const horas = editHoras ? parseFloat(editHoras) : null;
      await updateActividadExtracurricular(id, editDesc.trim(), horas);
      setEditingId(null);
      loadData();
    } catch (e) {
      alert('Error al actualizar.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar esta actividad? Las cargas asignadas a ella se perderán.')) {
      await deleteActividadExtracurricular(id);
      loadData();
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full w-full mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[#1e293b]">Mantenedor Actividades Extracurriculares</h1>
        <p className="text-sm text-gray-500 mt-1">Administra el catálogo de actividades y configura sus horas por defecto.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-6">
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-[2]">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nueva Actividad</label>
            <input 
              type="text" 
              placeholder="Ej. Taller Pedagógico"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-[#016098] focus:ring-1 focus:ring-[#016098]"
              value={nuevaDesc}
              onChange={(e) => setNuevaDesc(e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Horas Default (Opcional)</label>
            <input 
              type="number" 
              step="0.1"
              min="0"
              placeholder="Ej. 44"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-[#016098] focus:ring-1 focus:ring-[#016098]"
              value={nuevasHoras}
              onChange={(e) => setNuevasHoras(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="bg-[#016098] hover:bg-[#014d7a] text-white px-6 py-2 rounded-lg font-medium transition-colors h-[42px]"
          >
            Agregar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden flex-1">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : (
          <div className="overflow-auto custom-scrollbar h-full">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-[#e2e8f0] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4 text-center">Horas Default</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {actividades.map(act => (
                  <tr key={act.id} className="border-b border-[#e2e8f0] hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500 w-24">{act.id}</td>
                    
                    <td className="px-6 py-4">
                      {editingId === act.id ? (
                        <input 
                          type="text" 
                          className="w-full border p-1 rounded" 
                          value={editDesc} 
                          onChange={e => setEditDesc(e.target.value)} 
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{act.descripcion}</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center w-48">
                      {editingId === act.id ? (
                        <input 
                          type="number" 
                          step="0.1" 
                          min="0"
                          className="w-24 border p-1 rounded text-center mx-auto" 
                          value={editHoras} 
                          onChange={e => setEditHoras(e.target.value)} 
                        />
                      ) : (
                        <span className={`font-bold ${act.horasDefault ? 'text-blue-600' : 'text-gray-400'}`}>
                          {act.horasDefault !== null ? `${act.horasDefault} Hrs` : '-'}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right w-48">
                      {editingId === act.id ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleSaveEdit(act.id)} className="text-green-600 font-bold hover:bg-green-50 px-2 py-1 rounded">Guardar</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500 hover:bg-gray-100 px-2 py-1 rounded">Cancelar</button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(act)} className="text-blue-600 font-medium text-xs px-3 py-1 rounded border border-blue-200 hover:bg-blue-50">Editar</button>
                          <button onClick={() => handleDelete(act.id)} className="text-red-600 font-medium text-xs px-3 py-1 rounded border border-red-200 hover:bg-red-50">Eliminar</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {actividades.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No hay actividades registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
