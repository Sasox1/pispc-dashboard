// 📁 app/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import { getSheetData } from "@/utils/sheets";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

export default function Dashboard() {
  const [commissions, setCommissions] = useState([]);
  const [marketerId, setMarketerId] = useState(null);

  const [stats, setStats] = useState({
    directSales: 0,
    referrals: 0,
    subReferrals: 0,
    totalSales: 0,
    packageCounts: {},
    directCommission: 0,
    referralCommission: 0,
    subReferralCommission: 0,
    paid: 0,
    pending: 0,
  });

  useEffect(() => {
    const localData = localStorage.getItem("marketerId");
    if (!localData) return;
    setMarketerId(localData);
  }, []);

  useEffect(() => {
    if (!marketerId) return;
    const fetchData = async () => {
      const rawData = await getSheetData("توزيع العمولات");
      const filtered = rawData.filter((row) => row[0] === marketerId);

      let direct = 0,
        referral = 0,
        subReferral = 0,
        packages = {},
        paid = 0,
        pending = 0,
        directAmount = 0,
        referralAmount = 0,
        subReferralAmount = 0;

      for (let row of filtered) {
        const saleType = row[2];
        const packageName = row[1];
        const status = row[11];

        packages[packageName] = (packages[packageName] || 0) + 1;

        if (saleType === "بيع مباشر") {
          direct++;
          directAmount += parseInt(row[4] || "0");
        } else if (saleType === "احالة") {
          referral++;
          referralAmount += parseInt(row[6] || "0");
        } else if (saleType === "احالة احالة") {
          subReferral++;
          subReferralAmount += parseInt(row[8] || "0");
        }

        if (status === "✓") paid++;
        else pending++;
      }

      setStats({
        directSales: direct,
        referrals: referral,
        subReferrals: subReferral,
        totalSales: direct + referral + subReferral,
        packageCounts: packages,
        directCommission: directAmount,
        referralCommission: referralAmount,
        subReferralCommission: subReferralAmount,
        paid,
        pending,
      });
    };
    fetchData();
  }, [marketerId]);

  const pieData = Object.entries(stats.packageCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const barData = [
    {
      name: "العمولات",
      مباشر: stats.directCommission,
      إحالة: stats.referralCommission,
      إحالة_إحالة: stats.subReferralCommission,
    },
  ];

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">عدد المبيعات الكلي</h2>
          <p className="text-3xl">{stats.totalSales}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">رسم دائري لنسب الحزم</h2>
          <PieChart width={300} height={250}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">رسم عمودي للعمولات</h2>
          <BarChart width={300} height={250} data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="مباشر" fill="#8884d8" />
            <Bar dataKey="إحالة" fill="#82ca9d" />
            <Bar dataKey="إحالة_إحالة" fill="#ffc658" />
          </BarChart>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">عمولة مباشرة</h2>
          <p className="text-2xl text-green-600 font-bold">{stats.directCommission} SP</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">عمولة فريق A</h2>
          <p className="text-2xl text-blue-600 font-bold">{stats.referralCommission} SP</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">عمولة فريق B</h2>
          <p className="text-2xl text-purple-600 font-bold">{stats.subReferralCommission} SP</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">العمولات المدفوعة</h2>
          <p className="text-2xl text-green-700">{stats.paid}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">قيد الانتظار</h2>
          <p className="text-2xl text-yellow-500">{stats.pending}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex justify-center items-center">
          <Button className="text-white bg-black hover:bg-gray-800">عرض التفاصيل</Button>
        </CardContent>
      </Card>
    </div>
  );
}
