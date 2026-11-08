#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""
Servidor Micro-API Jerárquico + Planificador Hardware-Aware en Paralelo + Motor SQLite WAL
para la Skill `/validar-temario-pdf`.

Propósito:
1. Detectar automáticamente el hardware real de la máquina (CPUs lógicos, RAM total, RAM libre y
   carga de memoria en Windows/Linux/macOS) y calcular un Plan de Concurrencia Óptimo:
   - Número de hilos del pool Python (`ThreadPoolExecutor`) para extracción/comparación multi-core.
   - Límite de subagentes de Capa 2 (Temas) en paralelo.
   - Límite de subagentes de Capa 3 (Extracción/Comparación) simultáneos por Tema y globales
     mediante oleadas (`execution_waves`) para máxima velocidad sin saturar RAM ni rate-limits.
2. Analizar la estructura completa de un PDF oficial LPI (~600 páginas), detectar Temas,
   Subtemas y Secciones internas y generar `structure-input.json` incluyendo el plan de oleadas
   paralelas adaptado al hardware.
3. Mantener una base de datos SQLite local (`content-src/_extract/validacion-masiva/validation_state.db`)
   en modo WAL con bloqueo transaccional (`DB_WRITE_LOCK` + retry exponencial) para soportar
   escrituras paralelas masivas sin errores de bloqueo.
4. Exponer APIs por Tema (`/api/topic/<topic_id>`), Sub-APIs por Sección y endpoints de ejecución
   paralela por oleada (`/api/topic/<topic_id>/extract-wave`, `/api/topic/<topic_id>/pre-compare-wave`,
   `/api/topic/<topic_id>/next-wave`), además de sus equivalentes CLI.
