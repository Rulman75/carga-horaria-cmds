const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/config/page.tsx', 'utf8');

// Add getCursosLetra to import
code = code.replace(
  /import \{ getEstablecimientoConfig, getGrados, updateEstablecimientoConfig \} from '\.\.\/\.\.\/actions';/,
  `import { getEstablecimientoConfig, getGrados, updateEstablecimientoConfig, getCursosLetra } from '../../actions';`
);

// Add state
code = code.replace(
  /const \[guardando, setGuardando\] = useState\(false\);/,
  `const [guardando, setGuardando] = useState(false);
  const [cursosLetra, setCursosLetra] = useState<any[]>([]);`
);

// Add load
code = code.replace(
  /const g = await getGrados\(\);/,
  `const g = await getGrados();
    const cl = await getCursosLetra(establecimientoId!);
    setCursosLetra(cl);`
);

// Add handler
code = code.replace(
  /const handleJecGradoChange = \(tienCod: number, grteCod: number, checked: boolean\) => \{/,
  `
  const handleJecLetraChange = (tienCod: number, grteCod: number, letra: string, checked: boolean) => {
    const existe = cursosLetra.find(c => c.tienCod === tienCod && c.grteCod === grteCod && c.letra === letra);
    if (existe) {
      setCursosLetra(cursosLetra.map(c => c === existe ? { ...c, esJec: checked } : c));
    } else {
      setCursosLetra([...cursosLetra, { tienCod, grteCod, letra, esJec: checked }]);
    }
  };
  
  const handleJecGradoChange = (tienCod: number, grteCod: number, checked: boolean) => {`
);

// Add payload
code = code.replace(
  /await updateEstablecimientoConfig\(establecimientoId!, esJec, payload, \[\]\);/,
  `await updateEstablecimientoConfig(establecimientoId!, esJec, payload, [], cursosLetra);`
);

// Add UI
const ui = `                          </div>
                          
                          {g.cantidadCursos > 0 && (
                            <div className="mt-2 flex flex-col gap-1 border-t pt-2 border-gray-200">
                              <span className="text-[10px] text-gray-500 font-bold">EXCEPCIONES JEC POR LETRA</span>
                              {Array.from({length: g.cantidadCursos}, (_, i) => String.fromCharCode(65 + i)).map(letra => {
                                const override = cursosLetra.find(c => c.tienCod === g.tienCod && c.grteCod === g.grteCod && c.letra === letra);
                                const isLetraJec = override && override.esJec !== null ? override.esJec : (g.esJec || false);
                                return (
                                  <div key={letra} className="flex items-center gap-2">
                                    <input 
                                      type="checkbox"
                                      checked={isLetraJec}
                                      onChange={(e) => handleJecLetraChange(g.tienCod, g.grteCod, letra, e.target.checked)}
                                      className="w-3 h-3 text-[#016098]"
                                    />
                                    <span className="text-[10px] text-gray-600">{letra} - {isLetraJec ? 'JEC' : 'Normal'}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
`;

code = code.replace(
  /<\/div>\s*<\/div>\s*<\/div>\s*\}\)\}\s*<\/div>/,
  ui + `\n</div>\n})}\n</div>`
);

fs.writeFileSync('src/app/establecimiento/config/page.tsx', code);
