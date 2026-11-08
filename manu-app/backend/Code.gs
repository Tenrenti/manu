/**
 * ============================================================
 *  NAME SUBMIT — Google Sheets backend
 * ============================================================
 *  WHERE TO PASTE THIS:
 *    Open your blank Google Sheet → Extensions → Apps Script
 *    → delete what's there → paste all of this → Save.
 *
 *  HOW TO TURN IT ON:
 *    Deploy → New deployment → (gear icon) Web app
 *      Execute as:      Me
 *      Who has access:  Anyone
 *    → Deploy → copy the "Web app URL" (ends with /exec)
 *    → paste that URL into index.html (API_URL at the bottom).
 *
 *  CHANGED THIS CODE LATER?
 *    Deploy → Manage deployments → pencil icon → Version: New version → Deploy.
 *    (The URL stays the same.)
 * ============================================================
 */

const SHEET_NAME = 'Submissions';          // tab where names are saved
const HEADERS = ['Timestamp', 'Name'];     // row 1 of that tab
const MAX_NAME_LENGTH = 100;               // longest name allowed


/** Website sends a name here → it gets saved as a new row. */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // one save at a time, so two people never overwrite each other

    const params = (e && e.parameter) || {};

    // Bot trap: a hidden field real people never see or fill in
    if (params.website) {
      return reply_({ ok: true });
    }

    const name = String(params.name || '').replace(/\s+/g, ' ').trim();
    if (!name) {
      return reply_({ ok: false, error: 'Please enter a name.' });
    }
    if (name.length > MAX_NAME_LENGTH) {
      return reply_({ ok: false, error: 'Name is too long (max ' + MAX_NAME_LENGTH + ' characters).' });
    }

    const sheet = getSheet_();
    sheet.appendRow([new Date(), safeText_(name)]);

    return reply_({ ok: true, count: sheet.getLastRow() - 1 });
  } catch (err) {
    return reply_({ ok: false, error: 'Server error: ' + err.message });
  } finally {
    lock.releaseLock();
  }
}


/** Health check: open the /exec URL in a browser to see if it's alive. */
function doGet() {
  const sheet = getSheet_();
  return reply_({
    ok: true,
    message: 'Name Submit backend is running.',
    count: Math.max(sheet.getLastRow() - 1, 0)
  });
}


/** Optional: click Run on this once to approve permissions and create the headers. */
function setup() {
  getSheet_();
  SpreadsheetApp.getActiveSpreadsheet().toast('Ready! Headers created in the "' + SHEET_NAME + '" tab.');
}


// ---------------- helpers ----------------

/** Finds the "Submissions" tab (or creates it) and makes sure the headers exist. */
function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    const first = ss.getSheets()[0];
    if (first.getLastRow() === 0) {
      first.setName(SHEET_NAME);          // reuse the blank "Sheet1"
      sheet = first;
    } else {
      sheet = ss.insertSheet(SHEET_NAME); // don't touch a tab that already has data
    }
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#e6f4ea')
      .setFontColor('#137333');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 190);
    sheet.setColumnWidth(2, 280);
    sheet.getRange('A2:A').setNumberFormat('mmm d, yyyy  h:mm:ss AM/PM');
  }
  return sheet;
}

/** Stops text like "=SUM(...)" from being treated as a formula. */
function safeText_(text) {
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

/** Sends a JSON answer back to the website. */
function reply_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