"""

import argparse
import concurrent.futures
import ctypes
import hashlib
import json
import math
import os
import platform
import re
import sqlite3
import sys
import threading
import time
import unicodedata
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any, Callable, Dict, List, Optional, Set, Tuple
from urllib.parse import urlparse

import pymupdf
import yaml

# Configurar salida UTF-8 en consolas Windows (PowerShell / CMD)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Rutas base del repositorio
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
EXTRACT_BASE_DIR = os.path.join(REPO_ROOT, "content-src", "_extract", "validacion-masiva")
DB_DEFAULT_PATH = os.path.join(EXTRACT_BASE_DIR, "validation_state.db")
REPORTS_BASE_DIR = os.path.join(REPO_ROOT, "docs", "agent", "validacion-temario")

# Cerrojo global en memoria para coordinar escrituras multihilo dentro del servidor HTTP
DB_WRITE_LOCK = threading.RLock()

# Expresiones regulares de tokenización técnica (Spec 11 §11.4 + ampliaciones 101/102)
ROMAN_NUMERALS = {
    "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
    "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"
}

KNOWN_ENV_VARS = {
    "PATH", "LANG", "LC_ALL", "LC_CTYPE", "LC_MESSAGES", "LC_TIME", "LC_NUMERIC",
    "LC_COLLATE", "LC_MONETARY", "SHELL", "USER", "LOGNAME", "HOME", "TERM",
    "DISPLAY", "TZ", "HISTSIZE", "HISTFILE", "HISTFILESIZE", "HISTCONTROL",
    "PS1", "PS2", "IFS", "EDITOR", "VISUAL", "MAIL", "HOSTNAME", "PWD", "OLDPWD",
    "UID", "EUID", "PPID", "BASH", "BASH_VERSION", "MANPATH", "LD_LIBRARY_PATH",
    "LD_PRELOAD", "XDG_DATA_DIRS", "XDG_CONFIG_DIRS", "XDG_CURRENT_DESKTOP",
    "XDG_SESSION_TYPE", "WAYLAND_DISPLAY", "XAUTHORITY", "DEBIAN_FRONTEND"
}

CORE_LINUX_COMMANDS = {
    # 101-500 core commands
    "lsmod", "modprobe", "insmod", "rmmod", "modinfo", "depmod", "lspci", "lsusb",
    "lscpu", "lsblk", "lshw", "udevadm", "dmesg", "journalctl", "systemctl",
    "init", "telinit", "runlevel", "shutdown", "reboot", "halt", "poweroff", "wall",
    "fdisk", "gdisk", "parted", "mkfs", "mkswap", "swapon", "swapoff", "mount",
    "umount", "blkid", "lsinitrd", "lsinitramfs", "mkinitrd", "dracut", "update-initramfs",
    "grub-install", "grub-mkconfig", "update-grub", "ldd", "ldconfig", "dpkg",
    "dpkg-reconfigure", "apt", "apt-get", "apt-cache", "apt-file", "aptitude",
    "rpm", "rpm2cpio", "yum", "dnf", "zypper", "uname", "history", "type", "which",
    "whereis", "locate", "updatedb", "find", "xargs", "cat", "tac", "nl", "od",
    "head", "tail", "split", "wc", "sort", "uniq", "cut", "paste", "join", "tr",
    "expand", "unexpand", "fmt", "pr", "less", "more", "grep", "egrep", "fgrep",
    "sed", "awk", "md5sum", "sha1sum", "sha256sum", "sha512sum", "cp", "mv", "rm",
    "mkdir", "rmdir", "touch", "dd", "file", "tar", "cpio", "gzip", "gunzip", "zcat",
    "bzip2", "bunzip2", "bzcat", "xz", "unxz", "xzcat", "tee", "ps", "top", "htop",
    "free", "uptime", "pgrep", "pkill", "kill", "killall", "jobs", "bg", "fg",
    "nohup", "screen", "tmux", "watch", "nice", "renice", "vi", "vim", "nano",
    "fsck", "e2fsck", "mke2fs", "tune2fs", "dumpe2fs", "debugfs", "xfs_repair",
    "xfs_info", "xfs_fsr", "xfs_db", "btrfs", "df", "du", "chmod", "chown", "chgrp",
    "umask", "ln", "stat",
    # 102-500 core commands
    "bash", "sh", "source", "export", "env", "set", "unset", "alias", "unalias",
    "echo", "printf", "read", "test", "seq", "exec", "function", "return", "exit",
    "su", "sudo", "useradd", "usermod", "userdel", "groupadd", "groupmod", "groupdel",
    "passwd", "chage", "getent", "id", "who", "w", "last", "lastb", "crontab",
    "at", "atq", "atrm", "batch", "systemd-run", "locale", "localectl", "iconv",
    "timedatectl", "tzselect", "hwclock", "date", "chronyc", "chronyd", "ntpdate",
    "ntpd", "ntpq", "logger", "logrotate", "sendmail", "mail", "mailq", "newaliases",
    "postqueue", "postsuper", "lpr", "lpq", "lprm", "lp", "lpstat", "cancel",
    "cupsaccept", "cupsreject", "cupsenable", "cupsdisable", "lpadmin", "lpc",
    "ip", "ifconfig", "route", "arp", "ping", "ping6", "traceroute", "traceroute6",
    "tracepath", "tracepath6", "netstat", "ss", "nc", "netcat", "nmcli", "host",
    "dig", "nslookup", "resolvectl", "hostname", "hostnamectl", "ulimit", "fuser",
    "lsof", "ssh", "sshd", "ssh-keygen", "ssh-copy-id", "ssh-add", "ssh-agent",
    "scp", "sftp", "gpg", "gpg2", "gpg-agent", "iptables", "ip6tables", "nft", "ufw"
}

RE_FLAG = re.compile(r"(?<![\w-])--?[A-Za-z0-9][\w-]*(?:=\S+)?")
RE_VAR_SIGIL = re.compile(r"\$([A-Za-z_]\w*|\d+|\?|#|@|\*|!)")
RE_PATH = re.compile(
    r"(?<!<)(?:(?:~|\.{1,2})/[A-Za-z0-9_.\-/{}*~$]+|/(?:etc|bin|sbin|usr|var|proc|sys|dev|boot|home|root|tmp|opt|srv|lib|lib64|run|mnt|media)(?:/[A-Za-z0-9_.\-/{}*~$]*)?)"
)
RE_CONFIG_FILE = re.compile(
    r"\b[\w.\-]+\.(?:conf|cfg|ini|rc|json|yaml|yml|service|socket|target|timer|mount|automount|path|slice|scope|log|pid|rules|allow|deny|default|profile|bashrc|bash_profile|bash_login|bash_logout|local|list|repo|gpg|asc|pub|key)\b"
)
RE_ACRONYM = re.compile(r"\b[A-Z]{2,}[a-z]?\b")


# ============================================================================
# DETECTOR DE HARDWARE Y PLANIFICADOR DINÁMICO DE CONCURRENCIA
# ============================================================================

def detect_hardware_profile() -> Dict[str, Any]:
    """
    Inspecciona los recursos físicos reales de la máquina (CPUs lógicos, RAM total,
    RAM libre disponible y porcentaje de uso de memoria) sin requerir librerías externas.
    """
    logical_cpus = os.cpu_count() or 4
    total_ram_gb = 8.0
    avail_ram_gb = 4.0
    memory_load_pct = 50

    if os.name == "nt":
        try:
            class MEMORYSTATUSEX(ctypes.Structure):
                _fields_ = [
                    ("dwLength", ctypes.c_ulong),
                    ("dwMemoryLoad", ctypes.c_ulong),
                    ("ullTotalPhys", ctypes.c_ulonglong),
                    ("ullAvailPhys", ctypes.c_ulonglong),
                    ("ullTotalPageFile", ctypes.c_ulonglong),
                    ("ullAvailPageFile", ctypes.c_ulonglong),
                    ("ullTotalVirtual", ctypes.c_ulonglong),
                    ("ullAvailVirtual", ctypes.c_ulonglong),
                    ("sullAvailExtendedVirtual", ctypes.c_ulonglong),
                ]

            mem = MEMORYSTATUSEX()
            mem.dwLength = ctypes.sizeof(MEMORYSTATUSEX)
            if ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(mem)):
                total_ram_gb = round(mem.ullTotalPhys / (1024 ** 3), 2)
                avail_ram_gb = round(mem.ullAvailPhys / (1024 ** 3), 2)
                memory_load_pct = int(mem.dwMemoryLoad)
        except Exception:
            pass
    else:
        try:
            if hasattr(os, "sysconf"):
                page_size = os.sysconf("SC_PAGE_SIZE")
                phys_pages = os.sysconf("SC_PHYS_PAGES")
                avail_pages = os.sysconf("SC_AVPHYS_PAGES")
                total_ram_gb = round((page_size * phys_pages) / (1024 ** 3), 2)
                avail_ram_gb = round((page_size * avail_pages) / (1024 ** 3), 2)
                memory_load_pct = int(round((1.0 - (avail_ram_gb / max(total_ram_gb, 0.1))) * 100))
        except Exception:
            pass

    if logical_cpus >= 12 and avail_ram_gb >= 12.0:
        tier = "HIGH_END_WORKSTATION"
    elif logical_cpus >= 6 and avail_ram_gb >= 6.0:
        tier = "MID_RANGE_MULTI_CORE"
    else:
        tier = "CONSERVATIVE_LOW_RAM"

    return {
        "os": f"{platform.system()} {platform.release()}",
        "logical_cpus": logical_cpus,
        "total_ram_gb": total_ram_gb,
        "available_ram_gb": avail_ram_gb,
        "memory_load_pct": memory_load_pct,
        "hardware_tier": tier,
    }


def compute_concurrency_plan(topics_count: int = 4, subtopics_count: int = 23) -> Dict[str, Any]:
    """
    Calcula cuántos hilos Python (`ThreadPoolExecutor`), cuántos Coordinadores de Tema (Capa 2)
    y cuántos Subagentes de Bajo Nivel (Capa 3A y 3B) deben ejecutarse en paralelo según el
    hardware detectado.
    """
    hw = detect_hardware_profile()
    cpus = hw["logical_cpus"]
    avail_gb = hw["available_ram_gb"]

    # 1. Hilos del servidor Python para extracción/comparación paralela con PyMuPDF
    # Reservamos 2 hilos para el SO y acotamos según RAM libre (~300 MB por worker PDF en pico)
    max_by_cpu = max(2, cpus - 2)
    max_by_ram = max(2, int(avail_gb * 2.5))
    python_worker_threads = min(max_by_cpu, max_by_ram, 16)

    # 2. Límite global de subagentes LLM concurrentes (Capa 3A / 3B) para no saturar red/CPU/cuota
    if hw["hardware_tier"] == "HIGH_END_WORKSTATION":
        max_parallel_topics = min(topics_count, 6)  # Todos los temas a la vez (4 en 101; 6 en 102)
        max_global_layer3_agents = 12
    elif hw["hardware_tier"] == "MID_RANGE_MULTI_CORE":
        max_parallel_topics = min(topics_count, 3)
        max_global_layer3_agents = 6
    else:
        max_parallel_topics = min(topics_count, 2)
        max_global_layer3_agents = 4

    # 3. Cuántos subagentes de Capa 3 (o subtemas en paralelo) puede lanzar cada Tema a la vez
    max_layer3_per_topic = max(2, math.floor(max_global_layer3_agents / max(1, max_parallel_topics)))

    # 4. Cuántos subtemas simultáneos por oleada dentro de cada Tema
    subtopics_per_wave_per_topic = max(2, min(max_layer3_per_topic, 4))

    return {
        "hardware": hw,
        "limits": {
            "python_thread_pool_workers": python_worker_threads,
            "max_parallel_layer2_topic_agents": max_parallel_topics,
            "max_global_layer3_subagents": max_global_layer3_agents,
            "max_parallel_layer3_subagents_per_topic": max_layer3_per_topic,
            "subtopics_per_wave_per_topic": subtopics_per_wave_per_topic,
            "sections_per_subtopic_in_parallel": 3,
        },
        "execution_strategy": {
            "mode": "PARALLEL_WAVES_HARDWARE_ADAPTIVE",
            "layer1_instruction": (
                f"Lanza hasta {max_parallel_topics} subagentes `coordinador-tema` (Capa 2) EN PARALELO "
                f"en un mismo turno (tu máquina tiene {cpus} CPUs lógicos y {avail_gb} GB de RAM libre)."
            ),
            "layer2_instruction": (
                f"Dentro de cada Tema, procesa los subtemas en oleadas paralelas de "
                f"{subtopics_per_wave_per_topic} subtemas simultáneos (`next-wave`). "
                f"Para la extracción física del PDF usa `extract-wave-parallel` ({python_worker_threads} hilos CPU) "
                f"o lanza hasta {max_layer3_per_topic} subagentes de Capa 3 en paralelo por turno."
            ),
        },
    }


def chunk_list(items: List[Any], chunk_size: int) -> List[List[Any]]:
    return [items[i : i + chunk_size] for i in range(0, len(items), max(1, chunk_size))]


# ============================================================================
# UTILIDADES DE TEXTO Y TOKENIZACIÓN TÉCNICA
# ============================================================================

def normalize_text(text: str) -> str:
    """Normaliza texto en Unicode NFC y colapsa espacios horizontales."""
    if not text:
        return ""
    nfc = unicodedata.normalize("NFC", text)
    collapsed = re.sub(r"[ \t\u00a0\u202f]+", " ", nfc)
    return collapsed.strip()


def strip_accents_lower(text: str) -> str:
    """Normaliza a minúsculas sin tildes para comparaciones insensibles."""
    if not text:
        return ""
    nfd = unicodedata.normalize("NFD", text.lower().strip())
    return "".join(ch for ch in nfd if unicodedata.category(ch) != "Mn")


_KNOWN_COMMANDS_CACHE: Optional[Set[str]] = None
_RE_KNOWN_COMMANDS_CACHE: Optional[re.Pattern] = None
_GLOBAL_REPO_DATA_CACHE: Optional[Dict[str, Any]] = None
_CACHE_LOCK = threading.Lock()


def load_known_commands_from_repo() -> Set[str]:
    """Carga y cachea en memoria los nombres de comandos existentes en content-src/commands.yaml + set base."""
    global _KNOWN_COMMANDS_CACHE
    if _KNOWN_COMMANDS_CACHE is not None:
        return _KNOWN_COMMANDS_CACHE
    with _CACHE_LOCK:
        if _KNOWN_COMMANDS_CACHE is not None:
            return _KNOWN_COMMANDS_CACHE
        cmds = set(CORE_LINUX_COMMANDS)
        cmd_path = os.path.join(REPO_ROOT, "content-src", "commands.yaml")
        if os.path.exists(cmd_path):
            try:
                with open(cmd_path, "r", encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                    if isinstance(data, list):
                        for item in data:
                            if isinstance(item, dict) and item.get("name"):
                                cmds.add(str(item["name"]).strip())
            except Exception:
                pass
        _KNOWN_COMMANDS_CACHE = cmds
        return cmds


def get_compiled_commands_regex() -> re.Pattern:
    """Compila una única expresión regular C-level para todos los comandos conocidos (~100x más rápido)."""
    global _RE_KNOWN_COMMANDS_CACHE
    if _RE_KNOWN_COMMANDS_CACHE is not None:
        return _RE_KNOWN_COMMANDS_CACHE
    cmds = load_known_commands_from_repo()
    with _CACHE_LOCK:
        if _RE_KNOWN_COMMANDS_CACHE is not None:
            return _RE_KNOWN_COMMANDS_CACHE
        sorted_cmds = sorted(cmds, key=len, reverse=True)
        pattern = r"(?<![\w\-/])(?:" + "|".join(re.escape(c) for c in sorted_cmds) + r")(?![\w\-/])"
        _RE_KNOWN_COMMANDS_CACHE = re.compile(pattern)
        return _RE_KNOWN_COMMANDS_CACHE


def extract_technical_tokens(
    text: str,
    mono_spans: Optional[List[str]] = None,
    bold_spans: Optional[List[str]] = None,
    italic_spans: Optional[List[str]] = None,
    known_commands: Optional[Set[str]] = None,
) -> Dict[str, List[str]]:
    """Extrae tokens técnicos de un bloque o sección con alta precisión y cero coste de LLM."""
    mono_spans = mono_spans or []
    bold_spans = bold_spans or []
    italic_spans = italic_spans or []
    known_commands = known_commands or CORE_LINUX_COMMANDS

    clean = normalize_text(text)

    # 1. Flags / opciones
    flags: Set[str] = set()
    for m in RE_FLAG.finditer(clean):
        fl = re.sub(r"[.,;:'\")\]]+$", "", m.group(0))
        if len(fl) > 1 and fl not in ("--", "-") and not re.match(r"^-\d+$", fl):
            flags.add(fl)

    # 2. Rutas y ficheros de configuración
    paths: Set[str] = set()
    for m in RE_PATH.finditer(clean):
        p = m.group(0).rstrip(".,;:'\")]")
        if len(p) > 2 and not p.startswith("//") and not re.match(r"^/\d+$", p):
            paths.add(p)
    for m in RE_CONFIG_FILE.finditer(clean):
        cf = m.group(0).rstrip(".,;:'\")]")
        paths.add(cf)

    # 3. Variables de entorno y parámetros especiales
    variables: Set[str] = set()
    for m in RE_VAR_SIGIL.finditer(clean):
        variables.add(m.group(0))
    for word in re.findall(r"\b[A-Z][A-Z0-9_]{2,}\b", clean):
        if word in KNOWN_ENV_VARS:
            variables.add(word)

    # 4. Comandos (búsqueda vectorizada con un único regex precompilado)
    commands: Set[str] = set()
    cmd_regex = get_compiled_commands_regex()
    for m_cmd in cmd_regex.finditer(clean):
        commands.add(m_cmd.group(0))
    for ms in mono_spans:
        ms_clean = normalize_text(ms)
        parts = ms_clean.split()
        if parts:
            has_prompt = parts[0] in ("$", "#") and len(parts) > 1
            first_word = parts[1] if has_prompt else parts[0].lstrip("$#>")
            if first_word in known_commands:
                commands.add(first_word)
            elif has_prompt and re.match(r"^[a-z][a-z0-9_-]{1,16}$", first_word):
                commands.add(first_word)

    # 5. Términos destacados (negrita/cursiva)
    terms: Set[str] = set()
    for sp in bold_spans + italic_spans:
        sp_clean = normalize_text(sp).strip(".,:;()\"'")
        if 2 <= len(sp_clean) <= 65 and not sp_clean.lower().startswith(("figura", "figure", "tabla", "table", "lección", "tema")):
            terms.add(sp_clean)

    # 6. Siglas / Acrónimos
    acronyms: Set[str] = set()
    for m in RE_ACRONYM.finditer(clean):
        acr = m.group(0)
        if acr not in ROMAN_NUMERALS and acr not in {"LPIC", "LPI", "NOTE", "NOTA", "TIP", "GNU"}:
            acronyms.add(acr)

    return {
        "commands": sorted(commands),
        "flags": sorted(flags),
        "paths": sorted(paths),
        "vars": sorted(variables),
        "terms": sorted(terms),
        "acronyms": sorted(acronyms),
    }


# ============================================================================
# CAPA DE PERSISTENCIA SQLITE CON BLOQUEO CONCURRENTE Y RETRY EXPONENCIAL
# ============================================================================

def get_db_connection(db_path: str = DB_DEFAULT_PATH) -> sqlite3.Connection:
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path, timeout=45.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA busy_timeout=45000;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


def run_db_write_transaction(db_path: str, fn: Callable[[sqlite3.Connection], Any]) -> Any:
    """
    Ejecuta una transacción de escritura en SQLite protegida por `DB_WRITE_LOCK` y
    reintentos automáticos con backoff para soportar múltiples subagentes e hilos en paralelo.
    """
    max_retries = 8
    for attempt in range(max_retries):
        with DB_WRITE_LOCK:
            conn = get_db_connection(db_path)
            try:
                res = fn(conn)
                conn.commit()
                return res
            except sqlite3.OperationalError as exc:
                conn.rollback()
                if "locked" in str(exc).lower() and attempt < max_retries - 1:
                    time.sleep(0.08 * (attempt + 1))
                    continue
                raise
            finally:
                conn.close()


def init_database_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS pdf_runs (
            exam_id TEXT PRIMARY KEY,
            pdf_path TEXT NOT NULL,
            total_pages INTEGER NOT NULL,
            curriculum_start_page INTEGER NOT NULL,
            curriculum_end_page INTEGER NOT NULL,
            topics_count INTEGER NOT NULL,
            subtopics_count INTEGER NOT NULL,
            sections_count INTEGER NOT NULL,
            structure_json_path TEXT NOT NULL,
            concurrency_plan_json TEXT DEFAULT NULL,
            status TEXT NOT NULL DEFAULT 'INITIALIZED',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS topics (
            topic_id TEXT PRIMARY KEY,
            exam_id TEXT NOT NULL,
            title TEXT NOT NULL,
            start_page INTEGER NOT NULL,
            end_page INTEGER NOT NULL,
            subtopics_count INTEGER NOT NULL,
            waves_count INTEGER NOT NULL DEFAULT 1,
            api_endpoint TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'PENDING',
            updated_at TEXT NOT NULL,
            FOREIGN KEY (exam_id) REFERENCES pdf_runs(exam_id)
        );

        CREATE TABLE IF NOT EXISTS subtopics (
            subtopic_id TEXT PRIMARY KEY,
            exam_id TEXT NOT NULL,
            topic_id TEXT NOT NULL,
            wave_index INTEGER NOT NULL DEFAULT 1,
            title TEXT NOT NULL,
            weight INTEGER DEFAULT 0,
            start_page INTEGER NOT NULL,
            end_page INTEGER NOT NULL,
            lessons_count INTEGER NOT NULL DEFAULT 1,
            extraction_status TEXT NOT NULL DEFAULT 'PENDING',
            comparison_status TEXT NOT NULL DEFAULT 'PENDING',
            score_total REAL DEFAULT NULL,
            verdict TEXT DEFAULT NULL,
            report_json_path TEXT DEFAULT NULL,
            report_md_path TEXT DEFAULT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (topic_id) REFERENCES topics(topic_id)
        );

        CREATE TABLE IF NOT EXISTS sections (
            section_id TEXT PRIMARY KEY,
            exam_id TEXT NOT NULL,
            topic_id TEXT NOT NULL,
            subtopic_id TEXT NOT NULL,
            section_slug TEXT NOT NULL,
            section_kind TEXT NOT NULL,
            title TEXT NOT NULL,
            start_page INTEGER NOT NULL,
            end_page INTEGER NOT NULL,
            api_endpoint TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'PENDING',
            extracted_json_path TEXT DEFAULT NULL,
            units_count INTEGER DEFAULT 0,
            commands_count INTEGER DEFAULT 0,
            terms_count INTEGER DEFAULT 0,
            exercises_count INTEGER DEFAULT 0,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (subtopic_id) REFERENCES subtopics(subtopic_id)
        );

        CREATE TABLE IF NOT EXISTS page_ledger (
            exam_id TEXT NOT NULL,
            page_number INTEGER NOT NULL,
            page_role TEXT NOT NULL,
            topic_id TEXT DEFAULT NULL,
            subtopic_id TEXT DEFAULT NULL,
            char_count INTEGER NOT NULL DEFAULT 0,
            extracted_status TEXT NOT NULL DEFAULT 'PENDING',
            updated_at TEXT NOT NULL,
            PRIMARY KEY (exam_id, page_number)
        );

        CREATE TABLE IF NOT EXISTS validation_reports (
            subtopic_id TEXT PRIMARY KEY,
            exam_id TEXT NOT NULL,
            topic_id TEXT NOT NULL,
            score_total REAL NOT NULL,
            score_commands REAL NOT NULL,
            score_definitions REAL NOT NULL,
            score_theory REAL NOT NULL,
            score_exercises REAL NOT NULL,
            verdict TEXT NOT NULL,
            missing_items_count INTEGER NOT NULL DEFAULT 0,
            extra_items_count INTEGER NOT NULL DEFAULT 0,
            distorted_items_count INTEGER NOT NULL DEFAULT 0,
            summary_text TEXT NOT NULL,
            report_json TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        """
    )
    # Migración suave por si la tabla existía antes de añadir columnas de oleadas
    try:
        conn.execute("ALTER TABLE pdf_runs ADD COLUMN concurrency_plan_json TEXT DEFAULT NULL;")
    except sqlite3.OperationalError:
        pass
    try:
        conn.execute("ALTER TABLE topics ADD COLUMN waves_count INTEGER NOT NULL DEFAULT 1;")
    except sqlite3.OperationalError:
        pass
    try:
        conn.execute("ALTER TABLE subtopics ADD COLUMN wave_index INTEGER NOT NULL DEFAULT 1;")
    except sqlite3.OperationalError:
        pass
    conn.commit()


# ============================================================================
# DESCUBRIMIENTO DE ESTRUCTURA DEL PDF + PLANIFICACIÓN DE OLEADAS PARALELAS
# ============================================================================

def detect_exam_id_from_pdf(pdf_path: str, doc: pymupdf.Document) -> str:
    bname = os.path.basename(pdf_path)
    if "101" in bname:
        return "101-500"
    if "102" in bname:
        return "102-500"
    toc = doc.get_toc()
    for _, title, _ in toc[:10]:
        if "101" in title:
            return "101-500"
        if "102" in title:
            return "102-500"
    return "lpic1-custom"


