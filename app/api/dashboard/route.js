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

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { marketerId } = body;

    console.log('📩 Received marketerId:', marketerId);

    const [
      commissions,
      users,
      pyramid,
      upgrades,
      marketers,
      rabat,
      rewardLink,
      tierRepo
    ] = await Promise.all([
      getSheetData('توزيع العمولات'),
      getSheetData('المستخدمين'),
      getSheetData('الهرم'),
      getSheetData('سجل الترقية'),
      getSheetData('صالة المسوقين'),
      getSheetData('رباط'),
      getSheetData('ربط المكافآت'),
      getSheetData('مستودع الطبقات'),
    ]);

    const cleanedCommissions = commissions.filter(row => row[0] && row[0] !== 'ID');

    const directSales = cleanedCommissions.filter(row => row[0] === marketerId && row[2] === '✓');
    const referralSales = cleanedCommissions.filter(row => row[0] === marketerId && row[3] === '✓');
    const referralOfReferralSales = cleanedCommissions.filter(row => row[0] === marketerId && row[4] === '✓');

    const totalPaid = cleanedCommissions.filter(row => row[0] === marketerId && row[11] === '✓').length;
    const totalPending = cleanedCommissions.filter(row => row[0] === marketerId && row[11] !== '✓').length;

    const upgradeRecords = upgrades.filter(row => row[1] === marketerId);

    const pyramidRow = pyramid.find(row => row[0] === marketerId);
    const teamA = pyramidRow?.[2]?.split(',').map(e => e.trim()).filter(Boolean) || [];
    const teamB = pyramidRow?.[3]?.split(',').map(e => e.trim()).filter(Boolean) || [];

    const marketerRow = marketers.find(row => row[0] === marketerId);
    const marketerName = marketerRow?.[1] || 'غير معروف';
    const marketerLevel = marketerRow?.[6] || 'غير محددة';

    const currentMonth = getCurrentMonth();

    let totalMonthEarnings = 0;
    let directCommission = 0;
    let teamACommission = 0;
    let teamBCommission = 0;

    let countDirectCommission = 0;
    let countReferralCommission = 0;
    let countRofRCommission = 0;

    for (let row of rabat) {
      if (!row[0] || row[0] === 'رقم المسوق') continue;
      if (row[0] !== marketerId) continue;

      const monthCols = [
        { month: row[1], check: row[2] },
        { month: row[3], check: row[4] },
        { month: row[5], check: row[6] },
        { month: row[7], check: row[8] },
        { month: row[9], check: row[10] },
      ];

      for (let { month, check } of monthCols) {
        if (month === currentMonth && check === '✓') {
          const type = row[16]?.trim(); // العمود Q
          const commission = parseInt(row[17]?.replace(/[^0-9]/g, '') || '0'); // العمود R

          totalMonthEarnings += commission;

          if (type === 'بيع مباشر') {
            directCommission += commission;
            countDirectCommission++;
          } else if (type === 'احالة') {
            teamACommission += commission;
            countReferralCommission++;
          } else if (type === 'احالة احالة') {
            teamBCommission += commission;
            countRofRCommission++;
          }
        }
      }
    }

    // ✅ حساب مؤشر المكافأة
    const rewardRow = rewardLink.find(row => row[0] === marketerId);
    const currentSales = parseInt(rewardRow?.[7] || '0');
    const nextRewardTarget = parseInt(rewardRow?.[8] || '1');
    const bonusProgress = Math.min(Math.round((currentSales / nextRewardTarget) * 100), 100);

    // ✅ حساب مؤشر الترقية
    const tierRow = tierRepo[0]; // عناوين الباقات تبدأ من العمود 2
    const levelIndex = tierRepo.findIndex(row => row[1] === marketerLevel);
    const nextLevel = tierRepo[levelIndex + 1];

    let upgradeProgress = 100;
    if (nextLevel) {
      const requiredSales = parseInt(nextLevel[2] || '1');
      const actualSales = countDirectCommission + countReferralCommission + countRofRCommission;
      upgradeProgress = Math.min(Math.round((actualSales / requiredSales) * 100), 100);
    }

    const response = {
      stats: {
        totalDirectCommission: directCommission,
        totalReferralCommission: teamACommission,
        totalRofRCommission: teamBCommission,

        countDirectCommission,
        countReferralCommission,
        countRofRCommission,

        totalPaid,
        totalPending,
        upgradeHistory: upgradeRecords,
        teamA,
        teamB,
        marketerName,
        marketerLevel,
        currentMonthEarnings: totalMonthEarnings,

        // ✅ الإضافات الجديدة
        bonusProgress,
        upgradeProgress,
      }
    };

    console.log('✅ Final dashboard response:', JSON.stringify(response, null, 2));
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Dashboard route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
