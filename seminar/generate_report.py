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
        "Software reverse engineering—the analysis of compiled binaries to recover program "
        "structure, behavior, and intent without original source code—has long been a "
        "specialist craft. Classical toolchains such as Ghidra, IDA Pro, and Binary Ninja "
        "already provide strong disassembly and decompilation, yet analysts still spend "
        "large fractions of effort on renaming, type recovery, structure layout, and "
        "navigating stripped symbols. Recent advances in large language models (LLMs) and "
        "agentic tooling are changing that bottleneck.",
        first_indent=False,
    )
    add_body(
        doc,
        "This seminar report surveys how AI is making reverse engineering more efficient: "
        "specialized decompilation models such as LLM4Decompile, identifier and type "
        "recovery systems, and in-tool assistants (Binary Ninja Sidekick, Hex-Rays IDA "
        "Assist, GhidraMCP bridges). Measured benchmarks show substantial gains in "
        "re-executability and readability when LLMs refine classical decompiler output, "
        "while also revealing correctness gaps that demand human verification.",
    )
    add_body(
        doc,
        "Using video games as the primary case study, the report examines how "
        "modifications that once required years of expert reverse engineering—especially "
        "cross-game “mashups” built from compiled executables rather than studio "
        "source—have become comparatively practical. The central technical pattern is "
        "not rewriting a game from scratch, but instrumenting binaries through "
        "passthrough bridges, thin DLL injection, shared-memory compositing, and "
        "AI-assisted matching decompilation loops. Minecraft running inside Elden Ring, "
        "related 2026 mashup demos, and AI-accelerated console decompilation projects "
        "illustrate both the opportunity and the limits of this shift.",
    )
    add_body(
        doc,
        "The report concludes that AI amplifies reverse engineering productivity; it does "
        "not eliminate the need for classical analysis, verification oracles, or ethical "
        "and legal judgment around copyright, anti-cheat, and redistribution.",
    )
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    run = p.add_run(
        "Keywords: Reverse Engineering, Decompilation, Large Language Models, Ghidra, "
        "Binary Analysis, Game Modding, Passthrough Mods, Matching Decompilation."
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
        "Chapter 2: How AI Transforms Reverse Engineering",
        "    2.1 Neural and LLM-Based Decompilation",
        "    2.2 In-Tool Assistants and Agentic Workflows",
        "    2.3 Measured Gains and Correctness Limits",
        "Chapter 3: Why Video Games Are the Right Case Study",
        "    3.1 Closed Engines and Missing Source",
        "    3.2 Pre-AI Effort versus Post-AI Acceleration",
        "Chapter 4: Techniques for Modifying Compiled Games",
        "    4.1 Passthrough and Shared-Memory Bridges",
        "    4.2 Native Injection and Thin Hooks",
        "    4.3 Decomp-as-Library and Matching Agent Loops",
        "Chapter 5: Case Study — Games Inside Games",
        "    5.1 Minecraft inside Elden Ring",
        "    5.2 The 2026 Mashup Wave and Related Work",
        "    5.3 What Became Easier—and What Did Not",
        "Chapter 6: Limitations, Ethics, and Open Challenges",
        "    6.1 Hallucinations, Obfuscation, and Verification",
        "    6.2 Copyright, Anti-Cheat, and Community Norms",
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
            "Figure 2.1: AI-augmented RE pipeline (classical tools + LLM refine + verify).",
            "Figure 4.1: Passthrough bridge architecture for two concurrent games.",
            "Figure 5.1: Conceptual data flow in a Minecraft–Elden Ring style bridge.",
        ],
    )
    add_heading_custom(doc, "Tables", level=2)
    add_bullets(
        doc,
        [
            "Table 2.1: Selected benchmark results for AI-assisted decompilation.",
            "Table 4.1: Comparison of compiled-game mashup techniques.",
            "Table 5.1: Case-study examples and their enabling techniques.",
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
        ("ROM", "Read-Only Memory (console game image)"),
        ("SCA", "Software Composition Analysis"),
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
        "data formats, and behaviors that are not available as original source code. "
        "In security research, interoperability work, digital preservation, and game "
        "modding, RE is often the only practical path when vendors ship closed "
        "executables (Eagle, 2011; Hex-Rays, 2025).",
        first_indent=False,
    )
    add_body(
        doc,
        "Critically, reverse engineering is not the same as rewriting a program from "
        "scratch. The binary already encodes control flow, calling conventions, and "
        "data layouts. The analyst’s job is to interpret and, when appropriate, "
        "instrument that existing machine code. This distinction is central to the "
        "present seminar: recent “game inside a game” demos succeed because they "
        "operate on compiled processes, not because an AI regenerates two full game "
        "engines as clean greenfield projects.",
    )

    add_heading_custom(doc, "1.2 The Traditional RE Pipeline", level=2)
    add_body(
        doc,
        "A conventional static/dynamic reverse-engineering workflow proceeds roughly "
        "as follows (Eagle, 2011; Ghidra, 2024):",
        first_indent=False,
    )
    add_bullets(
        doc,
        [
            "Ingest the binary (PE/ELF/Mach-O or console ROM) and identify architecture, compiler, and packing.",
            "Disassemble instructions and reconstruct control-flow graphs.",
            "Decompile intermediate representations into pseudo-C (Ghidra P-Code, Hex-Rays, Binary Ninja HLIL).",
            "Recover imports, RTTI, strings, and signature-matched library functions.",
            "Perform dynamic analysis with a debugger or instrumentation framework (e.g., Frida).",
            "Apply human judgment to name functions, define structures, and form a narrative of behavior.",
        ],
    )
    add_body(
        doc,
        "This pipeline is powerful and largely deterministic, but it remains labor-"
        "intensive. Stripped binaries present opaque names such as sub_401000 and "
        "local_28. Structure fields appear as raw offsets. Optimized code (-O2/-O3) "
        "further obscures original developer intent. Hours of expert attention are "
        "often spent before any higher-level modification—such as a stable game "
        "hook—can be written safely.",
    )
    add_mono_block(
        doc,
        [
            "[ Binary PE/ELF/ROM ]",
            "        |",
            "        v",
            "[ Disassembly + CFG ] ---> [ Decompiler Pseudo-C ]",
            "        |",
            "        v",
            "[ Symbol/Type Recovery ] ---> [ Dynamic Checks ] ---> [ Human Insight ]",
        ],
    )
    add_caption(doc, "Figure 1.1: Classical reverse-engineering pipeline from binary to insight.")

    page_break(doc)

    # ---------- CHAPTER 2 ----------
    add_heading_custom(doc, "CHAPTER 2: HOW AI TRANSFORMS REVERSE ENGINEERING", level=1)
    add_heading_custom(doc, "2.1 Neural and LLM-Based Decompilation", level=2)
    add_body(
        doc,
        "Large language models trained on paired assembly and source have opened a "
        "new track of neural decompilation. LLM4Decompile (Tan et al., 2024) released "
        "open models ranging from 1.3B to 33B parameters in two styles: End models "
        "that map binary/assembly directly toward C, and Ref models that refine "
        "pseudo-C already produced by Ghidra. On the HumanEval-Decompile benchmark, "
        "the End-6.7B model reported about 45.4% average re-executability, more than "
        "doubling GPT-4o’s roughly 16% in the authors’ comparison; refining Ghidra "
        "with Ref models raised re-executability from about 20% (Ghidra alone) toward "
        "the low-to-mid 50% range for mid-size Ref variants (Tan et al., 2024).",
        first_indent=False,
    )
    add_body(
        doc,
        "Parallel research recovers developer-facing identifiers rather than full "
        "recompilation. Systems such as DIRE and DIRTY demonstrated substantial "
        "exact-match rates for variable names and types from decompiler ASTs (Lacomis "
        "et al., 2019; Chen et al., 2022). ReSym combines LLMs with constrained "
        "reasoning to recover user-defined structures from stripped binaries (Xie et "
        "al., 2024). These results matter operationally: readable names and types "
        "compress the time an analyst needs before writing a patch or hook.",
    )

    add_heading_custom(doc, "2.2 In-Tool Assistants and Agentic Workflows", level=2)
    add_body(
        doc,
        "Industrial adoption has concentrated less on replacing Hex-Rays or Ghidra "
        "and more on embedding AI inside those environments. Binary Ninja Sidekick "
        "offers structure recovery, renaming, summarization, and evidence-linked "
        "investigation inside the decompiler UI (Vector 35, 2024). Hex-Rays has "
        "introduced IDA Assist as an in-GUI harness and an official MCP server so "
        "external coding agents can query databases and propose renames or patches "
        "under analyst approval (Hex-Rays, 2025). Community bridges such as GhidraMCP "
        "expose decompilation, cross-references, and renaming to agent clients "
        "(Wired, 2025).",
        first_indent=False,
    )
    add_body(
        doc,
        "The emerging pattern is agentic reverse engineering: an LLM proposes "
        "hypotheses, calls tools, and iterates, while classical analysis engines "
        "remain the source of truth for bytes and control flow. For game "
        "decompilation projects, the same pattern appears as a closed loop—propose "
        "C, compile with the original toolchain, diff against the target object—"
        "rather than free-form chat about assembly (Lewis, 2026; reversedwithai, 2026).",
    )
    add_mono_block(
        doc,
        [
            "Binary --> [Ghidra / IDA / Binary Ninja] --> Pseudo-C / IL",
            "       --> [LLM rename / retype / refine]",
            "       --> [Agent via MCP / scripts]",
            "       --> [Verify: rebuild, objdiff, emulate]",
            "       --> Human-approved insight or hook",
        ],
    )
    add_caption(doc, "Figure 2.1: AI-augmented RE pipeline (classical tools + LLM refine + verify).")

    add_heading_custom(doc, "2.3 Measured Gains and Correctness Limits", level=2)
    add_body(
        doc,
        "AI improvements are real but uneven. DecompileBench (2025) reports that "
        "LLM-based methods can outperform commercial tools on perceived "
        "understandability while showing substantially lower functional correctness "
        "on some metrics—illustrating the risk of plausible but wrong code "
        "(DecompileBench authors, 2025). Obfuscation techniques such as control-flow "
        "flattening still collapse many LLM decompilation successes. Therefore, "
        "responsible practice treats AI output as a draft requiring an oracle: "
        "re-execution tests, byte-identical matching, or independent review.",
        first_indent=False,
    )
    add_caption(doc, "Table 2.1: Selected benchmark results for AI-assisted decompilation.")
    add_table(
        doc,
        ["System / Setting", "Metric", "Reported Result"],
        [
            ["LLM4Decompile-End-6.7B", "HumanEval re-executability", "~45.4% vs GPT-4o ~16%"],
            ["Ghidra alone", "HumanEval re-executability", "~20%"],
            ["LLM4Decompile-Ref on Ghidra", "HumanEval re-executability", "~53% (6.7B Ref)"],
            ["DIRTY", "Variable name / type exact match", "~66% / ~76%"],
            ["DecompileBench (2025)", "LLM vs commercial correctness", "Readability up; CER can drop ~52%"],
        ],
    )

    page_break(doc)

    # ---------- CHAPTER 3 ----------
    add_heading_custom(doc, "CHAPTER 3: WHY VIDEO GAMES ARE THE RIGHT CASE STUDY", level=1)
    add_heading_custom(doc, "3.1 Closed Engines and Missing Source", level=2)
    add_body(
        doc,
        "Commercial games are an extreme RE setting. Engines ship as optimized "
        "native binaries, often with custom allocators, proprietary serialization, "
        "GPU command buffers, and anti-tamper or anti-cheat layers. Official modding "
        "APIs—when they exist—expose only curated surfaces. Anything deeper (camera "
        "matrices, collision queries, damage application, frame presentation) usually "
        "requires locating addresses and calling conventions inside the compiled "
        "image (Fox, 2024).",
        first_indent=False,
    )
    add_body(
        doc,
        "This is why game case studies clarify the seminar thesis. Asset swaps and "
        "scripted plugin mods (for example, historical Mario Kart–themed Counter-"
        "Strike maps built with server plugins) are not the same class of problem "
        "as merging two live engines. The latter demands reverse engineering of "
        "compiled behavior: hooks, shared memory protocols, and renderer "
        "compositing (Bustin, 2026; Sheikh, 2026).",
    )

    add_heading_custom(doc, "3.2 Pre-AI Effort versus Post-AI Acceleration", level=2)
    add_body(
        doc,
        "Matching decompilation communities spent years recovering Super Mario 64, "
        "The Legend of Zelda: Ocarina of Time, and Mario Kart Wii into byte-"
        "identical C projects. Those efforts built essential tooling—splat, m2c, "
        "decomp.me, decomp-permuter, objdiff—but progress was human-limited "
        "function by function (sm64 decomp community; riidefi mkw work).",
        first_indent=False,
    )
    add_body(
        doc,
        "AI coding agents now sit on top of that toolchain. Reports from Snowboard "
        "Kids 2 and related projects describe headless agent loops that pick an "
        "unmatched function, attempt C, compile, and diff until match or timeout—"
        "with multi-week agent runs sometimes outpacing months of manual matching "
        "(Lewis, 2026). Separately, static recompilation projects such as N64: "
        "Recompiled translate console binaries into portable C for modern ports "
        "(Wiseguy, 2024). Together, these advances lower the cost of understanding "
        "and reusing compiled game logic—the prerequisite for ambitious mashups.",
    )

    page_break(doc)

    # ---------- CHAPTER 4 ----------
    add_heading_custom(doc, "CHAPTER 4: TECHNIQUES FOR MODIFYING COMPILED GAMES", level=1)
    add_heading_custom(doc, "4.1 Passthrough and Shared-Memory Bridges", level=2)
    add_body(
        doc,
        "Passthrough modding runs two games concurrently. One process typically "
        "owns the world (terrain, enemies, lighting); the other owns player "
        "mechanics or a second renderer. A bridge—often a Fabric/Java mod on one "
        "side and a native DLL on the other—exchanges camera pose, collision rays, "
        "entity proxies, and damage events over shared memory or local IPC. At "
        "present time, guest pixels are depth-tested into the host swapchain so "
        "blocks appear behind walls correctly (Bustin, 2026; MartianLee, 2026).",
        first_indent=False,
    )
    add_mono_block(
        doc,
        [
            "Guest Game (e.g., Minecraft)          Host Game (e.g., Elden Ring)",
            "  Fabric/native mod  --camera/frames-->  Bridge DLL (hooks Present)",
            "                 <--ray hits/HP/entities--",
            "                 --damage events-------->",
            "         Shared memory / IPC files",
            "  Depth-composite guest RGBA into host frame",
        ],
    )
    add_caption(doc, "Figure 4.1: Passthrough bridge architecture for two concurrent games.")

    add_heading_custom(doc, "4.2 Native Injection and Thin Hooks", level=2)
    add_body(
        doc,
        "When only one host process should remain authoritative, modders inject a "
        "minimal DLL (for example via a dinput8.dll proxy or a loader such as "
        "ModEngine2/me3), hook rendering or gameplay functions with libraries like "
        "MinHook, and push heavy work to an external daemon. Design goals emphasize "
        "crash isolation and small in-process footprints (Altimit, 2026). AI agents "
        "accelerate the search for stable byte patterns, RTTI names, and call sites, "
        "especially when paired with live memory tools exposed over agent protocols.",
        first_indent=False,
    )

    add_heading_custom(doc, "4.3 Decomp-as-Library and Matching Agent Loops", level=2)
    add_body(
        doc,
        "A third route uses community decompilations as libraries. Super Mario 64’s "
        "matching decomp enables projects that embed Mario’s physics inside other "
        "hosts without redistributing Nintendo assets—builders supply their own ROM "
        "(sm64 community; Game Pixel AI survey, 2026). Matching agent loops for "
        "ongoing decomps follow a strict oracle: the original compiler is fixed; "
        "inline assembly cheats and edited verification scripts are rejected "
        "(reversedwithai, 2026). This discipline is what turns AI speed into "
        "trustworthy preservation rather than unverifiable guesses.",
        first_indent=False,
    )
    add_caption(doc, "Table 4.1: Comparison of compiled-game mashup techniques.")
    add_table(
        doc,
        ["Technique", "Core Idea", "Typical Use", "Main Risk"],
        [
            [
                "Content port",
                "Convert guest assets into host formats",
                "Vehicles/weapons as host entities",
                "Format drift; incomplete behavior",
            ],
            [
                "Passthrough",
                "Run both binaries; sync + composite",
                "Full guest systems in host world",
                "Sync bugs; version pin fragility",
            ],
            [
                "Headless rules",
                "Reimplement guest logic; host is view",
                "Simulations inside another game",
                "Behavior mismatch with original",
            ],
            [
                "Decomp-as-library",
                "Call matched/recompiled guest code",
                "Retro characters/engines in hosts",
                "Legal/ROM requirements; porting cost",
            ],
        ],
    )

    page_break(doc)

    # ---------- CHAPTER 5 ----------
    add_heading_custom(doc, "CHAPTER 5: CASE STUDY — GAMES INSIDE GAMES", level=1)
    add_heading_custom(doc, "5.1 Minecraft inside Elden Ring", level=2)
    add_body(
        doc,
        "In late 2025–2026, demonstrations of Minecraft running inside Elden Ring "
        "became a viral emblem of AI-era modding. Creators showed Steve exploring "
        "the Lands Between with Minecraft HUD elements, items, and combat against "
        "host enemies (Jacobs demos covered by TweakTown, Decrypt, and IGN, 2026). "
        "Not all demos shipped public Windows builds immediately; however, open "
        "repositories document a concrete architecture that matches the claims.",
        first_indent=False,
    )
    add_body(
        doc,
        "The minecraft-crossover-bridge project (and the Windows-oriented Minecraft "
        "Ring port) keep Minecraft Java and Elden Ring as separate processes. A "
        "Fabric mod captures camera and frames; a native bridge DLL loaded into "
        "Elden Ring overwrites camera state, casts rays against host collision, "
        "publishes enemy proxies, applies damage through host functions, and "
        "composites Minecraft’s image with a depth test (Bustin, 2026; siddoff, "
        "2026). Addresses are validated against expected bytes so mismatched game "
        "versions disable features instead of corrupting memory blindly.",
    )
    add_mono_block(
        doc,
        [
            "Minecraft (player + blocks + HUD)",
            "   | shared memory: pose, RGBA, depth",
            "   v",
            "Bridge DLL in Elden Ring",
            "   | overwrite camera | raycast terrain | proxy enemies",
            "   v",
            "Elden Ring presents composited frame (offline / no EAC path)",
        ],
    )
    add_caption(doc, "Figure 5.1: Conceptual data flow in a Minecraft–Elden Ring style bridge.")

    add_heading_custom(doc, "5.2 The 2026 Mashup Wave and Related Work", level=2)
    add_body(
        doc,
        "Press coverage described a broader wave of “vibe-coded” mashups: "
        "skateboarding systems in Modern Warfare 2 maps, Mario Kart vehicles in "
        "Call of Duty: World at War Zombies, Spider-Man traversal in Arkham City "
        "spaces, and Escape from Tarkov-inspired systems in Skyrim (Thomas/IGN, "
        "2026; Decrypt, 2026). Tooling write-ups such as Universal Modder’s mashup "
        "skill catalog four routes—content port, passthrough, headless rules, and "
        "decomp-as-library—and record field notes for dozens of combinations "
        "(Sheikh, 2026). Separately, CS2-style movement and gunplay conversions of "
        "offline Elden Ring illustrate injection-heavy single-host redesigns rather "
        "than dual-process compositing.",
        first_indent=False,
    )
    add_body(
        doc,
        "For academic clarity: older Counter-Strike Mario Kart maps (AMX Mod X era) "
        "are scripted gameplay transformations on Source/GoldSrc plugin APIs. They "
        "are historically interesting but should not be conflated with binary-level "
        "passthrough mashups of 2026. The seminar’s focus remains compiled-engine "
        "instrumentation accelerated by AI-assisted reverse engineering.",
    )
    add_caption(doc, "Table 5.1: Case-study examples and their enabling techniques.")
    add_table(
        doc,
        ["Example", "Primary Technique", "AI Role (typical)", "Notes"],
        [
            [
                "Minecraft ↔ Elden Ring",
                "Passthrough bridge",
                "Glue code, address/protocol iteration",
                "Public bridge code available",
            ],
            [
                "Mario Kart in CoD Zombies",
                "Passthrough / injected systems",
                "Rapid prototype glue",
                "Mostly demo clips in press",
            ],
            [
                "SM64 Mario in modern hosts",
                "Decomp-as-library",
                "Optional; decomp was human-led",
                "Requires user-supplied ROM",
            ],
            [
                "Snowboard Kids 2 matching",
                "Agent + objdiff oracle",
                "Function matching loops",
                "Preservation, not mashup",
            ],
        ],
    )

    add_heading_custom(doc, "5.3 What Became Easier—and What Did Not", level=2)
    add_body(
        doc,
        "What became easier is the middle of the stack: proposing hook code, "
        "drafting shared-memory protocols, renaming decompiled functions, and "
        "iterating on compile–diff loops. What remains hard is everything that "
        "still needs ground truth—correct struct layouts, anti-cheat avoidance "
        "policies (most serious projects stay offline), version pinning, depth "
        "compositing edge cases, and legal redistribution of assets. Many viral "
        "clips are demonstrations; open, reproducible bridges are the minority "
        "(heyaican analysis, 2026). AI lowers the expertise floor; it does not "
        "grant a free pass on verification or rights.",
        first_indent=False,
    )

    page_break(doc)

    # ---------- CHAPTER 6 ----------
    add_heading_custom(doc, "CHAPTER 6: LIMITATIONS, ETHICS, AND OPEN CHALLENGES", level=1)
    add_heading_custom(doc, "6.1 Hallucinations, Obfuscation, and Verification", level=2)
    add_body(
        doc,
        "LLM assistants invent plausible types, comments, and even protocol fields. "
        "Without a fixed oracle—unit tests, re-executability checks, or byte-"
        "identical object diffs—agents have been observed to “cheat” by forking "
        "compilers or editing verification scripts (reversedwithai, 2026). "
        "Obfuscation and heavy optimization continue to defeat both classical and "
        "neural decompilers. Best practice is dual control: AI proposes, classical "
        "tools measure, humans approve.",
        first_indent=False,
    )

    add_heading_custom(doc, "6.2 Copyright, Anti-Cheat, and Community Norms", level=2)
    add_body(
        doc,
        "Reverse engineering for interoperability has limited legal traditions in "
        "some jurisdictions (for example, fair-use discussion around Sega v. "
        "Accolade; DMCA §1201(f) interoperability exceptions in U.S. law), but "
        "EULAs, anti-circumvention rules, and game publisher policies still "
        "constrain many workflows (EFF, n.d.). Mashups that combine two commercial "
        "titles’ code and assets without licenses raise clear redistribution "
        "problems; platforms such as Nexus Mods discourage AI-assisted uploads "
        "that lack rights to the underlying assets (IGN summary, 2026).",
        first_indent=False,
    )
    add_body(
        doc,
        "Anti-cheat systems are another hard boundary. Documented bridges emphasize "
        "offline launches and never shipping game files. Responsible seminar "
        "discussion should treat online multiplayer bypass as out of scope. Finally, "
        "parts of the traditional modding community criticize viral mashups as "
        "engagement-driven “slop,” arguing that sustainable creativity still "
        "requires craft and respect for original works (Thomas/IGN, 2026). AI "
        "capability and community legitimacy are not the same variable.",
    )

    page_break(doc)

    # ---------- CHAPTER 7 ----------
    add_heading_custom(doc, "CHAPTER 7: CONCLUSION", level=1)
    add_body(
        doc,
        "Artificial intelligence is transforming software reverse engineering by "
        "attacking its slowest human stages: naming, typing, explaining, and "
        "iterating candidate patches against binaries. Specialized models and "
        "in-tool agents produce measurable gains on decompilation benchmarks and "
        "dramatically accelerate game preservation and experimental modding. Yet "
        "the foundation remains classical analysis—bytes, control flow, and "
        "verification oracles.",
        first_indent=False,
    )
    add_body(
        doc,
        "Video games make the transformation vivid. Projects that place Minecraft "
        "systems inside Elden Ring, or that match console functions with agent "
        "loops, show that ambitious modification of compiled code is no longer "
        "reserved for multi-year specialist teams alone. The correct story is not "
        "that AI rewrites games from imagination; it is that AI makes reverse "
        "engineering efficient enough for new classes of binary-level composition.",
    )
    add_body(
        doc,
        "For engineers and researchers, the actionable lesson is clear: combine "
        "LLM assistance with Ghidra/IDA-class tooling, insist on automated checks, "
        "and treat legal and ethical constraints as first-class design inputs. "
        "Under those conditions, AI-powered reverse engineering is a durable "
        "direction for security, preservation, and creative systems research.",
    )

    page_break(doc)

    # ---------- REFERENCES ----------
    add_centered(doc, "REFERENCES", size=14, bold=True, space_after=12)

    refs = [
        "Altimit, A. (2026). Injection Toolkit (ITK) & game mods [Computer software]. GitHub. https://github.com/AndrewAltimit/game-mods",
        "Bustin, J. (2026). minecraft-crossover-bridge [Computer software]. GitHub. https://github.com/justbustin/minecraft-crossover-bridge",
        "Chen, Q., Lacomis, J., Schwartz, E. J., Le Goues, C., Nebula, & Vasilescu, B. (2022). Augmenting decompiler output with learned variable names and types (DIRTY).",
        "DecompileBench authors. (2025). DecompileBench: A comprehensive benchmark for evaluating decompilers. arXiv. https://arxiv.org/html/2505.11340v1",
        "Eagle, C. (2011). The IDA Pro book (2nd ed.). No Starch Press.",
        "Electronic Frontier Foundation. (n.d.). Coders’ rights project reverse engineering FAQ. https://www.eff.org/issues/coders/reverse-engineering-faq",
        "Ghidra. (2024). Ghidra software reverse engineering framework. National Security Agency. https://ghidra-sre.org",
        "Hex-Rays. (2025). IDA Assist overview & MCP documentation. https://docs.hex-rays.com",
        "Lacomis, J., et al. (2019). DIRE: A neural approach to decompiled identifier naming. ASE.",
        "Lewis, C. (2026). The long tail of LLM-assisted decompilation. https://blog.chrislewis.au/the-long-tail-of-llm-assisted-decompilation/",
        "MartianLee. (2026). Inside the bridge that runs Minecraft in Elden Ring. https://martianlee.github.io/",
        "reversedwithai. (2026). AI-assisted game decompilation: matching decomps and ports with agents. https://reversedwithai.com/learn/ai-assisted-game-decompilation",
        "Sheikh, R. (2026). AI game mashups / Universal Modder mashup skill. https://universal-modder.dev/mashup/",
        "siddoff. (2026). Minecraft-Ring [Computer software]. GitHub. https://github.com/siddoff/Minecraft-Ring",
        "Tan, H., Luo, Q., Li, J., & Zhang, Y. (2024). LLM4Decompile: Decompiling binary code with large language models. EMNLP. https://arxiv.org/abs/2403.05286",
        "Thomas, J. (2026, October). Vibe-coded mashup mods have taken over X this week. IGN Nordic.",
        "TweakTown / Decrypt. (2026). Coverage of Minecraft-in-Elden-Ring and related AI mashup mods.",
        "Vector 35. (2024). Binary Ninja Sidekick 1.0. https://sidekick.binary.ninja/",
        "Wired, L. (2025). GhidraMCP [Computer software]. GitHub. https://github.com/LaurieWired/GhidraMCP",
        "Wiseguy, M. (2024). N64: Recompiled [Computer software]. https://github.com/Mr-Wiseguy/N64Recomp",
        "Xie, D., et al. (2024). ReSym: Harnessing LLMs to recover variable and data structure symbols from stripped binaries. ACM CCS.",
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