def analyze_pdf_structure(pdf_path: str, db_path: str = DB_DEFAULT_PATH) -> Dict[str, Any]:
    """
    Inspecciona el PDF completo (~600 páginas), detecta el hardware de la máquina, calcula
    el plan de concurrencia y divide los subtemas de cada Tema en oleadas paralelas (`execution_waves`),
    guardando `structure-input.json` y poblando SQLite.
    """
    abs_pdf = os.path.abspath(pdf_path)
    if not os.path.exists(abs_pdf):
        raise FileNotFoundError(f"No existe el PDF en la ruta: {abs_pdf}")

    doc = pymupdf.open(abs_pdf)
    total_pages = len(doc)
    exam_id = detect_exam_id_from_pdf(abs_pdf, doc)
    toc = doc.get_toc()
    now_iso = datetime.now(timezone.utc).isoformat()

    # 1. Identificar Temas (Nivel 1: "Tema 101: ...") y Pie de imprenta
    raw_topics: List[Dict[str, Any]] = []
    imprint_page = total_pages
    for lvl, title, pno in toc:
        clean_t = normalize_text(title)
        if "Pie de imprenta" in clean_t or "Imprint" in clean_t:
            imprint_page = min(imprint_page, pno)
        if lvl == 1:
            m_top = re.match(r"^Tema\s+(\d{3})\s*:\s*(.+)$", clean_t, re.IGNORECASE)
            if m_top:
                raw_topics.append({
                    "topic_id": m_top.group(1),
                    "title": m_top.group(2).strip(),
                    "full_title": clean_t,
                    "start_page": pno,
                })

    curriculum_end_page = imprint_page - 1 if imprint_page > 1 else total_pages
    for i, t in enumerate(raw_topics):
        if i + 1 < len(raw_topics):
            t["end_page"] = raw_topics[i + 1]["start_page"] - 1
        else:
            t["end_page"] = curriculum_end_page

    # 2. Identificar Subtemas (Nivel 2: "101.1 ...", excluyendo "101.2 Lección 1")
    raw_subtopics: List[Dict[str, Any]] = []
    for lvl, title, pno in toc:
        clean_t = normalize_text(title)
        if lvl == 2:
            m_sub = re.match(r"^(\d{3}\.\d+)\s+(?!Lecci[oó]n\b)(.+)$", clean_t, re.IGNORECASE)
            if m_sub:
                sid = m_sub.group(1)
                stitle = m_sub.group(2).strip()
                topic_id = sid.split(".")[0]
                raw_subtopics.append({
                    "subtopic_id": sid,
                    "topic_id": topic_id,
                    "title": stitle,
                    "toc_start_page": pno,
                })

    # Calcular plan de concurrencia adaptado al hardware real de la máquina
    concurrency_plan = compute_concurrency_plan(len(raw_topics), len(raw_subtopics))
    wave_size = concurrency_plan["limits"]["subtopics_per_wave_per_topic"]

    topic_starts_by_id = {t["topic_id"]: t["start_page"] for t in raw_topics}
    topic_ends_by_id = {t["topic_id"]: t["end_page"] for t in raw_topics}

    for i, st in enumerate(raw_subtopics):
        tid = st["topic_id"]
        start_p = st["toc_start_page"]
        if i == 0 or raw_subtopics[i - 1]["topic_id"] != tid:
            t_start = topic_starts_by_id.get(tid, start_p)
            st["topic_cover_page"] = t_start if t_start < start_p else None
            st["start_page"] = start_p
        else:
            st["topic_cover_page"] = None
            st["start_page"] = start_p

        if i + 1 < len(raw_subtopics):
            next_st = raw_subtopics[i + 1]
            if next_st["topic_id"] != tid:
                st["end_page"] = topic_ends_by_id.get(tid, next_st["toc_start_page"] - 1)
            else:
                st["end_page"] = next_st["toc_start_page"] - 1
        else:
            st["end_page"] = curriculum_end_page

    # 3. Dentro de cada Tema, organizar Subtemas en Oleadas Paralelas (`execution_waves`)
    structured_topics: List[Dict[str, Any]] = []
    all_sections_db: List[Dict[str, Any]] = []

    for t in raw_topics:
        tid = t["topic_id"]
        t_subtopics = [s for s in raw_subtopics if s["topic_id"] == tid]
        subtopics_out: List[Dict[str, Any]] = []

        # Dividir los subtemas de este tema en oleadas de tamaño `wave_size`
        waves_chunks = chunk_list([s["subtopic_id"] for s in t_subtopics], wave_size)
        subtopic_to_wave: Dict[str, int] = {}
        for w_idx, w_list in enumerate(waves_chunks, start=1):
            for sid_item in w_list:
                subtopic_to_wave[sid_item] = w_idx

        for st in t_subtopics:
            sid = st["subtopic_id"]
            sp, ep = st["start_page"], st["end_page"]
            w_idx = subtopic_to_wave[sid]

            intro_text = doc[sp - 1].get_text("text")
            m_weight = re.search(r"Importancia\s*[:\n]\s*(\d+)", intro_text, re.IGNORECASE)
            weight = int(m_weight.group(1)) if m_weight else 0

            sub_toc = [
                {"level": lvl, "title": normalize_text(title), "page": pno}
                for lvl, title, pno in toc
                if sp <= pno <= ep and normalize_text(title) != f"{sid} {st['title']}"
            ]

            lesson_markers = [
                entry for entry in sub_toc
                if re.search(r"Lecci[oó]n\s+\d+", entry["title"], re.IGNORECASE)
            ]
            lessons_count = max(1, len(lesson_markers))
            first_lesson_page = lesson_markers[0]["page"] if lesson_markers else min(sp + 1, ep)
            intro_end_page = max(sp, first_lesson_page - 1)

            guided_pages = [
                e["page"] for e in sub_toc
                if any(k in e["title"].lower() for k in ("ejercicios guiados", "ejercicios exploratorios", "ejercicios de exploraci", "respuestas a"))
            ]
            theory_pages = [
                e["page"] for e in sub_toc
                if any(k in e["title"].lower() for k in ("introducción", "introduccion", "lección", "leccion"))
            ]

            sections_for_subtopic = [
                {
                    "section_id": f"{sid}#metadatos_y_resumen",
                    "section_slug": "metadatos_y_resumen",
                    "section_kind": "metadata_summary",
                    "title": f"{sid} · Portada de Objetivo, Áreas Clave, Archivos/Términos y Resumen",
                    "start_page": sp,
                    "end_page": ep,
                    "focus_pages": sorted(set([sp, intro_end_page] + [e["page"] for e in sub_toc if "resumen" in e["title"].lower()])),
                    "api_endpoint": f"/api/topic/{tid}/subtopic/{sid}/section/metadatos_y_resumen",
                },
                {
                    "section_id": f"{sid}#teoria_lecciones",
                    "section_slug": "teoria_lecciones",
                    "section_kind": "theory",
                    "title": f"{sid} · Desarrollo Teórico, Comandos, Opciones y Definiciones ({lessons_count} lección/es)",
                    "start_page": first_lesson_page,
                    "end_page": ep,
                    "focus_pages": sorted(set(theory_pages)) if theory_pages else list(range(first_lesson_page, ep + 1)),
                    "api_endpoint": f"/api/topic/{tid}/subtopic/{sid}/section/teoria_lecciones",
                },
                {
                    "section_id": f"{sid}#ejercicios_y_respuestas",
                    "section_slug": "ejercicios_y_respuestas",
                    "section_kind": "exercises",
                    "title": f"{sid} · Ejercicios Guiados, Exploratorios y Respuestas Oficiales",
                    "start_page": min(guided_pages) if guided_pages else first_lesson_page,
                    "end_page": ep,
                    "focus_pages": sorted(set(guided_pages)),
                    "api_endpoint": f"/api/topic/{tid}/subtopic/{sid}/section/ejercicios_y_respuestas",
                },
            ]

            for sec in sections_for_subtopic:
                all_sections_db.append({
                    **sec,
                    "exam_id": exam_id,
                    "topic_id": tid,
                    "subtopic_id": sid,
                })

            subtopics_out.append({
                "subtopic_id": sid,
                "topic_id": tid,
                "wave_index": w_idx,
                "title": st["title"],
                "weight": weight,
                "start_page": sp,
                "end_page": ep,
                "pages_count": ep - sp + 1,
                "lessons_count": lessons_count,
                "toc_entries": sub_toc,
                "sub_apis": {
                    "manifest": f"/api/topic/{tid}/subtopic/{sid}",
                    "sections": {s["section_slug"]: s["api_endpoint"] for s in sections_for_subtopic},
                    "pre_compare": f"/api/topic/{tid}/subtopic/{sid}/pre-compare",
                    "save_comparison": f"/api/topic/{tid}/subtopic/{sid}/save-comparison",
                },
                "sections": sections_for_subtopic,
            })

        structured_topics.append({
            "topic_id": tid,
            "exam_id": exam_id,
            "title": t["title"],
            "full_title": t["full_title"],
            "start_page": t["start_page"],
            "end_page": t["end_page"],
            "subtopics_count": len(subtopics_out),
            "waves_count": len(waves_chunks),
            "parallel_execution_waves": [
                {"wave_index": idx, "subtopics_in_parallel": chunk}
                for idx, chunk in enumerate(waves_chunks, start=1)
            ],
            "topic_api_base": f"/api/topic/{tid}",
            "topic_parallel_apis": {
                "next_wave": f"/api/topic/{tid}/next-wave",
                "extract_wave": f"/api/topic/{tid}/extract-wave",
                "pre_compare_wave": f"/api/topic/{tid}/pre-compare-wave",
            },
            "subtopics": subtopics_out,
        })

    # Organizar también las oleadas de Temas (Capa 2) según `max_parallel_layer2_topic_agents`
    topic_waves = chunk_list(
        [t["topic_id"] for t in structured_topics],
        concurrency_plan["limits"]["max_parallel_layer2_topic_agents"],
    )
    concurrency_plan["topic_waves_for_layer1"] = [
        {"topic_wave_index": idx, "topics_in_parallel": ch}
        for idx, ch in enumerate(topic_waves, start=1)
    ]

    # 4. Guardar `structure-input.json`
    exam_extract_dir = os.path.join(EXTRACT_BASE_DIR, exam_id)
    os.makedirs(exam_extract_dir, exist_ok=True)
    structure_json_path = os.path.join(exam_extract_dir, "structure-input.json")

    curriculum_start_page = raw_topics[0]["start_page"] if raw_topics else 1
    structure_payload = {
        "exam_id": exam_id,
        "pdf_path": os.path.relpath(abs_pdf, REPO_ROOT).replace("\\", "/"),
        "total_pages": total_pages,
        "curriculum_pages_range": {"start": curriculum_start_page, "end": curriculum_end_page},
        "topics_count": len(structured_topics),
        "subtopics_count": len(raw_subtopics),
        "sections_count": len(all_sections_db),
        "generated_at": now_iso,
        "concurrency_plan": concurrency_plan,
        "server_apis": {
            "hardware_plan": "/api/hardware-plan",
            "exam_progress": f"/api/exam/{exam_id}/progress",
            "exam_structure": f"/api/exam/{exam_id}/structure",
            "topic_apis": {t["topic_id"]: t["topic_api_base"] for t in structured_topics},
        },
        "topics": structured_topics,
    }

    with open(structure_json_path, "w", encoding="utf-8") as f:
        json.dump(structure_payload, f, ensure_ascii=False, indent=2)

    # 5. Poblar SQLite dentro de transacción protegida
    def _populate_db(conn: sqlite3.Connection) -> None:
        init_database_schema(conn)
        conn.execute(
            """
            INSERT INTO pdf_runs (
                exam_id, pdf_path, total_pages, curriculum_start_page, curriculum_end_page,
                topics_count, subtopics_count, sections_count, structure_json_path,
                concurrency_plan_json, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'IN_PROGRESS', ?, ?)
            ON CONFLICT(exam_id) DO UPDATE SET
                pdf_path=excluded.pdf_path,
                total_pages=excluded.total_pages,
                curriculum_start_page=excluded.curriculum_start_page,
                curriculum_end_page=excluded.curriculum_end_page,
                topics_count=excluded.topics_count,
                subtopics_count=excluded.subtopics_count,
                sections_count=excluded.sections_count,
                structure_json_path=excluded.structure_json_path,
                concurrency_plan_json=excluded.concurrency_plan_json,
                updated_at=excluded.updated_at;
            """,
            (
                exam_id,
                os.path.relpath(abs_pdf, REPO_ROOT).replace("\\", "/"),
                total_pages,
                curriculum_start_page,
                curriculum_end_page,
                len(structured_topics),
                len(raw_subtopics),
                len(all_sections_db),
                os.path.relpath(structure_json_path, REPO_ROOT).replace("\\", "/"),
                json.dumps(concurrency_plan, ensure_ascii=False),
                now_iso,
                now_iso,
            ),
        )

        for t in structured_topics:
            conn.execute(
                """
                INSERT INTO topics (topic_id, exam_id, title, start_page, end_page, subtopics_count, waves_count, api_endpoint, status, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
                ON CONFLICT(topic_id) DO UPDATE SET
                    title=excluded.title,
                    start_page=excluded.start_page,
                    end_page=excluded.end_page,
                    subtopics_count=excluded.subtopics_count,
                    waves_count=excluded.waves_count,
                    api_endpoint=excluded.api_endpoint,
                    updated_at=excluded.updated_at;
                """,
                (
                    t["topic_id"],
                    exam_id,
                    t["title"],
                    t["start_page"],
                    t["end_page"],
                    t["subtopics_count"],
                    t["waves_count"],
                    t["topic_api_base"],
                    now_iso,
                ),
            )
            for st in t["subtopics"]:
                conn.execute(
                    """
                    INSERT INTO subtopics (
                        subtopic_id, exam_id, topic_id, wave_index, title, weight, start_page, end_page,
                        lessons_count, extraction_status, comparison_status, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'PENDING', ?)
                    ON CONFLICT(subtopic_id) DO UPDATE SET
                        wave_index=excluded.wave_index,
                        title=excluded.title,
                        weight=excluded.weight,
                        start_page=excluded.start_page,
                        end_page=excluded.end_page,
                        lessons_count=excluded.lessons_count,
                        updated_at=excluded.updated_at;
                    """,
                    (
                        st["subtopic_id"],
                        exam_id,
                        t["topic_id"],
                        st["wave_index"],
                        st["title"],
                        st["weight"],
                        st["start_page"],
                        st["end_page"],
                        st["lessons_count"],
                        now_iso,
                    ),
                )

        for sec in all_sections_db:
            conn.execute(
                """
                INSERT INTO sections (
                    section_id, exam_id, topic_id, subtopic_id, section_slug, section_kind,
                    title, start_page, end_page, api_endpoint, status, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
                ON CONFLICT(section_id) DO UPDATE SET
                    title=excluded.title,
                    start_page=excluded.start_page,
                    end_page=excluded.end_page,
                    api_endpoint=excluded.api_endpoint,
                    updated_at=excluded.updated_at;
                """,
                (
                    sec["section_id"],
                    sec["exam_id"],
                    sec["topic_id"],
                    sec["subtopic_id"],
                    sec["section_slug"],
                    sec["section_kind"],
                    sec["title"],
                    sec["start_page"],
                    sec["end_page"],
                    sec["api_endpoint"],
                    now_iso,
                ),
            )

        page_to_subtopic: Dict[int, Tuple[str, str]] = {}
        topic_cover_pages: Dict[int, str] = {}
        for t in structured_topics:
            topic_cover_pages[t["start_page"]] = t["topic_id"]
            for st in t["subtopics"]:
                for p in range(st["start_page"], st["end_page"] + 1):
                    page_to_subtopic[p] = (t["topic_id"], st["subtopic_id"])

        for pno in range(1, total_pages + 1):
            txt = doc[pno - 1].get_text("text")
            char_len = len(txt.strip())
            if pno < curriculum_start_page:
                role = "FRONT_MATTER"
                tid, sid = None, None
                ext_status = "EXEMPT_FRONT_MATTER"
            elif pno > curriculum_end_page:
                role = "IMPRINT"
                tid, sid = None, None
                ext_status = "EXEMPT_IMPRINT"
            elif pno in topic_cover_pages and pno not in page_to_subtopic:
                role = "TOPIC_COVER"
                tid, sid = topic_cover_pages[pno], None
                ext_status = "EXEMPT_TOPIC_COVER"
            else:
                role = "CURRICULUM"
                tid, sid = page_to_subtopic.get(pno, (None, None))
                ext_status = "PENDING"

            conn.execute(
                """
                INSERT INTO page_ledger (exam_id, page_number, page_role, topic_id, subtopic_id, char_count, extracted_status, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(exam_id, page_number) DO UPDATE SET
                    page_role=excluded.page_role,
                    topic_id=excluded.topic_id,
                    subtopic_id=excluded.subtopic_id,
                    char_count=excluded.char_count,
                    updated_at=excluded.updated_at;
                """,
                (exam_id, pno, role, tid, sid, char_len, ext_status, now_iso),
            )

    run_db_write_transaction(db_path, _populate_db)
    doc.close()
    return structure_payload


