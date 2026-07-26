"""
check_cv.py - verify a CV PDF exported from the builder.

Usage:
    pip install pymupdf
    python check_cv.py path\\to\\your.pdf
    python check_cv.py new.pdf old.pdf      # compare two files

Reference values are taken from the skynet CV_old.pdf.
"""
import sys
import collections
import re
import fitz

# --- reference values measured from skynet's CV_old.pdf ---
REF = {
    "body_pt": 9.75,          # 13 px body text
    "section_pt": 10.88,      # 14.5 px, same for all five headers
    "table_pt": 9.38,         # 12.5 px academic table
    "awards_y": 632.94,       # y of AWARDS header = vertical budget marker
}
SECTIONS = ["ACADEMIC PROFILE", "INTERNSHIP", "PROJECTS",
            "POSITION OF RESPONSIBILITIES", "AWARDS AND ACHIEVEMENTS"]

OK, BAD, WARN = "[ OK ]", "[FAIL]", "[warn]"


def spans(page):
    out = []
    for b in page.get_text("dict")["blocks"]:
        for line in b.get("lines", []):
            for s in line["spans"]:
                if s["text"].strip():
                    out.append(s)
    return out


def check(path):
    doc = fitz.open(path)
    page = doc[0]
    sp = spans(page)
    fails = 0

    print("=" * 62)
    print(f"  {path}")
    print("=" * 62)
    print(f"  producer: {doc.metadata.get('producer')}")
    print(f"  pages: {len(doc)}   size: {page.rect.width:.2f} x {page.rect.height:.2f} pt\n")

    # ---------- 1. font embedding format ----------
    print("-- 1. FONT FORMAT " + "-" * 44)
    fonts = doc.get_page_fonts(0)
    t3 = [f for f in fonts if f[2] == "Type3"]
    good = [f for f in fonts if f[2] != "Type3"]
    for f in fonts:
        base = f[3] or f"(unnamed, internal name {f[4]})"
        mark = BAD if f[2] == "Type3" else OK
        print(f"  {mark} {base:38s} {f[2]}")
    print()
    if t3:
        print(f"  {BAD} {len(t3)} Type 3 font object(s) found.")
        print("         The static-weight font swap did NOT take effect.")
        print("         Check the @import uses  wght@0,400;0,700  (not 400..800)")
        print("         and that boldWeight is 700.")
        fails += 1
    else:
        print(f"  {OK} No Type 3 fonts. Fonts embedded as real outlines.")

    # ---------- 2. stray non-Garamond fonts ----------
    print("\n-- 2. STRAY FONTS " + "-" * 44)
    stray = [f[3] for f in fonts if f[3] and "aramond" not in f[3].lower()]
    if stray:
        print(f"  {WARN} non-Garamond fonts present: {sorted(set(stray))}")
        print("         'Georgia' usually means a leftover Tailwind font-serif class.")
        print("         (DejaVu / Arial for a single glyph like the rupee sign is fine.)")
    else:
        print(f"  {OK} Everything renders in Garamond.")

    # ---------- 3. section header sizes ----------
    print("\n-- 3. SECTION HEADERS " + "-" * 40)
    found = {}
    for s in sp:
        t = s["text"].strip()
        if t in SECTIONS:
            found[t] = (round(s["size"], 2), round(s["bbox"][1], 2))
    sizes = {v[0] for v in found.values()}
    for name in SECTIONS:
        if name in found:
            size, y = found[name]
            mark = OK if abs(size - REF["section_pt"]) < 0.2 else WARN
            print(f"  {mark} {name:30s} {size:6.2f} pt  ({size/0.75:5.2f} px)  y={y:7.2f}")
        else:
            print(f"  {WARN} {name:30s} not found")
    print()
    if len(sizes) > 1:
        print(f"  {BAD} {len(sizes)} different header sizes: "
              f"{sorted(round(s/0.75, 2) for s in sizes)} px. Should be one value.")
        fails += 1
    else:
        print(f"  {OK} All headers share one size.")

    # ---------- 4. body text size ----------
    print("\n-- 4. TEXT SIZES " + "-" * 45)
    bysize = collections.Counter()
    for s in sp:
        bysize[round(s["size"], 2)] += len(s["text"])
    body = bysize.most_common(1)[0][0]
    mark = OK if abs(body - REF["body_pt"]) < 0.1 else WARN
    print(f"  {mark} dominant body size {body:.2f} pt ({body/0.75:.2f} px) "
          f"- skynet {REF['body_pt']} pt")
    print("       full distribution:")
    for size, n in bysize.most_common(8):
        print(f"         {size:6.2f} pt ({size/0.75:6.2f} px)  {n:5d} chars")

    # ---------- 5. vertical budget ----------
    print("\n-- 5. VERTICAL DRIFT " + "-" * 41)
    if "AWARDS AND ACHIEVEMENTS" in found:
        y = found["AWARDS AND ACHIEVEMENTS"][1]
        d = y - REF["awards_y"]
        mark = OK if abs(d) < 3 else (WARN if abs(d) < 8 else BAD)
        print(f"  {mark} AWARDS header at y={y:.2f} pt   skynet={REF['awards_y']:.2f}"
              f"   drift={d:+.2f} pt")
        if d > 3:
            print(f"         You are using {d:.1f} pt more vertical space than skynet.")
    else:
        print(f"  {WARN} AWARDS header not found - cannot measure drift.")

    # ---------- 6. text layer / ATS ----------
    print("\n-- 6. TEXT LAYER (ATS) " + "-" * 39)
    txt = page.get_text()
    n_pipe_only = re.sub(r"\s+", "", txt).count("|||")
    if n_pipe_only:
        print(f"  {BAD} Found '|||' - the banner text is missing, only separators remain.")
        fails += 1
    else:
        print(f"  {OK} No empty-banner signature.")
    words = len(txt.split())
    print(f"  ---- {words} words / {len(txt)} chars in the text layer "
          f"(skynet: ~823 words / 6217 chars)")
    if words < 700:
        print(f"  {WARN} Noticeably fewer words than skynet - text may not be extracting.")

    # ---------- verdict ----------
    print("\n" + "=" * 62)
    print("  RESULT: " + ("PASS - no blocking issues" if fails == 0
                          else f"{fails} blocking issue(s) above"))
    print("=" * 62 + "\n")
    return fails


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    total = 0
    for p in sys.argv[1:]:
        try:
            total += check(p)
        except Exception as e:
            print(f"[FAIL] could not read {p}: {e}")
            total += 1
    sys.exit(1 if total else 0)