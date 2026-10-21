#!/usr/bin/env python3
"""
Seminar PPT — 9 slides, balanced text + Mermaid diagrams.
Flow: RE background → AI-assisted RE → game case study → problems.
Design: Assertion–Evidence + Presentation Zen (enough text to teach, not walls).
"""

from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt, Emu


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "Ankrit_Jarngal_2023BSE028_Seminar_PPT.pptx"
ASSETS = ROOT / "assets"

NAVY = RGBColor(0x0B, 0x1F, 0x3A)
TEAL = RGBColor(0x1F, 0x7A, 0x8C)
SLATE = RGBColor(0x33, 0x41, 0x55)
MUTED = RGBColor(0x64, 0x74, 0x8B)
LIGHT = RGBColor(0xF8, 0xFA, 0xFC)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LINE = RGBColor(0xCB, 0xD5, 0xE1)


def bg(slide, color=LIGHT):
    f = slide.background.fill
    f.solid()
    f.fore_color.rgb = color


def txt(slide, l, t, w, h, text, size=18, bold=False, color=SLATE, align=PP_ALIGN.LEFT, font="Calibri"):
    box = slide.shapes.add_textbox(l, t, w, h)
    tf = box.text_frame
    tf.word_wrap = True
    # support multiline with \n
    lines = text.split("\n")
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.space_after = Pt(4)
        run = p.add_run()
        run.text = line
        run.font.size = Pt(size)
        run.font.bold = bold
        run.font.color.rgb = color
        run.font.name = font
    return box


def bullets(slide, l, t, w, h, items, size=16, color=SLATE):
    box = slide.shapes.add_textbox(l, t, w, h)
    tf = box.text_frame
    tf.word_wrap = True
    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.LEFT
        p.space_after = Pt(8)
        p.level = 0
        run = p.add_run()
        run.text = "•  " + item
        run.font.size = Pt(size)
        run.font.color.rgb = color
        run.font.name = "Calibri"
    return box


def accent_bar(slide):
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(0.1), Inches(7.5))
    bar.fill.solid()
    bar.fill.fore_color.rgb = TEAL
    bar.line.fill.background()


def title_block(slide, title, subtitle=None):
    accent_bar(slide)
    txt(slide, Inches(0.5), Inches(0.28), Inches(12.2), Inches(0.7), title, size=28, bold=True, color=NAVY)
    if subtitle:
        txt(slide, Inches(0.5), Inches(0.95), Inches(12.2), Inches(0.45), subtitle, size=15, color=MUTED)
    # thin rule
    rule = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(1.4), Inches(12.2), Inches(0.02))
    rule.fill.solid()
    rule.fill.fore_color.rgb = LINE
    rule.line.fill.background()


def add_img(slide, path, left, top, width):
    slide.shapes.add_picture(str(path), left, top, width=width)


