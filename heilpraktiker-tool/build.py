#!/usr/bin/env python3
"""Baut aus src/ eine einzige, offline nutzbare HTML-Datei.

Aufruf:  python3 build.py
Ergebnis: Krankheiten-Nachschlagewerk.html (kann auf jedes Gerät kopiert
und direkt im Browser geöffnet werden – kein Server, kein Internet nötig).
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT / "Krankheiten-Nachschlagewerk.html"

html = (SRC / "app.html").read_text(encoding="utf-8")
data = "\n".join(
    p.read_text(encoding="utf-8") for p in sorted((SRC / "data").glob("*.js"))
)
app = (SRC / "app.js").read_text(encoding="utf-8")

# "</script" darf im Inline-Skript nicht vorkommen
for name, chunk in (("data", data), ("app", app)):
    if "</script" in chunk.lower():
        raise SystemExit(f"'</script' in {name} gefunden – bitte entfernen")

html = html.replace("/*__DATA__*/", data, 1).replace("/*__APP__*/", app, 1)
OUT.write_text(html, encoding="utf-8")
print(f"OK: {OUT.name} ({OUT.stat().st_size // 1024} KB)")
