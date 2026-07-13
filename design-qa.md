# Design QA — source covers, header, and footer

- Reference: the user-owned live site at `https://agencyluxuryself.com/`.
- Desktop comparison: `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-fidelity\comparison-desktop-source-left-local-right.png`.
- Mobile comparison: `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-fidelity\comparison-mobile-source-left-local-right.png`.
- Desktop footer comparison (source above, corrected implementation below): `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-fidelity\comparison-footer-desktop-source-top-local-bottom.png`.
- Mobile footer comparison (source left, corrected implementation right): `C:\Users\Edgar\.codex\visualizations\2026\07\13\019f5a26-633e-73f2-a50b-14d2f3acf8c4\agency-fidelity\comparison-footer-mobile-source-left-local-right.png`.
- Desktop viewport: 1440 × 900. Mobile viewport: 390 × 844.
- Comparison convention: source on the left, corrected implementation on the right.

The first pass found P1 fidelity regressions: a horizontal desktop navigation replaced the original hamburger header, the header was opaque at the top, the real logo was replaced by text, the home hero became a split layout, multiple section covers used unrelated substitute imagery, and the original compact light footer had become a tall dark navigation block.

The correction restores the eight original source covers and both original logo treatments. Every top-level route now uses the correct large, centered, cover-sized image. The fixed header starts transparent over cover routes, preserves the hamburger/logo/flag structure on desktop and mobile, then transitions to the existing ivory surface with the dark logo after scroll. Non-cover routes start with the solid header so their content remains unobscured. The footer now matches the source anatomy on desktop and mobile: light compact surface, dark logo, four icon-led contact links, divider, full legal links, and copyright.

Final QA covered all eight Spanish top-level routes, representative mobile covers, transparent and scrolled header states, desktop and mobile footer comparisons, menu open/close and Escape behavior, keyboard focus, console errors, responsive overflow, source-file hashes, Open Graph cover mapping, release integrity, links, and the exact Nuklo Core contract. Localized template copy remains intentionally independent from the source wording; the requested fidelity surface was imagery, crop, header anatomy, scroll behavior, and footer anatomy.

- P0: none.
- P1: none remaining.
- P2: none remaining in the requested fidelity surface.

final result: passed
