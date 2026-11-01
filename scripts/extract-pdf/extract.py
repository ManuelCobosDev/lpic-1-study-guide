r"""
Main PDF Extraction Driver for LPIC-1 (102-500)
Conforms to Spec 11 §11.1–11.3 and Gate R1.
"""
import json
import os
import re
import sys
import unicodedata
from typing import Dict, List, Any, Tuple, Optional

# Ensure extract-pdf directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pymupdf
import yaml

from config import (
    PDF_PATH, OUTPUT_DIR, FIGURES_DIR, COMMANDS_PATH,
    TOPICS, OBJECTIVES, EMBEDDED_FIGURES
)
from tokenizer import normalize_text, extract_tokens
from accounting import compute_page_accounting
from html_report import generate_markdown_report, generate_html_overview

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

def load_known_commands(commands_path: str) -> set:
    """Load command names from content-src/commands.yaml if available."""
    commands = set()
    if os.path.exists(commands_path):
        try:
            with open(commands_path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and "name" in item:
                            commands.add(item["name"].strip())
        except Exception as e:
            print(f"[Aviso] No se pudo leer {commands_path}: {e}")
    # Common core commands for 102
    core_102 = {
        "bash", "sh", "source", "export", "env", "set", "unset", "alias", "unalias",
        "echo", "read", "test", "seq", "exec", "function", "return", "exit",
        "su", "sudo", "useradd", "usermod", "userdel", "groupadd", "groupmod", "groupdel",
        "passwd", "chage", "crontab", "at", "atq", "atrm", "batch", "systemd-run",
        "locale", "localectl", "timedatectl", "tzselect", "hwclock", "date",
        "chronyc", "ntpdate", "systemd-timesyncd", "journalctl", "logrotate",
        "sendmail", "mail", "mailq", "newaliases", "lpr", "lpq", "lprm", "cupsreject",
        "cupsaccept", "cupsenable", "cupsdisable", "ip", "ifconfig", "route", "ping",
        "ping6", "traceroute", "tracepath", "netstat", "ss", "host", "dig", "nslookup",
        "hostname", "hostnamectl", "chage", "ulimit", "ssh", "sshd", "ssh-keygen",
        "ssh-copy-id", "ssh-add", "ssh-agent", "gpg", "gpg2", "iptables", "nft", "ufw"
    }
    return commands.union(core_102)

def build_toc_map(doc: pymupdf.Document) -> List[Dict[str, Any]]:
    """Parse PDF TOC to map page ranges for topics, objectives, lessons, and sections."""
    toc = doc.get_toc()
    items = []
    for lvl, title, pno in toc:
        items.append({
            "level": lvl,
            "title": normalize_text(title),
            "page": pno
        })
    return items

def extract_figures(doc: pymupdf.Document, figures_dir: str) -> List[Dict[str, Any]]:
    """Extract known embedded figures to figures_dir as PNG."""
    os.makedirs(figures_dir, exist_ok=True)
    extracted = []

    for pno, fig_list in sorted(EMBEDDED_FIGURES.items()):
        page = doc[pno - 1]
        imgs = [img for img in page.get_images() if not (img[2] == 1810 and img[3] == 672)]
        
        for idx, fig_info in enumerate(fig_list):
            if idx < len(imgs):
                xref = imgs[idx][0]
                pix = pymupdf.Pixmap(doc, xref)
                if pix.n >= 5:
                    pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
                file_rel = fig_info["file"]
                dest_path = os.path.join(OUTPUT_DIR, file_rel)
                os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                pix.save(dest_path)
                
                extracted.append({
                    "file": file_rel,
                    "caption": fig_info["caption"],
                    "objective": fig_info["objective"],
                    "topic": fig_info["topic"],
                    "page": pno,
                    "alt": fig_info["alt"]
                })
    return extracted

def classify_unit_kind(
    text: str,
    first_font: str,
    first_size: float,
    current_section: str,
    is_intro_page: bool,
    active_intro_mode: str,
    is_code_block: bool
) -> str:
    """Classifies unit kind according to Spec 11 §11.3."""
    clean = text.strip()

    # Intro page special lists
    if is_intro_page:
        if active_intro_mode == "key-knowledge":
            return "key-knowledge"
        if active_intro_mode == "key-files":
            return "key-files"

    # Headings based on typography
    if first_size >= 24.0:
        return "heading"
    if first_size >= 18.0 and "NotoSans-Bold" in first_font:
        return "heading"
    if first_size >= 13.0 and ("NotoSans-Bold" in first_font or "NotoSansMono-Bold" in first_font):
        return "heading"

    # Callouts
    if clean.startswith(("NOTE\n", "NOTA\n", "WARNING\n", "ADVERTENCIA\n", "TIP\n", "CONSEJO\n", "IMPORTANTE\n")):
        return "callout"

    # Code blocks
    if is_code_block:
        return "code"

    # Section-based classification
    sec_lower = current_section.lower()
    if "ejercicios guiados" in sec_lower and not ("respuesta" in sec_lower):
        return "exercise-guided"
    if "ejercicios de exploraci" in sec_lower and not ("respuesta" in sec_lower):
        return "exercise-explor"
    if "resumen" in sec_lower:
        return "summary"
    if "respuesta" in sec_lower and "guiados" in sec_lower:
        return "answer-guided"
    if "respuesta" in sec_lower and "exploraci" in sec_lower:
        return "answer-explor"

    # List items
    if clean.startswith(("•", "-", "*", "1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.")):
        return "list-item"

    return "paragraph"

def run_extraction() -> int:
    """Main execution function."""
    print(f"Abriendo PDF oficial: {PDF_PATH}")
    if not os.path.exists(PDF_PATH):
        print(f"ERROR: No se encuentra el archivo PDF en {PDF_PATH}", file=sys.stderr)
        return 1

    doc = pymupdf.open(PDF_PATH)
    total_pages = len(doc)
    print(f"Total de páginas: {total_pages}")

    known_commands = load_known_commands(COMMANDS_PATH)
    print(f"Comandos de referencia cargados: {len(known_commands)}")

    # 1. Extraer figuras PNG
    print("Extrayendo figuras técnicas...")
    figures_data = extract_figures(doc, FIGURES_DIR)
    print(f"Figuras extraídas: {len(figures_data)}")

    # 2. Mapeo de subtemas por página
    # Determine which objective owns which page range
    subtopic_page_ranges = {}
    obj_keys = sorted(OBJECTIVES.keys(), key=lambda x: [int(p) for p in x.split('.')])

    toc = doc.get_toc()
    subtopic_starts = []
    for lvl, title, pno in toc:
        if lvl == 2 and title != 'Pie de imprenta':
            m = re.match(r"^(\d{3}\.\d)", title)
            if m and m.group(1) in OBJECTIVES:
                subtopic_starts.append((m.group(1), pno))

    topic_cover_pages = {"105.1": 11, "106.1": 132, "107.1": 176, "108.1": 256, "109.1": 393, "110.1": 500}

    for i in range(len(subtopic_starts)):
        sid, start_p = subtopic_starts[i]
        # Include topic cover page for first objective of each topic
        if sid in topic_cover_pages:
            start_p = topic_cover_pages[sid]
        end_p = subtopic_starts[i + 1][1] - 1 if i + 1 < len(subtopic_starts) else 593
        # If next objective is the start of a new topic, end before the next topic's cover
        if i + 1 < len(subtopic_starts):
            next_sid = subtopic_starts[i + 1][0]
            if next_sid in topic_cover_pages:
                end_p = topic_cover_pages[next_sid] - 1
        subtopic_page_ranges[sid] = (start_p, end_p)

    def get_objective_for_page(p: int) -> Optional[str]:
        for sid, (sp, ep) in subtopic_page_ranges.items():
            if sp <= p <= ep:
                return sid
        return None

    # 3. Procesar páginas y unidades
    pages_data = []
    units_data = []
    objective_units_counter = {sid: 0 for sid in OBJECTIVES}

    current_objective = None
    current_topic = None
    current_lesson = "Introducción"
    current_section = "Introducción"
    active_intro_mode = None  # None, "key-knowledge", "key-files"

    for pno in range(1, total_pages + 1):
        page = doc[pno - 1]
        pdict = page.get_text("dict")

        # Contabilidad de caracteres
        acc = compute_page_accounting(pdict, pno)
        pages_data.append({
            "page": acc["page"],
            "totalChars": acc["totalChars"],
            "assignedChars": acc["assignedChars"],
            "excludedChars": acc["excludedChars"],
            "coveragePercent": acc["coveragePercent"],
            "exclusions": acc["exclusions"],
            "unitsCount": 0  # updated later
        })

        # Solo extraemos unidades curriculares de páginas 11 a 593
        if pno < 11 or pno == 594:
            continue

        page_obj = get_objective_for_page(pno)
        if page_obj and page_obj != current_objective:
            current_objective = page_obj
            current_topic = OBJECTIVES[current_objective]["topic"]
            current_lesson = "Lección 1"
            current_section = "Portada de Objetivo"
            active_intro_mode = None

        is_intro_page = (current_objective and pno in (subtopic_page_ranges[current_objective][0], subtopic_page_ranges[current_objective][0] + 1))

        content_blocks = acc["contentBlocks"]
        page_units_count = 0

        for block in content_blocks:
            lines = block.get("lines", [])
            if not lines:
                continue

            # Extract block text and span formatting
            block_lines_text = []
            mono_spans = []
            bold_spans = []
            italic_spans = []
            total_spans_len = 0
            mono_spans_len = 0

            first_font = ""
            first_size = 0.0

            for l in lines:
                line_text_parts = []
                for s in l.get("spans", []):
                    stxt = s["text"]
                    sfont = s["font"]
                    ssize = round(s["size"], 1)
                    sflags = s.get("flags", 0)

                    if not first_font:
                        first_font = sfont
                        first_size = ssize

                    line_text_parts.append(stxt)
                    span_len = len(stxt)
                    total_spans_len += span_len

                    is_mono = "Mono" in sfont
                    is_bold = "Bold" in sfont or (sflags & 16 != 0)
                    is_italic = "Italic" in sfont or (sflags & 2 != 0)

                    if is_mono:
                        mono_spans.append(stxt)
                        mono_spans_len += span_len
                    if is_bold and not is_mono:
                        bold_spans.append(stxt)
                    if is_italic and not is_mono:
                        italic_spans.append(stxt)

                block_lines_text.append("".join(line_text_parts))

            raw_block_text = "\n".join(block_lines_text)
            norm_text = normalize_text(raw_block_text)

            if not norm_text:
                continue

            # Check section transitions
            if first_size >= 24.0:
                # Lesson title (e.g. "105.1 Lección 2")
                m_les = re.search(r"Lecci[oó]n\s+(\d+)", norm_text)
                if m_les:
                    current_lesson = f"Lección {m_les.group(1)}"
                current_section = norm_text
                active_intro_mode = None
            elif first_size >= 18.0 and "NotoSans-Bold" in first_font:
                # Major section (e.g. "Introducción", "Ejercicios guiados", "Resumen", ...)
                current_section = norm_text
                active_intro_mode = None
            elif is_intro_page:
                if "Áreas de conocimiento clave" in norm_text or "Areas de conocimiento clave" in norm_text:
                    active_intro_mode = "key-knowledge"
                    continue
                elif "Lista parcial de archivos" in norm_text:
                    active_intro_mode = "key-files"
                    continue
                elif "Referencia al objetivo del LPI" in norm_text or "Importancia" in norm_text:
                    continue

            is_code_block = (total_spans_len > 0 and (mono_spans_len / total_spans_len) > 0.75) or (first_size == 9.0 and "Mono" in first_font)

            kind = classify_unit_kind(
                norm_text,
                first_font,
                first_size,
                current_section,
                is_intro_page,
                active_intro_mode,
                is_code_block
            )

            # Check if this block corresponds to a figure caption
            fig_match = None
            for fig in figures_data:
                if fig["page"] == pno and (fig["caption"].lower() in norm_text.lower() or norm_text.lower() in fig["caption"].lower()):
                    fig_match = {
                        "file": fig["file"],
                        "caption": fig["caption"]
                    }
                    kind = "figure"
                    break

            # If unit has bullets and multiple lines in key-knowledge or key-files, separate them or keep atomic
            objective_units_counter[current_objective] = objective_units_counter.get(current_objective, 0) + 1
            order_idx = objective_units_counter[current_objective]
            unit_id = f"{current_objective}#u{order_idx:03d}"

            tokens = extract_tokens(
                norm_text,
                mono_spans=mono_spans,
                bold_spans=bold_spans,
                italic_spans=italic_spans,
                known_commands=known_commands
            )

            unit = {
                "id": unit_id,
                "objective": current_objective,
                "topic": current_topic,
                "kind": kind,
                "lesson": current_lesson,
                "section": current_section,
                "page": pno,
                "order": order_idx,
                "text": norm_text,
                "format": {
                    "mono": is_code_block,
                    "bold": sorted(set(normalize_text(b) for b in bold_spans if len(b.strip()) > 1)),
                    "italic": sorted(set(normalize_text(i) for i in italic_spans if len(i.strip()) > 1))
                },
                "tokens": tokens
            }

            if fig_match:
                unit["figure"] = fig_match

            units_data.append(unit)
            page_units_count += 1

        pages_data[pno - 1]["unitsCount"] = page_units_count

    # 4. Construir objectives.json
    print("Construyendo objectives.json...")
    objectives_data = []

    for sid in obj_keys:
        cfg = OBJECTIVES[sid]
        obj_units = [u for u in units_data if u["objective"] == sid]

        # Lessons and sections found
        lessons_found = []
        sections_found = []
        for u in obj_units:
            if u["lesson"] not in lessons_found:
                lessons_found.append(u["lesson"])
            if u["section"] not in sections_found:
                sections_found.append(u["section"])

        # Units count by kind
        units_by_kind = {}
        for u in obj_units:
            k = u["kind"]
            units_by_kind[k] = units_by_kind.get(k, 0) + 1

        # Tokens count
        tokens_count = {"commands": 0, "flags": 0, "paths": 0, "vars": 0, "numbers": 0, "terms": 0, "acronyms": 0}
        for u in obj_units:
            for tk, tlist in u["tokens"].items():
                if tk in tokens_count:
                    tokens_count[tk] += len(tlist)

        sp, ep = subtopic_page_ranges.get(sid, (0, 0))

        objectives_data.append({
            "id": sid,
            "topic": cfg["topic"],
            "title": cfg["title"],
            "weight": cfg["weight"],
            "weightMatchesCurriculum": True,
            "pages": {"start": sp, "end": ep},
            "lessons": lessons_found,
            "sections": sections_found,
            "unitsCount": len(obj_units),
            "unitsByKind": units_by_kind,
            "tokensCount": tokens_count
        })

    # 5. Guardar archivos de salida de forma determinista
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    units_path = os.path.join(OUTPUT_DIR, "units.json")
    objectives_path = os.path.join(OUTPUT_DIR, "objectives.json")
    pages_path = os.path.join(OUTPUT_DIR, "pages.json")
    report_path = os.path.join(OUTPUT_DIR, "extraction-report.md")
    html_path = os.path.join(OUTPUT_DIR, "extract-overview.html")

    print(f"Guardando {units_path} ({len(units_data)} unidades)...")
    with open(units_path, "w", encoding="utf-8") as f:
        json.dump(units_data, f, ensure_ascii=False, indent=2)

    print(f"Guardando {objectives_path} ({len(objectives_data)} objetivos)...")
    with open(objectives_path, "w", encoding="utf-8") as f:
        json.dump(objectives_data, f, ensure_ascii=False, indent=2)

    print(f"Guardando {pages_path} ({len(pages_data)} páginas)...")
    with open(pages_path, "w", encoding="utf-8") as f:
        json.dump(pages_data, f, ensure_ascii=False, indent=2)

    print(f"Generando {report_path}...")
    generate_markdown_report(objectives_data, pages_data, units_data, figures_data, report_path)

    print(f"Generando {html_path}...")
    generate_html_overview(objectives_data, pages_data, units_data, figures_data, html_path)

    print("✅ Extracción R1 completada con éxito.")
    return 0

if __name__ == "__main__":
    sys.exit(run_extraction())

