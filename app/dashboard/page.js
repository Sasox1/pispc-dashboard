// app/dashboard/page.js
"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
import { getSheetData } from "@/utils/sheets";
import { Card, CardContent } from "@/components/ui/card";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EFF", "#FF6699"];

export default function DashboardPage() {
  const [commissionData, setCommissionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    directSales: 0,
    totalCommission: 0,
    teamACommission: 0,
    teamBCommission: 0,
    paidCommissions: 0,
    pendingCommissions: 0,
    pieData: [],
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getSheetData("توزيع العمولات");
        const headers = data[0];
        const rows = data.slice(1);

        const salesCount = {
          "2 Mbps": 0,
          "4 Mbps": 0,
          "8 Mbps": 0,
          "12 Mbps": 0,
          "16 Mbps": 0,
          "24 Mbps": 0,
          "60 Mbps": 0,
        };

        let directSales = 0,
          totalSales = 0,
          totalCommission = 0,
          teamA = 0,
          teamB = 0,
          paid = 0,
          pending = 0;

        rows.forEach(row => {
          const type = row[2]; // بيع مباشر، إحالة، إحالة إحالة
          const amount = parseInt(row[5]) || 0;
          const status = row[11];
          const packageName = row[1];

          totalSales++;

          if (type === "بيع مباشر") {
            directSales++;
            totalCommission += amount;
          } else if (type === "إحالة") {
            teamA += amount;
          } else if (type === "إحالة إحالة") {
            teamB += amount;
          }

          if (status === "✓") {
            paid += amount;
          } else {
            pending += amount;
          }

          if (salesCount[packageName] !== undefined) {
            salesCount[packageName]++;
          }
        });

        const pieData = Object.entries(salesCount).map(([name, value]) => ({
          name,
          value,
        }));

        setStats({
          totalSales,
          directSales,
          totalCommission,
          teamACommission: teamA,
          teamBCommission: teamB,
          paidCommissions: paid,
          pendingCommissions: pending,
          pieData,
        });
      } catch (err) {
        console.error("خطأ في تحميل البيانات:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="p-8 space-y-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-800">لوحة تحكم المسوق</h1>

      {loading ? (
        <p className="text-center">جاري تحميل البيانات...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="hover:shadow-xl cursor-pointer">
            <CardContent className="p-4">
              <p className="text-lg font-semibold">إجمالي المبيعات</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalSales}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl cursor-pointer">
            <CardContent className="p-4">
              <p className="text-lg font-semibold">المبيعات المباشرة</p>
              <p className="text-3xl font-bold text-green-600">{stats.directSales}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl cursor-pointer">
            <CardContent className="p-4">
              <p className="text-lg font-semibold">العمولة المباشرة</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalCommission.toLocaleString()} ل.س</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl cursor-pointer">
            <CardContent className="p-4">
              <p className="text-lg font-semibold">عمولة الفريق A</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.teamACommission.toLocaleString()} ل.س</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl cursor-pointer">
            <CardContent className="p-4">
              <p className="text-lg font-semibold">عمولة الفريق B</p>
              <p className="text-3xl font-bold text-pink-600">{stats.teamBCommission.toLocaleString()} ل.س</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl cursor-pointer">
            <CardContent className="p-4">
              <p className="text-lg font-semibold">العمولات المدفوعة</p>
              <p className="text-3xl font-bold text-green-700">{stats.paidCommissions.toLocaleString()} ل.س</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl cursor-pointer">
            <CardContent className="p-4">
              <p className="text-lg font-semibold">العمولات قيد الانتظار</p>
              <p className="text-3xl font-bold text-red-600">{stats.pendingCommissions.toLocaleString()} ل.س</p>
            </CardContent>
          </Card>

          <div className="col-span-1 md:col-span-2 xl:col-span-3 bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-semibold text-center mb-4">نسبة مبيعات الباقات</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie dataKey="value" data={stats.pieData} cx="50%" cy="50%" outerRadius={120} label>
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
