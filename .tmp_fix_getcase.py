from pathlib import Path
p = Path('message.js')
text = p.read_text(encoding='utf-8')
old_line = "                const regex = new RegExp(`case\\s+[\"]${escapeRegex(caseId)}[\"]\\s*:\\s*\\{`, 'g');\n"
new_line = "                const regex = new RegExp(`case\\s+[\"']${escapeRegex(caseId)}[\"']\\s*:\\s*\\{`, 'g');\n"
if old_line not in text:
    old_line = "                const regex = new RegExp(`case\\s+[\"]${escapeRegex(caseId)}[\"]\\s*:\\s*\\{`, 'g');\n"
text = text.replace(old_line, new_line)
p.write_text(text, encoding='utf-8')
