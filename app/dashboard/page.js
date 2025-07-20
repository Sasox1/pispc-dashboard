/*
  هذا هو الكود الأساسي لواجهة Dashboard احترافية عصرية لمسوق
  يستخدم مكتبة recharts لعرض الرسوم البيانية، و shadcn/ui لبطاقات عرض المحتوى.
*/

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getSheetData } from "@/utils/sheets";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EFF", "#FF6A9F"];

export default function DashboardPage() {
  const [commissions, setCommissions] = useState([]);
  const [stats, setStats] = useState({});
  const searchParams = useSearchParams();
  const marketerId = searchParams.get("id"); // معرف المسوّق من رابط URL

  useEffect(() => {
    async function fetchData() {
      const sheetId = "1XmZKicNeBpdu2MKvDFlFgu4tWMgBT9YQWeP2hkxyfHA";
      const range = "توزيع العمولات!A2:L";
      const rows = await getSheetData(sheetId, range);
      const filtered = rows.filter(row => row[0] === marketerId);

      const stats = {
        totalSales: filtered.length,
        directSales: filtered.filter(row => row[2] === "✓").length,
        teamA: filtered.filter(row => row[3] === "✓").length,
        teamB: filtered.filter(row => row[4] === "✓").length,
        paid: filtered.filter(row => row[11] === "✓").length,
        pending: filtered.filter(row => row[11] !== "✓").length,
        packages: {},
      };

      filtered.forEach(row => {
        const pkg = row[5] || "غير معروف";
        stats.packages[pkg] = (stats.packages[pkg] || 0) + 1;
      });

      setCommissions(filtered);
      setStats(stats);
    }
    if (marketerId) fetchData();
  }, [marketerId]);

  const pieData = Object.entries(stats.packages || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const SquareBox = ({ title, value, href }) => (
    <Link href={href}>
      <Card className="rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          <p className="text-2xl font-bold text-blue-600">{value}</p>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">لوحة تحكم المسوق</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <SquareBox title="عدد المبيعات الكلي" value={stats.totalSales || 0} href="/dashboard/sales" />
        <SquareBox title="مبيعات مباشرة" value={stats.directSales || 0} href="/dashboard/direct-sales" />
        <SquareBox title="عمولة فريق A" value={stats.teamA || 0} href="/dashboard/team-a" />
        <SquareBox title="عمولة فريق B" value={stats.teamB || 0} href="/dashboard/team-b" />
        <SquareBox title="عمولات مدفوعة" value={stats.paid || 0} href="/dashboard/paid" />
        <SquareBox title="قيد الانتظار" value={stats.pending || 0} href="/dashboard/pending" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">نسبة الباقات المباعة</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {pieData.map((_, index) => (
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
