const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

// تحميل بيانات الاعتماد من ملف JSON
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "credentials.json"), // <-- هذا هو ملف Google service account
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// إنشاء عميل Sheets
async function getSheetsClient() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });
  return sheets;
}

module.exports = { getSheetsClient };
