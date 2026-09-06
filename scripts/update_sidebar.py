import re

with open('src/components/SidebarLayout.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

target = """      <div>
        <h3 className="px-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Configuración Base</h3>"""

replacement = """      <div className="mb-6">
        <h3 className="px-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Mi Establecimiento</h3>
        <nav className="flex flex-col space-y-1">
          <SidebarItem icon={<Settings size={20} />} label="Configuración" href="/establecimiento/config" active={pathname.startsWith('/establecimiento/config')} />
          <SidebarItem icon={<BookOpen size={20} />} label="Mis Planes de Estudio" href="/establecimiento/planes" active={pathname.startsWith('/establecimiento/planes')} />
        </nav>
      </div>

      <div>
        <h3 className="px-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Configuración Base (CMDS)</h3>"""

c = c.replace(target, replacement)

with open('src/components/SidebarLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
