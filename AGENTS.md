# Release maintenance

For every user-visible update, update `public/releases.js` with matching Japanese and Simplified Chinese notes. Keep the clickable version label in `public/index.html` and `package.json` version synchronized with the latest release. Do not remove existing release history. Run `npm test` before pushing.

Room components live in `public/assets/objects/`; positions and independent event bindings live in `public/app.js`. Keep assets, collision geometry, interaction targets and accessible names in sync. Preserve both languages, the desktop single-screen layout and BGM2 as the only music track.
