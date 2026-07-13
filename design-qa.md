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

## UX typography and photographic-text contrast pass

- Browser-rendered baseline: `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-ux-typography-shadow\contact-before-582x796.png`.
- Corrected implementation: `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-ux-typography-shadow\contact-after-582x796.png`.
- Same-state comparison board: `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-ux-typography-shadow\contact-typography-before-after.png` (baseline left, corrected implementation right).
- Comparison viewport: 582 × 796, same contact route, language, scroll position, cover image, and browser state.
- Additional corrected surfaces:
  - properties cover at 1280 × 720: `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-ux-typography-shadow\properties-hero-desktop-1280x720.png`;
  - property detail and summary at 1280 × 720: `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-ux-typography-shadow\property-detail-desktop-1280x720.png`;
  - contact image caption at 390 × 844: `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-ux-typography-shadow\contact-visual-mobile-390x844.png`;
  - journal sidebar form at 1280 × 720: `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-ux-typography-shadow\blog-sidebar-desktop-1280x720.png`.

The baseline exposed a P1 readability issue: photographic covers relied on thin type, a weak scrim, and no edge contrast, so the title and supporting copy lost definition over light foliage and architecture. The correction establishes a clear eyebrow/title/body hierarchy, adds restrained two-layer shadows only to text placed over photography, and strengthens the cover gradients. Light cards and solid content panels deliberately remain shadow-free.

Post-fix measurements on the contact cover confirmed title 49.6 px/500, lead 15.2 px/500, and eyebrow 12 px/700. The properties cover measured 58.88 px/500 for the title, while property-detail titles use a balanced 28ch desktop measure and an 18ch mobile limit. A 111-character mobile property title was verified at 390 px wide without clipping or horizontal overflow. The journal form now uses readable 11.2 px/700 field labels, 11.84 px/500 privacy copy, and 16 px mobile inputs to avoid browser zoom.

Required fidelity surfaces: original covers and crops remain unchanged; transparent-to-solid header behavior remains intact; title hierarchy is stronger without changing localized copy; shadows are scoped to photography; overlays preserve image detail; responsive headings fit desktop, portrait mobile, and long translated titles; property prices and metrics remain clean on light panels. Broken-image checks found none, horizontal-overflow checks passed, and the browser console reported no errors.

- P0: none.
- P1: none remaining.
- P2: none remaining in the requested typography and contrast surface.

## Home source-order, service carousel, and property imagery pass

- Source visual truth:
  - `C:\Users\Edgar\AppData\Local\Temp\codex-clipboard-7de70c46-4d59-4ddd-aca0-c7dd2e2086bd.png` (brand statement directly below the home cover);
  - `C:\Users\Edgar\AppData\Local\Temp\codex-clipboard-c75416fa-a653-47f1-a9cc-668513fe3d1a.png` (three-slide services carousel).
- Same-region comparison boards, source on top and corrected implementation below:
  - `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-home-source-sections\compare-home-statement.jpg`;
  - `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-home-source-sections\compare-home-carousel.jpg`.
- Browser-rendered implementation evidence:
  - Spanish statement and carousel context at 1280 × 720: `implementation-home-statement-context.jpg` and `implementation-home-carousel-context.jpg` in the evidence directory above;
  - German statement and complete stacked carousel at 390 × 844: `implementation-home-de-mobile-statement.jpg` and `implementation-home-de-mobile-carousel.jpg`;
  - Spanish property listing with both first-row photographs visible: `implementation-properties-images.jpg`.

The initial pass exposed a P1 structural mismatch on Inicio: the source statement and service carousel had been replaced by an unrelated three-card grid. The correction restores the source order immediately after the cover, preserves the exact localized brand statement, and rebuilds the three service slides with the original real-estate, property-management, and interior-design photographs. The carousel keeps the source dark-panel/image split, rounded frame, arrows, three indicators, localized CTA destinations, and a stacked image-first mobile layout.

Post-fix browser QA confirmed one active slide out of three, working next-arrow and direct-indicator navigation, the expected localized title and destination after each interaction, no horizontal overflow at 1280 px or 390 px, and all three carousel images decoded successfully. Indicator controls preserve the 12 px source appearance while exposing 36 × 44 px hit areas, visible keyboard focus, and pointer cursors. The German mobile layout fits the longest tested copy without clipping. The property listing still renders 11 cards; after normal lazy-loading traversal, all 11 source photographs reported non-zero natural width, with zero missing or broken images. Home and properties browser consoles reported zero errors.

- P0: none.
- P1: none remaining.
- P2: none remaining in the requested home and property-image surface.

## Property-detail gallery visibility and image-priority pass

- Live source truth: `https://agencyluxuryself.com/portfolio/la-paloma-manilva/`.
- Source-vs-implementation comparison: `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\property-gallery-fix\compare-source-vs-gallery-fix.jpg`.
- Corrected desktop detail: `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\property-gallery-fix\03-property-detail-after.jpg`.
- Responsive evidence: `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\property-gallery-fix\05-property-detail-mobile-after.jpg`.

The audit found that the first four source listings publish one original photograph each and no gallery nodes. Their local files were valid, but the implementation hid the entire gallery whenever the assembled image array had length one. The correction renders every available original gallery immediately after the summary, uses a wide single-image layout when needed, and keeps the description below the media. It does not invent, generate, or substitute photographs.

Visible card media now loads eagerly for the first four listing results and for related-property cards. In full galleries, the first four images are prioritized while later photographs remain lazy. La Paloma now exposes one decoded 1600 x 1068 gallery image and three decoded related-card covers; Villa KOA still exposes all 46 available images, with its first four decoded eagerly and zero broken images. The single-image lightbox opens and closes correctly.

Responsive browser checks passed at 1280 x 720 and an emulated 390 x 844 viewport. The gallery becomes one column with a 4:3 mobile crop, the enquiry CTA remains within its container, and neither viewport has horizontal overflow. Browser consoles reported zero errors. Repository-wide asset verification covered 250 unique property-image references with zero missing or undecodable files. Production build and link validation passed.

- P0: none.
- P1: none remaining in property image visibility.
- P2: the live source currently provides no additional original photos for the first four listings; adding more requires an authorized original-media source.

final result: passed
