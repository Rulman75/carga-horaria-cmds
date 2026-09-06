"use client";
import React, { useState, useEffect } from 'react';
import { getPlanesPropios, getPlanesEstudio, clonarPlanEstudioBase, eliminarPlanPropio } from '../../actions';
import Link from 'next/link';

export default function MisPlanesPage() {
  const [planesPropios, setPlanesPropios] = useState<any[]>([]);
  const [planesBase, setPlanesBase] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [planBaseSeleccionado, setPlanBaseSeleccionado] = useState('');
  const [clonando, setClonando] = useState(false);

  // Simulamos usuario logueado
  const [establecimientoId, setEstablecimientoId] = useState<number | null>(null);

  const loadData = async () => {
    const estId = Number(localStorage.getItem('selectedEstablecimientoId')) || 2;
    setEstablecimientoId(estId);
    const propios = await getPlanesPropios(estId);
    const bases = await getPlanesEstudio();
    setPlanesPropios(propios);
    setPlanesBase(bases);
  };

  useEffect(() => {
    loadData();
  }, []);


  const handleEliminarPlan = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    if (!confirm('¿Estás seguro que deseas ELIMINAR completamente este plan propio y todas sus horas configuradas?')) return;
    
    try {
      await eliminarPlanPropio(id);
      await loadData();
    } catch(err) {
      alert('Error al eliminar el plan');
    }
  };

  const handleClonar = async () => {

    if (!nuevoNombre || !planBaseSeleccionado) {
      alert('Debes ingresar un nombre y seleccionar un Decreto Base.');
      return;
    }
    setClonando(true);
    try {
      await clonarPlanEstudioBase(establecimientoId!, parseInt(planBaseSeleccionado), nuevoNombre);
      setShowModal(false);
      setNuevoNombre('');
      setPlanBaseSeleccionado('');
      await loadData();
    } catch (error) {
      console.error(error);
      alert('Error al clonar el plan.');
    }
    setClonando(false);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Mis Planes de Estudio (Propios)</h1>
          <p className="text-sm text-gray-500 mt-1">Formula la carga horaria adaptando los decretos ministeriales a la realidad de tu colegio.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#016098] hover:bg-[#014d7a] text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          + Formular Nuevo Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planesPropios.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300 text-gray-400">
            <p className="mb-4">No has formulado ningún plan propio aún.</p>
            <button 
              onClick={() => setShowModal(true)}
              className="text-[#016098] font-medium hover:underline"
            >
              Crea tu primer plan clonando un Decreto
            </button>
          </div>
        ) : (
          planesPropios.map(plan => (
            <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              <button onClick={(e) => handleEliminarPlan(e, plan.id)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 bg-red-50 rounded-md px-3 py-1 text-xs font-bold transition-all z-10 hover:bg-red-100" title="Eliminar Plan Completo">Eliminar</button>
              <div className="absolute top-0 left-0 w-1 h-full bg-[#39BABD]"></div>
              
              <h3 className="font-bold text-lg text-[#1e293b] mb-1">{plan.nombre}</h3>
              <p className="text-xs text-gray-500 mb-4">Basado en: Decreto {plan.codPlanBase} ({plan.planBase?.nombrePlan})</p>
              
              <div className="flex justify-between items-center mb-6">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                  {plan._count?.detalles} Asignaturas
                </span>
                <span className="text-xs text-gray-400">
                  Creado: {new Date(plan.createdAt).toLocaleDateString('es-CL')}
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <Link 
                  href={`/establecimiento/planes/${plan.id}`}
                  className="text-[#016098] font-semibold text-sm hover:text-[#014d7a] flex items-center justify-between w-full group-hover:translate-x-1 transition-transform"
                >
                  Editar Plan / Malla <span>→</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Clonación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#1e293b]">Formular Nuevo Plan</h2>
              <p className="text-sm text-gray-500 mt-1">Clona un decreto ministerial base (El sistema usará horas CJ o SJ según tu configuración).</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Plan Propio</label>
                <input 
                  type="text" 
                  placeholder="Ej. Plan Básico A-16 2026"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#016098] focus:ring-1 focus:ring-[#016098]"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Decreto Ministerial a Clonar</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#016098] focus:ring-1 focus:ring-[#016098]"
                  value={planBaseSeleccionado}
                  onChange={(e) => setPlanBaseSeleccionado(e.target.value)}
                >
                  <option value="">Seleccione un decreto base...</option>
                  {planesBase.map(pb => (
                    <option key={pb.codPlan} value={pb.codPlan}>
                      Decreto {pb.codPlan} - {pb.nombrePlan}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleClonar}
                disabled={clonando}
                className="bg-[#39BABD] hover:bg-[#2b9698] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
              >
                {clonando ? 'Clonando...' : 'Clonar Decreto'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
