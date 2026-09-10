"""
Ingest -> Structured Extraction -> GxP Rule Audit.

This mirrors the three-stage flow of the founder demo (dossier + QA package
PDFs -> regulatoryFiling.json -> rules.yaml audit -> compliance_report.json)
in a simplified, dependency-light form suitable for an MVP scaffold.

Swap `extract_fields()` for a real NLP/LLM-assisted extractor and expand
`rules.yaml` for production use -- see README "Limitations & Future Work".
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

import pdfplumber
import yaml

RULES_PATH = Path(__file__).parent / "rules.yaml"

# Bundled sample values, used when the visitor clicks "Run with bundled
# sample" instead of uploading real files -- lets anyone try the product
# on the landing page with zero setup, matching the founder demo's UX.
BUNDLED_SAMPLE_FIELDS: dict[str, Any] = {
    "product_name": "Amlodipine Besylate API",
    "nomenclature_present": True,
    "yield_percent": 96.4,
    "nitrosamine_ppm": 0.8,
    "coa_present": True,
    "ksm_coa_match": True,
    "open_deviations": 0,
}


@dataclass
class ExtractionResult:
    fields: dict[str, Any] = field(default_factory=dict)
    raw_text_preview: str = ""


def extract_text_from_pdf(file_bytes: bytes, max_pages: int = 25) -> str:
    text_chunks: list[str] = []
    with pdfplumber.open(file_bytes if hasattr(file_bytes, "read") else _as_stream(file_bytes)) as pdf:
        for page in pdf.pages[:max_pages]:
            text_chunks.append(page.extract_text() or "")
    return "\n".join(text_chunks)


def _as_stream(file_bytes: bytes):
    import io

    return io.BytesIO(file_bytes)


_FIELD_PATTERNS: dict[str, re.Pattern] = {
    "yield_percent": re.compile(r"(?:batch\s+)?yield[:\s]+([\d.]+)\s*%", re.I),
    "nitrosamine_ppm": re.compile(r"nitrosamine[^\d]{0,30}([\d.]+)\s*ppm", re.I),
    "open_deviations": re.compile(r"open\s+deviations?[:\s]+(\d+)", re.I),
}


def extract_fields(dossier_text: str, qa_text: str) -> ExtractionResult:
    """
    Best-effort structured extraction via regex. Real production systems
    should replace this with a layout-aware parser or an LLM extraction
    step with function-calling / schema validation.
    """
    combined = f"{dossier_text}\n{qa_text}"
    fields: dict[str, Any] = {}

    for key, pattern in _FIELD_PATTERNS.items():
        m = pattern.search(combined)
        if m:
            try:
                fields[key] = float(m.group(1)) if "." in m.group(1) else int(m.group(1))
            except ValueError:
                fields[key] = None
        else:
            fields[key] = None

    fields["nomenclature_present"] = bool(re.search(r"\bINN\b|\bIUPAC\b", combined, re.I))
    fields["coa_present"] = bool(re.search(r"certificate of analysis|\bCoA\b", combined, re.I))
    fields["ksm_coa_match"] = bool(
        re.search(r"key starting material", combined, re.I)
        and re.search(r"certificate of analysis|\bCoA\b", combined, re.I)
    )

    return ExtractionResult(fields=fields, raw_text_preview=combined[:500])


def load_rules() -> list[dict]:
    with open(RULES_PATH, "r") as f:
        data = yaml.safe_load(f)
    return data["rules"]


def evaluate_rules(fields: dict[str, Any]) -> dict[str, Any]:
    rules = load_rules()
    findings = []
    passed = 0

    for rule in rules:
        value = fields.get(rule["field"])
        ok, reason = _check_rule(rule, value)
        if ok:
            passed += 1
        findings.append(
            {
                "id": rule["id"],
                "description": rule["description"],
                "severity": rule["severity"],
                "field": rule["field"],
                "observed_value": value,
                "passed": ok,
                "reason": reason,
            }
        )

    total = len(rules)
    score = round((passed / total) * 100) if total else 0
    critical_failures = [f for f in findings if not f["passed"] and f["severity"] == "critical"]
    verdict = "FAIL" if critical_failures else ("REVIEW" if score < 100 else "PASS")

    return {
        "score": score,
        "verdict": verdict,
        "findings": findings,
        "summary": {
            "total_rules": total,
            "passed": passed,
            "failed": total - passed,
            "critical_failures": len(critical_failures),
        },
    }


def _check_rule(rule: dict, value: Optional[Any]) -> tuple[bool, str]:
    check = rule["check"]
    if value is None:
        return False, "Field could not be extracted from the supplied documents."

    if check == "range":
        ok = rule["min"] <= value <= rule["max"]
        return ok, f"Expected between {rule['min']} and {rule['max']}, observed {value}."
    if check == "max":
        ok = value <= rule["max"]
        return ok, f"Expected at most {rule['max']}, observed {value}."
    if check == "min":
        ok = value >= rule["min"]
        return ok, f"Expected at least {rule['min']}, observed {value}."
    if check == "boolean_true":
        ok = bool(value)
        return ok, "Expected condition to be satisfied." if not ok else "Condition satisfied."
    return False, f"Unknown check type '{check}'."


def run_pipeline(
    dossier_bytes: Optional[bytes],
    qa_bytes: Optional[bytes],
    use_bundled_sample: bool,
) -> dict[str, Any]:
    if use_bundled_sample:
        fields = dict(BUNDLED_SAMPLE_FIELDS)
    else:
        dossier_text = extract_text_from_pdf(dossier_bytes) if dossier_bytes else ""
        qa_text = extract_text_from_pdf(qa_bytes) if qa_bytes else ""
        extraction = extract_fields(dossier_text, qa_text)
        fields = extraction.fields

    audit = evaluate_rules(fields)
    return {
        "extracted_fields": fields,
        **audit,
    }
