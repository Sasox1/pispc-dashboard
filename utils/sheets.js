import { google } from 'googleapis';
import { readFileSync } from 'fs';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const CREDENTIALS = JSON.parse(readFileSync('credentials.json'));

const auth = new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

const SHEET_ID = '1XmZKicNeBpdu2MKvDFlFgu4tWMgBT9YQWeP2hkxyfHA';

export async function verifyLogin(email, password) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'المستخدمين!A2:D',
  });

  const rows = res.data.values || [];

  const user = rows.find(
    row => row[0] === email && row[1] === password
  );

  if (!user) return null;

  return {
    email: user[0],
    password: user[1],
    marketerId: user[2],
    marketerEmail: user[3],
  };
}
