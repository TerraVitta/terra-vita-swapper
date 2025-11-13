#!/usr/bin/env python3
with open('/workspaces/terra-vita-swapper/src/index.css', 'r') as f:
    lines = f.readlines()

open_count = 0
close_count = 0
stack = []

for i, line in enumerate(lines, 1):
    for j, char in enumerate(line):
        if char == '{':
            open_count += 1
            # Extract context
            context = line[:j].strip()[-50:] if len(line[:j].strip()) > 50 else line[:j].strip()
            stack.append((i, j, context))
        elif char == '}':
            close_count += 1
            if stack:
                stack.pop()
            else:
                print(f"Extra closing brace at line {i}, column {j}: {line.strip()}")

print(f"Total opening braces: {open_count}")
print(f"Total closing braces: {close_count}")
print(f"Unclosed blocks: {len(stack)}")

if stack:
    print("\nUnclosed blocks:")
    for line_num, col, context in stack:
        print(f"  Line {line_num}, Col {col}: {context}")
