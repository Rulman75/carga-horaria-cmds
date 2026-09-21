'use client';

import { useState } from 'react';
import { loginUsuario, changePassword } from '../actions';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Password change state
  const [showChangePass, setShowChangePass] = useState(false);
  const [loggedUser, setLoggedUser] = useState<any>(null);
  const [newPass, setNewPass] = useState('');
  const [newPassConfirm, setNewPassConfirm] = useState('');
  
  const router = useRouter();

  const proceedLogin = (user: any) => {
    localStorage.setItem('token', 'mock_jwt_token_12345');
    localStorage.setItem('user', JSON.stringify(user));
    if (user.establecimientoId) {
       localStorage.setItem('selectedEstablecimientoId', user.establecimientoId.toString());
    } else {
       localStorage.setItem('selectedEstablecimientoId', ''); // Global view
    }
    window.location.href = '/';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await loginUsuario(username, password);
      if (user) {
        if (user.debeCambiarPassword || password === 'Cmds2027') {
          setLoggedUser(user);
          setShowChangePass(true);
        } else {
          proceedLogin(user);
        }
      } else {
        setError('Credenciales incorrectas.');
      }
    } catch (err: any) {
      setError('Error al iniciar sesión');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== newPassConfirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (newPass === 'Cmds2027') {
      setError('Debe elegir una contraseña diferente a la por defecto.');
      return;
    }
    if (newPass.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      await changePassword(loggedUser.id, newPass);
      const updatedUser = { ...loggedUser, debeCambiarPassword: false };
      proceedLogin(updatedUser);
    } catch (err) {
      setError('Error al actualizar contraseña.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#016098] tracking-tight mb-2">
            CorpDocs<span className="text-[#39BABD]">.edu</span>
          </h1>
          <p className="text-[#64748b] font-medium">Plataforma de Carga Horaria Docente</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {!showChangePass ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>
              
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39BABD] focus:border-transparent transition-all"
                    placeholder="ejemplo@cmds.cl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39BABD] focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#016098] hover:bg-[#014a75] text-white font-bold py-3 px-4 rounded-lg transition-colors mt-2"
                >
                  Ingresar a la Plataforma
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Actualizar Contraseña</h2>
              <p className="text-sm text-amber-600 font-medium bg-amber-50 p-3 rounded mb-6 text-center border border-amber-200">
                Por seguridad, debes cambiar tu contraseña predeterminada antes de continuar.
              </p>
              
              <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nueva Contraseña</label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39BABD] focus:border-transparent transition-all"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar Contraseña</label>
                  <input
                    type="password"
                    required
                    value={newPassConfirm}
                    onChange={(e) => setNewPassConfirm(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39BABD] focus:border-transparent transition-all"
                    placeholder="Vuelve a escribir la contraseña"
                  />
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#39BABD] hover:bg-[#2b9799] text-white font-bold py-3 px-4 rounded-lg transition-colors mt-2"
                >
                  Guardar e Ingresar
                </button>
              </form>
            </>
          )}
        </div>
        
        <p className="text-center text-gray-400 text-sm mt-8">
          © {new Date().getFullYear()} Corporación Municipal de Desarrollo Social
        </p>
      </div>
    </div>
  );
}
