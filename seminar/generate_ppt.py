#!/usr/bin/env python3
"""
Minimal Assertion–Evidence seminar PPT.
Design refs: Alley (Penn State) assertion–evidence; Garr Reynolds Presentation Zen.
"""

from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Emu, Inches, Pt


OUT = Path(__file__).resolve().parent / "Ankrit_Jarngal_2023BSE028_Seminar_PPT.pptx"

# Palette: academic navy + teal accent (avoid purple AI-slop)
NAVY = RGBColor(0x0B, 0x1F, 0x3A)
TEAL = RGBColor(0x1F, 0x7A, 0x8C)
SLATE = RGBColor(0x2F, 0x3E, 0x4E)
LIGHT = RGBColor(0xF4, 0xF6, 0xF8)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
ACCENT2 = RGBColor(0xE8, 0x6A, 0x33)  # muted rust for emphasis only
SOFT = RGBColor(0xD7, 0xE2, 0xEA)


def set_slide_bg(slide, color):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color


def add_textbox(slide, left, top, width, height, text, size=28, bold=False, color=NAVY, align=PP_ALIGN.LEFT, font="Calibri"):
    box = slide.shapes.add_textbox(left, top, width, height)
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = font
    return box


def add_shape(slide, left, top, width, height, fill=TEAL, text=None, text_size=14, text_color=WHITE):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    shape.line.fill.background()
    shape.adjustments[0] = 0.1
    if text:
        tf = shape.text_frame
        tf.word_wrap = True
        tf.paragraphs[0].alignment = PP_ALIGN.CENTER
        tf.paragraphs[0].space_before = Pt(0)
        run = tf.paragraphs[0].add_run()
        run.text = text
        run.font.size = Pt(text_size)
        run.font.bold = True
        run.font.color.rgb = text_color
        run.font.name = "Calibri"
        tf.auto_size = None
        shape.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    return shape


def add_arrow_line(slide, begin, end):
    # begin/end = (x, y)
    connector = slide.shapes.add_connector(
        MSO_CONNECTOR.STRAIGHT, begin[0], begin[1], end[0], end[1]
    )
    connector.line.color.rgb = SLATE
    connector.line.width = Pt(2)
    return connector


def blank_slide(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank
    set_slide_bg(slide, LIGHT)
    return slide


def assertion_header(slide, text):
    # Left accent bar
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(0.12), Inches(7.5))
    bar.fill.solid()
    bar.fill.fore_color.rgb = TEAL
    bar.line.fill.background()
    add_textbox(slide, Inches(0.45), Inches(0.28), Inches(9.1), Inches(1.1), text, size=26, bold=True, color=NAVY)


