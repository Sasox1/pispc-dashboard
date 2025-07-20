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

    // Load data from all relevant sheets
    const [
      commissions,
      users,
      pyramid,
      upgrades
    ] = await Promise.all([
      getSheetData('توزيع العمولات'),
      getSheetData('المستخدمين'),
      getSheetData('الهرم'),
      getSheetData('سجل الترقية')
    ]);

    // استخراج مبيعات المسوق
    const directSales = commissions.filter(row => row[0] === marketerId && row[2] === '✓');
    const referralSales = commissions.filter(row => row[0] === marketerId && row[3] === '✓');
    const referralOfReferralSales = commissions.filter(row => row[0] === marketerId && row[4] === '✓');

    // حساب إجمالي العمولات المستحقة والمدفوعة (✓ = مدفوعة)
    const totalDirectCommission = directSales.length;
    const totalReferralCommission = referralSales.length;
    const totalRofRCommission = referralOfReferralSales.length;

    // النسبة العامة للعمولات المدفوعة مقابل الإجمالية
    const totalPaid = commissions.filter(row => row[0] === marketerId && row[11] === '✓').length;
    const totalPending = commissions.filter(row => row[0] === marketerId && row[11] !== '✓').length;

    // معلومات الترقية
    const upgradeRecords = upgrades.filter(row => row[1] === marketerId);

    // الفريق من الهرم
    const pyramidRow = pyramid.find(row => row[0] === marketerId);
    const teamA = pyramidRow ? pyramidRow[2]?.split(',').filter(Boolean) : [];
    const teamB = pyramidRow ? pyramidRow[3]?.split(',').filter(Boolean) : [];

    return NextResponse.json({
      stats: {
        totalDirectCommission,
        totalReferralCommission,
        totalRofRCommission,
        totalPaid,
        totalPending,
        upgradeHistory: upgradeRecords,
        teamA,
        teamB,
      }
    });
  } catch (error) {
    console.error('Dashboard route error:', error);
    return NextResponse.json({ message: 'خطأ في السيرفر', error: error.message }, { status: 500 });
  }
}
