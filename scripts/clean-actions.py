import re

with open('src/app/actions.ts', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('\\"Establecimiento\\"', '"Establecimiento"')

with open('src/app/actions.ts', 'w', encoding='utf-8') as f:
    f.write(code)

print("Cleaned up backslashes")
