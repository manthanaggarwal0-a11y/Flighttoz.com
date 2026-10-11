# Flight to Z — flighttoz.com

Static website hosted on GitHub Pages (custom domain in `CNAME`).

- `index.html` — home page
- `privacy.html`, `terms.html`, `refund.html` — policy pages
- `assets/js/app.js` — search, currency switch, WhatsApp booking links, contact form
- `assets/css/site.css` — compiled styles (do not edit by hand)
- `assets/css/input.css` + `tailwind.config.js` — source for `site.css`
- `assets/fonts/` — self-hosted Inter font

Text changes can be made directly in the HTML files. If you add or change
Tailwind classes, rebuild the stylesheet:

    npx tailwindcss@3.4.17 -i assets/css/input.css -o assets/css/site.css --minify

The site loads no third-party scripts, fonts or trackers, and each page sets a
strict Content-Security-Policy. Keep it that way: put new scripts in
`assets/js/` and new styles in `assets/css/`, not inline.
