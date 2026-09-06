'use client';

import React, { useState, useEffect } from 'react';
import { getEstablecimientosConTipos, updateEstablecimientoTipos, getTiposEnsenanza } from '../../actions';

export default function MantenedorEstablecimientosPage() {
  const [establecimientos, setEstablecimientos] = useState<any[]>([]);
  const [tiposEnsenanza, setTiposEnsenanza] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingEst, setEditingEst] = useState<any | null>(null);
  const [selectedTipos, setSelectedTipos] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [ests, tipos] = await Promise.all([
      getEstablecimientosConTipos(),
      getTiposEnsenanza()
    ]);
    setEstablecimientos(ests);
    setTiposEnsenanza(tipos);
    setLoading(false);
  };

  const handleEdit = (est: any) => {
    setEditingEst(est);
    setSelectedTipos(est.tiposEnsenanza.map((te: any) => te.tienCod));
  };

  const handleToggleTipo = (tienCod: number) => {
    if (selectedTipos.includes(tienCod)) {
      setSelectedTipos(selectedTipos.filter(t => t !== tienCod));
    } else {
      setSelectedTipos([...selectedTipos, tienCod]);
    }
  };

  const handleSave = async () => {
    if (!editingEst) return;
    setSaving(true);
    try {
      await updateEstablecimientoTipos(editingEst.esedSec, selectedTipos);
      await loadData();
      setEditingEst(null);
    } catch (e) {
      alert('Error al guardar');
    }
    setSaving(false);
  };

  const filtered = establecimientos.filter(e => 
    e.esedDescripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.esedDescCorta?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[#016098]">Mantenedor de Establecimientos</h1>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden flex">
        
        {/* Lista de Establecimientos */}
        <div className="w-2/3 border-r border-[#e2e8f0] flex flex-col">
          <div className="p-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
            <input 
              type="text" 
              placeholder="Buscar establecimiento..." 
              className="w-full border border-[#e2e8f0] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#016098]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar p-4">
            {loading ? (
              <div className="text-center text-gray-500 py-8">Cargando...</div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filtered.map(est => (
                  <div 
                    key={est.esedSec}
                    onClick={() => handleEdit(est)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      editingEst?.esedSec === est.esedSec 
                        ? 'border-[#016098] bg-[#f0f9ff] shadow-sm' 
                        : 'border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1e293b]">{est.esedDescCorta}</span>
                          <span className="text-xs text-gray-400">ID: {est.esedSec}</span>
                        </div>
                        <p className="text-sm text-[#64748b] mt-1">{est.esedDescripcion}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {est.tiposEnsenanza.length === 0 ? (
                        <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded">Sin tipos configurados</span>
                      ) : (
                        est.tiposEnsenanza.map((te: any) => (
                          <span key={te.tienCod} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-gray-200 uppercase">
                            {te.tipoEnsenanza.tienDescripcion}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel Lateral de Edición */}
        <div className="w-1/3 bg-[#f8fafc] flex flex-col">
          {editingEst ? (
            <>
              <div className="p-6 border-b border-[#e2e8f0] bg-white">
                <h2 className="text-lg font-bold text-[#1e293b]">{editingEst.esedDescCorta}</h2>
                <p className="text-sm text-[#64748b]">{editingEst.esedDescripcion}</p>
              </div>
              
              <div className="p-6 flex-1 overflow-auto custom-scrollbar">
                <h3 className="text-sm font-bold text-[#016098] uppercase tracking-wider mb-4">
                  Tipos de Enseñanza Habilitados
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Selecciona qué niveles educativos imparte este colegio. Esto filtrará lo que el director puede configurar.
                </p>
                
                <div className="space-y-2">
                  {tiposEnsenanza.map(tipo => (
                    <label 
                      key={tipo.tienCod} 
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTipos.includes(tipo.tienCod) 
                          ? 'border-[#39BABD] bg-[#f0fdfa]' 
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="mt-0.5"
                        checked={selectedTipos.includes(tipo.tienCod)}
                        onChange={() => handleToggleTipo(tipo.tienCod)}
                      />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{tipo.tienDescripcion}</div>
                        <div className="text-xs text-gray-500">Cód: {tipo.tienCod}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-white border-t border-[#e2e8f0]">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-[#016098] hover:bg-[#014d7a] text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  {saving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400 text-2xl">
                🏫
              </div>
              <h3 className="text-gray-500 font-medium">Selecciona un establecimiento</h3>
              <p className="text-sm text-gray-400 mt-2">
                Para configurar sus Tipos de Enseñanza autorizados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
