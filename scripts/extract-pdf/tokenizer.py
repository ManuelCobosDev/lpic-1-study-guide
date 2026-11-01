"""
Tokenizer module for Spec 11 §11.4
"""
import re
import unicodedata
from typing import Dict, List, Set

ROMAN_NUMERALS = {
    "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
    "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"
}

KNOWN_ENV_VARS = {
    "PATH", "LANG", "LC_ALL", "LC_CTYPE", "LC_MESSAGES", "LC_TIME", "LC_NUMERIC",
    "SHELL", "USER", "LOGNAME", "HOME", "TERM", "DISPLAY", "TZ", "HISTSIZE",
    "HISTFILE", "HISTFILESIZE", "HISTCONTROL", "PS1", "PS2", "IFS", "EDITOR",
    "VISUAL", "MAIL", "HOSTNAME", "PWD", "OLDPWD", "UID", "EUID", "PPID",
    "BASH", "BASH_VERSION", "MANPATH", "XDG_DATA_DIRS", "XDG_CONFIG_DIRS",
    "XDG_CURRENT_DESKTOP", "XDG_SESSION_TYPE", "WAYLAND_DISPLAY", "XAUTHORITY"
}

RE_FLAG = re.compile(r'(?<![\w-])--?[A-Za-z][\w-]*(?:=\S+)?')
RE_VAR_SIGIL = re.compile(r'\$([A-Za-z_]\w*)')
RE_PATH = re.compile(r'(?:~|\.{1,2})?/[\w.\-/{}*~$]+')
RE_CONFIG_FILE = re.compile(r'\b[\w.\-]+\.(?:conf|cfg|ini|rc|json|yaml|yml|service|socket|target|timer|log|pid|rules|allow|deny|default|profile|bashrc|bash_profile|bash_login|bash_logout)\b')
RE_ACRONYM = re.compile(r'\b[A-Z]{2,}[a-z]?\b')
RE_NUMBER_OCTAL = re.compile(r'\b0[0-7]{3}\b|\b[0-7]{3,4}\b')
RE_NUMBER_PORT_SIGNAL = re.compile(r'\b(?:port|puerto|se[nñ]al|signal)\s+(\d+)\b', re.IGNORECASE)
RE_NUMBER_WITH_UNIT = re.compile(r'\b\d+(?:\.\d+)?\s*(?:DPI|dpi|KB|MB|GB|TB|KiB|MiB|GiB|bps|Kbps|Mbps|Gbps|ms|s|bit|bits|byte|bytes|px)\b')

def normalize_text(text: str) -> str:
    """Normalize text with Unicode NFC and collapsed whitespace."""
    if not text:
        return ""
    nfc = unicodedata.normalize("NFC", text)
    # Collapse non-breaking spaces and regular spaces
    collapsed = re.sub(r'[ \t\u00a0\u202f]+', ' ', nfc)
    return collapsed.strip()

