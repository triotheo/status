"""Re-extract the status page's pen.js from scripts/owner_dashboard.py's pen (the documented path: 'Edit there, re-extract
here'). usage: extract_pen.py <repo root> <pen.js to write>. Everything is cut VERBATIM out of the dashboard's script."""
import re, sys
from pathlib import Path
src = (Path(sys.argv[1]) / "scripts/owner_dashboard.py").read_text()

def between(start, end, incl_end=True):
    i = src.index(start)
    j = src.index(end, i) + (len(end) if incl_end else 0)
    return src[i:j]

def fn(name):
    """one top-level `function name(` … to its closing `}` at column 0"""
    i = src.index("\nfunction " + name + "(") + 1
    j = src.index("\n}\n", i) + 3
    return src[i:j]

def one_line(prefix):
    i = src.index("\n" + prefix) + 1
    return src[i:src.index("\n", i) + 1]

parts = [
    "/* THE PEN — ported verbatim from scripts/owner_dashboard.py (itself a port of the Learn app's\n"
    "   drawnChrome / CoinChrome at the same seeds), the CALM pen of #1851 included. Edit there, re-extract here; never by hand. */\n",
    one_line("var SVG_STYLE"),
    one_line("function mulberry"),
    between("/* ── THE CALM PEN", "/* ── end of the calm pen ── */") + "\n",
    fn("jitterCircle"),
    fn("wobblePath"),
    fn("arcPts"),
    # once() carries its own comment above it; take the function only
    fn("once"),
    # sketch() and tube() each sit under their own explanatory comment in the dashboard; the functions alone come across
    fn("sketch"),
    fn("tube"),
]
out = "\n".join(p.rstrip("\n") + "\n" for p in parts)
assert "$" not in out
Path(sys.argv[2]).write_text(out)
print(len(out), "bytes;", ", ".join(re.findall(r"^function (\w+)", out, re.M)))
