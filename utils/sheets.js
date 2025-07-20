// utils/sheets.js
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import credentials from './credentials.json'; // تأكد من وجود هذا الملف

const auth = new JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function getSheetData(sheetName, range) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1XmZKicNeBpdu2MKvDFlFgu4tWMgBT9YQWeP2hkxyfHA',
    range: `${sheetName}!${range}`,
  });
  return res.data.values;
}
