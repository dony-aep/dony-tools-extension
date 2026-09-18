---
paths:
  - "src/**/*.tsx"
  - "src/styles/fonts.css"
  - "scripts/subset-icons.py"
---

# Icons

The icon font is a static Material Symbols subset (`src/styles/fonts/material-symbols-outlined.woff2`).
When you add or remove an `<Icon name="…">`:

1. Update `ICONS` in `scripts/subset-icons.py` and the matching comment in
   `src/styles/fonts.css`.
2. Run `python scripts/subset-icons.py` (needs `pip install fonttools brotli`).
3. Check on screen that every icon still draws. A bad subset raises no error: it drops glyphs
   and each icon renders as its literal ligature name.
