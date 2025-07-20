import { NextResponse } from 'next/server';
import { getSheetData } from '@/utils/sheets';

const SHEET_ID = '1XmZKicNeBpdu2MKvDFlFgu4tWMgBT9YQWeP2hkxyfHA';
const USERS_RANGE = 'المستخدمين!A2:D';

export async function POST(req) {
  const body = await req.json();
  const { email, password } = body;

  const users = await getSheetData(SHEET_ID, USERS_RANGE);

  const user = users.find(
    ([username, pass, marketerId, userEmail]) =>
      userEmail === email && pass === password
  );

  if (user) {
    // Session أو Cookie يمكنك هنا حفظ بيانات الدخول باستخدام
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false });
}
