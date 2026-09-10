import sys

with open('src/app/carga/asignacion/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

bad_html = """          <table>
            </table>
            ` + (observacionCarga ? `"""

good_html = """          ` + (observacionCarga ? `"""

code = code.replace(bad_html, good_html)

with open('src/app/carga/asignacion/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("fixed")
