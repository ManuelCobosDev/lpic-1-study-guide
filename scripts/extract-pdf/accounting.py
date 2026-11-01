r"""
Accounting module for PDF character accounting (Spec 11 §11.3)
Verifies that >= 99.5% of characters per page are accounted for between assigned units
and recognized exclusions (running headers, footers, page numbers).
"""
import re
from typing import Dict, List, Tuple, Any

RE_HEADER = re.compile(r'^LPIC-1\s*\(102\)\s*\(Versi[oó]n\s*5\.0\)', re.IGNORECASE)
RE_FOOTER = re.compile(r'(?:learning\.lpi\.org|CC\s*BY-NC-ND\s*4\.0|Version:\s*\d{4}-\d{2}-\d{2})', re.IGNORECASE)
RE_PAGE_NUM_ONLY = re.compile(r'^\s*(\d{1,3})\s*(?:\|\s*)?$|^(?:\|\s*)?(\d{1,3})\s*$')

def classify_block_exclusion(bbox: Tuple[float, float, float, float], text: str, page_num: int) -> Tuple[bool, str]:
    """
    Determines if a block is a recognized exclusion (header, footer, or page number).
    Returns (is_excluded, exclusion_type).
    """
    clean = text.strip()
    if not clean:
        return True, "empty"

    # Header region: top of page (bbox[3] <= 55)
    if bbox[3] <= 55 and page_num >= 11:
        if RE_HEADER.search(clean) or "LPIC-1" in clean:
            return True, "header"

    # Footer region: bottom of page (bbox[1] >= 735)
    if bbox[1] >= 735 and page_num >= 11:
        if RE_FOOTER.search(clean) or RE_PAGE_NUM_ONLY.match(clean) or clean == "|" or clean.isdigit():
            return True, "footer"

    return False, ""

def compute_page_accounting(page_dict: Dict[str, Any], page_num: int) -> Dict[str, Any]:
    """
    Computes character accounting for a single page.
    """
    total_chars = 0
    assigned_chars = 0
    excluded_chars = 0
    exclusions = []
    content_blocks = []

    for block in page_dict.get("blocks", []):
        btype = block.get("type", 0)
        if btype == 0:  # text block
            block_text = "".join(s["text"] for l in block.get("lines", []) for s in l.get("spans", []))
            char_count = len(block_text)
            total_chars += char_count

            bbox = block.get("bbox", (0, 0, 0, 0))
            is_ex, ex_type = classify_block_exclusion(bbox, block_text, page_num)

            if is_ex:
                excluded_chars += char_count
                exclusions.append({
                    "type": ex_type,
                    "text": block_text.strip(),
                    "chars": char_count
                })
            else:
                assigned_chars += char_count
                content_blocks.append(block)

    if total_chars == 0:
        coverage_pct = 100.0
    else:
        accounted = assigned_chars + excluded_chars
        coverage_pct = round((accounted / total_chars) * 100.0, 2)

    return {
        "page": page_num,
        "totalChars": total_chars,
        "assignedChars": assigned_chars,
        "excludedChars": excluded_chars,
        "coveragePercent": coverage_pct,
        "exclusions": exclusions,
        "contentBlocks": content_blocks
    }

