import { NextResponse } from 'next/server';
import { getSheetData } from '@/utils/sheets';

const SHEET_ID = process.env.SHEET_ID;
const COMMISSIONS_RANGE = 'توزيع العمولات!A1:L';

export async function GET() {
  try {
    const data = await getSheetData(SHEET_ID, COMMISSIONS_RANGE);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
