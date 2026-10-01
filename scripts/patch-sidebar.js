const fs = require('fs');
let code = fs.readFileSync('src/components/SidebarLayout.tsx', 'utf8');

const linkToAdd = `<li>
                        <Link 
                          href="/config/global" 
                          className={\`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 \${
                            isActive('/config/global') 
                            ? 'bg-[#016098] text-white' 
                            : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#016098]'
                          }\`}
                        >
                          Configuración Global
                        </Link>
                      </li>`;

code = code.replace(/<li>\s*<Link\s*href="\/config\/establecimientos"/, linkToAdd + '\n                      <li>\n                        <Link \n                          href="/config/establecimientos"');

fs.writeFileSync('src/components/SidebarLayout.tsx', code);