def extract_tokens(
    text: str,
    mono_spans: List[str] = None,
    bold_spans: List[str] = None,
    italic_spans: List[str] = None,
    known_commands: Set[str] = None
) -> Dict[str, List[str]]:
    r"""
    Extracts technical tokens per Spec 11 §11.4:
    - commands: mono spans that match known commands or start code lines
    - flags: options matching (?<![\w-])--?[A-Za-z][\w-]*(=\S+)?
    - paths: filesystem paths and config files
    - vars: $var and known uppercase env vars
    - numbers: octal modes, ports, signals, units, or numbers in monospace
    - terms: text in bold/italic spans
    - acronyms: 2+ uppercase letters (excluding Roman numerals)
    """
    if mono_spans is None:
        mono_spans = []
    if bold_spans is None:
        bold_spans = []
    if italic_spans is None:
        italic_spans = []
    if known_commands is None:
        known_commands = set()

    clean_text = normalize_text(text)

    # 1. Flags
    flags = set()
    for m in RE_FLAG.finditer(clean_text):
        fl = m.group(0)
        # trim trailing punctuation like commas, dots, quotes, parentheses
        fl = re.sub(r'[.,;:\'")]+$', '', fl)
        if len(fl) > 1 and fl != '--' and fl != '-':
            flags.add(fl)

    # 2. Paths
    paths = set()
    for m in RE_PATH.finditer(clean_text):
        p = m.group(0).rstrip('.,;:\'")')
        if len(p) > 1 and not p.startswith('//'):
            paths.add(p)
    for m in RE_CONFIG_FILE.finditer(clean_text):
        cf = m.group(0).rstrip('.,;:\'")')
        paths.add(cf)

    # 3. Vars
    variables = set()
    for m in RE_VAR_SIGIL.finditer(clean_text):
        var_name = m.group(0) # e.g. $PATH or $1
        variables.add(var_name)
    for word in re.findall(r'\b[A-Z][A-Z0-9_]{2,}\b', clean_text):
        if word in KNOWN_ENV_VARS:
            variables.add(word)

    # 4. Commands
    commands = set()
    # Check known commands appearing in text
    for cmd in known_commands:
        # Match as word boundary
        pattern = r'(?<![\w\-/])' + re.escape(cmd) + r'(?![\w\-/])'
        if re.search(pattern, clean_text):
            commands.add(cmd)
    # Check mono spans
    for ms in mono_spans:
        ms_clean = normalize_text(ms)
        # Often a mono span is just a command like "export" or "bash -l"
        parts = ms_clean.split()
        if parts:
            first_word = parts[0].lstrip('$#')
            if first_word in known_commands:
                commands.add(first_word)
            elif re.match(r'^[a-z][a-z0-9_-]{1,15}$', first_word) and not first_word.startswith('-'):
                # Potential command in monospace
                commands.add(first_word)

    # 5. Numbers
    numbers = set()
    for m in RE_NUMBER_OCTAL.finditer(clean_text):
        numbers.add(m.group(0))
    for m in RE_NUMBER_PORT_SIGNAL.finditer(clean_text):
        numbers.add(m.group(1))
    for m in RE_NUMBER_WITH_UNIT.finditer(clean_text):
        numbers.add(m.group(0))
    # numbers in mono spans
    for ms in mono_spans:
        ms_clean = normalize_text(ms)
        for num in re.findall(r'\b\d+\b', ms_clean):
            numbers.add(num)

    # 6. Terms
    terms = set()
    for b in bold_spans:
        b_clean = normalize_text(b)
        if 2 <= len(b_clean) <= 60 and not b_clean.startswith('Figura'):
            terms.add(b_clean)
    for it in italic_spans:
        it_clean = normalize_text(it)
        if 2 <= len(it_clean) <= 60:
            terms.add(it_clean)

    # 7. Acronyms
    acronyms = set()
    for m in RE_ACRONYM.finditer(clean_text):
        acr = m.group(0)
        if acr not in ROMAN_NUMERALS and len(acr) >= 2:
            # Exclude subtopic tags like LPIC
            if acr not in {"LPIC", "NOTE"}:
                acronyms.add(acr)

    return {
        "commands": sorted(commands),
        "flags": sorted(flags),
        "paths": sorted(paths),
        "vars": sorted(variables),
        "numbers": sorted(numbers),
        "terms": sorted(terms),
        "acronyms": sorted(acronyms),
    }

if __name__ == "__main__":
    sample = "El comando bash -l o bash --login invoca un shell de inicio de sesión. Modifica $PATH en /etc/profile y ~/.bashrc. Puerto 22 con SSH y modo 0755."
    res = extract_tokens(
        sample,
        mono_spans=["bash -l", "bash --login", "$PATH", "/etc/profile", "~/.bashrc"],
        bold_spans=["shell de inicio de sesión"],
        known_commands={"bash", "ssh", "su", "sudo", "export"}
    )
    import json
    print(json.dumps(res, indent=2, ensure_ascii=False))
