'use client';

import React, { useState, useEffect } from 'react';
import { getEstablecimientoConfig, getGrados, updateEstablecimientoConfig } from '../../actions';

export default function ConfigEstablecimientoPage() {
  const [esJec, setEsJec] = useState(false);
  const [gradosDotacion, setGradosDotacion] = useState<any[]>([]);
  const [tiposPermitidos, setTiposPermitidos] = useState<any[]>([]);
  const [todosGrados, setTodosGrados] = useState<any[]>([]);
  
  const [establecimientoId, setEstablecimientoId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const estId = Number(localStorage.getItem('selectedEstablecimientoId')) || 2;
    setEstablecimientoId(estId);

    const config = await getEstablecimientoConfig(estId);
    const g = await getGrados();

    setTodosGrados(g);
    
    if (config) {
      setEsJec(config.esJec);
      
      // El director solo ve los tipos de enseñanza que el Admin le asignó
      const tipos = config.tiposEnsenanza.map((te: any) => te.tipoEnsenanza);
      setTiposPermitidos(tipos);
      
      const prevGrados = config.grados.map((cg: any) => ({
        tienCod: cg.tienCod,
        grteCod: cg.grteCod,
        cantidadCursos: cg.cantidadCursos
      }));

      // Merge de todos los grados posibles con los configurados
      const merged = g.map(grado => {
        const found = prevGrados.find((p: any) => p.tienCod === grado.tienCod && p.grteCod === grado.grteCod);
        return {
          ...grado,
          cantidadCursos: found ? found.cantidadCursos : 0
        };
      });
      setGradosDotacion(merged);
    }
    setLoading(false);
  };

  const handleCursoChange = (tienCod: number, grteCod: number, value: string) => {
    const num = parseInt(value) || 0;
    setGradosDotacion(gradosDotacion.map(g => 
      (g.tienCod === tienCod && g.grteCod === grteCod) ? { ...g, cantidadCursos: Math.max(0, num) } : g
    ));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const payload = gradosDotacion.filter(g => g.cantidadCursos > 0).map(g => ({
        tienCod: g.tienCod,
        grteCod: g.grteCod,
        cantidadCursos: g.cantidadCursos
      }));
      // Enviar array vacio de tiposData porque ya no lo actualizamos acá
      await updateEstablecimientoConfig(establecimientoId!, esJec, payload, []);
      alert('Configuración guardada exitosamente');
    } catch (e) {
      alert('Error guardando configuración');
    }
    setGuardando(false);
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#016098]">Configuración JEC y Cursos</h1>
          <p className="text-sm text-gray-500 mt-1">Declara si el establecimiento tiene JEC y cuántos cursos hay por cada nivel.</p>
        </div>
        <button 
          onClick={handleGuardar}
          disabled={guardando}
          className="bg-[#39BABD] hover:bg-[#2b9799] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {guardando ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-6 mb-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={esJec} 
            onChange={(e) => setEsJec(e.target.checked)}
            className="w-5 h-5 text-[#016098] border-gray-300 rounded focus:ring-[#016098]" 
          />
          <span className="text-lg font-medium text-[#1e293b]">Establecimiento Adscrito a Jornada Escolar Completa (JEC)</span>
        </label>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden flex flex-col p-6">
        <h2 className="text-lg font-bold text-[#016098] mb-4">Dotación de Cursos por Nivel</h2>
        <div className="overflow-auto custom-scrollbar flex-1 space-y-6">
          
          {tiposPermitidos.length === 0 && (
            <div className="text-center p-8 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
              No tienes ningún Tipo de Enseñanza autorizado por Administración Central.
            </div>
          )}

          {tiposPermitidos.map(t => {
            const gradosTipo = gradosDotacion.filter(g => g.tienCod === t.tienCod);
            
            return (
              <div key={t.tienCod} className="border border-[#e2e8f0] rounded-xl overflow-hidden">
                <div className="bg-[#f1f5f9] px-4 py-3 border-b border-[#e2e8f0] flex justify-between items-center">
                  <h3 className="font-bold text-[#1e293b]">{t.tienDescripcion}</h3>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-white">
                  {gradosTipo.map(g => (
                    <div key={g.grteCod} className="flex flex-col gap-1 p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <label className="text-xs font-semibold text-gray-600">{g.grteDescrip}</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          min="0"
                          value={g.cantidadCursos || ''}
                          onChange={(e) => handleCursoChange(g.tienCod, g.grteCod, e.target.value)}
                          className="w-16 p-1.5 border border-gray-300 rounded text-center text-sm focus:outline-none focus:border-[#016098] focus:ring-1 focus:ring-[#016098]"
                          placeholder="0"
                        />
                        <span className="text-xs text-gray-400">cursos</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
