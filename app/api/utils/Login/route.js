// app/api/login/route.js

import { NextResponse } from 'next/server';
import { getSheetData } from '@/utils/sheets';

// 🆔 معرف Google Sheets
const SHEET_ID = '1XmZKicNeBpdu2MKvDFlFgu4tWMgBT9YQWeP2hkxyfHA';
const RANGE = 'المستخدمين!A2:D';

export async function POST(request) {
  const body = await request.json();
  const { email, password } = body;

  try {
    const rows = await getSheetData(SHEET_ID, RANGE);

    const user = rows.find(row => {
      const rowEmail = row[3]?.trim();
      const rowPassword = row[1]?.trim();
      return rowEmail === email && rowPassword === password;
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      marketerId: user[2],
      name: user[0],
      email: user[3],
    });
  } catch (error) {
    console.error('خطأ في الاتصال بـ Google Sheets:', error);
    return NextResponse.json({ success: false, message: 'فشل في الاتصال بالسيرفر' }, { status: 500 });
  }
}
