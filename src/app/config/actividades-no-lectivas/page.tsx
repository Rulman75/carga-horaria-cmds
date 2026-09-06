'use client';

import React, { useState, useEffect } from 'react';
import { getActividadesNoLectivas, createActividadNoLectiva, deleteActividadNoLectiva } from '../../actions';

export default function MantenedorANLPage() {
  const [actividades, setActividades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevaDesc, setNuevaDesc] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await getActividadesNoLectivas();
    setActividades(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaDesc.trim()) return;
    try {
      await createActividadNoLectiva(nuevaDesc.trim());
      setNuevaDesc('');
      loadData();
    } catch (e) {
      alert('Error al crear. Es posible que ya exista.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar esta actividad? Las cargas asignadas a ella se perderán.')) {
      await deleteActividadNoLectiva(id);
      loadData();
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-[#016098]">Mantenedor Actividades No Lectivas</h1>
        <p className="text-sm text-gray-500 mt-1">Administra el catálogo de actividades como Planificación, Talleres Técnicos, etc.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-6">
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nueva Actividad</label>
            <input 
              type="text" 
              placeholder="Ej. Taller Pedagógico"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-[#016098] focus:ring-1 focus:ring-[#016098]"
              value={nuevaDesc}
              onChange={(e) => setNuevaDesc(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="bg-[#016098] hover:bg-[#014d7a] text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Agregar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden flex-1">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-[#e2e8f0]">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {actividades.map(act => (
                <tr key={act.id} className="border-b border-[#e2e8f0] hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">{act.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{act.descripcion}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(act.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-xs px-3 py-1 rounded border border-red-200 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {actividades.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No hay actividades registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
