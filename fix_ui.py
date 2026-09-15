import sys

with open('src/app/establecimiento/planes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add state for categoria
old_state = "const [asigCod, setAsigCod] = useState('');"
new_state = "const [asigCod, setAsigCod] = useState('');\n  const [categoria, setCategoria] = useState('BASE');"
code = code.replace(old_state, new_state)

# 2. Pass categoria to API
old_api = """      await agregarAsignaturaIndividualPropio(
        parseInt(id as string),
        asigTienCod,
        asigGrteCod,
        asigCod
      );"""
new_api = """      await agregarAsignaturaIndividualPropio(
        parseInt(id as string),
        asigTienCod,
        asigGrteCod,
        asigCod,
        categoria
      );"""
code = code.replace(old_api, new_api)

# 3. Reset categoria on success
old_reset = """      setAsigCod('');
      setSearchAsig('');"""
new_reset = """      setAsigCod('');
      setSearchAsig('');
      setCategoria('BASE');"""
code = code.replace(old_reset, new_reset)

# 4. Add UI for Categoria in the Modal
old_ui = """                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>"""

new_ui = """                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría de Asignatura</label>
                      <select 
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#016098]"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                      >
                        <option value="BASE">Plan Base (Adicional / Electiva)</option>
                        <option value="JEC">Horas de Libre Disposición (JEC)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Sirve para ordenar visualmente la matriz del plan.</p>
                    </div>

                  </div>
                )}
              </div>"""

code = code.replace(old_ui, new_ui)

with open('src/app/establecimiento/planes/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("done ui")
