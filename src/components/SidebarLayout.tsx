"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getEstablecimientos } from '../app/actions';

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [menuCargaOpen, setMenuCargaOpen] = useState(true);
  const [menuConfigOpen, setMenuConfigOpen] = useState(true);
  const [menuEstablecimientoOpen, setMenuEstablecimientoOpen] = useState(true);

  const [userData, setUserData] = useState<{ nombre?: string, rol?: string }>({});
  const [establecimientos, setEstablecimientos] = useState<any[]>([]);
  const [selectedRbd, setSelectedRbd] = useState<string>('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    let rol = '';
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserData({ nombre: u.nombre || u.username, rol: u.rol });
        rol = u.rol;
      } catch(e){}
    }
    
    if (rol === 'ADMIN') {
      getEstablecimientos().then(setEstablecimientos);
    }
    
    const saved = localStorage.getItem('selectedEstablecimientoId');
    if (saved) setSelectedRbd(saved);
  }, []);

  const handleSelectEstablecimiento = (id: string) => {
    setSelectedRbd(id);
    localStorage.setItem('selectedEstablecimientoId', id);
    // Reload page to reflect new context
    window.location.reload();
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  const isAdmin = userData.rol === 'ADMIN';

  // Mostrar menú de establecimiento/carga si es colegio, o si es admin y ya seleccionó uno
  const showColegioMenus = !isAdmin || (isAdmin && selectedRbd && selectedRbd !== '');

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      
      {/* Botón menú móvil */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-md shadow-md text-[#016098]"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <span>Cerrar</span> : <span>Menú</span>}
      </button>

      {/* Overlay Móvil */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Principal */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-72 bg-white border-r border-[#e2e8f0] shadow-sm
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col items-center py-6 border-b border-[#e2e8f0] bg-[#016098] text-white">
          <div className="w-16 h-16 bg-white rounded-xl shadow-inner flex items-center justify-center p-2 mb-3">
            <img src="/logo.png" alt="CMDS Logo" className="object-contain" />
          </div>
          <h1 className="text-xl font-bold tracking-widest text-yellow-400">CMDS</h1>
          <p className="text-[10px] uppercase tracking-wider text-blue-200 mt-1 font-semibold">Carga Docente</p>
        </div>
        
        <div className="px-4 py-4 bg-blue-50 border-b border-[#e2e8f0]">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Usuario Activo</p>
          <p className="text-sm font-bold text-[#016098] truncate">{userData.nombre || 'Cargando...'}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-[#39BABD] text-white text-[10px] font-bold rounded">
            {userData.rol}
          </span>
          
          {isAdmin && (
            <div className="mt-4 pt-3 border-t border-blue-200">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Seleccionar Establecimiento:</label>
              <select 
                className="w-full text-xs p-2 border border-blue-300 rounded text-gray-700 focus:outline-none focus:border-[#016098]"
                value={selectedRbd}
                onChange={(e) => handleSelectEstablecimiento(e.target.value)}
              >
                <option value="">-- Global (Seleccione) --</option>
                {establecimientos.map(e => (
                  <option key={e.esedSec} value={e.esedSec}>{e.esedCod} - {e.esedDescripcion}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3 space-y-1">
          <ul className="space-y-1">
            <li>
              <Link 
                href="/" 
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive('/') && pathname === '/' 
                  ? 'bg-[#016098] text-white shadow-md shadow-blue-900/20' 
                  : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                }`}
              >
                Dashboard
              </Link>
            </li>

            {showColegioMenus && (
              <>
                <li className="pt-2">
                  <button 
                    onClick={() => setMenuCargaOpen(!menuCargaOpen)}
                    className={`flex justify-between items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      menuCargaOpen ? 'text-[#016098]' : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                    }`}
                  >
                    <span>Gestión de Carga</span>
                    <span className="text-xs">{menuCargaOpen ? '▼' : '▶'}</span>
                  </button>
                  {menuCargaOpen && (
                    <ul className="mt-1 space-y-1 pl-4">
                      <li>
                        <Link 
                          href="/carga/asignacion" 
                          className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            isActive('/carga/asignacion') 
                            ? 'bg-[#016098] text-white' 
                            : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                          }`}
                        >Asignación de Horas</Link>
                      </li>
                      
                      <li>
                        <Link 
                          href="/carga/matriz-clasica" 
                          className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            isActive('/carga/matriz-clasica') 
                            ? 'bg-[#016098] text-white' 
                            : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                          }`}
                        >Sábana Clásica (Por Asig.)</Link>
                      </li>
                      <li>
                        <Link 
                          href="/carga/docentes" 
                          className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            isActive('/carga/docentes') 
                            ? 'bg-[#016098] text-white' 
                            : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                          }`}
                        >Registro de Docentes</Link>
                      </li>
                    </ul>
                  )}
                </li>

                <li className="pt-2">
                  <button 
                    onClick={() => setMenuEstablecimientoOpen(!menuEstablecimientoOpen)}
                    className={`flex justify-between items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      menuEstablecimientoOpen ? 'text-[#016098]' : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                    }`}
                  >
                    <span>{isAdmin ? 'Config. Colegio' : 'Mi Establecimiento'}</span>
                    <span className="text-xs">{menuEstablecimientoOpen ? '▼' : '▶'}</span>
                  </button>
                  {menuEstablecimientoOpen && (
                    <ul className="mt-1 space-y-1 pl-4">
                      <li>
                        <Link 
                          href="/establecimiento/config" 
                          className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            isActive('/establecimiento/config') 
                            ? 'bg-[#016098] text-white' 
                            : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                          }`}
                        >Configuración JEC y Cursos</Link>
                      </li>
                      <li>
                        <Link 
                          href="/establecimiento/planes" 
                          className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            isActive('/establecimiento/planes') 
                            ? 'bg-[#016098] text-white' 
                            : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                          }`}
                        >Planes de Estudio</Link>
                      </li>
                    </ul>
                  )}
                </li>
              </>
            )}
            
            {isAdmin && (
              <li className="pt-2">
                <button 
                  onClick={() => setMenuConfigOpen(!menuConfigOpen)}
                  className={`flex justify-between items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    menuConfigOpen ? 'text-[#016098]' : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                  }`}
                >
                  <span>Administración Global</span>
                  <span className="text-xs">{menuConfigOpen ? '▼' : '▶'}</span>
                </button>
                {menuConfigOpen && (
                  <ul className="mt-1 space-y-1 pl-4">
                    <li>
                      <Link 
                        href="/config/establecimientos" 
                        className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          isActive('/config/establecimientos') 
                          ? 'bg-[#016098] text-white' 
                          : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                        }`}
                      >Mantenedor Establecimientos</Link>
                    </li>
                    <li>
                      <Link 
                        href="/config/asignaturas" 
                        className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          isActive('/config/asignaturas') 
                          ? 'bg-[#016098] text-white' 
                          : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                        }`}
                      >Mantenedor Asignaturas</Link>
                    </li>
                    <li>
                      <Link 
                        href="/config/actividades-no-lectivas" 
                        className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          isActive('/config/actividades-no-lectivas') 
                          ? 'bg-[#016098] text-white' 
                          : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                        }`}
                      >Actividades No Lectivas</Link>
                    </li>
                    <li>
                      <Link 
                        href="/config/extracurriculares"
                        className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          pathname === '/config/extracurriculares' 
                          ? 'bg-[#016098] text-white' 
                          : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                        }`}
                      >Act. Extracurriculares</Link>
                    </li>
                    <li>
                      <Link 
                        href="/config/planes" 
                        className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          isActive('/config/planes') 
                          ? 'bg-[#016098] text-white' 
                          : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                        }`}
                      >Decretos / Planes Base</Link>
                    </li>
                  </ul>
                )}
              </li>
            )}

          </ul>
        </div>
        
        <div className="p-4 border-t border-[#e2e8f0]">
          <button 
            className="w-full px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            onClick={() => {
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              localStorage.removeItem('selectedEstablecimientoId');
              window.location.href = '/login';
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-auto h-screen bg-[#f8fafc] p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
