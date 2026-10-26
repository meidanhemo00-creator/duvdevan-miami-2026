/**
 * Duvdevan in Los Angeles: RSVP backend (Google Apps Script, bound to the RSVP sheet).
 *
 *  • doPost: the website's RSVP form sends each reply here. It is written to
 *    the "RSVPs" tab (one row per email; a second RSVP from the same email
 *    updates that row) and a confirmation email goes out right away.
 *  • sendReminders: runs once, the day before the event, and emails everyone
 *    on the list who hasn't had a reminder yet.
 *
 * SETUP (once, about 2 minutes)
 *  1. In the RSVP sheet: Extensions → Apps Script. Delete what's there, paste this file, Save.
 *  2. Choose the function "setup" in the toolbar and press Run. Approve the permissions
 *     (Google asks because the script writes to this sheet and sends email as you).
 *  3. Deploy → New deployment → type "Web app".
 *       Execute as: Me    ·    Who has access: Anyone
 *     Press Deploy and copy the Web app URL (ends in /exec). Send it over: it goes into the website.
 *
 * Edit the wording of the emails in CONFIG below; no other changes are needed.
 */

const CONFIG = {
  sheetName: 'RSVPs',
  eventName: 'Duvdevan in Los Angeles',
  eventDate: 'Sunday, November 15, 2026',
  eventPlace: 'Beverly Hills, Los Angeles',
  /** When the reminder goes out (Los Angeles time). */
  reminderAt: '2026-11-14T10:00:00-08:00',
  /** Shown as the sender name. Mail is sent from the Google account that deploys this script. */
  senderName: 'Friends of Duvdevan',
  /** Optional: where guests' replies go, e.g. 'events@yourdomain.org'. Empty = your own address. */
  replyTo: '',

  confirmation: {
    subject: 'You’re on the list: Duvdevan in Los Angeles, November 15',
    // {name} {guests} {date} {place} are filled in automatically.
    body:
      'Hi {name},\n\n' +
      'Thank you for your RSVP. We look forward to seeing you at Duvdevan in Los Angeles.\n\n' +
      'When: {date}\n' +
      'Where: {place}\n' +
      'Additional guests: {guests}\n\n' +
      'We’ll send a reminder the day before.\n\n' +
      'Friends of Duvdevan',
  },
  reminder: {
    subject: 'Tomorrow: Duvdevan in Los Angeles',
    body:
      'Hi {name},\n\n' +
      'A reminder that Duvdevan in Los Angeles is tomorrow, {date}, in {place}.\n\n' +
      'Additional guests on your RSVP: {guests}\n\n' +
      'See you there,\n' +
      'Friends of Duvdevan',
  },
}

const HEADERS = ['Submitted', 'Name', 'Email', 'Phone', 'Additional guests', 'Total attending', 'Confirmation sent', 'Reminder sent']

/** Run once from the editor: prepares the tab and schedules the reminder. */
function setup() {
  const sheet = getSheet_()
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold')
  sheet.setFrozenRows(1)
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'sendReminders')
    .forEach((t) => ScriptApp.deleteTrigger(t))
  ScriptApp.newTrigger('sendReminders').timeBased().at(new Date(CONFIG.reminderAt)).create()
  // Touch MailApp so the permission prompt covers sending email.
  Logger.log('Emails left today: ' + MailApp.getRemainingDailyQuota())
}

/** The website posts each RSVP here (JSON in a text/plain body). */
function doPost(e) {
  const lock = LockService.getScriptLock()
  lock.waitLock(20000)
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}')
    const name = String(data.name || '').trim().slice(0, 120)
    const email = String(data.email || '').trim().toLowerCase().slice(0, 160)
    const phone = String(data.phone || '').trim().slice(0, 40)
    const guests = Math.max(0, Math.min(20, parseInt(data.guests, 10) || 0))
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return text_('invalid')

    const sheet = getSheet_()
    const now = new Date()
    const row = [now, name, email, phone, guests, guests + 1]
    const existing = findRowByEmail_(sheet, email)
    let rowIndex
    if (existing) {
      rowIndex = existing
      sheet.getRange(rowIndex, 1, 1, row.length).setValues([row])
    } else {
      sheet.appendRow(row.concat(['', '']))
      rowIndex = sheet.getLastRow()
    }

    try {
      send_(email, CONFIG.confirmation, { name, guests })
      sheet.getRange(rowIndex, 7).setValue(new Date())
    } catch (err) {
      sheet.getRange(rowIndex, 7).setValue('Failed: ' + err)
    }
    return text_('ok')
  } finally {
    lock.releaseLock()
  }
}

/** Opening the web app URL in a browser shows this, which is a quick way to check it's live. */
function doGet() {
  return text_('RSVP endpoint is live.')
}

/** Runs from the time trigger the day before the event. Safe to run again: it skips people already reminded. */
function sendReminders() {
  const sheet = getSheet_()
  const last = sheet.getLastRow()
  if (last < 2) return
  const rows = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues()
  rows.forEach((r, i) => {
    const [, name, email, , guests, , , reminded] = r
    if (!email || reminded) return
    try {
      send_(email, CONFIG.reminder, { name, guests })
      sheet.getRange(i + 2, 8).setValue(new Date())
    } catch (err) {
      sheet.getRange(i + 2, 8).setValue('Failed: ' + err)
    }
  })
}

function send_(to, tpl, v) {
  const fill = (s) =>
    s
      .replace(/{name}/g, String(v.name).split(' ')[0] || 'there')
      .replace(/{guests}/g, v.guests ? String(v.guests) : 'none')
      .replace(/{date}/g, CONFIG.eventDate)
      .replace(/{place}/g, CONFIG.eventPlace)
  const options = { name: CONFIG.senderName }
  if (CONFIG.replyTo) options.replyTo = CONFIG.replyTo
  MailApp.sendEmail(to, fill(tpl.subject), fill(tpl.body), options)
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  // This spreadsheet is only for RSVPs, so the first tab becomes the RSVP tab.
  return ss.getSheetByName(CONFIG.sheetName) || ss.getSheets()[0].setName(CONFIG.sheetName)
}

function findRowByEmail_(sheet, email) {
  const last = sheet.getLastRow()
  if (last < 2) return 0
  const emails = sheet.getRange(2, 3, last - 1, 1).getValues()
  for (let i = 0; i < emails.length; i++) if (String(emails[i][0]).toLowerCase() === email) return i + 2
  return 0
}

function text_(s) {
  return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT)
}