# ============================================================================
# EXTRACCIÓN EXACTA POR SUB-API DE SECCIÓN Y EN PARALELO MULTI-HILO (CAPA 3A)
# ============================================================================

def classify_pdf_block(
    norm_text: str,
    first_font: str,
    first_size: float,
    current_section: str,
    is_intro_page: bool,
    active_intro_mode: Optional[str],
    is_code_block: bool,
) -> str:
    """Clasifica cada bloque tipográfico del PDF en una categoría semántica."""
    if is_intro_page:
        if active_intro_mode == "key-knowledge":
            return "key-knowledge"
        if active_intro_mode == "key-files":
            return "key-files"

    if first_size >= 22.0 or (first_size >= 17.5 and "Bold" in first_font):
        return "heading-major"
    if first_size >= 12.8 and "Bold" in first_font:
        return "heading-sub"

    if norm_text.startswith(("NOTE\n", "NOTA\n", "WARNING\n", "ADVERTENCIA\n", "TIP\n", "CONSEJO\n", "IMPORTANTE\n")):
        return "callout"

    if is_code_block:
        return "code"

    sec_lower = current_section.lower()
    if "ejercicios guiados" in sec_lower and "respuesta" not in sec_lower:
        return "exercise-guided"
    if ("ejercicios exploratorios" in sec_lower or "ejercicios de exploraci" in sec_lower) and "respuesta" not in sec_lower:
        return "exercise-explor"
    if "resumen" in sec_lower:
        return "summary"
    if "respuesta" in sec_lower and "guiados" in sec_lower:
        return "answer-guided"
    if "respuesta" in sec_lower and "explor" in sec_lower:
        return "answer-explor"

    if norm_text.startswith(("•", "-", "*", "1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.")):
        return "list-item"

    return "paragraph"


def extract_subtopic_section(
    exam_id: str,
    subtopic_id: str,
    section_slug: str,
    db_path: str = DB_DEFAULT_PATH,
) -> Dict[str, Any]:
    """
    Extrae de forma determinista con PyMuPDF únicamente la sección solicitada (`metadatos_y_resumen`,
    `teoria_lecciones`, o `ejercicios_y_respuestas`). Cada invocación abre su propio descriptor de
    `pymupdf.Document` independiente para permitir paralelismo real en `ThreadPoolExecutor`.
    """
    conn_ro = get_db_connection(db_path)
    run_row = conn_ro.execute("SELECT * FROM pdf_runs WHERE exam_id = ?", (exam_id,)).fetchone()
    st_row = conn_ro.execute(
        "SELECT * FROM subtopics WHERE exam_id = ? AND subtopic_id = ?", (exam_id, subtopic_id)
    ).fetchone()
    sec_id = f"{subtopic_id}#{section_slug}"
    sec_row = conn_ro.execute("SELECT * FROM sections WHERE section_id = ?", (sec_id,)).fetchone()
    conn_ro.close()

    if not run_row:
        raise ValueError(f"El examen '{exam_id}' no está inicializado en la BBDD. Ejecuta primero `init`.")
    if not st_row:
        raise ValueError(f"No existe el subtema '{subtopic_id}' en el examen '{exam_id}'.")
    if not sec_row:
        raise ValueError(f"No existe la sección '{section_slug}' para el subtema '{subtopic_id}'.")

    pdf_abs = os.path.join(REPO_ROOT, run_row["pdf_path"])
    doc = pymupdf.open(pdf_abs)
    known_commands = load_known_commands_from_repo()

    sp, ep = int(st_row["start_page"]), int(st_row["end_page"])
    current_lesson = "Lección 1"
    current_section = "Portada de Objetivo"
    active_intro_mode: Optional[str] = None

    key_knowledge_areas: List[str] = []
    partial_files_terms: List[str] = []
    summaries: List[Dict[str, Any]] = []
    theory_blocks: List[Dict[str, Any]] = []
    definitions_candidates: List[Dict[str, Any]] = []
    code_and_commands_blocks: List[Dict[str, Any]] = []
    guided_exercises: List[Dict[str, Any]] = []
    exploratory_exercises: List[Dict[str, Any]] = []
    guided_answers: List[Dict[str, Any]] = []
    exploratory_answers: List[Dict[str, Any]] = []

    agg_tokens: Dict[str, Set[str]] = {
        "commands": set(),
        "flags": set(),
        "paths": set(),
        "vars": set(),
        "terms": set(),
        "acronyms": set(),
    }

    pages_touched: Set[int] = set()
    unit_idx = 0

    for pno in range(sp, ep + 1):
        page = doc[pno - 1]
        pdict = page.get_text("dict")
        is_intro_page = pno in (sp, sp + 1) and current_section == "Portada de Objetivo"

        for block in pdict.get("blocks", []):
            if block.get("type") != 0:
                continue
            lines = block.get("lines", [])
            if not lines:
                continue

            bbox = block.get("bbox", [0, 0, 0, 0])
            if bbox[1] < 40 or bbox[1] > 790:
                continue

            block_lines_text: List[str] = []
            mono_spans: List[str] = []
            bold_spans: List[str] = []
            italic_spans: List[str] = []
            total_len = 0
            mono_len = 0
            first_font = ""
            first_size = 0.0

            for l in lines:
                parts: List[str] = []
                for s in l.get("spans", []):
                    stxt = s.get("text", "")
                    sfont = s.get("font", "")
                    ssize = round(float(s.get("size", 0.0)), 1)
                    sflags = int(s.get("flags", 0))

                    if not first_font and stxt.strip():
                        first_font = sfont
                        first_size = ssize

                    parts.append(stxt)
                    slen = len(stxt)
                    total_len += slen

                    is_mono = "Mono" in sfont or "Courier" in sfont
                    is_bold = "Bold" in sfont or (sflags & 16 != 0)
                    is_italic = "Italic" in sfont or (sflags & 2 != 0)

                    if is_mono:
                        mono_spans.append(stxt)
                        mono_len += slen
                    if is_bold and not is_mono:
                        bold_spans.append(stxt)
                    if is_italic and not is_mono:
                        italic_spans.append(stxt)

                block_lines_text.append("".join(parts))

            raw_text = "\n".join(block_lines_text)
            norm_text = normalize_text(raw_text)
            if not norm_text:
                continue
            if (
                norm_text in ("Licencia Creative Commons — CC BY-NC-ND 4.0", "versión 5.0", "Linux Professional Institute")
                or "learning.lpi.org" in norm_text.lower()
                or "cc by-nc-nd" in norm_text.lower()
            ):
                continue
            if (
                re.match(r"^Página\s+\d+$", norm_text, re.IGNORECASE)
                or re.match(r"^\d+$", norm_text)
                or re.match(r"^\|\s*\d+$|^\d+\s*\|$", norm_text)
            ):
                continue

            if first_size >= 22.0:
                m_les = re.search(r"Lecci[oó]n\s+(\d+)", norm_text, re.IGNORECASE)
                if m_les:
                    current_lesson = f"Lección {m_les.group(1)}"
                current_section = norm_text
                active_intro_mode = None
            elif first_size >= 17.5 and "Bold" in first_font:
                current_section = norm_text
                active_intro_mode = None
            elif is_intro_page:
                if "áreas de conocimiento clave" in norm_text.lower() or "areas de conocimiento clave" in norm_text.lower():
                    active_intro_mode = "key-knowledge"
                    continue
                if "lista parcial de archivos" in norm_text.lower():
                    active_intro_mode = "key-files"
                    continue
                if norm_text.lower().startswith(("referencia al objetivo", "importancia")):
                    continue

            is_code_block = (total_len > 0 and (mono_len / total_len) > 0.72) or (first_size <= 9.5 and "Mono" in first_font)
            kind = classify_pdf_block(
                norm_text, first_font, first_size, current_section, is_intro_page, active_intro_mode, is_code_block
            )

            belongs_to_section = False
            if section_slug == "metadatos_y_resumen":
                belongs_to_section = kind in ("key-knowledge", "key-files", "summary") or (is_intro_page and kind == "paragraph")
            elif section_slug == "teoria_lecciones":
                belongs_to_section = kind in ("heading-major", "heading-sub", "paragraph", "list-item", "code", "callout") and not is_intro_page
            elif section_slug == "ejercicios_y_respuestas":
                belongs_to_section = kind in ("exercise-guided", "exercise-explor", "answer-guided", "answer-explor")
                sec_l = current_section.lower()
                if any(w in sec_l for w in ("ejercicios guiados", "ejercicios exploratorios", "ejercicios de exploraci", "respuestas a")):
                    belongs_to_section = True
            if section_slug == "teoria_lecciones":
                sec_l = current_section.lower()
                if any(w in sec_l for w in ("ejercicios guiados", "ejercicios exploratorios", "ejercicios de exploraci", "respuestas a", "resumen")):
                    belongs_to_section = False

            if not belongs_to_section:
                continue

            pages_touched.add(pno)
            unit_idx += 1
            effective_bold = [] if kind in ("heading-major", "heading-sub") else bold_spans
            effective_italic = [] if kind in ("heading-major", "heading-sub") else italic_spans
            tokens = extract_technical_tokens(norm_text, mono_spans, effective_bold, effective_italic, known_commands)
            for k, v in tokens.items():
                agg_tokens[k].update(v)

            item_record = {
                "unit_id": f"{subtopic_id}#{section_slug[:3]}-{unit_idx:03d}",
                "page": pno,
                "lesson": current_lesson,
                "section": current_section,
                "kind": kind,
                "text": norm_text,
                "tokens": {k: v for k, v in tokens.items() if v},
            }

            if kind == "key-knowledge":
                for line in [l.strip("•-* \t") for l in raw_text.splitlines() if l.strip("•-* \t")]:
                    key_knowledge_areas.append(normalize_text(line))
            elif kind == "key-files":
                for line in [l.strip("•-* \t") for l in raw_text.splitlines() if l.strip("•-* \t")]:
                    partial_files_terms.append(normalize_text(line))
            elif kind == "summary":
                summaries.append(item_record)
            elif kind == "exercise-guided" or ("ejercicios guiados" in current_section.lower() and "respuesta" not in current_section.lower()):
                guided_exercises.append(item_record)
            elif kind == "exercise-explor" or (("ejercicios exploratorios" in current_section.lower() or "ejercicios de exploraci" in current_section.lower()) and "respuesta" not in current_section.lower()):
                exploratory_exercises.append(item_record)
            elif kind == "answer-guided" or ("respuesta" in current_section.lower() and "guiados" in current_section.lower()):
                guided_answers.append(item_record)
            elif kind == "answer-explor" or ("respuesta" in current_section.lower() and "explor" in current_section.lower()):
                exploratory_answers.append(item_record)
            else:
                theory_blocks.append(item_record)
                if kind == "code" or tokens["commands"] or tokens["flags"]:
                    code_and_commands_blocks.append({
                        "page": pno,
                        "section": current_section,
                        "commands": tokens["commands"],
                        "flags": tokens["flags"],
                        "paths": tokens["paths"],
                        "text": norm_text,
                    })
                if tokens["terms"] or tokens["acronyms"]:
                    definitions_candidates.append({
                        "page": pno,
                        "section": current_section,
                        "terms": tokens["terms"],
                        "acronyms": tokens["acronyms"],
                        "context": norm_text,
                    })

    doc.close()

    structured_section = {
        "exam_id": exam_id,
        "topic_id": st_row["topic_id"],
        "subtopic_id": subtopic_id,
        "subtopic_title": st_row["title"],
        "section_slug": section_slug,
        "pages_range": {"start": sp, "end": ep},
        "pages_with_content": sorted(pages_touched),
        "units_extracted": unit_idx,
        "aggregated_tokens": {k: sorted(v) for k, v in agg_tokens.items()},
        "data": {},
    }

    if section_slug == "metadatos_y_resumen":
        structured_section["data"] = {
            "weight": st_row["weight"],
            "key_knowledge_areas": key_knowledge_areas,
            "partial_files_terms_utilities": partial_files_terms,
            "summaries": summaries,
        }
    elif section_slug == "teoria_lecciones":
        structured_section["data"] = {
            "commands_and_syntax_blocks": code_and_commands_blocks,
            "definitions_and_terms_contexts": definitions_candidates,
            "theory_units": theory_blocks,
        }
    elif section_slug == "ejercicios_y_respuestas":
        structured_section["data"] = {
            "guided_exercises": guided_exercises,
            "exploratory_exercises": exploratory_exercises,
            "guided_answers": guided_answers,
            "exploratory_answers": exploratory_answers,
        }

    out_dir = os.path.join(EXTRACT_BASE_DIR, exam_id, "subtopics", subtopic_id)
    os.makedirs(out_dir, exist_ok=True)
    json_out_path = os.path.join(out_dir, f"{section_slug}.json")
    yaml_out_path = os.path.join(out_dir, f"{section_slug}.yaml")

    with open(json_out_path, "w", encoding="utf-8") as f:
        json.dump(structured_section, f, ensure_ascii=False, indent=2)
    with open(yaml_out_path, "w", encoding="utf-8") as f:
        yaml.safe_dump(structured_section, f, allow_unicode=True, sort_keys=False)

    now_iso = datetime.now(timezone.utc).isoformat()
    rel_json = os.path.relpath(json_out_path, REPO_ROOT).replace("\\", "/")
    exercises_cnt = len(guided_exercises) + len(exploratory_exercises) + len(guided_answers) + len(exploratory_answers)

    def _update_section_db(conn: sqlite3.Connection) -> int:
        conn.execute(
            """
            UPDATE sections SET
                status = 'OK',
                extracted_json_path = ?,
                units_count = ?,
                commands_count = ?,
                terms_count = ?,
                exercises_count = ?,
                updated_at = ?
            WHERE section_id = ?;
            """,
            (
                rel_json,
                unit_idx,
                len(agg_tokens["commands"]),
                len(agg_tokens["terms"]),
                exercises_cnt,
                now_iso,
                sec_id,
            ),
        )
        pending_secs = conn.execute(
            "SELECT COUNT(*) AS cnt FROM sections WHERE subtopic_id = ? AND status != 'OK'",
            (subtopic_id,),
        ).fetchone()["cnt"]

        if pending_secs == 0:
            conn.execute(
                "UPDATE subtopics SET extraction_status = 'OK', updated_at = ? WHERE subtopic_id = ?",
                (now_iso, subtopic_id),
            )
            conn.execute(
                """
                UPDATE page_ledger SET extracted_status = 'EXTRACTED', updated_at = ?
                WHERE exam_id = ? AND subtopic_id = ? AND extracted_status = 'PENDING';
                """,
                (now_iso, exam_id, subtopic_id),
            )
        return pending_secs

    pending_secs = run_db_write_transaction(db_path, _update_section_db)

    return {
        "status": "OK",
        "exam_id": exam_id,
        "topic_id": st_row["topic_id"],
        "subtopic_id": subtopic_id,
        "section_slug": section_slug,
        "units_extracted": unit_idx,
        "tokens_counts": {k: len(v) for k, v in agg_tokens.items()},
        "subtopic_all_sections_ready": pending_secs == 0,
        "saved_json": rel_json,
        "saved_yaml": os.path.relpath(yaml_out_path, REPO_ROOT).replace("\\", "/"),
    }


