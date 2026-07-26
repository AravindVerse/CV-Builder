"""
check_bullets.py - verify each long bullet still fits on one line.

Usage:
    python check_bullets.py new.pdf

Tests the LAST WORD of the longest bullets. If it sits near skynet's x
position it is still on line 1. If it drops to x~118 the bullet wrapped.
Targets are measured from skynet's CV_old.pdf.
"""
import sys
import fitz

# last word -> skynet's x0 (pt)
TARGETS = {
    "datasets":      535.12,
    "example":       506.48,
    "handling":      534.82,
    "collaboration": 484.68,
    "partnerships":  488.63,
    "Coursera":      496.71,
    "Udemy":         508.94,
    "transition":    502.41,
    "rigor":         518.86,
    "notepad":       498.02,
}
INDENT = 118.0        # left edge of the bullet text column


def main(path):
    pg = fitz.open(path)[0]
    print("=" * 60)
    print(f"  {path}")
    print("=" * 60)
    print(f"  {'last word':16s}{'yours':>9s}{'skynet':>9s}{'diff':>8s}   status")
    wrapped = drift = 0
    for word, target in TARGETS.items():
        hits = pg.search_for(word)
        if not hits:
            print(f"  {word:16s}{'--':>9s}{target:9.2f}{'':>8s}   NOT FOUND")
            continue
        x = hits[0].x0
        if x < INDENT + 12:
            wrapped += 1
            print(f"  {word:16s}{x:9.2f}{target:9.2f}{'':>8s}   *** WRAPPED ***")
        else:
            d = x - target
            flag = "ok" if abs(d) < 6 else "drifted"
            if flag == "drifted":
                drift += 1
            print(f"  {word:16s}{x:9.2f}{target:9.2f}{d:+8.2f}   {flag}")
    print()
    if wrapped == 0 and drift == 0:
        print("  *** ALL BULLETS MATCH SKYNET ***")
    else:
        print(f"  {wrapped} wrapped, {drift} drifted more than 6 pt")
    print()
    return wrapped


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    sys.exit(1 if any(main(p) for p in sys.argv[1:]) else 0)