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

## Property-card typography readability pass

- Source visual truth: `C:\Users\Edgar\AppData\Local\Temp\codex-clipboard-9dce56ca-bdef-4c2c-8236-a805d55bcb28.png`.
- Browser-rendered implementation evidence:
  - `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-typography-readability\local-properties-typography-desktop.png`
  - `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-typography-readability\local-properties-typography-mobile.png`
- Full-view comparison evidence: `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-typography-readability\compare-properties-typography.png` (source on top, corrected implementation below).
- Viewports and state: focused Spanish desktop listing at 1772 px wide; mobile listing at 390 × 844; the narrow German CTA was also measured at 320 × 800.
- Focused-region evidence: the comparison board isolates the exact title, location, metrics, price, and CTA region, so a second crop was not needed.

The first typography pass found a P1 readability issue: listing titles and prices used the high-contrast display serif at weight 400, while the location, metric labels, and category were too small and low-contrast at card scale. The fix scopes the readable sans family to property cards, with semibold titles, bold tabular prices, stronger metadata weights, a darker category color, and slightly larger secondary text. The display serif remains unchanged for large editorial headings and the logo.

Post-fix browser measurements confirmed title 27.52 px/600 on desktop and 23.68 px/600 on mobile, price 19.84 px/700, location 14.4 px/500, metrics 15 px/600, and metric labels 11.84 px/500. The 390 px mobile card has no horizontal overflow; at 320 px the long German CTA wraps inside the existing flexible footer instead of clipping. No property-card images changed, all visible copy remains intact, no broken images were found, and the browser console reported no errors.

Required fidelity surfaces: typography is now legible while preserving the site's editorial hierarchy; spacing remains flexible with no fixed card height; colors use existing ink tokens plus a darker brass category label; original image assets and crops are unchanged; localized property copy and CTA labels remain unchanged.

Final QA covered transparent-to-solid header behavior, menu focus and Escape behavior, the short-landscape menu, localized article links, responsive horizontal overflow, broken-image checks, browser console errors, 11 property cards, complete galleries, article ordering, desktop/mobile comparison boards, source hashes, release integrity, route links, and the exact Nuklo Core contract.

- P0: none.
- P1: none remaining.
- P2: none remaining in the requested fidelity surface.

final result: passed
