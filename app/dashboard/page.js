'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [debug, setDebug] = useState('');
  const [error, setError] = useState('');
  const [marketerName, setMarketerName] = useState('');
  const [marketerTier, setMarketerTier] = useState('');

  useEffect(() => {
    const marketerId = sessionStorage.getItem('marketerId');
    if (!marketerId) {
      setError('⚠️ لم يتم العثور على بيانات الدخول (marketerId). الرجاء تسجيل الدخول مجددًا.');
      return;
    }

    setDebug(`🔍 تم العثور على المعرف: marketerId = ${marketerId}`);

    fetch('/api/dashboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ marketerId })
    })
      .then((res) => {
        if (!res.ok) throw new Error('❌ فشل في تحميل البيانات من API');
        return res.json();
      })
      .then((data) => {
        if (!data.stats) {
          setError('❌ لم يتم استلام بيانات صالحة من السيرفر.');
          return;
        }
        setStats(data.stats);
        setMarketerName(data.stats.marketerName || '');
        setMarketerTier(data.stats.marketerTier || '');
      })
      .catch((err) => {
        setError('❌ فشل في تحميل البيانات من السيرفر');
      });
  }, []);

  if (error) {
    return (
      <div className="p-8 text-red-600 font-bold whitespace-pre-wrap">
        {error}
        {'\n\n'}
        {debug}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-gray-500 animate-pulse whitespace-pre-wrap">
        ⏳ جاري تحميل البيانات...
        {'\n\n'}
        {debug}
      </div>
    );
  }

  const pieData = [
    { name: 'مباشر', value: stats.totalDirectCommission },
    { name: 'إحالة', value: stats.totalReferralCommission },
    { name: 'إحالة إحالة', value: stats.totalRofRCommission }
  ];
  const pieColors = ['#00f7ff', '#ff8c00', '#ff00c3'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-8 min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-white font-mono"
    >
      <div className="flex items-center justify-between mb-6">
        <Image src="/logo.png" alt="PISPC Logo" width={50} height={50} />
        <div className="text-right">
          <div className="text-sm">اسم المسوق: <span className="text-[#00f7ff] font-bold">{marketerName}</span></div>
          <div className="text-sm">الطبقة: <span className="text-[#ff00c3] font-bold">{marketerTier}</span></div>
        </div>
      </div>

      <h1 className="text-md font-bold text-[#999] pb-2 border-b border-gray-700 mb-6">📊 لوحة تحكم المسوق</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="العمولة المباشرة" value={stats.totalDirectCommission + ' SP'} icon="💼" />
        <StatCard title="عمولة الإحالة" value={stats.totalReferralCommission + ' SP'} icon="👥" />
        <StatCard title="عمولة إحالة الإحالة" value={stats.totalRofRCommission + ' SP'} icon="📡" />
        <StatCard title="العمولات المدفوعة" value={stats.totalPaid} icon="✅" />
        <StatCard title="العمولات غير المدفوعة" value={stats.totalPending} icon="⏳" />
        <StatCard title="عدد ترقياتك" value={stats.upgradeHistory.length} icon="🚀" />
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
          <h2 className="text-[#00f7ff] font-semibold mb-4">🔵 توزيع العمولات</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                innerRadius={40}
                fill="#8884d8"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
          <h2 className="text-[#ff8c00] font-semibold mb-4">📈 أداء العمولات</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pieData}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Bar dataKey="value" fill="#00f7ff" radius={[5, 5, 0, 0]} />
              <Tooltip />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-bold mb-4 text-[#00f7ff]">🧑‍🤝‍🧑 فريقك:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TeamCard label="فريق A (الإحالة المباشرة)" members={stats.teamA} />
          <TeamCard label="فريق B (إحالة الإحالة)" members={stats.teamB} />
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white bg-opacity-10 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-lg p-6 transition duration-300"
    >
      <div className="text-sm text-[#ccc] mb-1 flex items-center gap-2">
        <span className="text-lg">{icon}</span> {title}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </motion.div>
  );
}

function TeamCard({ label, members }) {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg border border-cyan-700 rounded-2xl shadow p-6">
      <div className="text-cyan-300 font-semibold mb-2">{label}</div>
      {members.length > 0 ? (
        <ul className="list-disc list-inside text-white space-y-1">
          {members.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">لا يوجد أعضاء</p>
      )}
    </div>
  );
}
