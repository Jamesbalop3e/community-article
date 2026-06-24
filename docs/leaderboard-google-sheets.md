Google Sheets leaderboard (Apps Script) — Setup Guide

This guide explains how to create a simple shared leaderboard backed by Google Sheets and a Google Apps Script web app. The client (Build Quest page) will POST completion entries and GET the top entries.

Quick summary
- Create a Google Sheet with headers: name, timeMs, ts
- Add an Apps Script that exposes doGet (returns JSON top N) and doPost (accepts JSON, appends row)
- Deploy the Apps Script as a Web App (execute as: Me, access: Anyone, even anonymous) or secure with a token
- Add the deployed web app URL to _config.yml as leaderboard_api_url (and optional leaderboard_api_token)

Recommended Apps Script code
1. Open the sheet, then Extensions → Apps Script and paste this code:

```javascript
const SHEET_NAME = 'leaderboard';
const SECRET = 'YOUR_OPTIONAL_SECRET_TOKEN'; // optional: set and add to site config

function sanitizeName(n) {
  if (!n) return 'Anonymous';
  const s = String(n).trim();
  return s.substring(0, 60);
}

function doGet(e) {
  // return top N entries as JSON
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);

  const rows = sheet.getDataRange().getValues(); // includes header
  const data = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    data.push({ name: r[0], timeMs: Number(r[1]) || 0, ts: Number(r[2]) || 0 });
  }
  data.sort((a,b) => a.timeMs - b.timeMs);
  const top = data.slice(0, 5);
  return ContentService.createTextOutput(JSON.stringify(top)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const raw = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    // optional token check
    if (SECRET && raw.token && raw.token !== SECRET) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'invalid token' })).setMimeType(ContentService.MimeType.JSON);
    }
    const name = sanitizeName(raw.name || raw.Name || 'Anonymous');
    const timeMs = Number(raw.timeMs || raw.time || 0) || 0;
    const ts = Number(raw.ts || Date.now()) || Date.now();

    // basic validation
    if (typeof timeMs !== 'number' || timeMs < 0 || timeMs > 1000*60*60) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'invalid time' })).setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActive();
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'no sheet' })).setMimeType(ContentService.MimeType.JSON);

    sheet.appendRow([name, timeMs, ts]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

Notes & configuration
- Create a sheet tab called `leaderboard` with header row: `name | timeMs | ts` in the first row.
- Deploy the Apps Script: Publish → Deploy as web app (or Deploy -> New deployment). Choose "Execute as: Me" and "Who has access: Anyone" for simplest setup.
- If you want a token, set SECRET in the script and also add `leaderboard_api_token` in `_config.yml`.
- Add the deployed URL to `_config.yml`:

```yaml
leaderboard_api_url: "https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec"
# optional
leaderboard_api_token: "your-secret-token"
```

Client behavior
- When `_config.yml` contains `leaderboard_api_url`, the Build Quest page will fetch top entries on load and POST entries on completion.
- If the remote is unreachable or returns errors, the client falls back to the localStorage leaderboard.

Security & abuse
- Allowing anonymous writes can be abused. Use the optional SECRET token or restrict access via a Google account if needed.
- Use rate-limiting heuristics or Cloud Functions for stronger protection if required.

That's it — if you want, I can implement the client changes (already done) and create this docs page (done). Next: deploy the Apps Script and set `leaderboard_api_url` in `_config.yml` on your site's config. Once you provide the URL (and token if used), the live site will start showing shared entries.