const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

// I will use regex to find handleAgregarIndividual and replace it.
const regex = /const handleAgregarIndividual = async \(\) => \{[\s\S]*?setImportando\(false\);\n  \};/;

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

code = code.replace(regex, newBlock);
fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
