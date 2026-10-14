const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const strStart = `const handleAgregarIndividual = async () => {`;
const strEnd = `setImportando(false);\n  };`;

const startIndex = code.indexOf(strStart);
const endIndex = code.indexOf(strEnd) + strEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
  const newBlock = `const handleAgregarIndividual = async () => {
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

  code = code.substring(0, startIndex) + newBlock + code.substring(endIndex);
  fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
} else {
  console.log("Could not find the block to replace.");
}
