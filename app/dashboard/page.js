'use client';

import React from 'react';
import { getSheetData } from '@/utils/sheets';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import '@/app/globals.css';

export default async function DashboardPage() {
  const sheetName = 'توزيع العمولات';
  const data = await getSheetData(sheetName);

  const chartData = data.slice(1).map((row, index) => ({
    name: row[1],
    direct: row[2] === '✓' ? 1 : 0,
    referral: row[3] === '✓' ? 1 : 0,
    subReferral: row[4] === '✓' ? 1 : 0,
  }));

  const packageStats = data.slice(1).reduce((acc, row) => {
    const packageName = row[5];
    if (!acc[packageName]) acc[packageName] = 0;
    acc[packageName]++;
    return acc;
  }, {});

  const pieData = Object.entries(packageStats).map(([name, value]) => ({ name, value }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-2xl shadow">
          <p className="text-sm text-gray-500">إجمالي المبيعات</p>
          <p className="text-2xl font-semibold text-gray-800">{data.length - 1}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <p className="text-sm text-gray-500">مبيعات مباشرة</p>
          <p className="text-2xl font-semibold text-gray-800">{chartData.filter(d => d.direct).length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <p className="text-sm text-gray-500">إحالات</p>
          <p className="text-2xl font-semibold text-gray-800">{chartData.filter(d => d.referral).length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <p className="text-sm text-gray-500">إحالة إحالة</p>
          <p className="text-2xl font-semibold text-gray-800">{chartData.filter(d => d.subReferral).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">توزيع الحزم</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">نوع البيع حسب المسوقين</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" hide />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="direct" stackId="a" fill="#6366f1" name="بيع مباشر" />
              <Bar dataKey="referral" stackId="a" fill="#10b981" name="إحالة" />
              <Bar dataKey="subReferral" stackId="a" fill="#f59e0b" name="إحالة إحالة" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* الجدول الأساسي الحالي */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border mt-6">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {data[0].map((header, i) => (
                <th key={i} className="p-3 border text-right whitespace-nowrap">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(1).map((row, i) => (
              <tr key={i} className="even:bg-gray-50">
                {row.map((cell, j) => (
                  <td key={j} className="p-3 border text-right whitespace-nowrap">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
