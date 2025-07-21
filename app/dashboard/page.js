'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

  const chartData = [
    { name: 'مباشر', value: stats.totalDirectCommission },
    { name: 'إحالة', value: stats.totalReferralCommission },
    { name: 'إحالة الإحالة', value: stats.totalRofRCommission },
  ];

  const colors = ['#B8860B', '#CC5500', '#3A3A3A'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="p-8 space-y-8 min-h-screen bg-[#1A1A1A] text-white font-sans">

      <div className="flex items-center justify-between">
        <Image src="/logo.png" alt="PISPC Logo" width={80} height={80} />
        <div className="relative overflow-hidden rounded-xl px-4 py-2 text-sm shadow-md border border-white/10 backdrop-blur-md bg-white/10">
          <div className="text-[#CCCCCC]">{marketerName}</div>
          <div className="text-[#B8860B] font-bold">{marketerTier}</div>
        </div>
      </div>

      <motion.div whileHover={{ scale: 1.01 }}
        className="relative overflow-hidden backdrop-blur-lg bg-white/10 ring-1 ring-white/10 rounded-2xl p-6 text-xl font-bold text-white border border-white/10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/5 via-white/10 to-transparent opacity-10 pointer-events-none"></div>
        📊 لوحة تحكم المسوق
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="العمولة المباشرة" value={stats.totalDirectCommission + ' SP'} />
        <StatCard title="عمولة الإحالة" value={stats.totalReferralCommission + ' SP'} />
        <StatCard title="عمولة إحالة الإحالة" value={stats.totalRofRCommission + ' SP'} />
        <StatCard title="العمولات المدفوعة" value={stats.totalPaid} />
        <StatCard title="العمولات غير المدفوعة" value={stats.totalPending} />
        <StatCard title="عدد ترقياتك" value={stats.upgradeHistory.length} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/10 ring-1 ring-white/10 hover:shadow-[0_0_20px_#B8860B33] transition-all">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/10 to-transparent opacity-20 pointer-events-none"></div>
          <h2 className="text-md font-bold text-[#CC5500] mb-4">📊 توزيع العمولات</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/10 ring-1 ring-white/10 hover:shadow-[0_0_20px_#CC550033] transition-all">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/10 to-transparent opacity-20 pointer-events-none"></div>
          <h2 className="text-md font-bold text-[#B8860B] mb-4">📈 عدد العمولات</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="value" fill="#CC5500" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="mt-10">
        <h2 className="text-md font-bold mb-4 text-[#B8860B]">🧑‍🤝‍🧑 فريقك:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TeamCard label="فريق A (الإحالة المباشرة)" members={stats.teamA} />
          <TeamCard label="فريق B (إحالة الإحالة)" members={stats.teamB} />
        </div>
      </div>

      <div className="mt-10 bg-[#1E1E1E] p-4 rounded-xl text-xs text-gray-400 whitespace-pre-wrap border border-gray-700">
        🛠️ <strong>معلومات تصحيحية (Debug Info):</strong>
        {'\n'}
        {debug}
      </div>
    </motion.div>
  );
}

function StatCard({ title, value }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }}
      className="relative overflow-hidden backdrop-blur-lg bg-white/10 ring-1 ring-white/10 border border-white/10 rounded-2xl shadow-md p-6 transition duration-300 hover:shadow-[0_0_30px_#CC550033]">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/5 via-white/10 to-transparent opacity-10 pointer-events-none"></div>
      <div className="text-sm text-[#CCCCCC] mb-1">{title}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </motion.div>
  );
}

function TeamCard({ label, members }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden backdrop-blur-lg bg-white/10 border border-white/10 ring-1 ring-white/10 rounded-2xl p-6">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/5 via-white/10 to-transparent opacity-10 pointer-events-none"></div>
      <div className="text-[#B8860B] font-semibold mb-2">{label}</div>
      {members.length > 0 ? (
        <ul className="list-disc list-inside text-white space-y-1">
          {members.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">لا يوجد أعضاء</p>
      )}
    </motion.div>
  );
}
