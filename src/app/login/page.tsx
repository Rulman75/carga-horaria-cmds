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
      setError('Error al iniciar sesión: ' + (err.message || ''));
      console.error(err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== newPassConfirm) {
      setError('Las contraseñas no coinciden.');
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
    } catch (err: any) {
      setError('Error al actualizar contraseña: ' + (err.message || ''));
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 absolute top-0 left-0 z-50">
      
      {/* Panel Izquierdo Corporativo (Logo y Branding) */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-[#016098] text-white p-12 shadow-[10px_0_15px_-3px_rgba(0,0,0,0.1)] z-10">
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-8">
          <img src="/logo.png" alt="CMDS Logo" className="w-48 h-48 object-contain" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-wider text-yellow-400 mb-4 text-center">
          CMDS
        </h1>
        <h2 className="text-xl font-semibold text-blue-200 tracking-wide text-center">
          Sistema de Gestión de
        </h2>
        <h2 className="text-2xl font-bold text-white uppercase mt-2 tracking-widest text-center">
          Carga Docente
        </h2>
        <div className="mt-12 w-16 h-1 bg-yellow-400 rounded"></div>
      </div>

      {/* Panel Derecho (Formulario de Login o Cambio de Password) */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white px-6">
        <div className="w-full max-w-md">
          
          {/* Logo visible solo en mobile */}
          <div className="md:hidden flex justify-center mb-8">
            <img src="/logo.png" alt="CMDS Logo" className="w-32 h-32 object-contain" />
          </div>

          {!showChangePass ? (
            <>
              <h3 className="text-3xl font-bold text-[#016098] mb-2">Bienvenido</h3>
              <p className="text-gray-500 mb-8">Ingresa tus credenciales para continuar</p>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm flex items-center gap-3 font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-[#016098] text-sm font-bold mb-2 uppercase tracking-wide" htmlFor="username">
                    Usuario
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Ej: admin@cmds.cl"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#016098] focus:bg-white transition shadow-sm text-gray-800 font-medium"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[#016098] text-sm font-bold mb-2 uppercase tracking-wide" htmlFor="password">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#016098] focus:bg-white transition shadow-sm text-gray-800 font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#016098] hover:bg-[#024a8d] text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-lg mt-4 flex justify-center items-center gap-2"
                >
                  Ingresar al Sistema
                </button>
              </form>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-[#016098] mb-2">Actualizar Contraseña</h3>
              <p className="text-sm text-gray-500 mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                Por seguridad, debes cambiar tu contraseña predeterminada antes de continuar.
              </p>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm flex items-center gap-3 font-semibold text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="block text-[#016098] text-sm font-bold mb-2 uppercase tracking-wide">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#016098] focus:bg-white transition shadow-sm text-gray-800 font-medium"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#016098] text-sm font-bold mb-2 uppercase tracking-wide">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="Vuelve a escribir tu clave"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#016098] focus:bg-white transition shadow-sm text-gray-800 font-medium"
                    value={newPassConfirm}
                    onChange={(e) => setNewPassConfirm(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#016098] hover:bg-[#024a8d] text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-lg mt-4"
                >
                  Guardar e Ingresar
                </button>
              </form>
            </>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400 font-semibold">
              &copy; 2026 CMDS - Corporación Municipal de Desarrollo Social de Antofagasta
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
