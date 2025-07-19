// app/test/page.js
import { getSheetData } from '@/utils/sheets';

export default async function TestPage() {
  const data = await getSheetData('المستخدمين', 'A1:D10');

  return (
    <div style={{ padding: '2rem' }}>
      <h1>اختبار الاتصال بـ Google Sheets</h1>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            {data[0]?.map((col, idx) => (
              <th key={idx}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(1).map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
