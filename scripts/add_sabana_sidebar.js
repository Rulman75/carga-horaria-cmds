const fs = require('fs');
let c = fs.readFileSync('src/components/SidebarLayout.tsx', 'utf8');
c = c.replace(
  `<li>
                    <Link 
                      href="/carga/docentes"`,
  `<li>
                    <Link 
                      href="/carga/matriz" 
                      className={\`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 \${
                        isActive('/carga/matriz') 
                        ? 'bg-[#016098] text-white' 
                        : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                      }\`}
                    >Sábana de Carga</Link>
                  </li>
                  <li>
                    <Link 
                      href="/carga/docentes"`
);
fs.writeFileSync('src/components/SidebarLayout.tsx', c);
