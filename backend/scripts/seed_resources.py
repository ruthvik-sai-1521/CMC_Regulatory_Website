"""
Idempotent seed for the public Resources hub.

Usage:
    python -m scripts.seed_resources

Safe to run repeatedly (and safe to run on every deploy) -- existing slugs
are left untouched, only missing ones are inserted.
"""
from app.database import Base, SessionLocal, engine
from app.models import Resource, ResourceCategory

RESOURCES = [
    dict(
        slug="reading-a-cmc-dossier-in-30-minutes",
        title="Reading a CMC dossier in 30 minutes: what actually matters on first pass",
        summary=(
            "A first-pass reviewer doesn't read a CTD Module 3.2.S front to back. "
            "Here's the order experienced reviewers actually check, and why."
        ),
        category=ResourceCategory.guide,
        read_minutes=7,
        author_name="Regulatory Engineering Team",
        author_role="Rauzr Technologies Pvt Ltd",
        body_markdown=(
            "## Start with identity, not process\n\n"
            "The instinct on a first read is to start at the top of Module 3.2.S and work "
            "downward through the manufacturing process narrative. That's usually the wrong "
            "order. Before the process matters at all, you need to confirm the dossier is "
            "describing the drug substance you think it is: nomenclature (INN and IUPAC name), "
            "structure, and molecular formula should match the application header before you "
            "spend any time on the rest.\n\n"
            "## Then go straight to the numbers that fail submissions\n\n"
            "A small number of fields account for most rejected first-pass reviews:\n\n"
            "- **Batch yield.** Anything outside the validated range on the batch analysis "
            "table is a critical finding, full stop -- it usually means either a process "
            "deviation wasn't disclosed or the validated range itself needs updating.\n"
            "- **Impurity levels**, especially nitrosamines given how much regulatory "
            "attention they've drawn industry-wide. A level above the acceptable intake limit "
            "blocks the batch regardless of how clean everything else looks.\n"
            "- **Open deviations.** A batch with an unresolved deviation attached shouldn't "
            "clear review even if every measured value is in range -- the deviation is "
            "unresolved precisely because its impact isn't fully characterized yet.\n\n"
            "## CoA and KSM cross-referencing is the tedious part worth automating\n\n"
            "Every key starting material listed in the process description needs a matching "
            "Certificate of Analysis reference elsewhere in the package. Doing this "
            "cross-reference by hand across a hundred-plus page dossier is exactly the kind "
            "of mechanical, error-prone work that's worth handing to a structured extraction "
            "pipeline -- not because the judgment is hard, but because eyeballing a match "
            "across two documents hundreds of pages apart is where transcription errors live.\n\n"
            "## What this doesn't replace\n\n"
            "None of the above is a substitute for a qualified reviewer's judgment on borderline "
            "cases -- it's the mechanical first pass that clears the obvious 80% so a reviewer's "
            "time goes to the 20% that actually needs a judgment call."
        ),
    ),
    dict(
        slug="nitrosamine-impurity-screening-explained",
        title="Nitrosamine impurity screening: what changed and what it means for batch release",
        summary=(
            "Why nitrosamine screening became a standard batch-release check industry-wide, "
            "and the practical thresholds a rule engine needs to encode."
        ),
        category=ResourceCategory.regulatory_update,
        read_minutes=6,
        author_name="Regulatory Engineering Team",
        author_role="Rauzr Technologies Pvt Ltd",
        body_markdown=(
            "## The short version\n\n"
            "Since nitrosamine contamination was identified in several widely used drug "
            "substances, regulators have pushed manufacturers to actively screen for "
            "nitrosamine impurities rather than assume their absence. For batch-release "
            "workflows, that turned a check that used to be occasional into a standard, "
            "every-batch gate.\n\n"
            "## What a release rule needs to encode\n\n"
            "At minimum, a batch-release rule set needs a hard ceiling on nitrosamine "
            "impurity concentration, expressed against the acceptable intake limit for the "
            "specific compound in question -- these limits are compound-specific, not a "
            "single industry-wide number, so a rule engine that hardcodes one threshold "
            "across every product is already wrong. Treat any published threshold as a "
            "per-compound configuration value, not a constant.\n\n"
            "## Why this belongs in an automated first-pass, not just a lab step\n\n"
            "The analytical testing itself happens in the lab -- that part isn't in scope for "
            "a document-review pipeline. What *is* in scope is confirming the resulting number "
            "actually made it into the dossier, is attached to the right batch, and is checked "
            "against the right limit before a human reviewer signs off. Missing or mismatched "
            "impurity data is a common, entirely preventable reason a batch bounces back after "
            "review instead of before it.\n\n"
            "## Practical takeaway\n\n"
            "If your current process treats nitrosamine screening as a note in a QA checklist "
            "rather than a hard gate with a numeric threshold enforced before release, that's "
            "the gap to close first -- it's a small rule to add and a common finding."
        ),
    ),
    dict(
        slug="structured-extraction-vs-manual-review",
        title="Structured extraction vs. manual first-pass review: where the time actually goes",
        summary=(
            "A breakdown of where reviewer hours go on a typical dossier, and which parts "
            "are genuinely mechanical vs. genuinely judgment-based."
        ),
        category=ResourceCategory.whitepaper,
        read_minutes=9,
        author_name="Regulatory Engineering Team",
        author_role="Rauzr Technologies Pvt Ltd",
        body_markdown=(
            "## The premise\n\n"
            "Ask most QA and regulatory affairs teams where first-pass review time goes and "
            "they'll describe judgment work: assessing whether a deviation's root cause "
            "analysis is convincing, whether a proposed corrective action is adequate. In "
            "practice, a large share of first-pass time goes somewhere much less interesting: "
            "locating values across a long PDF, confirming two documents refer to the same "
            "batch, and re-checking arithmetic that should have been validated on the way in.\n\n"
            "## A rough time breakdown\n\n"
            "On a typical CMC dossier + QA package pairing, reviewer time roughly splits "
            "into three buckets:\n\n"
            "1. **Locating and transcribing values** -- finding the yield, impurity levels, "
            "CoA references, and deviation status across both documents. Purely mechanical, "
            "no judgment involved, and the highest-error-rate part of manual review because "
            "it's tedious.\n"
            "2. **Checking values against fixed rules** -- is the yield in range, is the "
            "impurity level under the limit, is a CoA present for every KSM. Also mechanical: "
            "these are the same checks every time, on every batch.\n"
            "3. **Judgment calls** -- is a borderline deviation's justification sound, does an "
            "edge case in the rule set need an exception, does the overall filing tell a "
            "coherent story. This is the part that actually needs a qualified reviewer.\n\n"
            "## Where automation helps, and where it doesn't\n\n"
            "Buckets 1 and 2 are exactly what a structured-extraction-and-rule-audit pipeline "
            "is good at: pull the values once, check them against a configurable rule set "
            "every time, and produce a scored report a reviewer can scan in minutes instead of "
            "reconstructing by hand. Bucket 3 isn't going anywhere, and shouldn't -- the goal "
            "isn't removing the reviewer, it's making sure their attention lands on bucket 3 "
            "instead of getting consumed by buckets 1 and 2.\n\n"
            "## What good automation looks like here\n\n"
            "A rule-audit report is only useful if it's honest about its own limits: every "
            "flagged finding should point back to the specific field and page it came from, "
            "and the tool should surface a clear pass/review/fail verdict rather than a vague "
            "risk score. Reviewers trust tools whose reasoning they can check in ten seconds -- "
            "opaque scoring erodes that trust fast."
        ),
    ),
    dict(
        slug="v1-resource-hub-and-pipeline-audit-trail",
        title="What shipped: a public resource hub and a per-run audit trail",
        summary=(
            "Changelog: the Resources hub, structured audit logging on every pipeline run, "
            "and the login-persistence fix."
        ),
        category=ResourceCategory.changelog,
        read_minutes=3,
        author_name="Engineering",
        author_role="Rauzr Technologies Pvt Ltd",
        body_markdown=(
            "## Login persistence fix\n\n"
            "Registered accounts were being lost on every restart/redeploy because the "
            "default SQLite database lived on a container's throwaway filesystem with no "
            "volume mounted behind it -- the app now refuses to boot in production against "
            "an unmounted SQLite path, and both the Docker image and docker-compose setup "
            "point at a persistent volume by default. See the README for the full writeup.\n\n"
            "## Resources hub\n\n"
            "Public, read-without-an-account resource pages (this one included), backed by a "
            "real CRUD API rather than static frontend content -- admins can publish, edit, "
            "and retract entries without a redeploy.\n\n"
            "## Every pipeline run keeps a request ID\n\n"
            "Every API response now carries an `X-Request-ID` header, and it's logged "
            "alongside the endpoint, method, and response time -- useful when tracing a "
            "specific pipeline run or booking back through the logs."
        ),
    ),
]


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    created = 0
    try:
        for entry in RESOURCES:
            exists = db.query(Resource).filter(Resource.slug == entry["slug"]).first()
            if exists:
                continue
            db.add(Resource(**entry))
            created += 1
        db.commit()
    finally:
        db.close()
    print(f"Seed complete: {created} new resource(s) inserted, {len(RESOURCES) - created} already present.")


if __name__ == "__main__":
    main()
