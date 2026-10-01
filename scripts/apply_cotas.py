#!/usr/bin/env python3
"""Cruza a relação oficial de pessoas pretas ou pardas com a base principal."""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path

ROW_RE = re.compile(r"^\s*(\d{12})\s+(.*?)\s{2,}(\S.*?\S)\s*$")


def extract_inscriptions(path: Path) -> set[str]:
    inscriptions: set[str] = set()
    with tempfile.NamedTemporaryFile(suffix=".txt") as text_file:
        subprocess.run(["pdftotext", "-layout", str(path), text_file.name], check=True)
        lines = Path(text_file.name).read_text(encoding="utf-8").splitlines()
    for line in lines:
        match = ROW_RE.match(line)
        if match:
            inscriptions.add(match.group(1))
    return inscriptions


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("records", type=Path)
    parser.add_argument("cotas_pdf", type=Path)
    args = parser.parse_args()
    records = json.loads(args.records.read_text(encoding="utf-8"))
    quota_inscriptions = extract_inscriptions(args.cotas_pdf)
    matched = 0
    for record in records:
        if record["inscricao"] in quota_inscriptions:
            record["cota"] = "Pessoa preta ou parda"
            matched += 1
    args.records.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{matched} registros marcados como pessoa preta ou parda; {len(quota_inscriptions)} inscrições na fonte complementar")
    if matched != len(quota_inscriptions):
        raise SystemExit("Atenção: houve inscrições da fonte complementar sem correspondência na base principal")


if __name__ == "__main__":
    main()
