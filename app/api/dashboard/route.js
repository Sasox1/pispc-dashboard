import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import credentials from '@/utils/credentials.json';

export async function GET() {
  try {
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = '1XmZKicNeBpdu2MKvDFlFgu4tWMgBT9YQWeP2hkxyfHA';
    const range = 'توزيع العمولات!A1:L';

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return NextResponse.json(res.data.values);
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'فشل تحميل البيانات' }, { status: 500 });
  }
}
