// utils/sheets.js
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const auth = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
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
