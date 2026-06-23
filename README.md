# Silky's Deals and Steals

Live clearance/deal feed. Amazon items get pulled automatically via the
Product Advertising API (PA-API 5), posted to the site and to Discord
the moment they're found. Twitter-sourced finds are designed to go through
a manual-approval queue rather than full auto-scrape, see the "About the
Twitter queue" note below for why.

## 1. Database (Supabase)

1. Create a project at supabase.com.
2. In the SQL editor, run `db/schema.sql`.
3. Grab your Project URL and `service_role` key from Settings → API,
   put them in `.env` as `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`.

## 2. Admin password

```
node -e "console.log(Buffer.from(require('bcryptjs').hashSync('yourpassword', 10)).toString('base64'))"
```

Put the output in `ADMIN_PASSWORD_HASH_B64`. Generate a random
`ADMIN_SESSION_SECRET` with `openssl rand -hex 32`.

## 3. Amazon PA-API

PA-API access requires your Associates account to have at least 3
qualifying sales in the trailing 180 days — if you're not there yet on this
specific account, the cron route will just fail quietly (logged, not fatal)
until it qualifies. Apply for access at
https://webservices.amazon.com/paapi5/documentation/ once qualifying, then
fill in `AMAZON_PAAPI_ACCESS_KEY`, `AMAZON_PAAPI_SECRET_KEY`, and
`AMAZON_ASSOCIATES_TAG`.

## 4. Discord

Create a webhook in each channel you want deals posted to (Channel
Settings → Integrations → Webhooks → New Webhook), and put the URLs,
comma-separated, in `DISCORD_WEBHOOK_URLS`.

## 5. Deploy

```
npm install
vercel
```

Add all the env vars above in the Vercel project settings, then redeploy.
The cron job in `vercel.json` runs every 15 minutes and needs
`CRON_SECRET` set in env — Vercel sends it automatically once configured.

## About the Twitter queue

The schema has a `pending_review` status and `twitter_queue` source built
in, but there's no scraper wired up yet. Worth restating why: stripping
another deal-account's link and replacing it with yours, then auto-posting
it as your own find, is the part most likely to get you blocked by other
deal accounts or flagged by Amazon as link-hijacking. The intended flow
once built: you (or a teammate) drop a product URL into a quick admin form,
the system fetches its own price/image data via PA-API, computes the
discount itself, and queues it for one-click approval — so every link on
the site is generated from your own tag, never copied from someone else's
post.

## What's stubbed vs. built

**Built and working:** live deals feed with sort/filter, admin login,
admin-only settings route, PA-API search-by-savings-percent, Discord
webhook fan-out, cron wiring.

**Stubbed for next pass:** the Twitter submission form/queue UI, editable
search keywords (currently hardcoded in the cron route), deal expiry
sweep (nothing currently flips old deals from `live` to `expired`).

