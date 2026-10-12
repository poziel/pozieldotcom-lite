# Pøziel logo exploration

## Current direction: folded P

The latest brief replaces the circle-and-diamond direction with a simpler folded shape inspired by the user's fourth ribbon reference. The curved top suggests the bowl of a P; a pinched left edge and broad lower sweep keep the mark abstract. Pink, violet, and blue replace the previous warm palette. The user approved this direction on October 12, 2026; it is installed in the local website preview.

`public/brand/poziel-mark.svg` is the shared profile and favicon asset: three native paths, three linear gradients, a transparent background, and a `128 × 128` viewBox. It contains no raster images, text, filters, or external dependencies. Edit its gradient stops to change the logo colors.

Open `folded-p/index.html` on the Vite development server for light/dark samples, 16/24/48 pixel sizes, and a monochrome version. `folded-p/poziel-mark-mono.svg` uses a small negative-space seam to separate the folds in one color; inline it to inherit `currentColor`, or use it as a CSS mask.

The website stays charcoal with a pale lilac profile card. `src/style.css` defines three accent roles: lilac `#b08af0` for small text and focus on charcoal, violet `#9964e8` for the large headline, and deep purple `#6d28b8` on the light card. Pink and blue are concentrated in the logo.

## Archived direction: circle and diamond

The previous installed C1 asset is preserved as `c1-amber-blue.svg`. It had wider arc openings, amber upper arc and diamond, and a muted blue lower arc. The earlier teal lower arc was too close to Subfolio's branding. The geometry and color studies below are retained as design history.

The four-part C mark from round 2 was preferred, with a request for a more distinctive design. Subsequent visual references favored rounded circular ribbons around a central diamond.

Open `round-3/index.html` for the archived SVG studies, with color, amber, and monochrome modes:

- **C1 — Open orbit:** two opposing, slightly tilted ribbons with a faceted diamond and shaded folds.
- **C2 — Fourfold:** the circular four-part C frame with a central diamond.
- **C3 — Cut circle:** a continuous circular frame around a rounded diamond opening and smaller diamond.

Each has an editable color SVG using native linear gradients and a separate `-mono.svg` using `currentColor`. Both versions have transparent backgrounds, a `128 × 128` viewBox, and no raster images, fonts, or external dependencies. The comparison includes 16, 24, and 48 pixel samples. These versions remain archived review assets.

C1 was the selected direction. Its two arcs have slightly wider openings: each end was shortened by 5 degrees, preserving the circular outline, 180-degree rotational symmetry, central diamond, and colors. `c1-spacing/index.html` compares the original and refined spacing, including small sizes on light and dark backgrounds.

`site-preview/index.html` shows the updated C1 beside the name on the actual landing page and in a simulated browser tab, with C3 retained for comparison. It offers desktop and mobile sizes and uses the same portrait for both. Serve it through Vite (for example, `http://127.0.0.1:4174/docs/branding/site-preview/`); it changes only the iframe preview DOM, not the app source.

## Round 2: circular SVG studies

The initial angular Ø draft was rejected. This earlier brief favored abstract circular marks, well-balanced symmetry, and SVG as the source format.

Open `round-2/index.html` to compare three new candidates in monochrome or amber, on light or dark backgrounds, including 16, 24, and 48 pixel samples:

- `round-2/a-twin-arc.svg`: two rounded hooks with 180-degree rotational symmetry.
- `round-2/b-threefold.svg`: three curved segments with 120-degree rotational symmetry.
- `round-2/c-quarter.svg`: four curved segments with 90-degree rotational symmetry.

All three are native SVG paths with a shared `128 × 128` viewBox and `currentColor` fill. They contain no embedded images, fonts, filters, masks, or external dependencies. Inline them to inherit text color; when loading as an image, set the desired color in the SVG or use a CSS mask.

These candidates are for review and are not used by the landing page or favicon.

## Archived first round

Direction C was initially selected on October 12, 2026: an angular Ø derived from the EØGAMING mark's chamfered corners, separated segments, and descending diagonal stroke.

- `poziel-logo-directions.png`: the first three directions.
- `poziel-mark-c-draft.png`: transparent amber raster draft of the selected direction.
- `preview.html`: the draft on light and dark backgrounds, including small sizes.

These are review assets, not yet used by the landing page or favicon. The final geometry and wordmark are still open for refinement.

Generated with the built-in imagegen tool, using the user's three EØGAMING logos as references. The refinement prompt requested only the C symbol, balanced stroke weights and clear gaps, a flat amber fill matching `#eebd78`, and a transparent background, with no lettering, glow, or additional decoration.
