# Landing page design review

## Latest profile update: fixed portrait and reordered socials

Checked on 2026-10-12. The user approved the folded P logo. The chosen portrait now has a slate-violet studio background and displays on every load. Its original input was preserved; the eleven previous portraits were archived outside the production build. The role, Progi employment, and location are separate unordered-list items. Socials now follow the requested nine-item order: GitHub, LinkedIn, Instagram, YouTube, Twitch, Kick, TikTok, Steam, and X.

- Production build and all six remaining GitHub-star tests pass; obsolete rotation code and tests were removed.
- Browser verified the exact social order and destinations, three profile list items, and updated social-preview image metadata.
- The same portrait remained across three reloads, with an old rotation value in localStorage, and with localStorage blocked. Exactly one portrait was requested; the production portrait directory contains only the new image.
- Chromium widths 320, 360, 390, 760, 761, 1000, and 1440px had no horizontal overflow. Desktop, mobile, and the 320px profile card were inspected visually.
- No JavaScript page errors. Existing GitHub API 404s for localdev and Prismix continue to use the documented unavailable-count fallback.

## Latest local preview: folded P and violet accents

Checked on 2026-10-12. The new logo direction is a first pass for review, replacing the circle-and-diamond mark with an abstract folded P in pink, violet, and blue. The website uses violet accents and a pale lilac profile card. The original layout and typography are retained. Current content includes ten socials, six projects, and eleven portraits.

- Production build passes.
- Native SVG verified: three paths, three linear gradients, transparent background, no raster images, filters, or text. The profile and favicon use the same asset.
- Logo samples inspected at 16, 24, and 48px on light and dark surfaces, plus a monochrome version.
- Chromium layout checks at 320, 390, 760, 761, 1000, and 1440px: no horizontal overflow. Desktop and mobile screenshots inspected.
- Project hover underlining, lilac focus outlines, and deep-purple profile-link focus verified through computed styles.
- Text contrast: large violet headline 4.48:1 against charcoal; small lilac accents 6.48:1 against charcoal; deep-purple links 6.77:1 against the light card.
- No JavaScript page errors during the branding check. Live GitHub counts were not part of this check; unavailable counts retain their existing `—` fallback.
- Not verified in this pass: Safari, Firefox, or physical mobile devices. No deployment performed.

See `docs/branding/folded-p/index.html` on the development server for the new mark and `docs/branding/README.md` for the archived directions.

## Original layout review (historical)

The remaining notes record the earlier amber design reviewed on 2026-10-12 using the frontend-design and better-ui skills. Content and interactions described below have since changed.

## Direction and references

The page uses a charcoal canvas, a cream portrait card, condensed display typography, and a single amber accent. It retains the brief's introduction, nine social links, five projects, rotating portrait, and website announcement without a navigation menu.

- [Nemanja](https://nemanja.works/): direct introduction and clear portrait/social grouping.
- [Akkila](https://akkila.dev/): restrained dark palette and straightforward developer identity.
- [Rohit](https://rohitwork.vercel.app/): compact profile column paired with strong typography.
- [Sawad](https://sawad.framer.website/): contrasting portrait surface and large type hierarchy.

All four were inspected in a browser. The content, typography, accent, social layout, and project presentation are tailored to Pøziel. No reference assets or source code were copied.

## UI polish changes

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| Medium, resolved | `src/components/SocialIcon.vue:1` | Letter abbreviations inside generic tiles | SVG brand icons from one library | Consistent icon style and recognizable destinations |
| Medium, resolved | `src/style.css:36` | Image without a defined edge | Pure black 10% inset outline | Keeps the portrait edge legible without a colored fringe |
| Medium, resolved | `src/style.css:80` | Hover rules active on touch devices | Hover styles gated by pointer capability | Avoids persistent hover feedback after a tap |
| Low, resolved | `src/style.css:33` | Minimal photo rounding without a profile surface | 24px outer radius, 16px inset, 8px image radius | Nested surfaces follow concentric radii |
| Low, resolved | `src/style.css:87` | No pressed feedback | Contact link scales to 0.96 over 150ms ease-out | Clear, restrained feedback; disabled under reduced motion |

## Verification

- Production build passes; fonts and icons are served locally.
- Existing portrait-selection tests pass (all six candidates, consecutive-repeat exclusion, and unavailable storage).
- Chromium checks at 320, 390, 768, 1024, and 1440px: no horizontal overflow.
- Desktop and mobile screenshots inspected; mobile profile switches to a horizontal card.
- All nine social destinations and five project destinations verified against the content config, including `xpoziel` and the supplied Stack Overflow URL.
- Skip link moves focus to main; visible focus styles remain present.
- Contact, social, and project hover backgrounds verified in the browser.
- Contact pressed scale measured at 0.96; reduced-motion scale measured as none.
- Muted text contrast 7.74:1; secondary headings 6.48:1; profile details 4.96:1; amber text 10.21:1.
- No browser console errors.
- Not verified: Safari/Firefox, physical touch devices, or playback in the browser Animations panel at 10% speed. Interaction values were checked through computed browser styles and source instead.
- GitHub deployment and domain configuration were not run.

No actionable UI-polish findings remain within the inspected coverage.
