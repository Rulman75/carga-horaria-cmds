const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

// Replace state
code = code.replace(/const \[asigGrteCod, setAsigGrteCod\] = useState<number \| ''>\(''\);/, 'const [asigGrteCods, setAsigGrteCods] = useState<number[]>([]);');

// Replace handleAgregarIndividual logic
const regexHandler = /const handleAgregarIndividual = async \(\) => \{[\s\S]*?setImportando\(false\);\n  \};/;
const replHandler = `const handleAgregarIndividual = async () => {
    if (asigTienCod === '' || asigGrteCods.length === 0 || !asigCod) {
      alert("Por favor, selecciona Tipo de Enseñanza, Cursos y Asignatura.");
      return;
    }

    setImportando(true);
    try {
      for (const grteCod of asigGrteCods) {
        await agregarAsignaturaIndividualPropio(
          parseInt(id as string),
          asigTienCod,
          grteCod,
          asigCod,
          categoria
        );
      }
      setShowModal(false);
      setAsigTienCod('');
      setAsigGrteCods([]);
      setAsigCod('');
      setSearchAsig('');
      setCategoria('BASE');
      await loadData();
    } catch (error) {
      alert("Error al agregar la asignatura.");
      console.error(error);
    }
    setImportando(false);
  };`;
code = code.replace(regexHandler, replHandler);

// Replace asigTienCod onChange
code = code.replace(/setAsigTienCod\(Number\(e\.target\.value\)\);\s*setAsigGrteCod\(''\);\s*\/\/\s*reset grade/, 'setAsigTienCod(Number(e.target.value));\n                          setAsigGrteCods([]); // reset grades');

// Replace the UI for Curso Destino
const regexUI = /<div>\s*<label className="block text-sm font-semibold text-gray-700 mb-1">Curso Destino<\/label>[\s\S]*?<\/select>\s*<\/div>/;
const replUI = `<div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Cursos Destino (Múltiple)</label>
                      <div className="border border-gray-300 rounded-lg p-2.5 text-sm h-[132px] overflow-y-auto custom-scrollbar bg-white">
                        {!asigTienCod ? (
                          <div className="text-gray-400 text-center mt-10">Seleccione Tipo Enseñanza</div>
                        ) : (
                          availableGradesForForm.map((g: any) => (
                            <label key={g.grteCod} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-0">
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 text-[#016098]"
                                checked={asigGrteCods.includes(g.grteCod)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAsigGrteCods([...asigGrteCods, g.grteCod]);
                                  } else {
                                    setAsigGrteCods(asigGrteCods.filter(c => c !== g.grteCod));
                                  }
                                }}
                              />
                              <span className="text-gray-800">{g.grteDescrip}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>`;
code = code.replace(regexUI, replUI);

fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
