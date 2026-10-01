#!/usr/bin/env python3
"""Extrai inscrições homologadas do PDF ReportLab do concurso SES/TO.

O PDF usa quatro colunas com coordenadas fixas e alguns nomes/cargos quebrados
em linhas auxiliares. O parser agrupa linhas pela coordenada vertical mais
próxima da linha que contém a inscrição.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET

INSCRIPTION_RE = re.compile(r"^\d{12}$")
LOCATION_RE = re.compile(r"^(.+?)/(TO)$")


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def clean(parts: list[str]) -> str:
    return re.sub(r"\s+", " ", " ".join(p for p in parts if p)).strip()


def page_lines(page: ET.Element) -> list[dict[str, Any]]:
    result = []
    for line in page.iter():
        if local_name(line.tag) != "line":
            continue
        columns = {"inscricao": [], "nome": [], "cargo": [], "local": []}
        for word in list(line):
            if local_name(word.tag) != "word":
                continue
            text = clean(["".join(word.itertext())])
            if not text:
                continue
            x = float(word.attrib["xMin"])
            if x < 105:
                columns["inscricao"].append(text)
            elif x < 265:
                columns["nome"].append(text)
            elif x < 445:
                columns["cargo"].append(text)
            else:
                columns["local"].append(text)
        if any(columns.values()):
            result.append({"y": float(line.attrib["yMin"]), "columns": columns})
    return result


def extract(pdf_path: Path) -> list[dict[str, str]]:
    with tempfile.TemporaryDirectory() as tmp:
        bbox = Path(tmp) / "layout.html"
        subprocess.run(["pdftotext", "-bbox-layout", str(pdf_path), str(bbox)], check=True)
        root = ET.parse(bbox).getroot()
        records: list[dict[str, str]] = []
        for page in root.iter():
            if local_name(page.tag) != "page":
                continue
            lines = page_lines(page)
            row_lines = [
                line for line in lines
                if any(INSCRIPTION_RE.fullmatch(x) for x in line["columns"]["inscricao"])
            ]
            for row in row_lines:
                inscription = next(x for x in row["columns"]["inscricao"] if INSCRIPTION_RE.fullmatch(x))
                near = [line for line in lines if abs(line["y"] - row["y"]) <= 9.5]
                # Sort by y so continuations are appended in reading order.
                near.sort(key=lambda line: line["y"])
                name = clean([part for line in near for part in line["columns"]["nome"]])
                cargo = clean([part for line in near for part in line["columns"]["cargo"]])
                local = clean([part for line in near for part in line["columns"]["local"]])
                if not (name and cargo and local):
                    raise ValueError(f"Registro incompleto {inscription}: {name!r} | {cargo!r} | {local!r}")
                match = LOCATION_RE.match(local)
                municipality = match.group(1) if match else local
                records.append({
                    "inscricao": inscription,
                    "nome": name,
                    "cargo": cargo,
                    "localProva": local,
                    "municipio": municipality,
                    "cota": None,
                })
    return records


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    records = extract(args.pdf)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(records)} registros escritos em {args.output}")


if __name__ == "__main__":
    main()
