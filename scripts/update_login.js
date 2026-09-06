const fs = require('fs');
let c = fs.readFileSync('src/app/login/page.tsx', 'utf8');

c = c.replace(
  "import { useState } from 'react';", 
  "import { useState } from 'react';\nimport { loginUsuario } from '../actions';"
);

c = c.replace(
`  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Mock Login Implementation (Since DB is not fully wired for Auth yet)
      if (username === 'admin' && password === 'admin') {
        localStorage.setItem('token', 'mock_jwt_token_12345');
        localStorage.setItem('user', JSON.stringify({ username: 'admin', rol: 'ADMIN' }));
        router.push('/');
      } else {
        setError('Credenciales incorrectas (usa admin/admin)');
      }
    } catch (err: any) {
      setError('Error al iniciar sesión');
    }
  };`,
`  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await loginUsuario(username, password);
      if (user) {
        localStorage.setItem('token', 'mock_jwt_token_12345');
        localStorage.setItem('user', JSON.stringify(user));
        // If they have an establishment, lock it in. If admin, they'll choose later.
        if (user.establecimientoId) {
           localStorage.setItem('selectedEstablecimientoId', user.establecimientoId.toString());
        } else {
           localStorage.setItem('selectedEstablecimientoId', '2'); // Fallback for admin until we build a selector
        }
        router.push('/');
      } else {
        setError('Credenciales incorrectas. (Pista: a16@cmds.cl o admin@cmds.cl / admin)');
      }
    } catch (err: any) {
      setError('Error al iniciar sesión');
    }
  };`
);

c = c.replace('Ej: admin', 'Ej: a16@cmds.cl');

fs.writeFileSync('src/app/login/page.tsx', c);
