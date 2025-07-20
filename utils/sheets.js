// ✅ 1. utils/sheets.js
import { google } from 'googleapis';
import credentials from '@/credentials.json';

export async function getSheetData(sheetName) {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1XmZKicNeBpdu2MKvDFlFgu4tWMgBT9YQWeP2hkxyfHA',
    range: `${sheetName}`,
  });

  return res.data.values;
}
