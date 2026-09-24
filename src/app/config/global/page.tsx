'use client';

import React, { useState, useEffect } from 'react';
import { getConfiguracionGlobal, updateConfiguracionGlobal } from '../../actions';

export default function ConfigGlobalPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [horasColacion, setHorasColacion] = useState(2);
  const [maxHorasPie, setMaxHorasPie] = useState(3);
  const [porcentajeMinimoPlanificacion, setPorcentajeMinimoPlanificacion] = useState(40);

  useEffect(() => {
    getConfiguracionGlobal().then(config => {
      if (config) {
        setHorasColacion(config.horasColacion || 2);
        setMaxHorasPie(config.maxHorasPie || 3);
        setPorcentajeMinimoPlanificacion(config.porcentajeMinimoPlanificacion ?? 40);
      }
      setLoading(false);
    });
  }, []);

  const handleGuardar = async () => {
    setSaving(true);
    try {
      await updateConfiguracionGlobal(horasColacion, maxHorasPie, porcentajeMinimoPlanificacion);
      alert('Configuración guardada correctamente');
    } catch (e) {
      console.error(e);
      alert('Error guardando configuración');
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Configuración Global</h1>
        <p className="text-gray-600 mt-1">Administra los parámetros generales del sistema.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">% Mínimo de Planificación</label>
          <p className="text-xs text-gray-500 mb-3">
            Porcentaje mínimo obligatorio de horas de planificación respecto al total de horas No Lectivas. (Ej: 40 para 40%)
          </p>
          <div className="flex items-center gap-2">
            <input 
              type="number"
              value={porcentajeMinimoPlanificacion}
              onChange={e => setPorcentajeMinimoPlanificacion(Number(e.target.value))}
              className="w-32 border border-gray-300 rounded-lg p-2.5 text-sm"
              min="0" max="100"
            />
            <span className="text-gray-500 font-medium">%</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Horas de Colación por defecto</label>
          <input 
            type="number"
            value={horasColacion}
            onChange={e => setHorasColacion(Number(e.target.value))}
            className="w-32 border border-gray-300 rounded-lg p-2.5 text-sm"
            step="0.5"
          />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Máx. Horas PIE por Asignatura</label>
          <input 
            type="number"
            value={maxHorasPie}
            onChange={e => setMaxHorasPie(Number(e.target.value))}
            className="w-32 border border-gray-300 rounded-lg p-2.5 text-sm"
            step="1"
          />
        </div>

        <div className="pt-6">
          <button 
            onClick={handleGuardar}
            disabled={saving}
            className="bg-[#016098] hover:bg-[#014d7a] text-white px-6 py-2.5 rounded-lg font-medium transition-colors w-full sm:w-auto"
          >
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
}
