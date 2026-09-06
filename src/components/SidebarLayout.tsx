"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserData({ nombre: u.nombre || u.username, rol: u.rol });
      } catch(e){}
    }
  }, []);

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

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
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-[280px] bg-white border-r border-[#e2e8f0] shadow-sm
        transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Logo / Header del Sidebar */}
        <div className="p-6 flex flex-col items-center border-b border-[#e2e8f0]">
          <img src="/logo.png" alt="CMDS Logo" className="w-full max-w-[140px] h-auto object-contain mb-2" />
          <span className="text-[1rem] text-[#64748b] text-center font-semibold leading-tight mt-2">
            Sistema de<br />Carga Docente
          </span>
          
          {userData.nombre && (
            <div className="flex flex-col items-center mt-4">
              <div className="flex items-center gap-2 text-xs text-[#016098] bg-[#e0f2fe] px-3 py-1.5 rounded-full font-medium uppercase tracking-wide">
                <span className="w-1.5 h-1.5 bg-[#39BABD] rounded-full"></span>
                {userData.nombre}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 uppercase">{userData.rol}</span>
            </div>
          )}
        </div>
        
        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <ul className="space-y-1">
            
            {/* Inicio */}
            <li>
              <Link 
                href="/" 
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive('/') 
                  ? 'bg-[#016098] text-white' 
                  : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                }`}
              >
                Dashboard
              </Link>
            </li>

            {/* Gestión de Carga */}
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
                      href="/carga/matriz" 
                      className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive('/carga/matriz') 
                        ? 'bg-[#016098] text-white' 
                        : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                      }`}
                    >Sábana de Carga (Por Grados)</Link>
                  </li>
                  <li>
                    <Link 
                      href="/carga/matriz-clasica" 
                      className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive('/carga/matriz-clasica') 
                        ? 'bg-[#016098] text-white' 
                        : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                      }`}
                    >Sábana Clásica (Por Asignatura)</Link>
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

            {/* Mi Establecimiento */}
            <li className="pt-2">
              <button 
                onClick={() => setMenuEstablecimientoOpen(!menuEstablecimientoOpen)}
                className={`flex justify-between items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  menuEstablecimientoOpen ? 'text-[#016098]' : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                }`}
              >
                <span>Mi Establecimiento</span>
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
                    >Mis Planes de Estudio</Link>
                  </li>
                </ul>
              )}
            </li>
            
            {/* Mantenedores */}
            {userData.rol === 'ADMIN' && (
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
                        href="/config/planes" 
                        className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          isActive('/config/planes') 
                          ? 'bg-[#016098] text-white' 
                          : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                        }`}
                      >Planes de Estudio (Decretos)</Link>
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
                        href="/config/establecimientos" 
                        className={`block px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                          isActive('/config/establecimientos') 
                          ? 'bg-[#39BABD] text-white font-medium' 
                          : 'text-[#64748b] hover:bg-[#1e293b] hover:text-white'
                        }`}
                      >Establecimientos y Niveles</Link>
                    </li>
                    <li>
                      <Link 
                        href="/config/actividades-no-lectivas" 
                        className={`block px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                          isActive('/config/actividades-no-lectivas') 
                          ? 'bg-[#39BABD] text-white font-medium' 
                          : 'text-[#64748b] hover:bg-[#1e293b] hover:text-white'
                        }`}
                      >Actividades No Lectivas</Link>
                    </li>
                  </ul>
                )}
              </li>
            )}
            
          </ul>
        </nav>
        
        {/* Logout */}
        <div className="p-4 border-t border-[#e2e8f0]">
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="w-full flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
        {/* Header Superior Móvil */}
        <header className="md:hidden bg-white border-b border-[#e2e8f0] h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="CMDS Logo" className="w-8 h-8 object-contain" />
            <span className="font-semibold text-[#016098]">Carga Docente</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="w-full h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
