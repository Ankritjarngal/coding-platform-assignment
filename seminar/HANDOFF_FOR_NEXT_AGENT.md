# Handoff Brief — Seminar Report + PPT
**For the next agent.** Do not trust the current PPT visual quality. Rebuild the PPT. The report is closer to usable but should stay aligned with this brief.

---

## 1. Who / college identity

| Field | Value |
|---|---|
| Name | **Ankrit Jarngal** |
| Enrollment | **2023BSE028** |
| Department | **Computer Science and Engineering (CSE)** |
| College | National Institute of Technology Srinagar, J&K |
| Year | 2025–2026 |
| Degree line | Bachelor of Technology in Computer Science and Engineering |

Sample format PDF the user provided (mirror structure, change IT → CSE, change name/enrollment):
- Uploaded as `seminar_orggg.pdf` (Delearning in Chatbots sample by Mohammed Adeeb, IT dept)

---

## 2. Topic

**Title:** AI-Powered Reverse Engineering

**User’s own framing (paraphrased from original ask):**
- Main focus: **video games as case study**
- Point is **not** rewriting games from source scratch
- Point **is** taking **compiled** game binaries and modifying / bridging them
- User had seen mashups like “CS in a Mario Kart map”, “Minecraft in Elden Ring”
- First do extensive research on:
  1. How normal reverse engineering became much more efficient due to AI
  2. How earlier nearly-impossible reverse engineering / modification of games from compiled code became relatively easier

**Important correction for credibility:**
- Viral 2026 wave is mostly **Minecraft inside Elden Ring**, **Mario Kart in CoD Zombies**, skate/MW2, etc.
- Older CS Mario Kart maps were **scripted plugin mods**, not the same as binary passthrough bridges
- **For the PPT especially:** user later said **do NOT dump exact game brand names** — teachers may not know them. Speak generically: host/guest binaries, bridges, compiled engines.

---

## 3. What the user wants from the PPT (CRITICAL — previous attempts failed this)

### Explicit requirements from user
1. **Max 8–9 slides**
2. **Not text-walls** — but also **NOT empty/almost-no-text slides**. User said: “not too much text” means **balanced teaching text**, not Apple one-word keynote emptiness and not corporate bullet dumps.
3. **Professional diagrams** (Mermaid-quality), not crude colored rounded boxes
4. **Cool minimal theme** — current dark rebuild still judged “very bad / BS”. Theme and content both need a real redesign by a better design pass.
5. Narrative order:
   1. Generic reverse engineering (what it means, background)
   2. What AI-assisted reverse engineering is + how it made the process fast
   3. Main case study (games compiled-code mods, **without brand-name spam**)
   4. Problems / limits / ethics
6. User will give existing PPT + report to next agent — **fix/replace the PPT**; keep report as reference content.

### What NOT to do (failures so far)
- Light “navy + teal left accent bar + Calibri cards” corporate template
- Empty slide with one sentence and no teaching value
- 14 slides of vague panels
- Listing Minecraft / Elden Ring / Mario Kart / CoD repeatedly on slides
- Fake “AI purple glow” aesthetic
- Treating “minimal” as “no content”

### Intended PPT storyline (9 slides max)

| # | Purpose | Content intent |
|---|---|---|
| 1 | Title | Topic + Ankrit Jarngal + 2023BSE028 + CSE + NIT Srinagar |
| 2 | What is RE | Clear definition: compiled binary → understanding/modification; not rewriting from scratch |
| 3 | Traditional RE | Pipeline diagram: Binary → Disasm → Decompile → Manual analysis → Insight. Stress bottleneck = human naming/structure |
| 4 | AI-assisted RE | Definition: LLMs/agents on top of Ghidra/IDA/BN — refine, rename, explain, iterate |
| 5 | Why faster | Diagram + short evidence: readable drafts faster; agent verify loops; benchmarks exist; verification still required |
| 6 | Case study intro | Closed game binaries, thin APIs; deep mods need RE; combining systems at runtime via bridges |
| 7 | How it works | Host + Guest + Bridge (hooks, shared memory/IPC, composited frame). Generic names only |
| 8 | Problems | Correctness/hallucinations, obfuscation, legal/copyright, offline/anti-cheat responsibility |
| 9 | Close | Thesis: AI compresses RE bottleneck, does not erase it + thank you |

---

## 4. Design research findings (for PPT theme)

Use these as **design references**, not as excuses to ship empty slides.

