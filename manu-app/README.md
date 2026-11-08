# Name Submit

A simple app: type your name, tap **Submit**, and it's saved to a Google Sheet.
You can install it on a phone like a normal app (the icon goes on the home screen).

**Live:** https://tenrenti.github.io/manu/

## What's in here
| File | What it does |
|---|---|
| `index.html` | The app page people see |
| `manifest.webmanifest` | App name, colors, and icons (makes it installable) |
| `sw.js` | Lets the app install and open fast |
| `icons/` | App icon in every size phones need |
| `backend/Code.gs` | Copy of the Google Apps Script backend (lives in the Google Sheet, not used by GitHub) |

## Change the Google Sheet link
Open `index.html`, find `const API_URL = '...'` near the bottom, and paste your Apps Script `/exec` link.

## Install on a phone
- **Android (Chrome):** tap **Install** on the page, or menu → *Install app*
- **iPhone (Safari):** tap **Share** → *Add to Home Screen*

designed by @tenrenti
