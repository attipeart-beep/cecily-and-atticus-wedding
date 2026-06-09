/**
 * Cecily & Atticus — RSVP tracker + branded notification email
 * --------------------------------------------------------------
 * This Google Apps Script runs inside a Google Sheet. Netlify sends
 * each RSVP here (via an "Outgoing webhook" form notification). For
 * every submission it:
 *   1. Adds a row to the Sheet  →  your live RSVP tracker.
 *   2. Emails you a styled summary in your wedding colours.
 *
 * Everything runs on your own Google account — no extra services.
 * See SETUP.md (in this folder) for the step-by-step install.
 */

/* ===================== SETTINGS ===================== */

// Where notification emails are sent.
var NOTIFY_EMAIL = 'cecandatti@gmail.com';

// The tab/sheet name used for the tracker (created automatically).
var SHEET_NAME = 'RSVPs';

// OPTIONAL spam guard. If you set this to e.g. 'cecatti2026', also add
// "?key=cecatti2026" to the end of the webhook URL you paste into Netlify.
// Leave it as '' to disable the check (simplest).
var SHARED_SECRET = '';

// Column headers, in order. (Don't reorder without updating appendRow_.)
var COLUMNS = [
  'Received', 'Guest 1 name', 'Guest 1 email', 'Guest 1 reply',
  'Second guest?', 'Guest 2 name', 'Guest 2 email', 'Guest 2 reply',
  'Accommodation', 'Dietary', 'Message'
];

/* ===================== WEB ENTRY POINTS ===================== */

function doPost(e) {
  try {
    if (SHARED_SECRET && (!e || !e.parameter || e.parameter.key !== SHARED_SECRET)) {
      return ContentService.createTextOutput('Forbidden');
    }

    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    // Netlify nests the form fields under "data"; fall back to top level.
    var d = body.data || body || {};

    appendRow_(d);
    sendEmail_(d);

    return ContentService.createTextOutput('OK');
  } catch (err) {
    return ContentService.createTextOutput('Error: ' + err);
  }
}

// Visiting the URL in a browser shows this (handy to confirm it deployed).
function doGet() {
  return ContentService.createTextOutput(
    'Cecily & Atticus RSVP tracker is live. This endpoint receives RSVPs from Netlify.'
  );
}

/* ===================== SHEET ===================== */

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function appendRow_(d) {
  getSheet_().appendRow([
    new Date(),
    d.guest_1_name || '',
    d.guest_1_email || '',
    d.guest_1_attending || '',
    d.has_guest_2 || '',
    d.guest_2_name || '',
    d.guest_2_email || '',
    d.guest_2_attending || '',
    d.accommodation || '',
    d.dietary || '',
    d.message || ''
  ]);
}

/* ===================== EMAIL ===================== */

function sendEmail_(d) {
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: d.subject || 'New RSVP',
    htmlBody: buildHtml_(d)
  });
}

function firstName_(full) {
  return (full || '').toString().trim().split(/\s+/)[0] || '';
}

function esc_(s) {
  return (s == null ? '' : String(s))
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Green for an acceptance, burgundy for a decline.
function replyColor_(v) {
  if (!v) return '#2c2e18';
  return /accept/i.test(v) ? '#4c6b2f' : '#75262f';
}

function row_(label, value, color) {
  if (!value) return '';
  var shown = color
    ? '<span style="color:' + color + ';font-weight:600">' + esc_(value) + '</span>'
    : esc_(value);
  return '' +
    '<tr>' +
    '<td style="padding:9px 0;border-bottom:1px solid #ece7d6;color:#8a8c6e;' +
    'font:600 11px/1.4 Georgia,serif;letter-spacing:.06em;text-transform:uppercase;' +
    'white-space:nowrap;vertical-align:top;width:42%">' + label + '</td>' +
    '<td style="padding:9px 0 9px 16px;border-bottom:1px solid #ece7d6;color:#2c2e18;' +
    'font:400 16px/1.5 Georgia,serif">' + shown + '</td>' +
    '</tr>';
}

function buildHtml_(d) {
  var names = [];
  var n1 = firstName_(d.guest_1_name);
  if (n1) names.push(n1);
  if ((d.has_guest_2 || '') === 'Yes') {
    var n2 = firstName_(d.guest_2_name);
    if (n2) names.push(n2);
  }
  var who = names.length ? names.join(' & ') : 'A guest';

  var rows =
    row_('Guest 1', d.guest_1_name) +
    row_('Email', d.guest_1_email) +
    row_('Reply', d.guest_1_attending, replyColor_(d.guest_1_attending));

  if ((d.has_guest_2 || '') === 'Yes') {
    rows +=
      row_('Guest 2', d.guest_2_name) +
      row_('Email', d.guest_2_email) +
      row_('Reply', d.guest_2_attending, replyColor_(d.guest_2_attending));
  }

  rows +=
    row_('Accommodation', d.accommodation) +
    row_('Dietary', d.dietary) +
    row_('Message', d.message);

  return '' +
  '<div style="margin:0;padding:24px;background:#f6f2e7">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" ' +
      'style="max-width:560px;margin:0 auto;background:#fbf9f1;border-radius:10px;overflow:hidden;' +
      'box-shadow:0 1px 4px rgba(0,0,0,.06)">' +

      // Header band
      '<tr><td style="background:#565a2b;padding:26px 32px;text-align:center">' +
        '<div style="color:#dfe0c5;font:600 11px/1 Georgia,serif;letter-spacing:.22em;' +
          'text-transform:uppercase;margin-bottom:8px">Cecily &amp; Atticus</div>' +
        '<div style="color:#fbf9f1;font:400 28px/1.2 Georgia,serif">New RSVP from ' + esc_(who) + '</div>' +
      '</td></tr>' +

      // Body
      '<tr><td style="padding:24px 32px 30px">' +
        '<table role="presentation" cellpadding="0" cellspacing="0" width="100%">' + rows + '</table>' +
        '<p style="margin:22px 0 0;color:#9a9c80;font:400 12px/1.5 Georgia,serif;text-align:center">' +
          'This RSVP has also been added to your tracker spreadsheet.' +
        '</p>' +
      '</td></tr>' +

    '</table>' +
  '</div>';
}
