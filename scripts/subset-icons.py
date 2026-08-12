"""Regenerate src/styles/fonts/material-symbols-outlined.woff2.

The full Material Symbols Outlined font is ~4 MB; the panel uses 27 glyphs.
This pins every variable axis (CEP's Chromium has no variable-font support on
the older hosts) and subsets to the ligatures actually rendered, which brings
the file to a few KB.

    pip install fonttools brotli
    python scripts/subset-icons.py

Keep ICONS in sync with the comment in src/styles/fonts.css.
"""

import os

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "node_modules", "material-symbols", "material-symbols-outlined.woff2")
OUT = os.path.join(ROOT, "src", "styles", "fonts", "material-symbols-outlined.woff2")

ICONS = """
add anchor build check check_circle close east error expand_more
filter_center_focus folder_open info movie north north_east north_west
open_in_new progress_activity refresh search south south_east south_west
speed upgrade warning west
""".split()


def main():
    font = TTFont(SRC)
    font = instancer.instantiateVariableFont(font, {"wght": 300, "FILL": 0, "GRAD": 0, "opsz": 24})

    options = Options()
    options.flavor = "woff2"
    # Material Symbols maps icon names through REQUIRED ligatures (rlig), not
    # liga — dropping rlig silently strips every icon glyph.
    options.layout_features = ["rlig", "liga", "ccmp"]
    options.layout_closure = False  # keep only the ligatures listed above
    options.name_IDs = ["*"]
    options.drop_tables += ["DSIG"]

    subsetter = Subsetter(options=options)
    subsetter.populate(glyphs=ICONS, text="".join(sorted(set("".join(ICONS)))))
    subsetter.subset(font)

    font.flavor = "woff2"
    font.save(OUT)
    print("%d icons -> %.1f KB  %s" % (len(ICONS), os.path.getsize(OUT) / 1024, OUT))


if __name__ == "__main__":
    main()
