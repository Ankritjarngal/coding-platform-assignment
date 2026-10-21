#!/usr/bin/env python3
"""Generate NIT Srinagar CSE seminar report: AI-Powered Reverse Engineering."""

from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


OUT = Path(__file__).resolve().parent / "Ankrit_Jarngal_2023BSE028_Seminar_Report.docx"


def set_run_font(run, size=12, bold=False, italic=False, name="Times New Roman"):
    run.font.name = name
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = RGBColor(0, 0, 0)


def add_centered(doc, text, size=14, bold=False, space_after=6, space_before=0):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
    run = p.add_run(text)
    set_run_font(run, size=size, bold=bold)
    return p


def add_body(doc, text, first_indent=True):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.line_spacing = 1.5
    if first_indent:
        p.paragraph_format.first_line_indent = Inches(0.3)
    run = p.add_run(text)
    set_run_font(run, size=12)
    return p


def add_heading_custom(doc, text, level=1):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(18 if level == 1 else 12)
    p.paragraph_format.space_after = Pt(10)
    size = 14 if level == 1 else 13
    run = p.add_run(text.upper() if level == 1 else text)
    set_run_font(run, size=size, bold=True)
    return p


def add_caption(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(12)
    run = p.add_run(text)
    set_run_font(run, size=11, italic=True)
    return p


def add_mono_block(doc, lines):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.left_indent = Inches(0.25)
    run = p.add_run("\n".join(lines))
    set_run_font(run, size=10, name="Courier New")
    return p


def add_bullets(doc, items):
    for item in items:
        p = doc.add_paragraph(style="List Bullet")
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        run = p.add_run(item)
        set_run_font(run, size=12)


def add_table(doc, headers, rows):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = "Table Grid"
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = ""
        run = cell.paragraphs[0].add_run(h)
        set_run_font(run, size=10, bold=True)
    for r_i, row in enumerate(rows):
        for c_i, val in enumerate(row):
            cell = table.rows[r_i + 1].cells[c_i]
            cell.text = ""
            run = cell.paragraphs[0].add_run(val)
            set_run_font(run, size=10)
    doc.add_paragraph()
    return table


def page_break(doc):
    doc.add_page_break()


def build():
    doc = Document()
    section = doc.sections[0]
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1.25)
    section.right_margin = Inches(1)

    # ---------- TITLE PAGE ----------
    add_centered(doc, "National Institute of Technology Srinagar, J&K", size=16, bold=True, space_after=4)
    add_centered(doc, "Department of Computer Science and Engineering", size=14, bold=True, space_after=4)
    add_centered(doc, "2025 – 2026", size=13, bold=True, space_after=28)
    add_centered(doc, "SEMINAR REPORT", size=18, bold=True, space_after=8)
    add_centered(doc, "ON", size=12, bold=False, space_after=8)
    add_centered(doc, "AI-POWERED REVERSE ENGINEERING", size=16, bold=True, space_after=28)
    add_centered(doc, "Submitted in partial fulfillment of the requirements", size=12, space_after=2)
    add_centered(doc, "for the award of the degree of", size=12, space_after=10)
    add_centered(doc, "BACHELOR OF TECHNOLOGY", size=13, bold=True, space_after=4)
    add_centered(doc, "IN", size=12, space_after=4)
    add_centered(doc, "COMPUTER SCIENCE AND ENGINEERING", size=13, bold=True, space_after=28)
    add_centered(doc, "Submitted by", size=12, space_after=8)
    add_centered(doc, "ANKRIT JARNGAL", size=14, bold=True, space_after=2)
    add_centered(doc, "Enroll. No. 2023BSE028", size=12, bold=True, space_after=28)
    add_centered(doc, "Department of Computer Science and Engineering", size=12, space_after=2)
    add_centered(doc, "National Institute of Technology Srinagar, J&K", size=12, space_after=2)
    add_centered(doc, "Hazratbal, Srinagar – 190006, J&K, India", size=12, space_after=2)

    page_break(doc)

    # ---------- CERTIFICATE ----------
    add_centered(doc, "CERTIFICATE", size=16, bold=True, space_after=18)
    add_body(
        doc,
        "This is to certify that the seminar titled AI-POWERED REVERSE ENGINEERING has been "
        "presented by ANKRIT JARNGAL (Enroll. No. 2023BSE028) in partial fulfillment "
        "of the requirements for the award of the degree of Bachelor of Technology in "
        "Computer Science and Engineering at the National Institute of Technology Srinagar, "
        "Jammu & Kashmir.",
        first_indent=False,
    )
    doc.add_paragraph()
    doc.add_paragraph()
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(36)
    run = p.add_run("Seminar Coordinator")
    set_run_font(run, size=12, bold=True)
    p2 = doc.add_paragraph()
    run = p2.add_run("Department of Computer Science and Engineering\nNIT Srinagar, J&K")
    set_run_font(run, size=11)

    p3 = doc.add_paragraph()
    p3.paragraph_format.space_before = Pt(36)
    run = p3.add_run("Head of Department")
    set_run_font(run, size=12, bold=True)
    p4 = doc.add_paragraph()
    run = p4.add_run("Department of Computer Science and Engineering\nNIT Srinagar, J&K")
    set_run_font(run, size=11)

    page_break(doc)

    # ---------- ABSTRACT ----------
    add_centered(doc, "ABSTRACT", size=14, bold=True, space_after=12)
    add_body(
        doc,
        "Software reverse engineering is the analysis of compiled binaries to recover "
        "program structure, behavior, and intent when original source code is unavailable. "
        "Classical toolchains such as Ghidra, IDA Pro, and Binary Ninja already provide "
        "strong disassembly and decompilation. Historically, however, a large share of "
        "effort still went into manual naming, type recovery, and understanding stripped "
        "symbols—making deep reverse engineering slow and expert-only.",
        first_indent=False,
    )
    add_body(
        doc,
        "This seminar report first establishes that background, then examines how "
        "artificial intelligence—especially large language models and coding agents—"
        "has accelerated the pipeline. AI does not replace classical tools; it sits on "
        "top of them, drafting readable explanations, refining pseudo-code, and "
        "automating iterate-and-verify loops. Benchmarks such as LLM4Decompile show "
        "clear gains when models refine decompiler output, while also reminding us that "
        "correctness still requires human and automated verification.",
    )
    add_body(
        doc,
        "As the main case study, the report focuses on video games: closed, optimized "
        "binaries where deep modification once required years of specialist work. "
        "Recent projects show that systems from different games can be combined at "
        "runtime by reverse-engineering compiled processes—using bridges, hooks, and "
        "shared memory—rather than rewriting engines from scratch. AI assistance made "
        "this class of work comparatively practical. The report ends with limits: "
        "hallucinations, obfuscation, legal constraints, and ethical responsibility.",
    )
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    run = p.add_run(
        "Keywords: Reverse Engineering, Decompilation, Large Language Models, Binary "
        "Analysis, Game Modding, AI Agents, Software Security."
    )
    set_run_font(run, size=12, italic=True)

    page_break(doc)

    # ---------- TOC ----------
    add_centered(doc, "TABLE OF CONTENTS", size=14, bold=True, space_after=12)
    toc_items = [
        "Abstract",
        "List of Figures & Tables",
        "List of Abbreviations",
        "Chapter 1: Introduction to Software Reverse Engineering",
        "    1.1 What Reverse Engineering Means",
        "    1.2 The Traditional RE Pipeline",
        "Chapter 2: AI-Assisted Reverse Engineering",
        "    2.1 What AI Changes in the Pipeline",
        "    2.2 Tools and Agentic Workflows",
        "    2.3 Evidence of Speed and Remaining Gaps",
        "Chapter 3: Why Video Games Are the Case Study",
        "    3.1 Closed Binaries and Limited APIs",
        "    3.2 From Expert-Only Work to Faster Iteration",
        "Chapter 4: Techniques for Modifying Compiled Games",
        "    4.1 Passthrough Bridges",
        "    4.2 Native Injection and Hooks",
        "    4.3 Decompilation-Assisted Reuse",
        "Chapter 5: Case Study — Cross-Game Binary Bridges",
        "    5.1 Problem Setting",
        "    5.2 Architecture of a Runtime Bridge",
        "    5.3 Role of AI in Making It Practical",
        "Chapter 6: Challenges, Limits, and Ethics",
        "    6.1 Correctness and Obfuscation",
        "    6.2 Legal and Ethical Boundaries",
        "Chapter 7: Conclusion",
        "References",
    ]
    for item in toc_items:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(2)
        run = p.add_run("•  " + item)
        set_run_font(run, size=12)

    page_break(doc)

    # ---------- LIST OF FIGURES ----------
    add_centered(doc, "LIST OF FIGURES & TABLES", size=14, bold=True, space_after=12)
    add_heading_custom(doc, "Figures", level=2)
    add_bullets(
        doc,
        [
            "Figure 1.1: Classical reverse-engineering pipeline from binary to insight.",
            "Figure 2.1: AI-augmented RE pipeline on top of classical tools.",
            "Figure 4.1: Passthrough bridge between two compiled game processes.",
            "Figure 5.1: Data flow in a cross-game runtime bridge.",
        ],
    )
    add_heading_custom(doc, "Tables", level=2)
    add_bullets(
        doc,
        [
            "Table 2.1: Selected results for AI-assisted decompilation.",
            "Table 4.1: Comparison of compiled-game modification techniques.",
            "Table 5.1: Case-study elements and enabling techniques.",
        ],
    )

    page_break(doc)

    # ---------- ABBREVIATIONS ----------
    add_centered(doc, "LIST OF ABBREVIATIONS", size=14, bold=True, space_after=12)
    abbr = [
        ("AI", "Artificial Intelligence"),
        ("API", "Application Programming Interface"),
        ("CFG", "Control-Flow Graph"),
        ("DLL", "Dynamic-Link Library"),
        ("IPC", "Inter-Process Communication"),
        ("LLM", "Large Language Model"),
        ("MCP", "Model Context Protocol"),
        ("PE", "Portable Executable"),
        ("RE", "Reverse Engineering"),
    ]
    for a, b in abbr:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(3)
        run = p.add_run(f"•  {a}: {b}")
        set_run_font(run, size=12)

    page_break(doc)

    # ---------- CHAPTER 1 ----------
    add_heading_custom(doc, "CHAPTER 1: INTRODUCTION TO SOFTWARE REVERSE ENGINEERING", level=1)
    add_heading_custom(doc, "1.1 What Reverse Engineering Means", level=2)
    add_body(
        doc,
        "Reverse engineering (RE) is the disciplined analysis of a finished software "
        "artifact—typically a compiled binary—to recover design decisions, algorithms, "
        "data formats, and behaviors that are not available as original source code "
        "(Eagle, 2011). In security research, interoperability work, digital "
        "preservation, and software modification, RE is often the only practical path "
        "when vendors ship closed executables.",
        first_indent=False,
    )
    add_body(
        doc,
        "Critically, reverse engineering is not the same as rewriting a program from "
        "scratch. The binary already encodes control flow, calling conventions, and "
        "data layouts. The analyst’s job is to interpret and, when appropriate, "
        "instrument that existing machine code. This distinction frames the rest of "
        "the seminar: recent advances succeed because they operate on compiled "
        "processes more efficiently, not because AI invents full applications from "
        "nothing.",
    )

    add_heading_custom(doc, "1.2 The Traditional RE Pipeline", level=2)
    add_body(
        doc,
        "A conventional reverse-engineering workflow proceeds roughly as follows "
        "(Eagle, 2011; Ghidra, 2024):",
        first_indent=False,
    )
    add_bullets(
        doc,
        [
            "Ingest the binary and identify architecture, compiler, and packing.",
            "Disassemble instructions and reconstruct control-flow graphs.",
            "Decompile intermediate representations into pseudo-C.",
            "Recover imports, strings, and signature-matched library functions.",
            "Optionally perform dynamic analysis with a debugger or instrumentation.",
            "Apply human judgment to name functions, define structures, and form a behavioral narrative.",
        ],
    )
    add_body(
        doc,
        "This pipeline is powerful and largely deterministic, but it remains labor-"
        "intensive. Stripped binaries present opaque names. Structure fields appear "
        "as raw offsets. Optimized code further obscures original intent. Hours or "
        "weeks of expert attention are often spent before any higher-level "
        "modification can be written safely. That human bottleneck is exactly where "
        "AI assistance has the largest impact.",
    )
    add_mono_block(
        doc,
        [
            "[ Compiled Binary ]",
            "        |",
            "        v",
            "[ Disassembly + CFG ] ---> [ Decompiler Pseudo-C ]",
            "        |",
            "        v",
            "[ Manual Naming / Types ] ---> [ Insight or Modification ]",
        ],
    )
    add_caption(doc, "Figure 1.1: Classical reverse-engineering pipeline from binary to insight.")

    page_break(doc)

    # ---------- CHAPTER 2 ----------
    add_heading_custom(doc, "CHAPTER 2: AI-ASSISTED REVERSE ENGINEERING", level=1)
    add_heading_custom(doc, "2.1 What AI Changes in the Pipeline", level=2)
    add_body(
        doc,
        "AI-assisted reverse engineering keeps classical tools as the foundation and "
        "adds a productivity layer on top. Large language models read decompiler "
        "output and propose meaningful names, types, comments, and structural "
        "hypotheses. Specialized decompilation models can also refine pseudo-C so "
        "that it becomes closer to re-executable source (Tan et al., 2024).",
        first_indent=False,
    )
    add_body(
        doc,
        "The practical effect is compression of analysis time: analysts spend less "
        "effort on mechanical renaming and more on verifying behavior and designing "
        "safe modifications. AI drafts; classical analysis engines still measure "
        "bytes and control flow; humans approve.",
    )

    add_heading_custom(doc, "2.2 Tools and Agentic Workflows", level=2)
    add_body(
        doc,
        "Industrial adoption has concentrated on embedding AI inside existing "
        "environments. Assistants inside commercial decompilers can recover "
        "structures, summarize functions, and investigate questions with links back "
        "to intermediate language (Vector 35, 2024; Hex-Rays, 2025). Bridges such as "
        "Model Context Protocol servers expose Ghidra or IDA databases to coding "
        "agents, enabling autonomous navigation, renaming, and scripted checks "
        "(Wired, 2025).",
        first_indent=False,
    )
    add_body(
        doc,
        "In stronger workflows, an agent proposes a change, compiles or diffs against "
        "the target binary, and retries until a verification oracle passes. This "
        "pattern is especially visible in game preservation projects that demand "
        "byte-identical matching (Lewis, 2026; reversedwithai, 2026).",
    )
    add_mono_block(
        doc,
        [
            "Binary --> [Ghidra / IDA / Binary Ninja] --> Pseudo-C",
            "       --> [LLM rename / explain / refine]",
            "       --> [Agent iterates with checks]",
            "       --> Human-approved understanding or hook",
        ],
    )
    add_caption(doc, "Figure 2.1: AI-augmented RE pipeline on top of classical tools.")

    add_heading_custom(doc, "2.3 Evidence of Speed and Remaining Gaps", level=2)
    add_body(
        doc,
        "LLM4Decompile reported substantial re-executability gains for models that "
        "either decompile directly or refine Ghidra output, outperforming generic "
        "chat models on the authors’ benchmarks (Tan et al., 2024). Related work on "
        "identifier recovery shows that names and types can often be restored at "
        "useful accuracy from decompiler ASTs (Chen et al., 2022).",
        first_indent=False,
    )
    add_body(
        doc,
        "Gaps remain. Broader evaluations warn that LLM output can look readable "
        "while being functionally wrong (DecompileBench authors, 2025). Obfuscation "
        "still collapses many automated successes. Therefore speed without "
        "verification is not progress—it is risk.",
    )
    add_caption(doc, "Table 2.1: Selected results for AI-assisted decompilation.")
    add_table(
        doc,
        ["System / Setting", "Metric", "Reported Result"],
        [
            ["LLM4Decompile-End", "Re-executability (HumanEval-Decompile)", "~45% (vs ~16% GPT-4o in paper)"],
            ["Ghidra alone", "Re-executability", "~20%"],
            ["Ghidra + LLM refine", "Re-executability", "~53% (mid-size Ref model)"],
            ["DIRTY-style recovery", "Names / types", "Often majority exact-match on benchmarks"],
            ["DecompileBench", "Readability vs correctness", "Readability can rise while correctness drops"],
        ],
    )

    page_break(doc)

    # ---------- CHAPTER 3 ----------
    add_heading_custom(doc, "CHAPTER 3: WHY VIDEO GAMES ARE THE CASE STUDY", level=1)
    add_heading_custom(doc, "3.1 Closed Binaries and Limited APIs", level=2)
    add_body(
        doc,
        "Commercial games are an extreme reverse-engineering setting. Engines ship "
        "as optimized native binaries, often with custom allocators, proprietary "
        "formats, GPU command submission, and anti-tamper layers. Official modding "
        "APIs—when they exist—expose only curated surfaces. Anything deeper "
        "(camera matrices, collision queries, damage application, frame "
        "presentation) usually requires locating addresses and calling conventions "
        "inside the compiled image.",
        first_indent=False,
    )
    add_body(
        doc,
        "That is why games clarify the seminar thesis. Simple scripted plugins that "
        "use documented APIs are not the same class of problem as merging two live "
        "compiled engines. The latter demands reverse engineering of binary behavior: "
        "hooks, shared-memory protocols, and renderer compositing.",
    )

    add_heading_custom(doc, "3.2 From Expert-Only Work to Faster Iteration", level=2)
    add_body(
        doc,
        "Matching decompilation communities historically spent years recovering "
        "classic console titles into byte-identical C projects. Those efforts built "
        "essential tooling, but progress was human-limited function by function. "
        "AI coding agents now sit on top of that toolchain: propose C, compile with "
        "the original compiler, diff against the target object, and retry "
        "(Lewis, 2026). Separately, static recompilation turns old binaries into "
        "portable code for modern platforms (Wiseguy, 2024).",
        first_indent=False,
    )
    add_body(
        doc,
        "Together, these advances lower the cost of understanding and reusing "
        "compiled game logic—the prerequisite for ambitious runtime bridges that "
        "were previously near-impossible outside specialist teams.",
    )

    page_break(doc)

    # ---------- CHAPTER 4 ----------
    add_heading_custom(doc, "CHAPTER 4: TECHNIQUES FOR MODIFYING COMPILED GAMES", level=1)
    add_heading_custom(doc, "4.1 Passthrough Bridges", level=2)
    add_body(
        doc,
        "Passthrough modding runs two games concurrently. One process typically owns "
        "the world (terrain, enemies, lighting); the other owns player mechanics or "
        "a second renderer. A bridge—often a script/mod on one side and a native "
        "library on the other—exchanges camera pose, collision rays, entity proxies, "
        "and damage events over shared memory or local IPC. At present time, guest "
        "pixels can be depth-tested into the host frame so both worlds appear "
        "coherent (open bridge implementations, 2026).",
        first_indent=False,
    )
    add_mono_block(
        doc,
        [
            "Guest Game Process                 Host Game Process",
            "  player systems / logic  <---->   world / physics / renderer",
            "                 \\               /",
            "                  Bridge Layer",
            "           hooks · shared memory · IPC",
            "                       |",
            "            Single composited frame",
        ],
    )
    add_caption(doc, "Figure 4.1: Passthrough bridge between two compiled game processes.")

    add_heading_custom(doc, "4.2 Native Injection and Hooks", level=2)
    add_body(
        doc,
        "When only one host process should remain authoritative, modders inject a "
        "minimal library, hook rendering or gameplay functions, and push heavy work "
        "to an external helper process. Design goals emphasize crash isolation and "
        "small in-process footprints. AI agents accelerate searching for stable byte "
        "patterns, class metadata, and call sites—especially when paired with live "
        "memory inspection tools.",
        first_indent=False,
    )

    add_heading_custom(doc, "4.3 Decompilation-Assisted Reuse", level=2)
    add_body(
        doc,
        "A third route uses community matching decompilations as libraries: recovered "
        "C that recompiles to the original bytes can be linked into new hosts for "
        "preservation or experimental composition. Matching agent loops follow a "
        "strict oracle—the original compiler is fixed—so AI speed becomes trustworthy "
        "only when verification cannot be cheated (reversedwithai, 2026).",
        first_indent=False,
    )
    add_caption(doc, "Table 4.1: Comparison of compiled-game modification techniques.")
    add_table(
        doc,
        ["Technique", "Core Idea", "Typical Use", "Main Risk"],
        [
            ["Content port", "Convert guest assets into host formats", "Items/models as host entities", "Incomplete behavior"],
            ["Passthrough", "Run both binaries; sync + composite", "Full guest systems in host world", "Sync bugs; version fragility"],
            ["Headless rules", "Reimplement guest logic; host is view", "Simulations inside another game", "Behavior mismatch"],
            ["Decomp reuse", "Call matched/recompiled guest code", "Preservation / embedded logic", "Legal & toolchain cost"],
        ],
    )

    page_break(doc)

    # ---------- CHAPTER 5 ----------
    add_heading_custom(doc, "CHAPTER 5: CASE STUDY — CROSS-GAME BINARY BRIDGES", level=1)
    add_heading_custom(doc, "5.1 Problem Setting", level=2)
    add_body(
        doc,
        "The case study asks a concrete question: how can gameplay systems from one "
        "closed-source title appear inside another title’s world when neither studio "
        "provides source code? Historically, answers were limited to asset swaps or "
        "official plugin APIs. Combining two live engines—camera, collision, combat, "
        "and rendering—was rare because it required deep binary analysis plus fragile "
        "integration code.",
        first_indent=False,
    )
    add_body(
        doc,
        "Recent open implementations and public demonstrations show that this barrier "
        "has dropped. Creators run two compiled games side by side, reverse-engineer "
        "enough of each process to exchange state, and present a single composited "
        "view. The point for this seminar is technical, not commercial branding: "
        "compiled-code modification, not greenfield rewriting.",
    )

    add_heading_custom(doc, "5.2 Architecture of a Runtime Bridge", level=2)
    add_body(
        doc,
        "A representative architecture keeps both games as separate processes. The "
        "guest side captures player pose and rendered frames. The host side receives "
        "that pose, overwrites its camera, casts rays against its own collision, "
        "publishes nearby entities, and applies damage through existing host "
        "functions. Shared memory or IPC carries the protocol. A depth test merges "
        "pixels so guest geometry respects host walls. Addresses are often validated "
        "against expected byte patterns so mismatched builds disable features instead "
        "of corrupting memory blindly.",
        first_indent=False,
    )
    add_mono_block(
        doc,
        [
            "Guest (player systems)",
            "   | shared memory: pose, frames, events",
            "   v",
            "Bridge (hooks + protocol)",
            "   | camera overwrite | raycasts | entity proxies | damage calls",
            "   v",
            "Host (world + renderer) --> composited frame",
        ],
    )
    add_caption(doc, "Figure 5.1: Data flow in a cross-game runtime bridge.")

    add_heading_custom(doc, "5.3 Role of AI in Making It Practical", level=2)
    add_body(
        doc,
        "AI does not magically invent two game engines. It accelerates the reverse-"
        "engineering and glue layers: locating functions, drafting hook code, "
        "designing shared-memory layouts, diagnosing sync bugs, and iterating until "
        "behavior looks correct. Coding agents paired with decompilers shorten what "
        "used to be months of specialist work into much shorter build–test cycles "
        "(Sheikh, 2026; Lewis, 2026).",
        first_indent=False,
    )
    add_body(
        doc,
        "Honesty matters for academic work: many viral clips are demonstrations; "
        "fully documented, reproducible bridges are fewer. Version pinning, depth "
        "compositing edge cases, and offline-only constraints remain hard. AI lowers "
        "the expertise floor; it does not remove engineering judgment.",
    )
    add_caption(doc, "Table 5.1: Case-study elements and enabling techniques.")
    add_table(
        doc,
        ["Element", "Technique", "AI Contribution", "Still Hard"],
        [
            ["Two live binaries", "Passthrough / IPC bridge", "Protocol + hook drafting", "Version fragility"],
            ["Shared camera/collision", "Memory hooks + raycasts", "Faster address discovery", "Correct struct layouts"],
            ["Visual merge", "Depth-tested compositing", "Debug iteration", "Edge cases / timing"],
            ["Preservation twin", "Matching decomp + objdiff", "Function matching loops", "Oracle discipline"],
        ],
    )

    page_break(doc)

    # ---------- CHAPTER 6 ----------
    add_heading_custom(doc, "CHAPTER 6: CHALLENGES, LIMITS, AND ETHICS", level=1)
    add_heading_custom(doc, "6.1 Correctness and Obfuscation", level=2)
    add_body(
        doc,
        "LLM assistants invent plausible types, comments, and protocol fields. "
        "Without a fixed oracle—tests, re-execution, or byte-identical diffs—agents "
        "may optimize for looking finished rather than being correct "
        "(reversedwithai, 2026). Obfuscation, packing, and heavy optimization still "
        "defeat both classical and neural decompilers. Best practice is dual control: "
        "AI proposes, classical tools measure, humans approve.",
        first_indent=False,
    )

    add_heading_custom(doc, "6.2 Legal and Ethical Boundaries", level=2)
    add_body(
        doc,
        "Reverse engineering for interoperability has limited legal traditions in "
        "some jurisdictions, but license agreements, anti-circumvention rules, and "
        "publisher policies still constrain many workflows (EFF, n.d.). Combining "
        "commercial titles’ code and assets without rights raises redistribution "
        "problems. Anti-cheat systems are another hard boundary: responsible "
        "discussion treats online multiplayer bypass as out of scope and emphasizes "
        "offline experimentation that does not ship proprietary game files.",
        first_indent=False,
    )
    add_body(
        doc,
        "Finally, community norms matter. Speed alone is not craft. Sustainable "
        "technical work still requires verification, respect for original creators, "
        "and clear separation between research prototypes and redistributable "
        "products.",
    )

    page_break(doc)

    # ---------- CHAPTER 7 ----------
    add_heading_custom(doc, "CHAPTER 7: CONCLUSION", level=1)
    add_body(
        doc,
        "Artificial intelligence is transforming software reverse engineering by "
        "attacking its slowest human stages: naming, typing, explaining, and "
        "iterating candidate patches against binaries. Classical tools remain the "
        "foundation; AI compresses analysis time on top of them.",
        first_indent=False,
    )
    add_body(
        doc,
        "Video games make the shift concrete. Cross-game runtime bridges show that "
        "ambitious modification of compiled code—once reserved for multi-year "
        "specialist teams—can become comparatively practical when reverse "
        "engineering is accelerated by LLMs and agents. The correct story is not "
        "that AI rewrites games from imagination; it is that AI makes reverse "
        "engineering efficient enough for new classes of binary-level composition.",
    )
    add_body(
        doc,
        "For students and practitioners, the lesson is clear: combine LLM assistance "
        "with Ghidra/IDA-class tooling, insist on automated checks, and treat legal "
        "and ethical constraints as first-class design inputs. Under those "
        "conditions, AI-powered reverse engineering is a durable direction for "
        "security, preservation, and creative systems research.",
    )

    page_break(doc)

    # ---------- REFERENCES ----------
    add_centered(doc, "REFERENCES", size=14, bold=True, space_after=12)

    refs = [
        "Chen, Q., Lacomis, J., Schwartz, E. J., Le Goues, C., Nebula, & Vasilescu, B. (2022). Augmenting decompiler output with learned variable names and types.",
        "DecompileBench authors. (2025). DecompileBench: A comprehensive benchmark for evaluating decompilers. arXiv. https://arxiv.org/html/2505.11340v1",
        "Eagle, C. (2011). The IDA Pro book (2nd ed.). No Starch Press.",
        "Electronic Frontier Foundation. (n.d.). Coders’ rights project reverse engineering FAQ. https://www.eff.org/issues/coders/reverse-engineering-faq",
        "Ghidra. (2024). Ghidra software reverse engineering framework. National Security Agency. https://ghidra-sre.org",
        "Hex-Rays. (2025). IDA Assist overview & MCP documentation. https://docs.hex-rays.com",
        "Lewis, C. (2026). The long tail of LLM-assisted decompilation. https://blog.chrislewis.au/",
        "reversedwithai. (2026). AI-assisted game decompilation: matching decomps and ports with agents. https://reversedwithai.com/learn/ai-assisted-game-decompilation",
        "Sheikh, R. (2026). Mashup patterns for compiled-game bridges / Universal Modder notes. https://universal-modder.dev/mashup/",
        "Tan, H., Luo, Q., Li, J., & Zhang, Y. (2024). LLM4Decompile: Decompiling binary code with large language models. EMNLP. https://arxiv.org/abs/2403.05286",
        "Vector 35. (2024). Binary Ninja Sidekick 1.0. https://sidekick.binary.ninja/",
        "Wired, L. (2025). GhidraMCP [Computer software]. GitHub. https://github.com/LaurieWired/GhidraMCP",
        "Wiseguy, M. (2024). N64: Recompiled [Computer software]. https://github.com/Mr-Wiseguy/N64Recomp",
    ]
    for ref in refs:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.left_indent = Inches(0.25)
        p.paragraph_format.first_line_indent = Inches(-0.25)
        run = p.add_run(ref)
        set_run_font(run, size=11)

    doc.save(OUT)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    build()