def extract_wave_in_parallel(
    exam_id: str,
    subtopics_list: List[str],
    db_path: str = DB_DEFAULT_PATH,
    max_workers: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Ejecuta en paralelo usando `ThreadPoolExecutor` (ajustado automáticamente a los núcleos
    de CPU y RAM disponibles en la máquina) la extracción de todas las secciones de una oleada
    de subtemas.
    """
    plan = compute_concurrency_plan()
    workers = max_workers or plan["limits"]["python_thread_pool_workers"]
    tasks: List[Tuple[str, str]] = []
    for sid in subtopics_list:
        for slug in ("metadatos_y_resumen", "teoria_lecciones", "ejercicios_y_respuestas"):
            tasks.append((sid, slug))

    t0 = time.perf_counter()
    results: List[Dict[str, Any]] = []
    errors: List[Dict[str, Any]] = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=min(workers, max(1, len(tasks)))) as executor:
        future_to_task = {
            executor.submit(extract_subtopic_section, exam_id, sid, slug, db_path): (sid, slug)
            for sid, slug in tasks
        }
        for fut in concurrent.futures.as_completed(future_to_task):
            sid, slug = future_to_task[fut]
            try:
                results.append(fut.result())
            except Exception as exc:
                errors.append({"subtopic_id": sid, "section_slug": slug, "error": str(exc)})

    elapsed = round(time.perf_counter() - t0, 2)
    return {
        "status": "OK" if not errors else "PARTIAL_ERROR",
        "exam_id": exam_id,
        "subtopics_processed": subtopics_list,
        "parallel_threads_used": min(workers, max(1, len(tasks))),
        "sections_extracted_count": len(results),
        "elapsed_seconds": elapsed,
        "errors": errors,
        "results": sorted(results, key=lambda x: (x["subtopic_id"], x["section_slug"])),
    }


# ============================================================================
# PRE-COMPARADOR DETERMINISTA PDF vs WEB Y EJECUCIÓN EN PARALELO (CAPA 3B)
# ============================================================================

def load_web_bundle_for_subtopic(subtopic_id: str) -> Dict[str, Any]:
    """
    Reúne todo el contenido actual de la aplicación web correspondiente a `subtopic_id`.
    """
    lesson_path = os.path.join(REPO_ROOT, "content-src", "lessons", f"{subtopic_id}.json")
    lab_path = os.path.join(REPO_ROOT, "content-src", "labs", f"{subtopic_id}.json")
    commands_path = os.path.join(REPO_ROOT, "content-src", "commands.yaml")
    glossary_path = os.path.join(REPO_ROOT, "content-src", "glossary.yaml")
    questions_dir = os.path.join(REPO_ROOT, "content-src", "questions")

    web_texts: List[str] = []
    lesson_info: Dict[str, Any] = {"exists": False, "placeholder": False, "slides_count": 0, "slides_titles": []}
    if os.path.exists(lesson_path):
        with open(lesson_path, "r", encoding="utf-8") as f:
            lesson_data = json.load(f)
            slides = lesson_data.get("slides", [])
            lesson_info = {
                "exists": True,
                "placeholder": bool(lesson_data.get("placeholder", False)),
                "title": lesson_data.get("title", ""),
                "slides_count": len(slides),
                "slides_titles": [s.get("title", "") for s in slides],
            }
            web_texts.append(json.dumps(lesson_data, ensure_ascii=False))

    lab_info: Dict[str, Any] = {"exists": False, "placeholder": False, "steps_count": 0, "exercises_count": 0}
    if os.path.exists(lab_path):
        with open(lab_path, "r", encoding="utf-8") as f:
            lab_data = json.load(f)
            lab_info = {
                "exists": True,
                "placeholder": bool(lab_data.get("placeholder", False)),
                "title": lab_data.get("title", ""),
                "steps_count": len(lab_data.get("steps", [])),
                "exercises_count": len(lab_data.get("guidedExercises", [])) + len(lab_data.get("exploratoryExercises", [])),
            }
            web_texts.append(json.dumps(lab_data, ensure_ascii=False))

    all_web_commands: Set[str] = set()
    subtopic_commands: List[Dict[str, Any]] = []
    if os.path.exists(commands_path):
        with open(commands_path, "r", encoding="utf-8") as f:
            cmds_data = yaml.safe_load(f) or []
            for c in cmds_data:
                if isinstance(c, dict) and c.get("name"):
                    cname = str(c["name"]).strip()
                    all_web_commands.add(cname)
                    if subtopic_id in (c.get("subtopicIds") or []) or c.get("explainedIn", {}).get("subtopicId") == subtopic_id:
                        subtopic_commands.append({
                            "name": cname,
                            "description": c.get("description", ""),
                            "syntax": c.get("syntax", ""),
                            "options": [o.get("flag") for o in (c.get("options") or []) if isinstance(o, dict)],
                        })
                        web_texts.append(json.dumps(c, ensure_ascii=False))

    all_web_terms: Set[str] = set()
    subtopic_terms: List[Dict[str, Any]] = []
    if os.path.exists(glossary_path):
        with open(glossary_path, "r", encoding="utf-8") as f:
            gl_data = yaml.safe_load(f) or []
            for g in gl_data:
                if isinstance(g, dict) and g.get("term"):
                    tname = str(g["term"]).strip()
                    all_web_terms.add(strip_accents_lower(tname))
                    if subtopic_id in (g.get("subtopicIds") or []) or g.get("explainedIn", {}).get("subtopicId") == subtopic_id:
                        subtopic_terms.append({
                            "term": tname,
                            "acronym": g.get("acronym", ""),
                            "definition": g.get("definition", ""),
                        })
                        web_texts.append(json.dumps(g, ensure_ascii=False))

    subtopic_questions_count = 0
    if os.path.exists(questions_dir):
        for fname in os.listdir(questions_dir):
            if fname.endswith(".json"):
                qpath = os.path.join(questions_dir, fname)
                try:
                    with open(qpath, "r", encoding="utf-8") as f:
                        qlist = json.load(f)
                        if isinstance(qlist, list):
                            for q in qlist:
                                if isinstance(q, dict) and q.get("subtopicId") == subtopic_id:
                                    subtopic_questions_count += 1
                                    web_texts.append(json.dumps(q, ensure_ascii=False))
                except Exception:
                    pass

    combined_web_corpus = "\n".join(web_texts)
    web_tokens = extract_technical_tokens(combined_web_corpus, known_commands=load_known_commands_from_repo())

    return {
        "subtopic_id": subtopic_id,
        "lesson": lesson_info,
        "lab": lab_info,
        "subtopic_commands": subtopic_commands,
        "subtopic_terms": subtopic_terms,
        "questions_count": subtopic_questions_count,
        "web_tokens_in_subtopic": web_tokens,
        "all_web_commands": sorted(all_web_commands),
        "all_web_terms_normalized": sorted(all_web_terms),
        "raw_corpus": combined_web_corpus,
    }


def pre_compare_subtopic(exam_id: str, subtopic_id: str, db_path: str = DB_DEFAULT_PATH) -> Dict[str, Any]:
    """
    Cruza los 3 JSON extraídos del PDF para `subtopic_id` contra el contenido real de la web,
    calculando métricas objetivas preliminares y devolviendo un informe compacto de diferencias.
    """
    sub_dir = os.path.join(EXTRACT_BASE_DIR, exam_id, "subtopics", subtopic_id)
    meta_path = os.path.join(sub_dir, "metadatos_y_resumen.json")
    theo_path = os.path.join(sub_dir, "teoria_lecciones.json")
    exer_path = os.path.join(sub_dir, "ejercicios_y_respuestas.json")

    for p in (meta_path, theo_path, exer_path):
        if not os.path.exists(p):
            raise ValueError(
                f"Falta el archivo de extracción '{os.path.basename(p)}' para {subtopic_id}. "
                "Asegúrate de que las 3 secciones hayan sido extraídas primero."
            )

    with open(meta_path, "r", encoding="utf-8") as f:
        meta_json = json.load(f)
    with open(theo_path, "r", encoding="utf-8") as f:
        theo_json = json.load(f)
    with open(exer_path, "r", encoding="utf-8") as f:
        exer_json = json.load(f)

    web_bundle = load_web_bundle_for_subtopic(subtopic_id)
    web_corpus = web_bundle["raw_corpus"]
    web_corpus_norm = strip_accents_lower(web_corpus)

    pdf_tokens: Dict[str, Set[str]] = {k: set() for k in ("commands", "flags", "paths", "vars", "terms", "acronyms")}
    for sec_j in (meta_json, theo_json, exer_json):
        for k, vals in sec_j.get("aggregated_tokens", {}).items():
            if k in pdf_tokens:
                pdf_tokens[k].update(vals)

    def check_presence(items: Set[str], case_sensitive: bool = True) -> Tuple[List[str], List[str]]:
        present: List[str] = []
        missing: List[str] = []
        for it in sorted(items):
            if case_sensitive:
                if it in web_corpus:
                    present.append(it)
                else:
                    missing.append(it)
            else:
                if strip_accents_lower(it) in web_corpus_norm:
                    present.append(it)
                else:
                    missing.append(it)
        return present, missing

    cmd_present, cmd_missing = check_presence(pdf_tokens["commands"], case_sensitive=True)
    flag_present, flag_missing = check_presence(pdf_tokens["flags"], case_sensitive=True)
    path_present, path_missing = check_presence(pdf_tokens["paths"], case_sensitive=True)
    var_present, var_missing = check_presence(pdf_tokens["vars"], case_sensitive=True)
    term_present, term_missing = check_presence(pdf_tokens["terms"], case_sensitive=False)
    acr_present, acr_missing = check_presence(pdf_tokens["acronyms"], case_sensitive=True)

    partial_list = meta_json.get("data", {}).get("partial_files_terms_utilities", [])
    partial_present: List[str] = []
    partial_missing: List[str] = []
    for item in partial_list:
        clean_it = item.split("(")[0].strip()
        if clean_it in web_corpus or strip_accents_lower(clean_it) in web_corpus_norm:
            partial_present.append(item)
        else:
            partial_missing.append(item)

    web_sub_cmds = set(web_bundle["web_tokens_in_subtopic"]["commands"])
    extra_web_commands = sorted(web_sub_cmds - pdf_tokens["commands"])
    web_sub_paths = set(web_bundle["web_tokens_in_subtopic"]["paths"])
    extra_web_paths = sorted(web_sub_paths - pdf_tokens["paths"])

    def ratio_pct(pres: int, tot: int) -> float:
        return round((pres / tot) * 100.0, 1) if tot > 0 else 100.0

    total_tech_items = len(pdf_tokens["commands"]) + len(pdf_tokens["flags"]) + len(pdf_tokens["paths"]) + len(pdf_tokens["vars"])
    pres_tech_items = len(cmd_present) + len(flag_present) + len(path_present) + len(var_present)
    auto_score_commands = ratio_pct(pres_tech_items, total_tech_items)

    total_def_items = len(pdf_tokens["terms"]) + len(pdf_tokens["acronyms"]) + len(partial_list)
    pres_def_items = len(term_present) + len(acr_present) + len(partial_present)
    auto_score_definitions = ratio_pct(pres_def_items, total_def_items)

    pdf_guided = exer_json.get("data", {}).get("guided_exercises", [])
    pdf_explor = exer_json.get("data", {}).get("exploratory_exercises", [])
    pdf_theory_units = theo_json.get("data", {}).get("theory_units", [])

    if web_bundle["lesson"]["placeholder"] or web_bundle["lesson"]["slides_count"] <= 3:
        auto_score_theory = 15.0
    else:
        covered_units = 0
        for u in pdf_theory_units:
            utoks = u.get("tokens", {})
            u_all = (utoks.get("commands") or []) + (utoks.get("terms") or []) + (utoks.get("paths") or [])
            if not u_all:
                covered_units += 1
            else:
                hits = sum(1 for tok in u_all if strip_accents_lower(tok) in web_corpus_norm)
                if hits / len(u_all) >= 0.6:
                    covered_units += 1
        auto_score_theory = ratio_pct(covered_units, len(pdf_theory_units))

    if web_bundle["lab"]["placeholder"] or web_bundle["lab"]["steps_count"] <= 1:
        auto_score_exercises = 10.0 if (pdf_guided or pdf_explor) else 100.0
    else:
        ex_units = pdf_guided + pdf_explor
        covered_ex = 0
        for ex in ex_units:
            extoks = ex.get("tokens", {})
            ex_all = (extoks.get("commands") or []) + (extoks.get("flags") or []) + (extoks.get("paths") or [])
            if not ex_all:
                covered_ex += 1
            else:
                hits = sum(1 for tok in ex_all if strip_accents_lower(tok) in web_corpus_norm)
                if hits / len(ex_all) >= 0.5:
                    covered_ex += 1
        auto_score_exercises = ratio_pct(covered_ex, len(ex_units))

    weighted_total = round(
        0.30 * auto_score_commands
        + 0.20 * auto_score_definitions
        + 0.25 * auto_score_theory
        + 0.25 * auto_score_exercises,
        1,
    )

    pre_comp_result = {
        "exam_id": exam_id,
        "topic_id": meta_json["topic_id"],
        "subtopic_id": subtopic_id,
        "subtopic_title": meta_json["subtopic_title"],
        "web_status": {
            "lesson": web_bundle["lesson"],
            "lab": web_bundle["lab"],
            "commands_linked_count": len(web_bundle["subtopic_commands"]),
            "glossary_linked_count": len(web_bundle["subtopic_terms"]),
            "questions_count": web_bundle["questions_count"],
        },
        "automated_baseline_scores": {
            "total_weighted": weighted_total,
            "commands_flags_paths_vars_30pct": auto_score_commands,
            "definitions_glossary_acronyms_20pct": auto_score_definitions,
            "theory_statements_25pct": auto_score_theory,
            "exercises_guided_and_exploratory_25pct": auto_score_exercises,
        },
        "pdf_official_metadata": {
            "weight": meta_json["data"].get("weight", 0),
            "key_knowledge_areas": meta_json["data"].get("key_knowledge_areas", []),
            "partial_files_terms_utilities": partial_list,
            "partial_list_missing_in_web": partial_missing,
        },
        "diff_summary": {
            "commands": {"present_count": len(cmd_present), "missing": cmd_missing, "extra_in_web": extra_web_commands},
            "flags": {"present_count": len(flag_present), "missing": flag_missing},
            "paths": {"present_count": len(path_present), "missing": path_missing, "extra_in_web": extra_web_paths[:25]},
            "vars": {"present_count": len(var_present), "missing": var_missing},
            "terms": {"present_count": len(term_present), "missing": term_missing[:40]},
            "acronyms": {"present_count": len(acr_present), "missing": acr_missing},
        },
        "exercises_digest": {
            "pdf_guided_count": len(pdf_guided),
            "pdf_exploratory_count": len(pdf_explor),
            "pdf_guided_prompts": [{"page": g["page"], "text": g["text"][:280]} for g in pdf_guided[:12]],
            "pdf_exploratory_prompts": [{"page": e["page"], "text": e["text"][:280]} for e in pdf_explor[:12]],
        },
    }

    pre_comp_path = os.path.join(sub_dir, "pre_comparison.json")
    with open(pre_comp_path, "w", encoding="utf-8") as f:
        json.dump(pre_comp_result, f, ensure_ascii=False, indent=2)

    return pre_comp_result


def pre_compare_wave_in_parallel(
    exam_id: str,
    subtopics_list: List[str],
    db_path: str = DB_DEFAULT_PATH,
    max_workers: Optional[int] = None,
) -> Dict[str, Any]:
    """Ejecuta `pre_compare_subtopic` en paralelo multi-hilo para toda una oleada de subtemas."""
    plan = compute_concurrency_plan()
    workers = max_workers or plan["limits"]["python_thread_pool_workers"]
    t0 = time.perf_counter()
    results: List[Dict[str, Any]] = []
    errors: List[Dict[str, Any]] = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=min(workers, max(1, len(subtopics_list)))) as executor:
        future_to_sid = {
            executor.submit(pre_compare_subtopic, exam_id, sid, db_path): sid
            for sid in subtopics_list
        }
        for fut in concurrent.futures.as_completed(future_to_sid):
            sid = future_to_sid[fut]
            try:
                res = fut.result()
                results.append({
                    "subtopic_id": sid,
                    "baseline_score": res["automated_baseline_scores"]["total_weighted"],
                    "pre_comparison_file": f"content-src/_extract/validacion-masiva/{exam_id}/subtopics/{sid}/pre_comparison.json",
                })
            except Exception as exc:
                errors.append({"subtopic_id": sid, "error": str(exc)})

    elapsed = round(time.perf_counter() - t0, 2)
    return {
        "status": "OK" if not errors else "PARTIAL_ERROR",
        "exam_id": exam_id,
        "subtopics_compared": sorted(results, key=lambda x: x["subtopic_id"]),
        "parallel_threads_used": min(workers, max(1, len(subtopics_list))),
        "elapsed_seconds": elapsed,
        "errors": errors,
    }


def get_next_parallel_wave_for_topic(topic_id: str, db_path: str = DB_DEFAULT_PATH) -> Dict[str, Any]:
    """
    Devuelve la siguiente oleada de subtemas pendientes del Tema indicado según el límite
    de concurrencia calculado para el hardware de la máquina.
    """
    conn = get_db_connection(db_path)
    t_row = conn.execute("SELECT * FROM topics WHERE topic_id = ?", (topic_id,)).fetchone()
    if not t_row:
        conn.close()
        raise ValueError(f"El tema {topic_id} no existe en la BBDD.")

    pending_subs = [
        dict(r)
        for r in conn.execute(
            """
            SELECT * FROM subtopics
            WHERE topic_id = ? AND (extraction_status != 'OK' OR comparison_status != 'OK')
            ORDER BY wave_index ASC, subtopic_id ASC;
            """,
            (topic_id,),
        ).fetchall()
    ]
    conn.close()

    plan = compute_concurrency_plan()
    wave_limit = plan["limits"]["subtopics_per_wave_per_topic"]

    if not pending_subs:
        return {
            "topic_id": topic_id,
            "topic_completed": True,
            "next_wave_subtopics": [],
            "concurrency_limit_applied": wave_limit,
        }

    current_wave_idx = pending_subs[0]["wave_index"]
    wave_batch = [s for s in pending_subs if s["wave_index"] == current_wave_idx][:wave_limit]

    return {
        "topic_id": topic_id,
        "topic_completed": False,
        "wave_index": current_wave_idx,
        "concurrency_limit_applied": wave_limit,
        "next_wave_subtopic_ids": [s["subtopic_id"] for s in wave_batch],
        "next_wave_details": wave_batch,
        "remaining_subtopics_in_topic": len(pending_subs),
    }


def save_subtopic_validation_report(
    exam_id: str,
    subtopic_id: str,
    payload: Dict[str, Any],
    db_path: str = DB_DEFAULT_PATH,
) -> Dict[str, Any]:
    """
    Registra el dictamen final y puntaje del subagente de Capa 3B en SQLite (de forma
    thread-safe) y genera los ficheros `.json` y `.md` en `docs/agent/validacion-temario/`.
    """
    conn_ro = get_db_connection(db_path)
    st_row = conn_ro.execute(
        "SELECT * FROM subtopics WHERE exam_id = ? AND subtopic_id = ?", (exam_id, subtopic_id)
    ).fetchone()
    conn_ro.close()
    if not st_row:
        raise ValueError(f"Subtema {subtopic_id} no encontrado en {exam_id}.")

    topic_id = st_row["topic_id"]
    scores = payload.get("scores", {})
    s_cmd = float(scores.get("commands_flags_paths", 0.0))
    s_def = float(scores.get("definitions_glossary", 0.0))
    s_the = float(scores.get("theory_statements", 0.0))
    s_exe = float(scores.get("exercises_practical", 0.0))
    s_tot = float(
        scores.get(
            "total",
            round(0.30 * s_cmd + 0.20 * s_def + 0.25 * s_the + 0.25 * s_exe, 1),
        )
    )

    if s_tot >= 95.0:
        verdict = "EXCELENTE"
    elif s_tot >= 80.0:
        verdict = "APTO_CON_HUECOS"
    elif s_tot >= 50.0:
        verdict = "INCOMPLETO"
    else:
        verdict = "CRITICO_ESQUELETO"

    missing_items = payload.get("missing_from_web", [])
    extra_items = payload.get("extra_in_web", [])
    distorted_items = payload.get("distortions_or_errors", [])
    summary_text = payload.get("executive_summary", f"Validación completada para {subtopic_id} con puntaje {s_tot}/100 ({verdict}).")

    now_iso = datetime.now(timezone.utc).isoformat()
    out_dir = os.path.join(REPORTS_BASE_DIR, exam_id, "subtemas")
    os.makedirs(out_dir, exist_ok=True)

    json_report_path = os.path.join(out_dir, f"{subtopic_id}-validacion.json")
    md_report_path = os.path.join(out_dir, f"{subtopic_id}-validacion.md")

    full_report = {
        "exam_id": exam_id,
        "topic_id": topic_id,
        "subtopic_id": subtopic_id,
        "subtopic_title": st_row["title"],
        "pages_range": {"start": st_row["start_page"], "end": st_row["end_page"]},
        "validated_at": now_iso,
        "verdict": verdict,
        "scores": {
            "total": s_tot,
            "commands_flags_paths": s_cmd,
            "definitions_glossary": s_def,
            "theory_statements": s_the,
            "exercises_practical": s_exe,
        },
        "executive_summary": summary_text,
        "missing_from_web": missing_items,
        "extra_in_web": extra_items,
        "distortions_or_errors": distorted_items,
        "actionable_fixes": payload.get("actionable_fixes", []),
    }

    with open(json_report_path, "w", encoding="utf-8") as f:
        json.dump(full_report, f, ensure_ascii=False, indent=2)

    md_lines = [
        f"# Informe de Validación Oficial · Subtema {subtopic_id}: {st_row['title']}",
        "",
        f"- **Examen**: `{exam_id}` · **Tema**: `{topic_id}` · **Páginas PDF**: {st_row['start_page']}–{st_row['end_page']}",
        f"- **Puntaje Global**: **{s_tot} / 100** (`{verdict}`)",
        f"  - Comandos, flags, rutas y variables (30%): **{s_cmd} / 100**",
        f"  - Definiciones, glosario y siglas (20%): **{s_def} / 100**",
        f"  - Enunciados teóricos y conceptos (25%): **{s_the} / 100**",
        f"  - Ejercicios guiados y exploratorios (25%): **{s_exe} / 100**",
        "",
        "## 1. Resumen Ejecutivo",
        summary_text,
        "",
        f"## 2. Qué falta en la Web respecto al PDF Oficial ({len(missing_items)} ítems)",
    ]
    if missing_items:
        for m in missing_items:
            if isinstance(m, dict):
                md_lines.append(f"- **[{m.get('kind', 'item')}]** `{m.get('item', '')}` (pág. {m.get('page', '?')}): {m.get('detail', '')}")
            else:
                md_lines.append(f"- {m}")
    else:
        md_lines.append("- Ninguna omisión detectada (100% cubierto).")

    md_lines.extend([
        "",
        f"## 3. Qué se ha puesto de más en la Web / Contenido Autor ({len(extra_items)} ítems)",
    ])
    if extra_items:
        for ex in extra_items:
            if isinstance(ex, dict):
                md_lines.append(f"- **[{ex.get('kind', 'extra')}]** `{ex.get('item', '')}`: {ex.get('detail', '')}")
            else:
                md_lines.append(f"- {ex}")
    else:
        md_lines.append("- Sin adiciones extra fuera del temario oficial.")

    md_lines.extend([
        "",
        f"## 4. Imprecisiones o Contradicciones Detectadas ({len(distorted_items)} ítems)",
    ])
    if distorted_items:
        for d in distorted_items:
            if isinstance(d, dict):
                md_lines.append(f"- **[{d.get('severity', 'P1')}]** `{d.get('item', '')}` (pág. {d.get('page', '?')}): {d.get('detail', '')}")
            else:
                md_lines.append(f"- {d}")
    else:
        md_lines.append("- Cero contradicciones con el manual oficial.")

    md_lines.extend([
        "",
        "## 5. Acciones Recomendadas para Alcanzar 100/100",
    ])
    for fix in full_report["actionable_fixes"] or ["Mantener sincronizado con los tests de cobertura."]:
        md_lines.append(f"- [ ] {fix}")

    with open(md_report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines) + "\n")

    rel_json = os.path.relpath(json_report_path, REPO_ROOT).replace("\\", "/")
    rel_md = os.path.relpath(md_report_path, REPO_ROOT).replace("\\", "/")

    def _save_report_db(conn: sqlite3.Connection) -> Tuple[int, int]:
        conn.execute(
            """
            INSERT INTO validation_reports (
                subtopic_id, exam_id, topic_id, score_total, score_commands, score_definitions,
                score_theory, score_exercises, verdict, missing_items_count, extra_items_count,
                distorted_items_count, summary_text, report_json, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(subtopic_id) DO UPDATE SET
                score_total=excluded.score_total,
                score_commands=excluded.score_commands,
                score_definitions=excluded.score_definitions,
                score_theory=excluded.score_theory,
                score_exercises=excluded.score_exercises,
                verdict=excluded.verdict,
                missing_items_count=excluded.missing_items_count,
                extra_items_count=excluded.extra_items_count,
                distorted_items_count=excluded.distorted_items_count,
                summary_text=excluded.summary_text,
                report_json=excluded.report_json,
                updated_at=excluded.updated_at;
            """,
            (
                subtopic_id,
                exam_id,
                topic_id,
                s_tot,
                s_cmd,
                s_def,
                s_the,
                s_exe,
                verdict,
                len(missing_items),
                len(extra_items),
                len(distorted_items),
                summary_text,
                json.dumps(full_report, ensure_ascii=False),
                now_iso,
            ),
        )
        conn.execute(
            """
            UPDATE subtopics SET
                comparison_status = 'OK',
                score_total = ?,
                verdict = ?,
                report_json_path = ?,
                report_md_path = ?,
                updated_at = ?
            WHERE subtopic_id = ?;
            """,
            (s_tot, verdict, rel_json, rel_md, now_iso, subtopic_id),
        )
        conn.execute(
            """
            UPDATE page_ledger SET extracted_status = 'VALIDATED', updated_at = ?
            WHERE exam_id = ? AND subtopic_id = ?;
            """,
            (now_iso, exam_id, subtopic_id),
        )
        p_topic = conn.execute(
            "SELECT COUNT(*) AS cnt FROM subtopics WHERE topic_id = ? AND comparison_status != 'OK'",
            (topic_id,),
        ).fetchone()["cnt"]
        if p_topic == 0:
            conn.execute(
                "UPDATE topics SET status = 'VALIDATED', updated_at = ? WHERE topic_id = ?",
                (now_iso, topic_id),
            )
        p_exam = conn.execute(
            "SELECT COUNT(*) AS cnt FROM subtopics WHERE exam_id = ? AND comparison_status != 'OK'",
            (exam_id,),
        ).fetchone()["cnt"]
        if p_exam == 0:
            conn.execute(
                "UPDATE pdf_runs SET status = 'COMPLETED', updated_at = ? WHERE exam_id = ?",
                (now_iso, exam_id),
            )
        return p_topic, p_exam

    pending_in_topic, pending_in_exam = run_db_write_transaction(db_path, _save_report_db)

    return {
        "status": "OK",
        "exam_id": exam_id,
        "topic_id": topic_id,
        "subtopic_id": subtopic_id,
        "score_total": s_tot,
        "verdict": verdict,
        "topic_completed": pending_in_topic == 0,
        "exam_completed": pending_in_exam == 0,
        "report_json_path": rel_json,
        "report_md_path": rel_md,
    }


def get_exam_progress(exam_id: str, db_path: str = DB_DEFAULT_PATH) -> Dict[str, Any]:
    """Devuelve el estado global de progreso en SQLite (páginas, temas, subtemas, oleadas, puntajes)."""
    conn = get_db_connection(db_path)
    run_row = conn.execute("SELECT * FROM pdf_runs WHERE exam_id = ?", (exam_id,)).fetchone()
    if not run_row:
        conn.close()
        return {"error": f"No existe ningún proceso registrado para {exam_id}"}

    pages_stats = conn.execute(
        """
        SELECT extracted_status, COUNT(*) AS cnt
        FROM page_ledger WHERE exam_id = ?
        GROUP BY extracted_status;
        """,
        (exam_id,),
    ).fetchall()
    p_map = {r["extracted_status"]: r["cnt"] for r in pages_stats}

    topics_rows = [dict(r) for r in conn.execute("SELECT * FROM topics WHERE exam_id = ? ORDER BY topic_id", (exam_id,)).fetchall()]
    subtopics_rows = [dict(r) for r in conn.execute("SELECT * FROM subtopics WHERE exam_id = ? ORDER BY subtopic_id", (exam_id,)).fetchall()]
    sections_stats = conn.execute(
        "SELECT status, COUNT(*) AS cnt FROM sections WHERE exam_id = ? GROUP BY status",
        (exam_id,),
    ).fetchall()
    s_map = {r["status"]: r["cnt"] for r in sections_stats}
    conn.close()

    total_pages = int(run_row["total_pages"])
    pending_pages = p_map.get("PENDING", 0)
    processed_pages = total_pages - pending_pages
    pct_pages = round((processed_pages / total_pages) * 100.0, 2) if total_pages else 0.0

    scored = [s["score_total"] for s in subtopics_rows if s["score_total"] is not None]
    avg_score = round(sum(scored) / len(scored), 1) if scored else None

    c_plan = json.loads(run_row["concurrency_plan_json"]) if run_row["concurrency_plan_json"] else compute_concurrency_plan()

    return {
        "exam_id": exam_id,
        "status": run_row["status"],
        "total_pages": total_pages,
        "processed_pages": processed_pages,
        "pending_curriculum_pages": pending_pages,
        "pages_completion_pct": pct_pages,
        "pages_breakdown": p_map,
        "sections_breakdown": s_map,
        "average_validation_score": avg_score,
        "can_stop": pending_pages == 0 and all(s["comparison_status"] == "OK" for s in subtopics_rows),
        "concurrency_plan": c_plan,
        "topics": topics_rows,
        "subtopics": subtopics_rows,
    }


def generate_master_exam_report(exam_id: str, db_path: str = DB_DEFAULT_PATH) -> Dict[str, Any]:
    """Consolida todos los reportes de subtemas del examen en un Informe Maestro global."""
    progress = get_exam_progress(exam_id, db_path)
    conn = get_db_connection(db_path)
    val_rows = [
        dict(r)
        for r in conn.execute(
            "SELECT * FROM validation_reports WHERE exam_id = ? ORDER BY subtopic_id", (exam_id,)
        ).fetchall()
    ]
    conn.close()

    out_dir = os.path.join(REPORTS_BASE_DIR, exam_id)
    os.makedirs(out_dir, exist_ok=True)
    master_md_path = os.path.join(out_dir, "00-RESUMEN-VALIDACION-TEMARIO.md")
    master_json_path = os.path.join(out_dir, "00-resumen-validacion-temario.json")

    with open(master_json_path, "w", encoding="utf-8") as f:
        json.dump({"progress": progress, "reports": val_rows}, f, ensure_ascii=False, indent=2)

    lines = [
        f"# Informe Maestro de Validación Oficial · Examen {exam_id}",
        "",
        f"- **Páginas Totales Procesadas**: **{progress['processed_pages']} / {progress['total_pages']}** ({progress['pages_completion_pct']}%)",
        f"- **Puntaje Promedio Global**: **{progress['average_validation_score']} / 100**",
        f"- **Estado del Proceso**: `{progress['status']}` (`can_stop={progress['can_stop']}`)",
        "",
        "## Tabla de Puntajes por Tema y Subtema",
        "",
        "| Tema | Subtema | Puntaje Total | Comandos (30%) | Definiciones (20%) | Teoría (25%) | Prácticas (25%) | Veredicto | Faltantes | Extras |",
        "|---|---|---:|---:|---:|---:|---:|---|---:|---:|",
    ]
    for r in val_rows:
        lines.append(
            f"| {r['topic_id']} | **{r['subtopic_id']}** | **{r['score_total']}** | {r['score_commands']} | "
            f"{r['score_definitions']} | {r['score_theory']} | {r['score_exercises']} | `{r['verdict']}` | "
            f"{r['missing_items_count']} | {r['extra_items_count']} |"
        )

    with open(master_md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    return {
        "status": "OK",
        "exam_id": exam_id,
        "master_md_path": os.path.relpath(master_md_path, REPO_ROOT).replace("\\", "/"),
        "master_json_path": os.path.relpath(master_json_path, REPO_ROOT).replace("\\", "/"),
        "average_score": progress["average_validation_score"],
        "can_stop": progress["can_stop"],
    }


# ============================================================================
# SERVIDOR HTTP MULTIHILO CON SUB-APIS Y OLEADAS PARALELAS
# ============================================================================

class ValidationAPIHandler(BaseHTTPRequestHandler):
    db_path: str = DB_DEFAULT_PATH

    def log_message(self, fmt: str, *args: Any) -> None:
        sys.stderr.write(f"[PDF-API] {self.address_string()} - {fmt % args}\n")

    def _send_json(self, status_code: int, payload: Dict[str, Any]) -> None:
        raw = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def _read_body_json(self) -> Dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        return json.loads(raw) if raw.strip() else {}

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        try:
            if path == "/api/health":
                self._send_json(200, {"status": "UP", "db_path": self.db_path})
                return

            if path == "/api/hardware-plan":
                self._send_json(200, compute_concurrency_plan())
                return

            m_prog = re.match(r"^/api/exam/([^/]+)/progress$", path)
            if m_prog:
                self._send_json(200, get_exam_progress(m_prog.group(1), self.db_path))
                return

            m_struct = re.match(r"^/api/exam/([^/]+)/structure$", path)
            if m_struct:
                exam_id = m_struct.group(1)
                s_path = os.path.join(EXTRACT_BASE_DIR, exam_id, "structure-input.json")
                if not os.path.exists(s_path):
                    self._send_json(404, {"error": f"No existe structure-input.json para {exam_id}"})
                    return
                with open(s_path, "r", encoding="utf-8") as f:
                    self._send_json(200, json.load(f))
                return

            m_top = re.match(r"^/api/topic/(\d{3})$", path)
            if m_top:
                tid = m_top.group(1)
                conn = get_db_connection(self.db_path)
                t_row = conn.execute("SELECT * FROM topics WHERE topic_id = ?", (tid,)).fetchone()
                if not t_row:
                    conn.close()
                    self._send_json(404, {"error": f"Tema {tid} no registrado"})
                    return
                subs = [dict(r) for r in conn.execute("SELECT * FROM subtopics WHERE topic_id = ? ORDER BY subtopic_id", (tid,)).fetchall()]
                secs = [dict(r) for r in conn.execute("SELECT * FROM sections WHERE topic_id = ? ORDER BY section_id", (tid,)).fetchall()]
                conn.close()
                next_wave = get_next_parallel_wave_for_topic(tid, self.db_path)
                self._send_json(200, {"topic": dict(t_row), "next_parallel_wave": next_wave, "subtopics": subs, "sections": secs})
                return

            m_next_wave = re.match(r"^/api/topic/(\d{3})/next-wave$", path)
            if m_next_wave:
                self._send_json(200, get_next_parallel_wave_for_topic(m_next_wave.group(1), self.db_path))
                return

            m_sec = re.match(r"^/api/topic/(\d{3})/subtopic/(\d{3}\.\d+)/section/([a-z_]+)$", path)
            if m_sec:
                tid, sid, slug = m_sec.group(1), m_sec.group(2), m_sec.group(3)
                conn = get_db_connection(self.db_path)
                st_row = conn.execute("SELECT exam_id FROM subtopics WHERE subtopic_id = ?", (sid,)).fetchone()
                conn.close()
                if not st_row:
                    self._send_json(404, {"error": f"Subtema {sid} no encontrado"})
                    return
                res = extract_subtopic_section(st_row["exam_id"], sid, slug, self.db_path)
                self._send_json(200, res)
                return

            m_pre = re.match(r"^/api/topic/(\d{3})/subtopic/(\d{3}\.\d+)/pre-compare$", path)
            if m_pre:
                tid, sid = m_pre.group(1), m_pre.group(2)
                conn = get_db_connection(self.db_path)
                st_row = conn.execute("SELECT exam_id FROM subtopics WHERE subtopic_id = ?", (sid,)).fetchone()
                conn.close()
                if not st_row:
                    self._send_json(404, {"error": f"Subtema {sid} no encontrado"})
                    return
                res = pre_compare_subtopic(st_row["exam_id"], sid, self.db_path)
                self._send_json(200, res)
                return

            self._send_json(404, {"error": f"Ruta GET desconocida: {path}"})
        except Exception as exc:
            self._send_json(500, {"error": str(exc)})

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        body = self._read_body_json()

        try:
            if path == "/api/init":
                pdf_path = body.get("pdf_path")
                if not pdf_path:
                    self._send_json(400, {"error": "Falta 'pdf_path' en el cuerpo JSON"})
                    return
                res = analyze_pdf_structure(pdf_path, self.db_path)
                self._send_json(200, res)
                return

            # POST /api/topic/<topic_id>/extract-wave  {"subtopics": ["101.1", "101.2", ...]}
            m_ext_wave = re.match(r"^/api/topic/(\d{3})/extract-wave$", path)
            if m_ext_wave:
                tid = m_ext_wave.group(1)
                subtopics_list = body.get("subtopics") or get_next_parallel_wave_for_topic(tid, self.db_path)["next_wave_subtopic_ids"]
                if not subtopics_list:
                    self._send_json(200, {"status": "OK", "message": "No quedan subtemas pendientes en este tema"})
                    return
                conn = get_db_connection(self.db_path)
                t_row = conn.execute("SELECT exam_id FROM topics WHERE topic_id = ?", (tid,)).fetchone()
                conn.close()
                res = extract_wave_in_parallel(t_row["exam_id"], subtopics_list, self.db_path)
                self._send_json(200, res)
                return

            # POST /api/topic/<topic_id>/pre-compare-wave  {"subtopics": ["101.1", "101.2", ...]}
            m_pre_wave = re.match(r"^/api/topic/(\d{3})/pre-compare-wave$", path)
            if m_pre_wave:
                tid = m_pre_wave.group(1)
                subtopics_list = body.get("subtopics") or get_next_parallel_wave_for_topic(tid, self.db_path)["next_wave_subtopic_ids"]
                conn = get_db_connection(self.db_path)
                t_row = conn.execute("SELECT exam_id FROM topics WHERE topic_id = ?", (tid,)).fetchone()
                conn.close()
                res = pre_compare_wave_in_parallel(t_row["exam_id"], subtopics_list, self.db_path)
                self._send_json(200, res)
                return

            m_save = re.match(r"^/api/topic/(\d{3})/subtopic/(\d{3}\.\d+)/save-comparison$", path)
            if m_save:
                tid, sid = m_save.group(1), m_save.group(2)
                conn = get_db_connection(self.db_path)
                st_row = conn.execute("SELECT exam_id FROM subtopics WHERE subtopic_id = ?", (sid,)).fetchone()
                conn.close()
                if not st_row:
                    self._send_json(404, {"error": f"Subtema {sid} no encontrado"})
                    return
                res = save_subtopic_validation_report(st_row["exam_id"], sid, body, self.db_path)
                self._send_json(200, res)
                return

            self._send_json(404, {"error": f"Ruta POST desconocida: {path}"})
        except Exception as exc:
            self._send_json(500, {"error": str(exc)})


def run_http_server(host: str, port: int, db_path: str) -> None:
    ValidationAPIHandler.db_path = db_path
    init_database_schema(get_db_connection(db_path))
    server = ThreadingHTTPServer((host, port), ValidationAPIHandler)
    print(f"🚀 Servidor de Validación PDF activo en http://{host}:{port} (BBDD: {db_path})")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nDeteniendo servidor...")
        server.server_close()


# ============================================================================
# CLI DIRECTA (SOPORTE COMPLETO DE EJECUCIÓN EN PARALELO Y POR OLEADAS)
# ============================================================================

def main() -> int:
    parser = argparse.ArgumentParser(
        description="Servidor HTTP, Planificador Hardware-Aware y CLI paralela para validación de PDFs LPI."
    )
    parser.add_argument("--db", default=DB_DEFAULT_PATH, help="Ruta de la base de datos SQLite")
    subparsers = parser.add_subparsers(dest="cmd", required=True)

    # 0. hardware-plan
    p_hw = subparsers.add_parser("hardware-plan", help="Detecta CPU/RAM de la máquina y muestra el plan de concurrencia óptima")
    p_hw.add_argument("--topics", type=int, default=4)
    p_hw.add_argument("--subtopics", type=int, default=23)

    # 1. init
    p_init = subparsers.add_parser("init", help="Analiza estructura del PDF, calcula oleadas paralelas según hardware e inicializa SQLite")
    p_init.add_argument("--pdf", required=True, help="Ruta al PDF oficial (101-500 o 102-500)")

    # 2. serve
    p_serve = subparsers.add_parser("serve", help="Levanta el servidor HTTP multihilo con APIs por Tema y Sub-APIs por Sección")
    p_serve.add_argument("--host", default="127.0.0.1")
    p_serve.add_argument("--port", type=int, default=8765)
    p_serve.add_argument("--pdf", default=None, help="Opcional: inicializar este PDF al arrancar el servidor")

    # 3. next-wave
    p_nw = subparsers.add_parser("next-wave", help="Obtiene la siguiente oleada paralela de subtemas pendientes de un Tema")
    p_nw.add_argument("--topic", required=True, help="ID del tema (ej. 101)")

    # 4. extract-wave-parallel
    p_ew = subparsers.add_parser("extract-wave-parallel", help="Extrae en paralelo multi-hilo todas las secciones de una oleada de subtemas")
    p_ew.add_argument("--exam", required=True, help="ID del examen (ej. 101-500 o 102-500)")
    p_ew.add_argument("--subtopics", required=True, help="Lista de subtemas separados por coma (ej. 101.1,101.2,101.3)")
    p_ew.add_argument("--workers", type=int, default=None, help="Opcional: nº de hilos paralelos (por defecto auto-detectado)")

    # 5. pre-compare-wave-parallel
    p_pw = subparsers.add_parser("pre-compare-wave-parallel", help="Ejecuta pre-comparación en paralelo multi-hilo para una oleada de subtemas")
    p_pw.add_argument("--exam", required=True, help="ID del examen (ej. 101-500 o 102-500)")
    p_pw.add_argument("--subtopics", required=True, help="Lista de subtemas separados por coma (ej. 101.1,101.2,101.3)")
    p_pw.add_argument("--workers", type=int, default=None, help="Opcional: nº de hilos paralelos")

    # 6. extract-section
    p_ext = subparsers.add_parser("extract-section", help="Extrae una sección específica de un subtema (Capa 3A)")
    p_ext.add_argument("--exam", required=True, help="ID del examen (ej. 101-500 o 102-500)")
    p_ext.add_argument("--subtopic", required=True, help="ID del subtema (ej. 101.1)")
    p_ext.add_argument(
        "--section",
        required=True,
        choices=["metadatos_y_resumen", "teoria_lecciones", "ejercicios_y_respuestas", "ALL"],
        help="Sección interna a extraer (o ALL para extraer las 3 del subtema en paralelo)",
    )

    # 7. pre-compare
    p_pre = subparsers.add_parser("pre-compare", help="Ejecuta la pre-comparación determinista PDF vs Web (Capa 3B)")
    p_pre.add_argument("--exam", required=True, help="ID del examen (ej. 101-500 o 102-500)")
    p_pre.add_argument("--subtopic", required=True, help="ID del subtema (ej. 101.1)")

    # 8. save-comparison
    p_save = subparsers.add_parser("save-comparison", help="Guarda el dictamen final y puntaje de un subtema en SQLite y disco")
    p_save.add_argument("--exam", required=True, help="ID del examen (ej. 101-500 o 102-500)")
    p_save.add_argument("--subtopic", required=True, help="ID del subtema (ej. 101.1)")
    p_save.add_argument("--input-json", required=True, help="Ruta al fichero JSON con el resultado de evaluación o 'AUTO' para usar baseline")

    # 9. progress
    p_prog = subparsers.add_parser("progress", help="Consulta el estado de progreso en SQLite (páginas, temas, subtemas)")
    p_prog.add_argument("--exam", required=True, help="ID del examen (ej. 101-500 o 102-500)")

    # 10. master-report
    p_rep = subparsers.add_parser("master-report", help="Genera el informe consolidado global del examen")
    p_rep.add_argument("--exam", required=True, help="ID del examen (ej. 101-500 o 102-500)")

    args = parser.parse_args()

    if args.cmd == "hardware-plan":
        print(json.dumps(compute_concurrency_plan(args.topics, args.subtopics), ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "init":
        res = analyze_pdf_structure(args.pdf, args.db)
        print(json.dumps({
            "status": "OK",
            "exam_id": res["exam_id"],
            "total_pages": res["total_pages"],
            "topics_count": res["topics_count"],
            "subtopics_count": res["subtopics_count"],
            "sections_count": res["sections_count"],
            "structure_input_file": f"content-src/_extract/validacion-masiva/{res['exam_id']}/structure-input.json",
            "concurrency_plan": res["concurrency_plan"],
            "server_apis": res["server_apis"],
        }, ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "serve":
        if args.pdf:
            analyze_pdf_structure(args.pdf, args.db)
        run_http_server(args.host, args.port, args.db)
        return 0

    if args.cmd == "next-wave":
        print(json.dumps(get_next_parallel_wave_for_topic(args.topic, args.db), ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "extract-wave-parallel":
        s_list = [s.strip() for s in args.subtopics.split(",") if s.strip()]
        res = extract_wave_in_parallel(args.exam, s_list, args.db, args.workers)
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "pre-compare-wave-parallel":
        s_list = [s.strip() for s in args.subtopics.split(",") if s.strip()]
        res = pre_compare_wave_in_parallel(args.exam, s_list, args.db, args.workers)
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "extract-section":
        if args.section == "ALL":
            res = extract_wave_in_parallel(args.exam, [args.subtopic], args.db, max_workers=3)
            print(json.dumps(res, ensure_ascii=False, indent=2))
        else:
            res = extract_subtopic_section(args.exam, args.subtopic, args.section, args.db)
            print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "pre-compare":
        res = pre_compare_subtopic(args.exam, args.subtopic, args.db)
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "save-comparison":
        if args.input_json.upper() in ("AUTO", "--AUTO"):
            pre_res = pre_compare_subtopic(args.exam, args.subtopic, args.db)
            base_scores = pre_res["automated_baseline_scores"]
            diff = pre_res["diff_summary"]
            missing_list = []
            for k in ("commands", "flags", "paths", "vars", "terms", "acronyms"):
                for m_it in diff.get(k, {}).get("missing", [])[:15]:
                    missing_list.append({"kind": k, "item": m_it, "page": "PDF", "detail": f"Ausente en la web ({k})"})
            for m_pl in pre_res["pdf_official_metadata"].get("partial_list_missing_in_web", []):
                missing_list.append({"kind": "partial_list", "item": m_pl, "page": "Portada", "detail": "Elemento de la lista parcial oficial no detectado"})
            extra_list = [
                {"kind": "command", "item": c, "detail": "Comando presente en la web pero no citado en este subtema del PDF"}
                for c in diff.get("commands", {}).get("extra_in_web", [])
            ]
            payload = {
                "scores": {
                    "total": base_scores["total_weighted"],
                    "commands_flags_paths": base_scores["commands_flags_paths_vars_30pct"],
                    "definitions_glossary": base_scores["definitions_glossary_acronyms_20pct"],
                    "theory_statements": base_scores["theory_statements_25pct"],
                    "exercises_practical": base_scores["exercises_guided_and_exploratory_25pct"],
                },
                "executive_summary": (
                    f"Evaluación determinista + estructural del subtema {args.subtopic}. "
                    f"Lección web: {pre_res['web_status']['lesson']['slides_count']} diapositivas "
                    f"(placeholder={pre_res['web_status']['lesson']['placeholder']}). "
                    f"Laboratorio web: {pre_res['web_status']['lab']['steps_count']} pasos."
                ),
                "missing_from_web": missing_list,
                "extra_in_web": extra_list,
                "distortions_or_errors": [],
                "actionable_fixes": [
                    f"Añadir los comandos ausentes: {', '.join(diff['commands']['missing'][:10])}" if diff["commands"]["missing"] else "Comandos principales cubiertos.",
                    f"Cubrir elementos de la lista parcial: {', '.join(pre_res['pdf_official_metadata']['partial_list_missing_in_web'][:8])}" if pre_res["pdf_official_metadata"]["partial_list_missing_in_web"] else "Lista parcial oficial cubierta.",
                ],
            }
        else:
            with open(args.input_json, "r", encoding="utf-8") as f:
                payload = json.load(f)
        res = save_subtopic_validation_report(args.exam, args.subtopic, payload, args.db)
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "progress":
        res = get_exam_progress(args.exam, args.db)
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "master-report":
        res = generate_master_exam_report(args.exam, args.db)
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(main())
