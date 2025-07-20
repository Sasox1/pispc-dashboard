import { getSheetData } from '@/utils/sheets';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await getSheetData(
      '1XmZKicNeBpdu2MKvDFlFgu4tWMgBT9YQWeP2hkxyfHA',
      'توزيع العمولات!A1:L'
    );
    return NextResponse.json({ data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'فشل في جلب البيانات' }, { status: 500 });
  }
}
