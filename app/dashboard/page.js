'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';

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
        console.log('✅ البيانات المستلمة من السيرفر:', data);
        if (!data.stats) {
          setError('❌ لم يتم استلام بيانات صالحة من السيرفر.');
          return;
        }
        setDebug(prev => prev + `\n✅ تم استلام البيانات من السيرفر بنجاح.\n📦 البيانات:\n${JSON.stringify(data.stats, null, 2)}`);
        setStats(data.stats);
        setMarketerName(data.stats.marketerName || '');
        setMarketerTier(data.stats.marketerTier || '');
      })
      .catch((err) => {
        console.error('❌ خطأ أثناء التحميل:', err);
        setError('❌ فشل في تحميل البيانات من السيرفر');
      });
  }, []);

  const chartData = [
    { name: 'مباشر', value: stats?.totalDirectCommission || 0 },
    { name: 'إحالة', value: stats?.totalReferralCommission || 0 },
    { name: 'إحالة الإحالة', value: stats?.totalRofRCommission || 0 }
  ];

  const COLORS = ['#00f7ff', '#a855f7', '#10b981'];

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
      <div className="p-8 text-gray-400 animate-pulse whitespace-pre-wrap">
        ⏳ جاري تحميل البيانات...
        {'\n\n'}
        {debug}
      </div>
    );
  }

  return (
    <motion.div
      className="p-8 space-y-6 min-h-screen text-white bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="flex items-center justify-between">
        <Image src="/logo.png" width={120} height={48} alt="PISPC Logo" />
        <div className="text-right">
          <div className="text-sm">اسم المسوق: <span className="text-emerald-400 font-bold">{marketerName}</span></div>
          <div className="text-sm">الطبقة الحالية: <span className="text-cyan-400 font-bold">{marketerTier}</span></div>
        </div>
      </div>

      <h1 className="text-xl font-bold text-sky-300 border-b border-sky-700 pb-2">📊 لوحة تحكم المسوق</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="العمولة المباشرة" value={stats.totalDirectCommission + ' SP'} icon="💼" />
        <StatCard title="عمولة الإحالة" value={stats.totalReferralCommission + ' SP'} icon="👥" />
        <StatCard title="عمولة إحالة الإحالة" value={stats.totalRofRCommission + ' SP'} icon="📡" />
        <StatCard title="العمولات المدفوعة" value={stats.totalPaid} icon="✅" />
        <StatCard title="العمولات غير المدفوعة" value={stats.totalPending} icon="⏳" />
        <StatCard title="عدد ترقياتك" value={stats.upgradeHistory.length} icon="🚀" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-cyan-800">
          <h2 className="text-cyan-400 font-semibold mb-4">🎯 توزيع العمولات (دائري)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
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

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-purple-800">
          <h2 className="text-purple-300 font-semibold mb-4">📊 رسم بياني عمودي</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="value" fill="#00f7ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-bold mb-4 text-pink-400">🧑‍🤝‍🧑 فريقك:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TeamCard label="فريق A (الإحالة المباشرة)" members={stats.teamA} />
          <TeamCard label="فريق B (إحالة الإحالة)" members={stats.teamB} />
        </div>
      </div>

      <div className="mt-10 bg-white/10 backdrop-blur-md p-4 rounded-xl text-xs text-gray-300 whitespace-pre-wrap border border-gray-700">
        🛠️ <strong>معلومات تصحيحية (Debug Info):</strong>
        {'\n'}
        {debug}
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-md border border-cyan-700 rounded-2xl shadow-xl p-6 hover:scale-[1.03] transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-sm text-cyan-300 mb-1 flex items-center gap-2">
        <span className="text-lg">{icon}</span> {title}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </motion.div>
  );
}

function TeamCard({ label, members }) {
  return (
    <motion.div className="bg-white/10 backdrop-blur-md border border-blue-700 rounded-2xl shadow p-6">
      <div className="text-blue-300 font-semibold mb-2">{label}</div>
      {members.length > 0 ? (
        <ul className="list-disc list-inside text-white space-y-1">
          {members.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 italic">لا يوجد أعضاء</p>
      )}
    </motion.div>
  );
}