def build():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # ---- 1 Title ----
    s = blank_slide(prs)
    set_slide_bg(s, NAVY)
    add_textbox(s, Inches(0.8), Inches(2.0), Inches(11.5), Inches(1.2),
                "AI-Powered Reverse Engineering", size=40, bold=True, color=WHITE, align=PP_ALIGN.LEFT)
    add_textbox(s, Inches(0.8), Inches(3.3), Inches(11.5), Inches(0.5),
                "Video games as a case study in compiled-code modification", size=20, color=SOFT)
    # accent line
    line = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(4.0), Inches(2.2), Inches(0.06))
    line.fill.solid()
    line.fill.fore_color.rgb = TEAL
    line.line.fill.background()
    add_textbox(s, Inches(0.8), Inches(4.4), Inches(11), Inches(1.2),
                "Ankrit Jarngal  ·  Enroll. No. 2023BSE028\n"
                "B.Tech CSE  ·  NIT Srinagar  ·  2025–2026",
                size=16, color=SOFT)

    # ---- 2 Hook ----
    s = blank_slide(prs)
    assertion_header(s, "One game can run inside another — without the studio’s source.")
    # Two big panels
    add_shape(s, Inches(1.2), Inches(2.0), Inches(4.5), Inches(3.8), fill=NAVY, text="HOST\nElden Ring\n(compiled world)", text_size=22)
    add_shape(s, Inches(7.5), Inches(2.0), Inches(4.5), Inches(3.8), fill=TEAL, text="GUEST\nMinecraft\n(live process)", text_size=22)
    add_textbox(s, Inches(5.6), Inches(3.5), Inches(2), Inches(0.6), "⟷", size=36, bold=True, color=ACCENT2, align=PP_ALIGN.CENTER)
    add_textbox(s, Inches(1.2), Inches(6.2), Inches(10.5), Inches(0.6),
                "Bridge: camera · collision · damage · depth composite", size=16, color=SLATE, align=PP_ALIGN.CENTER)

    # ---- 3 Agenda ----
    s = blank_slide(prs)
    assertion_header(s, "Three stops: how RE works, how AI helps, what games reveal.")
    cards = [
        (Inches(0.8), "01", "Classical RE", "Binary → insight"),
        (Inches(4.7), "02", "AI layer", "Names, types, loops"),
        (Inches(8.6), "03", "Game bridges", "Compiled mashups"),
    ]
    for left, num, title, sub in cards:
        add_shape(s, left, Inches(2.2), Inches(3.5), Inches(3.6), fill=WHITE)
        # border feel via navy top strip
        strip = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, Inches(2.2), Inches(3.5), Inches(0.15))
        strip.fill.solid()
        strip.fill.fore_color.rgb = TEAL
        strip.line.fill.background()
        add_textbox(s, left + Inches(0.3), Inches(2.6), Inches(2.8), Inches(0.6), num, size=28, bold=True, color=TEAL)
        add_textbox(s, left + Inches(0.3), Inches(3.4), Inches(2.9), Inches(0.6), title, size=22, bold=True, color=NAVY)
        add_textbox(s, left + Inches(0.3), Inches(4.2), Inches(2.9), Inches(0.8), sub, size=16, color=SLATE)

    # ---- 4 What is RE ----
    s = blank_slide(prs)
    assertion_header(s, "Reverse engineering recovers meaning from compiled binaries.")
    steps = ["Binary", "Disasm", "Decompile", "Types", "Insight"]
    x0 = 0.7
    for i, label in enumerate(steps):
        left = Inches(x0 + i * 2.4)
        add_shape(s, left, Inches(3.0), Inches(2.0), Inches(1.4), fill=NAVY if i < 4 else TEAL, text=label, text_size=16)
        if i < 4:
            add_textbox(s, left + Inches(1.85), Inches(3.35), Inches(0.6), Inches(0.6), "→", size=28, color=TEAL, align=PP_ALIGN.CENTER)
    add_textbox(s, Inches(0.7), Inches(5.2), Inches(11.5), Inches(0.8),
                "Not rewriting from scratch — interpreting what the compiler already emitted.",
                size=18, color=SLATE, align=PP_ALIGN.CENTER)

    # ---- 5 Classical pain ----
    s = blank_slide(prs)
    assertion_header(s, "Classical tools are strong; naming and structure still burn hours.")
    add_shape(s, Inches(1.0), Inches(2.2), Inches(5.2), Inches(4.0), fill=NAVY, text="sub_401000\nlocal_28\noffset +0x2C", text_size=26)
    add_textbox(s, Inches(6.6), Inches(2.4), Inches(0.8), Inches(0.6), "→", size=36, color=TEAL)
    add_shape(s, Inches(7.4), Inches(2.2), Inches(5.0), Inches(4.0), fill=TEAL, text="load_player()\nhealth\nHitbox.radius", text_size=26)

    # ---- 6 Big numbers ----
    s = blank_slide(prs)
    assertion_header(s, "Specialized LLMs raise decompilation re-executability.")
    metrics = [
        ("~20%", "Ghidra alone"),
        ("~45%", "LLM4Decompile-End"),
        ("~53%", "Ghidra + LLM Ref"),
    ]
    for i, (val, label) in enumerate(metrics):
        left = Inches(1.0 + i * 4.0)
        add_shape(s, left, Inches(2.3), Inches(3.4), Inches(3.5), fill=WHITE)
        top = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, Inches(2.3), Inches(3.4), Inches(0.12))
        top.fill.solid()
        top.fill.fore_color.rgb = TEAL if i else SLATE
        top.line.fill.background()
        add_textbox(s, left, Inches(3.0), Inches(3.4), Inches(1.2), val, size=48, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
        add_textbox(s, left + Inches(0.2), Inches(4.4), Inches(3.0), Inches(0.9), label, size=16, color=SLATE, align=PP_ALIGN.CENTER)
    add_textbox(s, Inches(1.0), Inches(6.3), Inches(11), Inches(0.5),
                "Source: Tan et al., LLM4Decompile (EMNLP 2024), HumanEval-Decompile", size=12, color=SLATE)

    # ---- 7 Pipeline ----
    s = blank_slide(prs)
    assertion_header(s, "AI sits on classical RE tools — it does not replace them.")
    nodes = [
        (0.5, "Ghidra / IDA\nBinary Ninja"),
        (3.7, "LLM refine\nnames · types"),
        (6.9, "Agent + MCP\niterate hooks"),
        (10.1, "Verify\nbuild · diff"),
    ]
    for left, text in nodes:
        add_shape(s, Inches(left), Inches(3.0), Inches(2.7), Inches(1.8), fill=NAVY, text=text, text_size=15)
    for i in range(3):
        x = Inches(3.15 + i * 3.2)
        add_textbox(s, x, Inches(3.5), Inches(0.6), Inches(0.6), "→", size=28, color=TEAL, align=PP_ALIGN.CENTER)
    add_textbox(s, Inches(0.5), Inches(5.5), Inches(12), Inches(0.7),
                "Industry pattern: refine pseudo-C, then prove it against bytes.",
                size=18, color=SLATE, align=PP_ALIGN.CENTER)

    # ---- 8 Why games ----
    s = blank_slide(prs)
    assertion_header(s, "Closed game engines make RE — not greenfield coding — the bottleneck.")
    items = [
        ("No source", "Optimized native binaries"),
        ("Deep systems", "Camera, collision, damage"),
        ("Few APIs", "Official mod surfaces are thin"),
    ]
    for i, (t, d) in enumerate(items):
        top = Inches(2.2 + i * 1.5)
        add_shape(s, Inches(1.5), top, Inches(10), Inches(1.25), fill=WHITE)
        add_textbox(s, Inches(1.9), top + Inches(0.25), Inches(3), Inches(0.7), t, size=22, bold=True, color=TEAL)
        add_textbox(s, Inches(5.2), top + Inches(0.3), Inches(5.8), Inches(0.7), d, size=20, color=NAVY)

    # ---- 9 Passthrough architecture ----
    s = blank_slide(prs)
    assertion_header(s, "Passthrough bridges keep both binaries alive and share one frame.")
    add_shape(s, Inches(0.6), Inches(2.0), Inches(3.6), Inches(4.2), fill=NAVY,
              text="GUEST\n\npose\nframes\nhits", text_size=18)
    add_shape(s, Inches(4.85), Inches(2.8), Inches(3.5), Inches(2.6), fill=ACCENT2,
              text="SHARED\nMEMORY\n/ IPC", text_size=18)
    add_shape(s, Inches(9.0), Inches(2.0), Inches(3.6), Inches(4.2), fill=TEAL,
              text="HOST\n\ncamera\nrays\nPresent()", text_size=18)
    add_textbox(s, Inches(0.6), Inches(6.4), Inches(12), Inches(0.5),
                "Example path: Fabric mod ↔ DLL in Elden Ring (offline)", size=14, color=SLATE, align=PP_ALIGN.CENTER)

    # ---- 10 Four routes ----
    s = blank_slide(prs)
    assertion_header(s, "Four routes put one game inside another.")
    routes = [
        ("Content\nport", "Assets → host formats"),
        ("Pass-\nthrough", "Two processes + sync"),
        ("Headless\nrules", "Reimplement logic"),
        ("Decomp as\nlibrary", "Call matched code"),
    ]
    for i, (title, sub) in enumerate(routes):
        left = Inches(0.7 + i * 3.15)
        add_shape(s, left, Inches(2.3), Inches(2.9), Inches(3.6), fill=NAVY if i % 2 == 0 else TEAL)
        add_textbox(s, left + Inches(0.15), Inches(2.7), Inches(2.6), Inches(1.6), title, size=20, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        add_textbox(s, left + Inches(0.15), Inches(4.6), Inches(2.6), Inches(0.9), sub, size=14, color=SOFT, align=PP_ALIGN.CENTER)

    # ---- 11 Matching decomps ----
    s = blank_slide(prs)
    assertion_header(s, "Matching decompilation is the serious twin of mashup demos.")
    # Loop graphic
    loop = ["Pick function", "Write C", "Compile", "objdiff", "Match?"]
    for i, label in enumerate(loop):
        left = Inches(0.6 + i * 2.5)
        fill = TEAL if i == 4 else NAVY
        add_shape(s, left, Inches(3.0), Inches(2.2), Inches(1.5), fill=fill, text=label, text_size=14)
        if i < 4:
            add_textbox(s, left + Inches(2.05), Inches(3.4), Inches(0.5), Inches(0.5), "→", size=24, color=TEAL)
    add_textbox(s, Inches(0.6), Inches(5.2), Inches(12), Inches(1.0),
                "Agent speed + fixed compiler oracle → trustworthy preservation.\n"
                "Example: Snowboard Kids 2 matching loops (Lewis, 2026).",
                size=16, color=SLATE, align=PP_ALIGN.CENTER)

    # ---- 12 Limits ----
    s = blank_slide(prs)
    assertion_header(s, "Capability rose; correctness, legality, and verification still bind us.")
    limits = [
        ("Hallucinations", "Plausible ≠ correct"),
        ("Obfuscation", "Still breaks models"),
        ("Rights / EULA", "Assets aren’t free"),
        ("Anti-cheat", "Offline-only for serious work"),
    ]
    for i, (t, d) in enumerate(limits):
        col = i % 2
        row = i // 2
        left = Inches(1.0 + col * 5.8)
        top = Inches(2.2 + row * 2.2)
        add_shape(s, left, top, Inches(5.2), Inches(1.8), fill=WHITE)
        add_textbox(s, left + Inches(0.35), top + Inches(0.35), Inches(4.5), Inches(0.6), t, size=22, bold=True, color=NAVY)
        add_textbox(s, left + Inches(0.35), top + Inches(1.0), Inches(4.5), Inches(0.5), d, size=16, color=SLATE)

    # ---- 13 Conclusion ----
    s = blank_slide(prs)
    assertion_header(s, "AI compresses the reverse-engineering bottleneck — it does not erase it.")
    add_shape(s, Inches(1.5), Inches(2.5), Inches(10.2), Inches(3.5), fill=NAVY)
    add_textbox(s, Inches(2.0), Inches(3.2), Inches(9.2), Inches(2.0),
                "Classical tools measure the bytes.\n"
                "LLMs draft the meaning.\n"
                "Humans — and oracles — decide what ships.",
                size=24, bold=False, color=WHITE, align=PP_ALIGN.CENTER)

    # ---- 14 Thanks ----
    s = blank_slide(prs)
    set_slide_bg(s, NAVY)
    add_textbox(s, Inches(0.8), Inches(2.4), Inches(11.5), Inches(1.0),
                "Thank you", size=44, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    line = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(5.5), Inches(3.6), Inches(2.2), Inches(0.06))
    line.fill.solid()
    line.fill.fore_color.rgb = TEAL
    line.line.fill.background()
    add_textbox(s, Inches(0.8), Inches(4.0), Inches(11.5), Inches(1.5),
                "Ankrit Jarngal  ·  2023BSE028\n"
                "Computer Science and Engineering  ·  NIT Srinagar\n"
                "Questions?",
                size=18, color=SOFT, align=PP_ALIGN.CENTER)

    # Speaker notes (verbal script, not on slide)
    notes = [
        "Introduce yourself and the topic: AI making reverse engineering efficient, games as the proof case.",
        "Hook: Minecraft-style systems appearing inside Elden Ring — ask how without source.",
        "Roadmap for the talk.",
        "Define RE clearly.",
        "Pain of stripped symbols.",
        "Cite LLM4Decompile numbers briefly; emphasize Ghidra+LLM refine path.",
        "Stress tools remain foundation.",
        "Why games: closed binaries.",
        "Explain passthrough without drowning in jargon.",
        "Four routes taxonomy.",
        "Serious twin: matching decomps.",
        "Limits and ethics — keep academic tone.",
        "Closing thesis.",
        "Open floor.",
    ]
    for slide, note in zip(prs.slides, notes):
        slide.notes_slide.notes_text_frame.text = note

    prs.save(OUT)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    build()
