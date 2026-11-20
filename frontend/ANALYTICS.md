# Portfolio analytics

The public `/admin` page is a login shell. All reports require a signed, HttpOnly, Secure cookie, valid for 12 hours. The password and database token stay on the server. Login attempts and collection requests are rate limited in Redis. No tracking runs on `/admin`.

## Enable on Vercel

1. Create an Upstash Redis database (or connect one through Vercel Marketplace).
2. Set the four server environment variables listed in `.env.example` on the existing Vercel project. Use the database REST URL and **read/write** REST token. Set a strong unique dashboard password. Generate `ANALYTICS_SECRET` with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
3. Redeploy. The Astro project root must remain `frontend`, so Vercel deploys `frontend/api/analytics.js` as a function alongside static pages.
4. Visit `/admin` and sign in. Visit a public page in another browser, click Resume, and refresh the report. Reports have no seed data. A missing configuration returns 503 and collection stays disabled.

The development Astro server does not run Vercel functions. Use `vercel dev` with the same server environment variables for full local testing. Secure cookies require HTTPS or a browser's localhost secure-cookie exception.

## What is measured

Page views; clicks on links, buttons, summary expanders, and elements with `data-track`; scroll milestones; and visible, engaged time in 15-second heartbeats. Inputs and keystroke contents are never recorded. Navigation query strings and hashes are stripped. Referrers are stored as hostnames only. Third-party sites and PDF reading activity cannot be observed after leaving the portfolio; a resume event means the link was clicked, not that the file was read or saved.

Browser IDs persist in localStorage. Visits use sessionStorage and a 30-minute inactivity boundary. Tabs count as separate visits; embedded experience pages share their parent tab's session. IDs are HMAC hashed before storage. Clearing storage or switching browsers creates a different visitor; shared devices may combine people. No fingerprinting or identity resolution is performed. Counts can be affected by blocking, bots, navigation failures, and storage settings.

Approximate city and country come from Vercel's IP geolocation headers. Raw IP addresses are not retained; a secret-derived network hash is used only for short-lived rate limits. Locations may reflect VPNs or network gateways. See [Vercel headers](https://vercel.com/docs/headers/request-headers) and [Upstash REST API](https://upstash.com/docs/redis/features/restapi).

Events expire after 90 days. Each UTC day retains the latest 10,000 events. Reports support 7, 14, or 30 calendar days (including today), with an explicit warning when a daily limit is reached. Graphs and totals use retained events in that window; the session journal shows the latest 500 sessions. Return counts are within the selected window, not lifetime. Active time excludes hidden tabs and pauses after 60 seconds without interaction. Admin timestamps use the viewer's timezone; charts use UTC days.

`/privacy` explains collection and offers a browser-local opt-out. Do Not Track and Global Privacy Control are respected. Add `data-no-track` to a containing element to exclude its click targets. This is custom first-party analytics, not session video or a record of text typed into forms.

## Validation

Run `node --test tests/analytics.test.mjs` and `npm run build` from `frontend`.
