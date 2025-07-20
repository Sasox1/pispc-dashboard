// app/dashboard/page.js
'use client';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div className="p-4 text-gray-500">جاري التحميل...</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">لوحة التحكم</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="text-gray-500">إجمالي المبيعات</div>
          <div className="text-xl font-bold">{data.totalSales}</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="text-gray-500">العمولة المباشرة</div>
          <div className="text-xl font-bold">{data.directCommission} SP</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="text-gray-500">العمولة من فريق A</div>
          <div className="text-xl font-bold">{data.teamACommission} SP</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="text-gray-500">العمولة من فريق B</div>
          <div className="text-xl font-bold">{data.teamBCommission} SP</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="text-gray-500">عمولات مدفوعة</div>
          <div className="text-xl font-bold">{data.paidCount}</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="text-gray-500">عمولات قيد الانتظار</div>
          <div className="text-xl font-bold">{data.pendingCount}</div>
        </div>
      </div>
    </div>
  );
}
