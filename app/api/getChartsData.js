// /pages/api/getChartsData.js

import { google } from 'googleapis';

export default async function handler(req, res) {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Missing email parameter' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    // جلب ورقة المستخدمين
    const usersRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'المستخدمين!A2:D',
    });

    const users = usersRes.data.values;
    const user = users.find(u => u[3] === email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const marketerId = user[2]; // الرقم التعريفي للمسوق

    // جلب بيانات الهرم
    const pyramidRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'الهرم!A2:E',
    });

    const pyramid = pyramidRes.data.values;
    const marketerRow = pyramid.find(row => row[0] === marketerId);
    const teamA = marketerRow?.[2]?.split(',').map(e => e.trim()) || [];
    const teamB = marketerRow?.[3]?.split(',').map(e => e.trim()) || [];

    // جلب بيانات توزيع العمولات
    const commissionsRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'توزيع العمولات!A2:L',
    });

    const commissions = commissionsRes.data.values;

    // إرسال الرد
    res.status(200).json({
      marketerId,
      teamA,
      teamB,
      commissions,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
