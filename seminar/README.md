# Seminar: AI-Powered Reverse Engineering

**Student:** Ankrit Jarngal · **2023BSE028** · CSE · NIT Srinagar · 2025–2026

## Deliverables

| File | Description |
| --- | --- |
| `Ankrit_Jarngal_2023BSE028_Seminar_Report.docx` | Full NIT-format seminar report |
| `Ankrit_Jarngal_2023BSE028_Seminar_PPT.pptx` | 9-slide talk deck (balanced text + Mermaid diagrams) |

## PPT flow (9 slides)

1. Title  
2. What is reverse engineering  
3. Traditional RE process (+ diagram)  
4. What is AI-assisted RE  
5. How AI made it faster (+ diagram)  
6. Case study: modifying compiled games (no brand-name spam)  
7. How those mods work — bridge architecture (+ diagram)  
8. Challenges & ethics  
9. Conclusion  

## Regenerate

```bash
# diagrams (needs @mermaid-js/mermaid-cli)
npx mmdc -i assets/diagram_traditional_re.mmd -o assets/diagram_traditional_re.png -b white --size 1600 -s 2 -p assets/puppeteer.json
npx mmdc -i assets/diagram_ai_assisted.mmd -o assets/diagram_ai_assisted.png -b white --size 1400 -s 2 -p assets/puppeteer.json
npx mmdc -i assets/diagram_case_study.mmd -o assets/diagram_case_study.png -b white --size 1400 -s 2 -p assets/puppeteer.json

python3 generate_report.py
python3 generate_ppt.py
```
