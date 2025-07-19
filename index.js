const { google } = require('googleapis');
const credentials = require('./credentials.json');

// إعداد Google Auth
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

// معرف الجدول
const SPREADSHEET_ID = '1XmZKicNeBpdu2MKvDFlFgu4tWMgBT9YQWeP2hkxyfHA';

// دالة قراءة البيانات من ورقة معينة
async function readSheetData(sheetName, range = 'A1:L100') {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!${range}`,
  });

  return response.data.values || [];
}

// البرنامج الرئيسي
async function main() {
  try {
    const commissions = await readSheetData('توزيع العمولات', 'A1:L100');
    const users = await readSheetData('المستخدمين', 'A1:D100');
    const pyramid = await readSheetData('الهرم', 'A1:E100');

    console.log('\n📋 توزيع العمولات:\n');
    console.table(commissions);

    console.log('\n👤 المستخدمين:\n');
    console.table(users);

    console.log('\n🏛️ الهرم:\n');
    console.table(pyramid);

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

main();
