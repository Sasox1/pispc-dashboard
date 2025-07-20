// app/api/dashboard/route.js

import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import credentials from '@/utils/credentials.json';
import { NextResponse } from 'next/server';

const spreadsheetId = '1XmZKicNeBpdu2MKvDFlFgu4tWMgBT9YQWeP2hkxyfHA';

const auth = new JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function getSheetData(sheetName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName,
  });
  return res.data.values;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { marketerId } = body;

    // جلب البيانات من الأوراق
    const [commissions, users, pyramid, upgrades] = await Promise.all([
      getSheetData('توزيع العمولات'),
      getSheetData('المستخدمين'),
      getSheetData('الهرم'),
      getSheetData('سجل الترقية'),
    ]);

    // تجاهل رأس الجدول إن وجد
    const data = commissions.filter(row => row[0] && row[0] !== 'ID');

    // استخراج المبيعات حسب نوع العمولة
    const directSales = data.filter(row => row[0] === marketerId && row[2] === '✓');
    const referralSales = data.filter(row => row[0] === marketerId && row[3] === '✓');
    const referralOfReferralSales = data.filter(row => row[0] === marketerId && row[4] === '✓');

    // المدفوعات
    const totalPaid = data.filter(row => row[0] === marketerId && row[11] === '✓').length;
    const totalPending = data.filter(row => row[0] === marketerId && row[11] !== '✓').length;

    // ترقيات
    const upgradeRecords = upgrades.filter(row => row[1] === marketerId);

    // الفريق
    const pyramidRow = pyramid.find(row => row[0] === marketerId);
    const teamA = pyramidRow?.[2]?.split(',').filter(Boolean) || [];
    const teamB = pyramidRow?.[3]?.split(',').filter(Boolean) || [];

    // الاستجابة النهائية
    const response = {
      stats: {
        totalDirectCommission: directSales.length,
        totalReferralCommission: referralSales.length,
        totalRofRCommission: referralOfReferralSales.length,
        totalPaid,
        totalPending,
        upgradeHistory: upgradeRecords,
        teamA,
        teamB,
      }
    };

    console.log('✅ Dashboard response:', response); // للتصحيح

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Dashboard route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
