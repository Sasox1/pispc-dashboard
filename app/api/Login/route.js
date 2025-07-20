// /app/api/login/route.js
import { NextResponse } from 'next/server';
import { getSheetData } from '@/utils/sheets';

export async function POST(request) {
  const body = await request.json();
  const { email, password } = body;

  const users = await getSheetData('1XmZKicNeBpdu2MKvDFlFgu4tWMgBT9YQWeP2hkxyfHA', 'المستخدمين!A2:D');
  const user = users.find(row => row[3] === email && row[1] === password);

  if (!user) {
    return NextResponse.json({ success: false, message: 'بيانات الدخول غير صحيحة' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    marketerId: user[2],
    name: user[0],
  });
}
