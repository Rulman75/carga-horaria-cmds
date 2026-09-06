const fs = require('fs');
let c = fs.readFileSync('src/components/SidebarLayout.tsx', 'utf8');

c = c.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';"
);

c = c.replace(
`  // Mock usuario
  const userData = {
    username: "Administrador CMDS",
    role: "Admin"
  };`,
`  const [userData, setUserData] = useState<{ nombre?: string, rol?: string }>({});

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserData({ nombre: u.nombre || u.username, rol: u.rol });
      } catch(e){}
    }
  }, []);`
);

c = c.replace(
  "{userData.username}",
  "{userData.nombre}"
);

c = c.replace(
  "{userData.username && (",
  "{userData.nombre && ("
);

// We should also add a logout button, maybe near the bottom of the sidebar.
const logoutBtn = `
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
      </aside>`;

c = c.replace('      </aside>', logoutBtn);

fs.writeFileSync('src/components/SidebarLayout.tsx', c);
