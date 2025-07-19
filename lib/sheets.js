import { google } from 'googleapis';
import path from 'path';
import { readFileSync } from 'fs';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(process.cwd(), 'credentials.json'), // يجب أن تضع الملف في جذر المشروع
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

const SPREADSHEET_ID = 'ضع هنا ID الخاص بـ Google Sheet';
const RANGE = 'توزيع العمولات!A2:L'; // مثلاً ورقة "توزيع العمولات" من الصف الثاني

export async function getCommissionsData() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });

  return response.data.values;
}
