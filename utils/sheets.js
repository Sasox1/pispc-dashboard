import { google } from 'googleapis';
import { readFileSync } from 'fs';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

// حمّل بيانات الاعتماد من ملف credentials.json في جذر المشروع
const CREDENTIALS = JSON.parse(
  readFileSync(path.join(process.cwd(), 'credentials.json'))
);

const auth = new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

// ✅ دالة لجلب البيانات من Google Sheets
export async function getSheetData(sheetId, range) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });
  return response.data.values;
}
