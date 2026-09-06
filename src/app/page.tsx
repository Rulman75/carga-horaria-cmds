export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold text-[#016098]">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2e8f0]">
          <h3 className="text-sm font-medium text-[#64748b]">Total Docentes</h3>
          <p className="text-3xl font-bold text-[#1e293b] mt-2">124</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2e8f0]">
          <h3 className="text-sm font-medium text-[#64748b]">Establecimientos</h3>
          <p className="text-3xl font-bold text-[#1e293b] mt-2">8</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2e8f0]">
          <h3 className="text-sm font-medium text-[#64748b]">Carga Completada</h3>
          <p className="text-3xl font-bold text-[#39BABD] mt-2">85%</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2e8f0] mt-4">
        <h2 className="text-xl font-semibold text-[#1e293b] mb-4">Bienvenido al Sistema de Carga Docente</h2>
        <p className="text-[#64748b]">
          Este sistema permite gestionar la asignación de horas lectivas y no lectivas de los docentes
          de la Corporación Municipal de Desarrollo Social (CMDS), dando cumplimiento a la Ley 20.903.
        </p>
      </div>
    </div>
  );
}
