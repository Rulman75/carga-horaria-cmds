const fs = require('fs');
let code = fs.readFileSync('src/app/config/extracurriculares/page.tsx', 'utf8');

code = code.replace("const [nuevasHoras, setNuevasHoras] = useState<string>('');", "const [nuevasHoras, setNuevasHoras] = useState<string>('');\n  const [nuevoTopeMaximo, setNuevoTopeMaximo] = useState<string>('');");
code = code.replace("const [editHoras, setEditHoras] = useState<string>('');", "const [editHoras, setEditHoras] = useState<string>('');\n  const [editTopeMaximo, setEditTopeMaximo] = useState<string>('');");

code = code.replace("await createActividadExtracurricular(nuevaDesc.trim(), horas);", "const tope = nuevoTopeMaximo ? parseFloat(nuevoTopeMaximo) : null;\n      await createActividadExtracurricular(nuevaDesc.trim(), horas, tope);");
code = code.replace("setNuevasHoras('');", "setNuevasHoras('');\n      setNuevoTopeMaximo('');");

code = code.replace("setEditHoras(act.horasDefault !== null ? act.horasDefault.toString() : '');", "setEditHoras(act.horasDefault !== null ? act.horasDefault.toString() : '');\n    setEditTopeMaximo(act.topeMaximo !== null ? act.topeMaximo.toString() : '');");
code = code.replace("await updateActividadExtracurricular(id, editDesc.trim(), horas);", "const tope = editTopeMaximo ? parseFloat(editTopeMaximo) : null;\n      await updateActividadExtracurricular(id, editDesc.trim(), horas, tope);");

// Now to update the HTML blocks in the file
// I will just use regex to insert the new input blocks
const inputToAdd = `
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tope Máximo (Escuela)</label>
            <input 
              type="number" 
              step="0.1"
              min="0"
              placeholder="Ej. 2"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-[#016098] focus:ring-1 focus:ring-[#016098]"
              value={nuevoTopeMaximo}
              onChange={(e) => setNuevoTopeMaximo(e.target.value)}
            />
          </div>`;

code = code.replace(/<div className="flex-1">\s*<label className="block text-sm font-semibold text-gray-700 mb-1">Horas Default \(Opcional\)<\/label>[\s\S]*?<\/div>/, match => match + inputToAdd);

const headerToAdd = `\n                  <th className="px-6 py-4 text-center">Tope Máx/Escuela</th>`;
code = code.replace(/<th className="px-6 py-4 text-center">Horas Default<\/th>/, match => match + headerToAdd);

const cellDisplay = `\n                      <td className="px-6 py-4 text-center text-red-600 font-bold">{act.topeMaximo !== null ? act.topeMaximo : '-'}</td>`;
const cellEdit = `\n                      <td className="px-6 py-4 text-center">
                        <input 
                          type="number" 
                          step="0.1"
                          className="w-16 border border-gray-300 rounded p-1 text-center"
                          value={editTopeMaximo}
                          onChange={(e) => setEditTopeMaximo(e.target.value)}
                        />
                      </td>`;

code = code.replace(/<td className="px-6 py-4 text-center">\{act\.horasDefault !== null \? act\.horasDefault : '-'\}.*<\/td>/, match => match + cellDisplay);
code = code.replace(/<td className="px-6 py-4 text-center">\s*<input[^>]*value=\{editHoras\}[^>]*>\s*<\/td>/, match => match + cellEdit);

fs.writeFileSync('src/app/config/extracurriculares/page.tsx', code);
