// app/api/login/route.js

import { NextResponse } from 'next/server';
import { getSheetData } from '@/utils/sheets';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // اقرأ البيانات من ورقة "المستخدمين"
    const users = await getSheetData('المستخدمين', 'A:D'); // A:D = [الاسم, كلمة المرور, ID, البريد]

    // تجاوز الصف الأول (عناوين الأعمدة)
    for (let i = 1; i < users.length; i++) {
      const row = users[i];
      const userEmail = row[3]?.trim();     // العمود D = البريد
      const userPassword = row[1]?.trim();  // العمود B = كلمة المرور
      const marketerId = row[2]?.trim();    // العمود C = الرقم التعريفي ID

      if (userEmail === email && userPassword === password) {
        // تسجيل دخول ناجح
        return NextResponse.json({
          message: 'نجح تسجيل الدخول',
          marketerId,
        });
      }
    }

    // بيانات غير صحيحة
    return NextResponse.json(
      { message: 'بيانات الدخول غير صحيحة' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
