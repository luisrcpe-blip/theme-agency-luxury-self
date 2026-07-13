# Design QA — menu, contact, properties, and journal

- Reference: the user-owned live site at `https://agencyluxuryself.com/`.
- Comparison convention: original on the left, corrected implementation on the right.
- Desktop boards:
  - `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-fidelity-2\compare-menu-desktop.png`
  - `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-fidelity-2\compare-contact-desktop.png`
  - `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-fidelity-2\compare-properties-desktop.png`
  - `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-fidelity-2\compare-blog-desktop.png`
- Mobile boards:
  - `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-fidelity-2\compare-menu-mobile.png`
  - `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-fidelity-2\compare-contact-mobile.png`
  - `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-fidelity-2\compare-properties-mobile.png`
  - `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-fidelity-2\compare-blog-mobile.png`

The first pass confirmed the user-reported P1 regressions: the lateral menu was too tall and internally scrollable, the four-language flags were crowded, contact omitted the original keys image and source-style form anatomy, property detail galleries stopped after nine images, and the journal omitted its secondary column, recent posts, contact form, and article covers.

The corrected menu preserves the compact source anatomy and uses no internal scroll. It was measured at 1280 × 720, 390 × 844, and 667 × 375: in every state `scrollHeight === clientHeight`, all seven links remain visible, and the panel uses `overflow: hidden`. The language control now presents one aligned current flag plus a chevron; its four localized destinations, `aria-expanded`, outside close, and two-stage Escape behavior were verified.

Contact now uses the original cover and recovered keys photograph, the three-item contact strip, split image/form composition, map/service band, and compact light footer transition. Properties use the original cover and source listing images in a two-column desktop grid and single-column mobile grid. Villa KOA renders all 46 available hero/gallery images and three related properties. The journal uses a two-column article grid plus a narrow right sidebar with categories, recent articles, the recovered background image, and a functional enquiry form; mobile collapses cleanly to one article column. Article pages now open with their own large source cover.

Final QA covered transparent-to-solid header behavior, menu focus and Escape behavior, the short-landscape menu, localized article links, responsive horizontal overflow, broken-image checks, browser console errors, 11 property cards, complete galleries, article ordering, desktop/mobile comparison boards, source hashes, release integrity, route links, and the exact Nuklo Core contract.

- P0: none.
- P1: none remaining.
- P2: none remaining in the requested fidelity surface.

final result: passed
