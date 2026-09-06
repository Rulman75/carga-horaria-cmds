import re

with open('src/components/SidebarLayout.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# I will insert the new "Mi Establecimiento" menu before "Configuración"

replacement = """
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
                    >Planes de Estudio</Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Configuración */}
"""

c = c.replace('            {/* Configuración */}', replacement)

# I also need to define the state for menuEstablecimientoOpen
state_replacement = """  const [menuCargaOpen, setMenuCargaOpen] = useState(true);
  const [menuConfigOpen, setMenuConfigOpen] = useState(true);
  const [menuEstablecimientoOpen, setMenuEstablecimientoOpen] = useState(true);"""

c = c.replace('  const [menuCargaOpen, setMenuCargaOpen] = useState(true);\n  const [menuConfigOpen, setMenuConfigOpen] = useState(true);', state_replacement)

with open('src/components/SidebarLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
