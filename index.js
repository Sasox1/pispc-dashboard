const { google } = require('googleapis');
const keys = require('./credentials.json');

// ✅ إصلاح مشكلة private_key بسطر واحد
const formattedKey = keys.private_key.replace(/\\n/g, '\n');

async function readSheetData(sheetName, range = 'A1:L50') {
  const client = new google.auth.JWT(
    keys.client_email,
    null,
    formattedKey,
    ['https://www.googleapis.com/auth/spreadsheets.readonly']
  );

  await client.authorize();

  const sheets = google.sheets({ version: 'v4', auth: client });

  const spreadsheetId = '1XmZKicNeBpdu2MKvDFlFgu4tWMgBT9YQWeP2hkxyfHA';

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!${range}`,
  });

  return response.data.values;
}

async function main() {
  try {
    const commissions = await readSheetData('توزيع العمولات');
    const users = await readSheetData('المستخدمين', 'A1:D50');
    const pyramid = await readSheetData('الهرم', 'A1:E50');

    console.log('\n📋 توزيع العمولات:\n', commissions);
    console.log('\n👤 المستخدمين:\n', users);
    console.log('\n🏛️ الهرم:\n', pyramid);
  } catch (error) {
    console.error('❌ حدث خطأ:', error.message);
  }
}

main();
