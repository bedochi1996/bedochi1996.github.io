# Badi Saeed Alosaimi — Cybersecurity Profile

Live: **https://bedochi1996.github.io**

A self-contained static site. No build step, no framework, no CDN — it renders from
`index.html`, one stylesheet, one script and four self-hosted woff2 fonts, and it works
offline from the filesystem as well as from a web host.

Bilingual English / Arabic with true right-to-left mirroring. It opens in English for
everyone; `?lang=ar` opens it in Arabic and makes that reading shareable, and the toggle
in the top right remembers a choice. Beside it is a second toggle, between the executive
read and the full technical detail.

## Structure

```
index.html          the site
assets/css, js      one stylesheet, one script
assets/fonts        Bricolage Grotesque · Instrument Sans · JetBrains Mono · Readex Pro
assets/img          25 screenshot plates (WebP) + the 1200×630 share card
documents/          the certificates this page links to
evidence/           runtime evidence captured from the platforms themselves
MANIFEST.sha256     SHA-256 of every file in documents/ and evidence/
```

## Verifying a download

```
sha256sum -c MANIFEST.sha256
```

Every document link on the page also carries its digest as a `data-sha256` attribute, so a
file can be checked against the page it came from without downloading the manifest.

## Editing

Open `index.html`. Every string exists twice — `<span class="en">` and `<span class="ar">` —
and CSS hides the inactive one, so there is no translation file to keep in sync. Blocks
marked `data-depth="technical"` are hidden in the executive view and shown in the full one.

© Badi Saeed Alosaimi. All certificates in `documents/` are my own.
