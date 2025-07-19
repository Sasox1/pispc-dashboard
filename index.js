const fs = require('fs');
const { google } = require('googleapis');

// تحميل بيانات الخدمة من credentials.json
const credentials = require('./credentials.json');

// إعداد المصادقة
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

// ID الجدول + النطاق الذي تريد قراءته
const SPREADSHEET_ID = 'ضع_هنا_معرف_الجدول';
const RANGE = 'ورقة1!A1:C10'; // غيّره حسب اسم الورقة والنطاق

async function accessSheet() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;

    if (rows.length) {
      console.log('📄 المحتوى:');
      rows.forEach((row) => console.log(row));
    } else {
      console.log('⚠️ لا توجد بيانات.');
    }
  } catch (err) {
    console.error('❌ حدث خطأ:', err);
  }
}

accessSheet();
