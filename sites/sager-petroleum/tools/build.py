#!/usr/bin/env python3
"""Inline data/catalog.json into index.html so the prototype stays one self-contained file.

Usage:
    python3 tools/build.py              # rewrite index.html in place
    python3 tools/build.py --artifact OUT.html
                                        # also write a copy without the <html>/<head>/<body> wrapper
                                        # (the claude.ai artifact host adds its own)
"""
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "index.html"
DATA = ROOT / "data" / "catalog.json"
TAG = re.compile(r'(<script id="catalog" type="application/json">)(.*?)(</script>)', re.S)
WRAPPER_LINES = {
    "<!doctype html>", '<html lang="en">', "<head>", "</head>", "<body>", "</body>", "</html>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--artifact", help="also write an artifact-ready copy to this path")
    a = ap.parse_args()
    catalog = json.loads(DATA.read_text(encoding="utf-8"))
    blob = json.dumps(catalog, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    html = PAGE.read_text(encoding="utf-8")
    html, n = TAG.subn(lambda m: m.group(1) + blob + m.group(3), html)
    if n != 1:
        raise SystemExit("catalog script tag not found exactly once")
    PAGE.write_text(html, encoding="utf-8")
    print(f"{PAGE.name}: {len(catalog['products'])} products inlined, {len(html):,} bytes")
    if a.artifact:
        lines = [l for l in html.splitlines() if l.strip() not in WRAPPER_LINES]
        Path(a.artifact).write_text("\n".join(lines) + "\n", encoding="utf-8")
        print(f"artifact copy: {a.artifact}")


if __name__ == "__main__":
    main()
