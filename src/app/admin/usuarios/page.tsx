'use client';
import { useState, useEffect } from 'react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, getEstablecimientosConTipos } from '../../actions';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [establecimientos, setEstablecimientos] = useState<any[]>([]);
  const [editUser, setEditUser] = useState<any>(null);
  
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'DIRECTOR',
    establecimientoId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const users = await getUsuarios();
    setUsuarios(users);
    const ests = await getEstablecimientosConTipos();
    setEstablecimientos(ests);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.email || !form.password) {
      alert("Por favor complete nombre, email y contraseña.");
      return;
    }
    
    const data = {
      ...form,
      establecimientoId: form.establecimientoId ? Number(form.establecimientoId) : null
    };

    if (editUser) {
      await updateUsuario(editUser.id, data);
    } else {
      await createUsuario(data);
    }
    
    setEditUser(null);
    setForm({ nombre: '', email: '', password: '', rol: 'DIRECTOR', establecimientoId: '' });
    loadData();
  };

  const handleEdit = (u: any) => {
    setEditUser(u);
    setForm({
      nombre: u.nombre,
      email: u.email,
      password: u.password,
      rol: u.rol,
      establecimientoId: u.establecimientoId?.toString() || ''
    });
  };

  const handleDelete = async (id: number) => {
    if(confirm('¿Está seguro de eliminar este usuario?')) {
      await deleteUsuario(id);
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-[#1e293b] mb-8">Mantenedor de Usuarios</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
            <h2 className="text-lg font-semibold mb-4 text-[#016098]">
              {editUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#016098] focus:ring-1 focus:ring-[#016098]"
                  value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#016098] focus:ring-1 focus:ring-[#016098]"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#016098] focus:ring-1 focus:ring-[#016098]"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select 
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#016098] focus:ring-1 focus:ring-[#016098]"
                  value={form.rol}
                  onChange={e => setForm({...form, rol: e.target.value})}
                >
                  <option value="ADMIN">Administrador (Corporativo)</option>
                  <option value="DIRECTOR">Director (Establecimiento)</option>
                </select>
              </div>
              
              {form.rol === 'DIRECTOR' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Establecimiento</label>
                  <select 
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#016098] focus:ring-1 focus:ring-[#016098]"
                    value={form.establecimientoId}
                    onChange={e => setForm({...form, establecimientoId: e.target.value})}
                  >
                    <option value="">-- Seleccionar Establecimiento --</option>
                    {establecimientos.map(est => (
                      <option key={est.esedSec} value={est.esedSec}>{est.esedDescripcion}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={handleSave}
                  className="flex-1 bg-[#016098] text-white py-2 rounded text-sm font-semibold hover:bg-[#014d7a] transition-colors"
                >
                  Guardar
                </button>
                {editUser && (
                  <button 
                    onClick={() => { setEditUser(null); setForm({ nombre: '', email: '', password: '', rol: 'DIRECTOR', establecimientoId: '' }); }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded text-sm font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-3 text-sm font-semibold text-gray-600">Nombre</th>
                    <th className="p-3 text-sm font-semibold text-gray-600">Email</th>
                    <th className="p-3 text-sm font-semibold text-gray-600">Rol</th>
                    <th className="p-3 text-sm font-semibold text-gray-600">Establecimiento</th>
                    <th className="p-3 text-sm font-semibold text-gray-600 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-sm text-gray-800">{u.nombre}</td>
                      <td className="p-3 text-sm text-gray-600">{u.email}</td>
                      <td className="p-3 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.rol === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-[#016098]'}`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {u.establecimiento ? u.establecimiento.esedDescripcion : '-'}
                      </td>
                      <td className="p-3 text-center space-x-2">
                        <button 
                          onClick={() => handleEdit(u)}
                          className="text-[#016098] hover:bg-blue-50 px-2 py-1 rounded text-xs font-bold transition-colors"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-xs font-bold transition-colors"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {usuarios.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500 text-sm">
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
