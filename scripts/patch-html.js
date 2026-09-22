const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/config/page.tsx', 'utf8');

const injection = `</div>
                          
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
                    ))}
`;

code = code.replace(
  /<\/div>\s*<\/div>\s*\}\)\}/,
  injection
);

fs.writeFileSync('src/app/establecimiento/config/page.tsx', code);
