import { google } from 'googleapis';
import { readFileSync } from 'fs';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const CREDENTIALS = JSON.parse(readFileSync('credentials.json'));

const auth = new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

export async function getSheetData(sheetId, range) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });
  return response.data.values;
}
