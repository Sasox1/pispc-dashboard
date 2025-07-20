import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

async function getData() {
  const res = await fetch('http://localhost:3000/api/dashboard', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('فشل في جلب البيانات');
  }

  const json = await res.json();
  return json.data;
}

export default async function DashboardPage() {
  const data = await getData();

  // تجهيز بيانات الرسم البياني
  const salesCounts = {};
  data.slice(1).forEach(row => {
    const packageName = row[1];
    if (!salesCounts[packageName]) salesCounts[packageName] = 0;
    salesCounts[packageName]++;
  });

  const chartData = Object.entries(salesCounts).map(([name, value]) => ({ name, value }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

  const totalSales = data.length - 1;
  const directSales = data.filter(row => row[2] === '✓').length;
  const referralSales = data.filter(row => row[3] === '✓').length;
  const subReferralSales = data.filter(row => row[4] === '✓').length;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">لوحة تحكم المسوق</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <h2 className="text-lg font-semibold">إجمالي المبيعات</h2>
          <p className="text-2xl font-bold text-blue-600">{totalSales}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <h2 className="text-lg font-semibold">المبيعات المباشرة</h2>
          <p className="text-2xl font-bold text-green-600">{directSales}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <h2 className="text-lg font-semibold">مبيعات الفريق A</h2>
          <p className="text-2xl font-bold text-orange-500">{referralSales}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <h2 className="text-lg font-semibold">مبيعات الفريق B</h2>
          <p className="text-2xl font-bold text-purple-500">{subReferralSales}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold text-center mb-4">نسبة المبيعات حسب الحزمة</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
