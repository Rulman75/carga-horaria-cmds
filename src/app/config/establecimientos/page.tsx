'use client';

import React, { useState, useEffect } from 'react';
import {
  getEstablecimientosConTipos,
  updateEstablecimientoTipos,
  getTiposEnsenanza,
  toggleBloqueoEstablecimiento
} from '../../actions';

export default function MantenedorEstablecimientosPage() {
  const [establecimientos, setEstablecimientos] = useState<any[]>([]);
  const [tiposEnsenanza, setTiposEnsenanza] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'TODOS' | 'ABIERTOS' | 'BLOQUEADOS'>('TODOS');

  const [editingEst, setEditingEst] = useState<any | null>(null);
  const [selectedTipos, setSelectedTipos] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

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
    if (editingEst) {
      const updated = ests.find((x: any) => x.esedSec === editingEst.esedSec);
      if (updated) setEditingEst(updated);
    }
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

  const handleToggleBloqueo = async (est: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nuevoEstado = !est.bloqueado;
    const msg = nuevoEstado
      ? `¿Bloquear el ingreso de modificaciones para "${est.esedDescripcion}"?\n\nEl establecimiento quedará en Modo Solo Lectura (podrán ver e imprimir su carga, pero no modificarla).`
      : `¿Reabrir la edición de carga horaria para "${est.esedDescripcion}"?`;

    if (!window.confirm(msg)) return;

    setTogglingId(est.esedSec);
    try {
      await toggleBloqueoEstablecimiento(est.esedSec, nuevoEstado);
      setEstablecimientos(prev =>
        prev.map(item =>
          item.esedSec === est.esedSec ? { ...item, bloqueado: nuevoEstado } : item
        )
      );
      if (editingEst?.esedSec === est.esedSec) {
        setEditingEst((prev: any) => (prev ? { ...prev, bloqueado: nuevoEstado } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Error al cambiar el estado de bloqueo');
    }
    setTogglingId(null);
  };

  const totalBloqueados = establecimientos.filter(e => e.bloqueado).length;
  const totalAbiertos = establecimientos.length - totalBloqueados;

  const filtered = establecimientos.filter(e => {
    const matchesSearch =
      e.esedDescripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.esedDescCorta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(e.esedCod || '').includes(searchTerm);
    if (!matchesSearch) return false;
    if (filterEstado === 'ABIERTOS') return !e.bloqueado;
    if (filterEstado === 'BLOQUEADOS') return !!e.bloqueado;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#016098]">Mantenedor de Establecimientos y Cierre de Carga</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configura los Tipos de Enseñanza autorizados y bloquea establecimientos que ya finalizaron su carga horaria.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setFilterEstado('TODOS')}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              filterEstado === 'TODOS'
                ? 'bg-[#016098] text-white border-[#016098]'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Todos ({establecimientos.length})
          </button>
          <button
            onClick={() => setFilterEstado('ABIERTOS')}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              filterEstado === 'ABIERTOS'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            🔓 Abiertos ({totalAbiertos})
          </button>
          <button
            onClick={() => setFilterEstado('BLOQUEADOS')}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              filterEstado === 'BLOQUEADOS'
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
            }`}
          >
            🔒 Bloqueados ({totalBloqueados})
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden flex">
        {/* Lista de Establecimientos */}
        <div className="w-2/3 border-r border-[#e2e8f0] flex flex-col">
          <div className="p-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
            <input
              type="text"
              placeholder="Buscar establecimiento por nombre, sigla o RBD..."
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
                        : est.bloqueado
                        ? 'border-red-200 bg-red-50/30 hover:bg-red-50/60'
                        : 'border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[#1e293b]">{est.esedDescCorta}</span>
                          <span className="text-xs text-gray-400">RBD: {est.esedCod} (ID: {est.esedSec})</span>
                          {est.bloqueado ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-300">
                              🔒 Bloqueado (Solo Lectura)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                              🔓 Abierto para Edición
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#64748b] mt-1">{est.esedDescripcion}</p>
                      </div>

                      <button
                        onClick={(e) => handleToggleBloqueo(est, e)}
                        disabled={togglingId === est.esedSec}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 border ${
                          est.bloqueado
                            ? 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                        } disabled:opacity-50`}
                        title={
                          est.bloqueado
                            ? 'Desbloquear para permitir que el establecimiento vuelva a editar su carga'
                            : 'Bloquear para que el establecimiento no pueda realizar más cambios'
                        }
                      >
                        {togglingId === est.esedSec
                          ? 'Procesando...'
                          : est.bloqueado
                          ? '🔓 Reabrir Carga'
                          : '🔒 Cerrar / Bloquear'}
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {est.tiposEnsenanza.length === 0 ? (
                        <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded">
                          Sin tipos configurados
                        </span>
                      ) : (
                        est.tiposEnsenanza.map((te: any) => (
                          <span
                            key={te.tienCod}
                            className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-gray-200 uppercase"
                          >
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
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-[#1e293b]">{editingEst.esedDescCorta}</h2>
                  <button
                    onClick={() => handleToggleBloqueo(editingEst)}
                    disabled={togglingId === editingEst.esedSec}
                    className={`px-3 py-1 rounded text-xs font-bold border ${
                      editingEst.bloqueado
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                    }`}
                  >
                    {editingEst.bloqueado ? '🔓 Desbloquear' : '🔒 Bloquear'}
                  </button>
                </div>
                <p className="text-sm text-[#64748b] mt-1">{editingEst.esedDescripcion}</p>
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
                Para configurar sus Tipos de Enseñanza autorizados o gestionar su bloqueo de carga.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
