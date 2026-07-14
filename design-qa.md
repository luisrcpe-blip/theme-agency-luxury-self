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

The initial audit found that the first four WordPress listings publish one attachment each and no gallery nodes. Their local files were valid, but the implementation hid the media section whenever the assembled image array had length one. That visibility defect remains corrected. For La Paloma, however, treating the damaged WordPress attachment set as the complete media truth was insufficient: a second source-grounded recovery identified the exact syndicated property reference V214 by matching the location, 4 bedrooms, 4 bathrooms, 560 m² built area, 1,356 m² plot, 150 m² terrace, description, and the ALS cover photograph.

Visible card media loads eagerly for the first four listing results and for related-property cards. In full galleries, the first four images are prioritized while later photographs remain lazy. La Paloma now exposes 60 unique photographs: the existing ALS cover plus 59 recovered V214 originals, with the matching source image 10 excluded to prevent duplication. All 60 local files decode correctly, the lightbox advances between images, and the complete source set remains traceable through `content/property-gallery-overrides.json`. Villa KOA still exposes all 46 available images.

The requested gallery redesign now keeps the full-bleed hero intact and places the media strip directly beneath it, before the property summary. The former four/two-column grid has been removed in favor of a single non-wrapping horizontal track at every breakpoint. Desktop and mobile rules retain dedicated carousel controls, touch scrolling, compact thumbnails, and no multi-row fallback. All 60 La Paloma image files remain present with zero missing local assets. Production build and link validation passed.

## Exact La Paloma V214 gallery recovery

- Exact syndicated source: `https://www.openfrontiers.com/properties/la-paloma/villa/V214` (60 source photographs).
- Independent price/reference corroboration: `https://www.selectionmed.com/proprietes/la-paloma/villa/V214`.
- WordPress-loss evidence: `https://public-api.wordpress.com/rest/v1.1/sites/254206541/posts/2772` reports one attachment.
- Existing ALS cover vs V214 image 10 match: `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\property-gallery-recovery\hero-match.jpg`.
- Full 60-image source contact sheet: `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\property-gallery-recovery\contact-sheet.jpg`.
- Source-versus-implementation comparison: `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\property-gallery-recovery\compare-source-vs-implementation.jpg`.
- Desktop implementation evidence: `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\property-gallery-recovery\downloads\04-complete-gallery-visible.png`.
- Mobile implementation evidence: `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\property-gallery-recovery\downloads\05-complete-gallery-mobile.png`.

- P0: none.
- P1: none remaining in property image visibility.
- P2: the live source currently provides no additional original photos for the first four listings; adding more requires an authorized original-media source.

final result: passed

## Cover-adjacent property carousel and zoom viewer

The property-detail source order is now hero cover, horizontal thumbnail carousel, summary, and long-form content. The carousel scrolls by touch/trackpad or previous/next controls and progressively loads the complete original gallery. Its arrow states follow real overflow and scroll position, including viewport changes. Clicking a thumbnail opens an accessible modal with focus trapping, Escape and arrow-key navigation, an image counter, localized controls, and body-scroll locking. Zoom supports 100–400% controls, keyboard shortcuts, mouse-wheel input, double-click toggle, and constrained pointer/touch panning while enlarged; changing images resets the view before the next photograph renders, and resize/rotation reclamps the pan bounds.

La Paloma still resolves to 59 recovered gallery photographs plus its distinct ALS cover (60 unique images total), and all 59 gallery asset paths exist locally. The live Vite page and transformed application module returned HTTP 200 with the new carousel and zoom viewer code. The full immutable release check passed: 136 routes, 512 integrity-tracked files, 1,112 references, all published assets, redirects, sitemap URLs, and the Nuklo Core contract.

## Exact Penthouse Sotogrande A213 gallery recovery

- ALS source: `https://agencyluxuryself.com/portfolio/la-paloma-manilva-copy-2772/` (WordPress post `221646`).
- Historical listing match: `https://luxurysotogrande.com/property/stunning-penthouse-with-views/` (reference `LS0427`, historical asking price €1,650,000).
- Exact gallery source: `https://www.openfrontiers.com/properties/sotogrande-puerto-deportivo/penthouse/A213` (reference `A213`, 23 photographs).
- Independent syndicated corroboration: `https://www.propertytop.com/forsale/sotogrande-puerto-deportivo/penthouses/642-A213`.

The ALS page exposes only its cover and no `.als-gallery` nodes. A213 is an exact identity match through its 4 bedrooms, 3 bathrooms plus guest toilet, 480 m² built area, south-west orientation, marina/Mediterranean/Gibraltar views, fireplace, marble floors, two parking spaces, security service, and matching cover photograph. The source listing later changed its asking price, but the stable references, specifications and media prove it is the same property; LS0427 preserves the historical €1,650,000 evidence.

ALS retains its existing cover. Source image 1 was excluded because it is that cover: after normalization, the re-encoded files differ by only 2.533 grayscale levels on average. Source images 2–23 were optimized locally and added as the fallback gallery, producing 23 total images. All 23 decode correctly, have unique paths and SHA-256 hashes, and are at least 1600 × 900. Provenance and the deterministic local paths are recorded in `content/property-gallery-overrides.json`; if ALS later publishes its own gallery, the importer will prefer the live source automatically.

## Complete 11-property media audit and Ribera recoveries

The full portfolio was audited property by property. Before this pass, every route and existing image worked, but Ribera del Paraíso and Ribera del Marlin still exposed only one cover each. Exact syndicated listings were recovered instead of borrowing unrelated media:

- Ribera del Paraíso: Open Frontiers reference `A181`, 9 source photographs. The ALS cover matches source photo 9 (2.383 mean grayscale levels after normalization), so source photos 1–8 were retained in source order and photo 9 was excluded as the duplicate cover. PropertyTop corroborates the historical €519,000 price and matching 3-bedroom, 2-bathroom, 185 m² specification.
- Ribera del Marlin: Open Frontiers reference `A525`, 21 source photographs. The ALS cover matches source photo 15 (2.271 mean grayscale levels after normalization), so the other 20 photographs were retained in source order and photo 15 was excluded as the duplicate cover. JamesEdition A525 and Luxury Sotogrande LS0431 independently corroborate the €720,000 price, 2 bedrooms, 2 bathrooms plus guest toilet, and 114 m² interior + 50 m² terrace = 164 m² built specification.

Final portfolio inventory:

| Property | Cover | Gallery | Total |
| --- | ---: | ---: | ---: |
| La Paloma | 1 | 59 | 60 |
| Penthouse Sotogrande | 1 | 22 | 23 |
| Ribera del Paraíso | 1 | 8 | 9 |
| Ribera del Marlin | 1 | 20 | 21 |
| Villa KOA | 1 | 45 | 46 |
| Zona C | 1 | 43 | 44 |
| Villa Ebony | 1 | 48 | 49 |
| Villa de Golf | 1 | 32 | 33 |
| Zona B | 1 | 40 | 41 |
| Zona G | 1 | 21 | 22 |
| Villa Verde | 1 | 10 | 11 |

The portfolio now contains 359 local property images. Final verification checks every declared path, decodes every file with Sharp, rejects duplicate paths and hashes within each property, requests all 359 media URLs over the local server, and requests all 44 localized property routes (11 properties × ES/EN/DE/FR).