### Systems researched
1. **SlideSpeak Monolith** — near-black `#0C0C0C`, huge thin display type, monospace labels, faint hairlines, lots of empty space, very limited palette
2. **SlideSpeak Keynote Minimal** — dark radial stage, oversized Inter headlines, one accent (e.g. `#0071e3`), one idea per slide
3. **Dark Modern (tech talks)** — BG `#0E1116`, text `#E8EAED`, muted `#9AA4B2`, accent `#4DA3FF` or mint, panels `#171B22`, hairlines `#2A313B`
4. **Nancy Duarte slide:ology** — contrast, hierarchy, proximity, whitespace; 3-second glance rule; backgrounds are surfaces not decoration; ≤2 fonts
5. **Apple keynote practice / Presentation Zen (Reynolds)** — one idea per slide, large type, sparse text; **but for a college seminar**, user wants **enough explanatory text to teach**, not 3-word manifesto slides
6. **CS academic minimal (Metropolis-like spirit)** — clean typography, dark accents, no heavy PowerPoint chrome

### Practical design recipe for next agent
- Dark stage that looks premium (not muddy gray)
- One accent only
- Large readable headlines (28–40pt+), body ~16–18pt when needed
- Mermaid (or equivalent) diagrams with **dark theme** matching the slide
- 2–5 short lines of teaching text where needed — **complete thoughts**, not orphan fragments
- No left teal strip “corporate sidebar”
- No bullet piles of 6+ long sentences
- Consistent margins, hairline rules, monospace eyebrows OK if tasteful
- Diagrams should carry the technical weight

**User verdict:** previous agents’ themes (light corporate AND first dark rebuild) were still “BS”. Next agent must actually make it look cool and readable for a CSE seminar.

---

## 5. Research findings — content (topic substance)

### Thesis
AI does **not** magically rewrite games from scratch.  
AI makes **reverse engineering of compiled binaries** much more efficient.  
That unlocks modifications (especially game binary bridges) that used to be expert-only / near-impossible.

### Part A — Traditional RE → AI-assisted RE

**Traditional pipeline:**
Binary → disassembly/CFG → decompilation (Ghidra/IDA/Hex-Rays/BN) → symbol/type recovery → dynamic analysis → human judgment

**Pain AI attacks:** stripped names (`sub_401000`), unknown structs, unreadability, slow iteration

**Two AI tracks:**
1. Neural/LLM decompilation (e.g. LLM4Decompile End vs Ref refining Ghidra)
2. In-tool assistants + agents (Binary Ninja Sidekick, IDA Assist/MCP, GhidraMCP)

**Industry pattern:** refine classical decompiler output + agent tooling — **not** replace Ghidra/IDA

**Citation-ready numbers:**
- LLM4Decompile-End-6.7B ≈ **45.4%** re-executability on HumanEval-Decompile vs GPT-4o ≈ **16%** (Tan et al., EMNLP 2024)
- Refining Ghidra with LLM4Decompile-Ref ≈ **53%** vs Ghidra alone ≈ **20%**
- DIRTY: names ~66%, types ~76% (approx from literature)
- DecompileBench: LLMs can look more readable but be **much worse** on functional correctness — honesty point
- Obfuscation (CFF etc.) can crush LLM decomp success (>70% drop in cited settings)

**Tools to mention (high level):** Ghidra, IDA, Binary Ninja, Sidekick, IDA Assist, GhidraMCP, Frida (dynamic)

### Part B — Games as case study (compiled-code mods)

**Four routes (taxonomy — good for diagram):**
1. Content port — convert guest assets into host formats
2. **Passthrough** — both binaries run; sync camera/collision/events; composite frames (main story)
3. Headless rules — reimplement guest logic; host is view
4. Decomp-as-library — call matched/recompiled guest code

**Passthrough architecture (core case-study diagram):**
- Guest process (player systems)
- Host process (world/physics/renderer)
- Bridge: hooks + shared memory / IPC
- Output: single composited frame
- AI role: draft hooks/protocols, find addresses, iterate; classical RE validates bytes

**Open technical references (for report citations; avoid brand spam on slides):**
- `justbustin/minecraft-crossover-bridge`
- `siddoff/Minecraft-Ring`
- Universal Modder mashup notes
- AI-assisted matching decomps (Snowboard Kids 2 / Lewis blogs; Melee agents; objdiff oracles)
- N64: Recompiled (static recomp)

**Press context (2026 mashup wave):** IGN / Decrypt / TweakTown — vibe-coded mashups; many demos not fully released; community backlash about “slop”