def blank(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg(s, LIGHT)
    return s


def build():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # ========== 1. Title ==========
    s = blank(prs)
    bg(s, NAVY)
    txt(s, Inches(0.8), Inches(2.1), Inches(11.5), Inches(1.0),
        "AI-Powered Reverse Engineering", size=36, bold=True, color=WHITE)
    txt(s, Inches(0.8), Inches(3.2), Inches(11.5), Inches(0.6),
        "How AI is transforming binary analysis — with video games as a case study",
        size=18, color=RGBColor(0xCB, 0xD5, 0xE1))
    rule = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(4.0), Inches(2.0), Inches(0.05))
    rule.fill.solid()
    rule.fill.fore_color.rgb = TEAL
    rule.line.fill.background()
    txt(s, Inches(0.8), Inches(4.3), Inches(11), Inches(1.2),
        "Ankrit Jarngal  |  Enroll. No. 2023BSE028\n"
        "B.Tech — Computer Science and Engineering\n"
        "National Institute of Technology Srinagar  |  2025–2026",
        size=15, color=RGBColor(0x94, 0xA3, 0xB8))

    # ========== 2. What is RE ==========
    s = blank(prs)
    title_block(s, "What is Reverse Engineering?",
                "Setting the background before we talk about AI")
    bullets(s, Inches(0.6), Inches(1.7), Inches(12), Inches(4.5), [
        "Reverse engineering means analyzing a finished software binary to understand how it works — without having the original source code.",
        "The program is already compiled into machine code. The goal is to recover structure, behavior, and intent from that binary.",
        "It is used in security research, interoperability, digital preservation, and software modification.",
        "Important: it is not rewriting software from scratch. It is interpreting and, when needed, carefully modifying what already exists.",
    ], size=18)
    txt(s, Inches(0.6), Inches(6.3), Inches(12), Inches(0.5),
        "Key idea: compiled code → human understanding → safe modification",
        size=16, bold=True, color=TEAL)

    # ========== 3. Traditional process ==========
    s = blank(prs)
    title_block(s, "The Traditional Reverse Engineering Process",
                "Powerful tools — but a slow human bottleneck")
    add_img(s, ASSETS / "diagram_traditional_re.png", Inches(0.7), Inches(1.7), Inches(12))
    bullets(s, Inches(0.6), Inches(4.6), Inches(12), Inches(2.2), [
        "Tools like Ghidra, IDA Pro, and Binary Ninja already disassemble and decompile well.",
        "The slow part is manual: naming functions, recovering data structures, and understanding intent.",
        "Stripped binaries show meaningless labels (e.g. sub_401000) — experts can spend weeks here.",
    ], size=16)

    # ========== 4. What is AI-assisted RE ==========
    s = blank(prs)
    title_block(s, "What is AI-Assisted Reverse Engineering?",
                "LLMs and agents on top of classical tools — not a replacement")
    bullets(s, Inches(0.6), Inches(1.7), Inches(6.0), Inches(4.8), [
        "AI assistants read decompiler output and suggest meaningful names, types, and explanations.",
        "Specialized models can refine pseudo-code so it becomes closer to readable source.",
        "Coding agents can iterate: propose a change, test against the binary, and retry.",
        "The analyst still decides what is correct — AI drafts, humans approve.",
    ], size=17)
    # right side callout cards
    cards = [
        ("LLM layer", "Rename · explain · refine"),
        ("Tool bridges", "Connect AI to Ghidra / IDA"),
        ("Agent loops", "Iterate until checks pass"),
    ]
    for i, (h, d) in enumerate(cards):
        top = Inches(1.8 + i * 1.55)
        card = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.2), top, Inches(5.3), Inches(1.35))
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.line.color.rgb = LINE
        card.adjustments[0] = 0.08
        txt(s, Inches(7.5), top + Inches(0.25), Inches(4.8), Inches(0.45), h, size=18, bold=True, color=NAVY)
        txt(s, Inches(7.5), top + Inches(0.7), Inches(4.8), Inches(0.45), d, size=15, color=MUTED)

    # ========== 5. How AI made it fast ==========
    s = blank(prs)
    title_block(s, "How AI Made Reverse Engineering Much Faster",
                "Same foundation — compressed analysis time")
    add_img(s, ASSETS / "diagram_ai_assisted.png", Inches(0.4), Inches(1.55), Inches(7.2))
    bullets(s, Inches(7.6), Inches(1.8), Inches(5.2), Inches(5.0), [
        "Readable drafts in minutes instead of long manual renaming sessions.",
        "Research models show large gains when LLMs refine classical decompiler output.",
        "Agents automate the try → check → fix loop for many functions.",
        "Result: work that took specialists months can often move in days or weeks — with verification still required.",
    ], size=16)

    # ========== 6. Case study intro ==========
    s = blank(prs)
    title_block(s, "Case Study: Modifying Compiled Video Games",
                "Why games show the power of AI-assisted reverse engineering")
    bullets(s, Inches(0.6), Inches(1.7), Inches(12), Inches(5.0), [
        "Modern games ship as closed, optimized binaries — usually with no source code and limited official APIs.",
        "Deep changes (camera control, collision, combat logic, rendering) require reverse engineering the compiled executable itself.",
        "Recently, creators have combined systems from different games at runtime — not by rewriting engines from scratch, but by analyzing and bridging compiled processes.",
        "AI coding agents made the glue work (hooks, protocols, iteration) far more accessible than before.",
        "This is the seminar’s main focus: previously near-impossible binary-level game modification becoming comparatively practical.",
    ], size=17)

    # ========== 7. How case study works ==========
    s = blank(prs)
    title_block(s, "How These Game Modifications Actually Work",
                "Two compiled processes + a reverse-engineered bridge")
    add_img(s, ASSETS / "diagram_case_study.png", Inches(0.35), Inches(1.55), Inches(7.5))
    bullets(s, Inches(7.9), Inches(1.8), Inches(4.9), Inches(5.0), [
        "Both games keep running as real binaries.",
        "A thin bridge exchanges camera, collision, and events over shared memory / IPC.",
        "Frames are composited so both worlds appear together.",
        "AI helps locate addresses, draft hooks, and iterate — classical RE still validates the binary.",
    ], size=16)

    # ========== 8. Challenges ==========
    s = blank(prs)
    title_block(s, "Challenges, Limits, and Ethical Concerns",
                "Faster does not mean automatic or unrestricted")
    items = [
        ("Correctness", "AI can invent plausible but wrong types and logic. Results must be verified against the binary."),
        ("Hard defenses", "Obfuscation, packing, and anti-tamper still defeat many automated approaches."),
        ("Legal / policy", "Copyright, license terms, and redistribution rules still apply — especially for commercial game assets."),
        ("Responsibility", "Online anti-cheat bypass is out of scope; serious work stays offline and does not ship proprietary files."),
    ]
    for i, (h, d) in enumerate(items):
        col = i % 2
        row = i // 2
        left = Inches(0.5 + col * 6.3)
        top = Inches(1.7 + row * 2.4)
        card = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(6.0), Inches(2.1))
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.line.color.rgb = LINE
        card.adjustments[0] = 0.06
        strip = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, Inches(0.12), Inches(2.1))
        strip.fill.solid()
        strip.fill.fore_color.rgb = TEAL
        strip.line.fill.background()
        txt(s, left + Inches(0.4), top + Inches(0.35), Inches(5.3), Inches(0.45), h, size=18, bold=True, color=NAVY)
        txt(s, left + Inches(0.4), top + Inches(0.9), Inches(5.3), Inches(0.95), d, size=14, color=SLATE)

    # ========== 9. Conclusion ==========
    s = blank(prs)
    title_block(s, "Conclusion",
                "AI amplifies reverse engineering — it does not replace it")
    bullets(s, Inches(0.6), Inches(1.7), Inches(12), Inches(3.5), [
        "Classical reverse engineering recovers meaning from compiled binaries; the bottleneck was always human analysis time.",
        "AI assists by renaming, explaining, refining, and iterating — making the pipeline dramatically faster.",
        "Video-game binary bridges show how formerly expert-only modifications become comparatively practical.",
        "Verification, legality, and ethics remain essential. AI drafts; engineers decide.",
    ], size=17)
    txt(s, Inches(0.6), Inches(5.5), Inches(12), Inches(1.2),
        "Thank you  |  Ankrit Jarngal · 2023BSE028 · CSE · NIT Srinagar\nQuestions?",
        size=16, bold=True, color=NAVY, align=PP_ALIGN.CENTER)

    notes = [
        "Introduce topic and yourself.",
        "Define reverse engineering clearly for the audience.",
        "Walk the traditional pipeline; stress the manual bottleneck.",
        "Define AI-assisted RE as a layer on classical tools.",
        "Explain speed gains with the pipeline diagram.",
        "Introduce games as the case study without dumping brand names.",
        "Explain the bridge architecture simply.",
        "Cover correctness, legal, and ethical limits.",
        "Close with the thesis and take questions.",
    ]
    for slide, note in zip(prs.slides, notes):
        slide.notes_slide.notes_text_frame.text = note

    prs.save(OUT)
    print(f"Wrote {OUT} ({len(prs.slides)} slides)")


if __name__ == "__main__":
    build()
