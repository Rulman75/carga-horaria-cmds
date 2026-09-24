'use client';

import React, { useState, useEffect } from 'react';
import { getEstablecimientoConfig, getGrados, updateEstablecimientoConfig, getCursosLetra } from '../../actions';

export default function ConfigEstablecimientoPage() {
  const [esJec, setEsJec] = useState(false);
  const [gradosDotacion, setGradosDotacion] = useState<any[]>([]);
  const [tiposPermitidos, setTiposPermitidos] = useState<any[]>([]);
  const [todosGrados, setTodosGrados] = useState<any[]>([]);
  
  const [establecimientoId, setEstablecimientoId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [cursosLetra, setCursosLetra] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const estId = Number(localStorage.getItem('selectedEstablecimientoId')) || 2;
    setEstablecimientoId(estId);
  }, []);

  useEffect(() => {
    if (establecimientoId !== null) {
      loadData();
    }
  }, [establecimientoId]);

  const loadData = async () => {
    setLoading(true);
    
    const config = await getEstablecimientoConfig(establecimientoId!);
    const g = await getGrados();
    const cl = await getCursosLetra(establecimientoId!);
    setCursosLetra(cl);
    
    setTodosGrados(g);

    if (config) {
      // Auto-populate missing letters
      let loadedLetras = cl || [];
      config.grados.forEach((cg: any) => {
        if (cg.cantidadCursos > 0) {
          const existing = loadedLetras.filter((l: any) => l.tienCod === cg.tienCod && l.grteCod === cg.grteCod);
          if (existing.length < cg.cantidadCursos) {
            for (let i = existing.length; i < cg.cantidadCursos; i++) {
              loadedLetras.push({ tienCod: cg.tienCod, grteCod: cg.grteCod, letra: String.fromCharCode(65 + i), esJec: null } as any);
            }
          }
        }
      });
      setCursosLetra(loadedLetras);

      setEsJec(config.esJec);
      
      const tipos = config.tiposEnsenanza.map((te: any) => te.tipoEnsenanza);
      setTiposPermitidos(tipos);
      
      const prevGrados = config.grados.map((cg: any) => ({
        tienCod: cg.tienCod,
        grteCod: cg.grteCod,
        cantidadCursos: cg.cantidadCursos,
        esJec: cg.esJec || false
      }));

      const merged = g.map(grado => {
        const found = prevGrados.find((p: any) => p.tienCod === grado.tienCod && p.grteCod === grado.grteCod);
        return {
          ...grado,
          cantidadCursos: found ? found.cantidadCursos : 0,
          esJec: found ? found.esJec : config.esJec
        };
      });
      setGradosDotacion(merged);
    }
    setLoading(false);
  };

  const handleGlobalJecChange = (checked: boolean) => {
    setEsJec(checked);
    setGradosDotacion(gradosDotacion.map(g => ({ ...g, esJec: checked })));
  };

  const handleCursoChange = (tienCod: number, grteCod: number, value: string) => {
    const num = Math.max(0, parseInt(value) || 0);
    setGradosDotacion(gradosDotacion.map(g => 
      (g.tienCod === tienCod && g.grteCod === grteCod) ? { ...g, cantidadCursos: num } : g
    ));
    
    setCursosLetra(prev => {
      let newCursos = [...prev];
      const existing = newCursos.filter(c => c.tienCod === tienCod && c.grteCod === grteCod);
      if (existing.length < num) {
        for (let i = existing.length; i < num; i++) {
          // Find next available letter logic is tricky if user edited them, but we just use A,B,C mapped by index
          // But to avoid duplicate default letters if user named one "B", we can just use CharCode.
          // For simplicity, just append standard letter for the new index.
          newCursos.push({ tienCod, grteCod, letra: String.fromCharCode(65 + i), esJec: null } as any);
        }
      } else if (existing.length > num) {
        const toRemove = existing.slice(num);
        newCursos = newCursos.filter(c => !toRemove.includes(c));
      }
      return newCursos;
    });
  };

  
  const handleJecLetraChange = (tienCod: number, grteCod: number, oldLetra: string, checked: boolean) => {
    const existe = cursosLetra.find(c => c.tienCod === tienCod && c.grteCod === grteCod && c.letra === oldLetra);
    if (existe) {
      setCursosLetra(cursosLetra.map(c => c === existe ? { ...c, esJec: checked } : c));
    } else {
      setCursosLetra([...cursosLetra, { tienCod, grteCod, letra: oldLetra, esJec: checked }]);
    }
  };

  const handleLetraNameChange = (tienCod: number, grteCod: number, indexEnGrado: number, newLetra: string) => {
    setCursosLetra(prev => {
      const existing = prev.filter(c => c.tienCod === tienCod && c.grteCod === grteCod);
      if (existing[indexEnGrado]) {
        const target = existing[indexEnGrado];
        return prev.map(c => c === target ? { ...c, letra: newLetra } : c);
      }
      return prev;
    });
  };
  
  const handleJecGradoChange = (tienCod: number, grteCod: number, checked: boolean) => {
    setGradosDotacion(gradosDotacion.map(g => 
      (g.tienCod === tienCod && g.grteCod === grteCod) ? { ...g, esJec: checked } : g
    ));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const payload = gradosDotacion.map(g => ({
        tienCod: g.tienCod,
        grteCod: g.grteCod,
        cantidadCursos: g.cantidadCursos || 0,
        esJec: g.esJec || false
      }));
      // Enviar array vacio de tiposData porque ya no lo actualizamos acá
      await updateEstablecimientoConfig(establecimientoId!, esJec, payload, [], cursosLetra);
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
            onChange={(e) => handleGlobalJecChange(e.target.checked)}
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
                      <div key={g.grteCod} className="flex flex-col gap-2 p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <label className="text-xs font-semibold text-gray-600 leading-tight h-8 flex items-center">{g.grteDescrip}</label>
                        <div className="flex flex-col gap-2 mt-auto">
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
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={g.esJec || false}
                              onChange={(e) => handleJecGradoChange(g.tienCod, g.grteCod, e.target.checked)}
                              className="w-4 h-4 text-[#016098] rounded border-gray-300 focus:ring-[#016098]"
                            />
                            <span className="text-xs text-gray-500 font-medium">¿Es JEC?</span>
                          </div>

                          {g.cantidadCursos > 0 && (
                            <div className="mt-2 flex flex-col gap-1 border-t pt-2 border-gray-200">
                              <span className="text-[10px] text-gray-500 font-bold">EXCEPCIONES JEC POR LETRA</span>
                              {cursosLetra.filter(c => c.tienCod === g.tienCod && c.grteCod === g.grteCod).map((curso, idx) => {
                                const isLetraJec = curso.esJec !== null ? curso.esJec : (g.esJec || false);
                                return (
                                  <div key={idx} className="flex items-center gap-2">
                                    <input 
                                      type="text"
                                      value={curso.letra}
                                      onChange={(e) => handleLetraNameChange(g.tienCod, g.grteCod, idx, e.target.value.toUpperCase())}
                                      className="w-6 p-0.5 border border-gray-300 rounded text-center text-[10px] focus:outline-none focus:border-[#016098]"
                                      maxLength={2}
                                    />
                                    <input 
                                      type="checkbox"
                                      checked={isLetraJec}
                                      onChange={(e) => handleJecLetraChange(g.tienCod, g.grteCod, curso.letra, e.target.checked)}
                                      className="w-3 h-3 text-[#016098]"
                                    />
                                    <span className="text-[10px] text-gray-600">{isLetraJec ? 'JEC' : 'Normal'}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

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
