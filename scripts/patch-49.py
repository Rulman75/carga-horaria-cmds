import re

with open('src/app/establecimiento/planes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Find the injected block and remove it
block_pattern = re.compile(r"(\s*\{esp !== 'GLOBAL' && filasDeEspecialidad\.length > 0 && \(\(\) => \{[\s\S]*?\n\s*\}\)\(\)\})")
match = block_pattern.search(content)

if not match:
    print("Block not found!")
    exit(1)

block = match.group(1)
content = content.replace(block, "")

# 2. Find the end of filasDeEspecialidad.map which is:
#                                     );
#                                   })}
#                                   </React.Fragment>

target_pattern = re.compile(r"(\s*)\}\)\}\n(\s*)<\/React\.Fragment>")
match2 = target_pattern.search(content)

if not match2:
    print("Target not found!")
    exit(1)

# 3. Insert block before </React.Fragment>
new_content = content[:match2.start(2)] + block + "\n" + content[match2.start(2):]

with open('src/app/establecimiento/planes/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully moved block!")
