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
  console.log(`📄 Loaded sheet: ${sheetName}`, res.data.values?.length || 0);
  return res.data.values;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { marketerId } = body;

    console.log('📩 Received marketerId:', marketerId);

    const [commissions, users, pyramid, upgrades] = await Promise.all([
      getSheetData('توزيع العمولات'),   // العمود A = ID
      getSheetData('المستخدمين'),       // العمود C = ID
      getSheetData('الهرم'),             // العمود A = ID
      getSheetData('سجل الترقية'),       // العمود B = ID
    ]);

    const cleanedCommissions = commissions.filter(row => row[0] && row[0] !== 'ID');

    const directSales = cleanedCommissions.filter(row => row[0] === marketerId && row[2] === '✓');
    const referralSales = cleanedCommissions.filter(row => row[0] === marketerId && row[3] === '✓');
    const referralOfReferralSales = cleanedCommissions.filter(row => row[0] === marketerId && row[4] === '✓');

    const totalPaid = cleanedCommissions.filter(row => row[0] === marketerId && row[11] === '✓').length;
    const totalPending = cleanedCommissions.filter(row => row[0] === marketerId && row[11] !== '✓').length;

    const upgradeRecords = upgrades.filter(row => row[1] === marketerId); // سجل الترقية - العمود B

    const pyramidRow = pyramid.find(row => row[0] === marketerId); // الهرم - العمود A
    const teamA = pyramidRow?.[2]?.split(',').map(e => e.trim()).filter(Boolean) || [];
    const teamB = pyramidRow?.[3]?.split(',').map(e => e.trim()).filter(Boolean) || [];

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

    console.log('✅ Final dashboard response:', JSON.stringify(response, null, 2));

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Dashboard route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
