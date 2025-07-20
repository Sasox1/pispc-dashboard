import { NextResponse } from 'next/server';
import { getSheetData } from '@/utils/sheets';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // استدعاء بيانات المستخدمين من ورقة Google Sheets
    const users = await getSheetData('1XmZKicNeBpdu2MKvDFlFgu4tWMgBT9YQWeP2hkxyfHA', 'المستخدمين!A2:D');

    // التحقق من وجود المستخدم بالبريد وكلمة المرور
    const user = users.find(row => row[3] === email && row[1] === password);

    if (!user) {
      return NextResponse.json({ message: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    // تسجيل الدخول ناجح
    return NextResponse.json({ message: 'نجح تسجيل الدخول', marketerId: row[2] });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'خطأ في الخادم' }, { status: 500 });
  }
}
