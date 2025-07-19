// app/dashboard/page.js
import { getSheetData } from '@/utils/sheets';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const SHEET_ID = process.env.SHEET_ID;
const RANGE = 'توزيع العمولات!A1:L';
const USERS_RANGE = 'المستخدمين!A1:D';

function getMarketerIdByEmail(data, email) {
  for (let i = 1; i < data.length; i++) {
    if (data[i][3] === email) return data[i][2];
  }
  return null;
}

export default async function DashboardPage() {
  const cookieStore = cookies();
  const email = cookieStore.get('email')?.value || null;
  if (!email) redirect('/login');

  const [commissionsData, usersData] = await Promise.all([
    getSheetData(SHEET_ID, RANGE),
    getSheetData(SHEET_ID, USERS_RANGE)
  ]);

  const marketerId = getMarketerIdByEmail(usersData, email);
  if (!marketerId) return <div>لا يوجد مسوق مرتبط بهذا البريد.</div>;

  const mySales = commissionsData.filter(
    (row, idx) => idx !== 0 && row[0] === marketerId && row[2] === '✓'
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">لوحة تحكم المسوق</h1>
      <h2 className="text-xl font-semibold mb-2">مبيعاتك المباشرة:</h2>
      <table className="table-auto w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">رقم البيعة</th>
            <th className="p-2 border">تاريخ المنح</th>
            <th className="p-2 border">حالة الدفع</th>
          </tr>
        </thead>
        <tbody>
          {mySales.map((row, i) => (
            <tr key={i} className="text-center">
              <td className="border p-2">{row[5]}</td>
              <td className="border p-2">{row[6]}</td>
              <td className="border p-2">{row[11]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