### Limits / ethics (must include)
- Hallucinations (plausible wrong types/logic)
- Obfuscation / packing still hard
- Copyright, EULAs, redistribution of commercial assets
- Anti-cheat: keep discussion **offline / no bypass instructions**
- Verification oracles required (agents can cheat checks)

---

## 6. Report requirements

### Format
Mirror the sample seminar PDF structure:
1. Title page (NIT Srinagar, CSE, topic, Ankrit Jarngal, 2023BSE028)
2. Certificate (Seminar Coordinator + HoD, CSE)
3. Abstract + Keywords
4. Table of Contents
5. List of Figures & Tables
6. List of Abbreviations
7. Chapters 1–7
8. References (Author, year style)

### Preferred chapter map (aligned to talk)
1. Introduction to Software Reverse Engineering  
2. AI-Assisted Reverse Engineering (what + how faster + evidence)  
3. Why Video Games Are the Case Study  
4. Techniques for Modifying Compiled Games  
5. Case Study — Cross-Game Binary Bridges (generic naming)  
6. Challenges, Limits, Ethics  
7. Conclusion  

### Report status in repo
File: `seminar/Ankrit_Jarngal_2023BSE028_Seminar_Report.docx`  
Generator: `seminar/generate_report.py`  

**Likely OK as content base** after last rewrite (generic game language, NIT structure). Next agent should:
- Verify tone/academic quality
- Keep citations
- Align wording with final PPT
- Not flood brand names

---

## 7. What already exists in the repo

Branch: `cursor/ai-re-seminar-8e60`  
PR: https://github.com/Ankritjarngal/coding-platform-assignment/pull/1  

| Path | Notes |
|---|---|
| `seminar/Ankrit_Jarngal_2023BSE028_Seminar_Report.docx` | Current report — use as content base |
| `seminar/Ankrit_Jarngal_2023BSE028_Seminar_PPT.pptx` | **Current PPT — user rejects quality; rebuild** |
| `seminar/generate_report.py` | Report generator |
| `seminar/generate_ppt.py` | Failed PPT generator (dark theme attempt) |
| `seminar/assets/*.mmd` + `*.png` | Mermaid sources/diagrams (usable ideas; restyle if needed) |
| `seminar/HANDOFF_FOR_NEXT_AGENT.md` | This brief |

User will also provide the existing PPT + report files directly to the next agent.

---

## 8. Goals for the next agent

### Must ship
1. **A new PPT (8–9 slides)** that looks cool/minimal AND teaches clearly  
2. Keep identity lines correct (Ankrit Jarngal, 2023BSE028, CSE, NIT Srinagar)  
3. Follow narrative: RE → AI-assisted RE → game case study (generic) → problems → close  
4. Include **professional diagrams** (Mermaid or better)  
5. Optionally polish the **report** so it matches the final PPT narrative  

### Success criteria (from user complaints)
- Teacher can understand without knowing viral game titles  
- Slides are not “AI corporate template” and not “empty keynote cosplay”  
- Diagrams look intentional and technical  
- Content is accurate to research (AI amplifies RE; games via compiled bridges)  
- Max ~9 slides  

### Out of scope
- Anti-cheat bypass / exploit PoCs  
- Shipping game files  
- Inventing fake playable mods as fact  

---

## 9. Key sources (bibliography starters)

**Academic / tools**
- Tan et al., LLM4Decompile — https://arxiv.org/abs/2403.05286  
- DecompileBench — https://arxiv.org/html/2505.11340v1  
- Binary Ninja Sidekick — https://sidekick.binary.ninja/  
- Hex-Rays IDA Assist / MCP docs  
- GhidraMCP — https://github.com/LaurieWired/GhidraMCP  

**Game RE / bridges / agent decomps**
- https://github.com/justbustin/minecraft-crossover-bridge  
- https://reversedwithai.com/learn/ai-assisted-game-decompilation  
- https://blog.chrislewis.au/ (LLM-assisted matching decomp)  
- https://universal-modder.dev/mashup/  

**Design refs**
- Duarte, slide:ology (arrangement, contrast, whitespace, 3-second rule)  
- Garr Reynolds, Presentation Zen  
- SlideSpeak Monolith / Keynote Minimal prompts  
- Dark Modern tech-talk palette (`#0E1116` / `#4DA3FF`)  

---

## 10. One-sentence mission for next agent

**Rebuild an 8–9 slide cool minimal seminar deck (and align the existing NIT report) that teaches AI-powered reverse engineering with a generic compiled-game bridge case study — balanced text, pro diagrams, no brand spam, no corporate-template look.**
