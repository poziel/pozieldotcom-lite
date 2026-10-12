# Profile portrait

The website now uses one fixed portrait: `public/portraits/alexandre-studio-violet.png`. Set `site.portrait` in `src/config/site.js` to change the image and update the social-preview URL in `index.html` as well. The role, employer, and location are separate unordered-list items.

The source was the user-supplied `magnific_clean-professional-corpor_Sy43ChIUb8.png`. The original file was not modified. The edited image was produced with the built-in imagegen tool on October 12, 2026 and copied into the project. Its slate-violet photographic background complements the website's violet accents.

## Final edit prompt

> Use case: identity-preserve. Edit target: the supplied square portrait of Alexandre wearing clear gray glasses, a white T-shirt, and a dark olive cardigan. Change ONLY the white background. Replace it with a realistic photography-studio seamless matte backdrop in muted slate blue-violet, a gentle soft gradient that is lighter behind the head and fades to deeper charcoal-violet toward the edges. Add only a very subtle diffused lavender-blue studio light wash for a creative but understated portrait that will sit beside a purple/pink/blue logo on a charcoal website. Keep the background visibly nonwhite, smooth, uncluttered, photographic, and free of objects, shapes, text, neon strips, or hard spotlight circles. Strictly preserve the man's exact identity, facial proportions, eyes, expression, glasses, hair and stray hair detail, beard, skin texture, pose, olive clothing, original neutral lighting on the person, framing, and square crop. Do not beautify, retouch, relight, or redraw the person. Clean realistic hair and shoulder edges with no white fringe. Return only the edited portrait.

## Previous photos

The eleven images formerly used in the random rotation are preserved in `previous/`. They are no longer shipped in `dist/` or requested by the website. Portraits 1–6 are the first supplied batch; portraits 7–11 are the second batch, in attachment order. Portrait 10 retains its original JPEG format.

The old portrait-selection code and its tests have been removed. Reloads use the same fixed image regardless of the previous rotation's localStorage value.
