"""
check_align.py - compare EVERY pointer against sky, not a 10-word sample.

Usage:
    python check_align.py new.pdf CV_old.pdf

Extracts every body-text line inside the bullet column from both PDFs,
matches them by text (exact, then fuzzy), and reports where each line ends.
"""
import sys
import re
import difflib
import statistics
import fitz

BODY_PT = 9.75
TOL = 0.25
COL_LEFT = 106      # right of the label column
COL_RIGHT = 544     # left of the year column


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def lines(path):
    doc = fitz.open(path)
    rows = {}
    for pno, pg in enumerate(doc):
        for b in pg.get_text("dict")["blocks"]:
            for l in b.get("lines", []):
                for s in l["spans"]:
                    if not s["text"].strip():
                        continue
                    if abs(s["size"] - BODY_PT) > TOL:
                        continue
                    if s["bbox"][0] < COL_LEFT or s["bbox"][0] > COL_RIGHT:
                        continue
                    rows.setdefault((pno, round(s["bbox"][1], 1)), []).append(s)
    out = []
    for key in sorted(rows):
        sp = sorted(rows[key], key=lambda s: s["bbox"][0])
        txt = "".join(s["text"] for s in sp).strip()
        if len(txt) < 45:
            continue
        out.append({
            "page": key[0], "y": key[1], "text": txt,
            "x0": sp[0]["bbox"][0], "x1": sp[-1]["bbox"][2],
            "key": norm(txt)[:44],
        })
    return out, len(doc)


def main(mine, sky):
    A, npg = lines(mine)
    B, _ = lines(sky)
    bykey = {r["key"]: r for r in B}
    pool = list(bykey)

    pairs, unmatched = [], []
    for r in A:
        m = bykey.get(r["key"])
        if m is None:
            c = difflib.get_close_matches(r["key"], pool, n=1, cutoff=0.75)
            m = bykey[c[0]] if c else None
        if m is None:
            unmatched.append(r)
        else:
            pairs.append((r, m))

    print("=" * 74)
    print(f"  {mine}   vs   {sky}")
    print("=" * 74)
    print(f"  pointers: {len(A)} yours / {len(B)} sky   matched: {len(pairs)}")
    if npg > 1:
        print(f"  !! {npg} pages - sky is 1")
    print()

    diffs = [(a["x1"] - b["x1"], a, b) for a, b in pairs]
    diffs.sort(key=lambda t: -abs(t[0]))

    print(f"  {'pointer':50s}{'sky':>8s}{'yours':>8s}{'diff':>8s}")
    for d, a, b in diffs:
        flag = "" if abs(d) <= 3 else "  <-- FIX"
        print(f"  {a['text'][:50]:50s}{b['x1']:8.2f}{a['x1']:8.2f}{d:+8.2f}{flag}")

    ds = [d for d, _, _ in diffs]
    if ds:
        print()
        print(f"  mean {statistics.mean(ds):+.3f} pt | median {statistics.median(ds):+.3f} pt"
              f" | worst {max(abs(x) for x in ds):.2f} pt")
        for t in (0.5, 1, 2, 3):
            print(f"    within {t} pt: {sum(1 for x in ds if abs(x) <= t):2d}/{len(ds)}")
        bad = sum(1 for x in ds if abs(x) > 3)
        print()
        print("  *** ALL POINTERS ALIGNED ***" if bad == 0 and not unmatched
              else f"  {bad} pointer(s) beyond 3 pt, {len(unmatched)} unmatched")

    if unmatched:
        print("\n  unmatched (text differs from sky - check wording):")
        for r in unmatched:
            print(f"    p{r['page']+1} y={r['y']:.0f}  {r['text'][:58]!r}")
    print()
    return sum(1 for x in ds if abs(x) > 3) + len(unmatched)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    sys.exit(1 if main(sys.argv[1], sys.argv[2]) else 0)