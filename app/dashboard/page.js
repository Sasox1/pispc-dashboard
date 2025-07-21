'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marketerId })
    })
      .then(res => {
        if (!res.ok) throw new Error('❌ فشل في تحميل البيانات من API');
        return res.json();
      })
      .then(data => {
        if (!data.stats) {
          setError('❌ لم يتم استلام بيانات صالحة من السيرفر.');
          return;
        }
        setDebug(prev => prev + `\n✅ تم استلام البيانات من السيرفر بنجاح.`);
        setStats(data.stats);
        setMarketerName(data.stats.marketerName || '');
        setMarketerTier(data.stats.marketerTier || '');
      })
      .catch(err => {
        console.error('❌ خطأ أثناء التحميل:', err);
        setError('❌ فشل في تحميل البيانات من السيرفر');
      });
  }, []);

  if (error) {
    return <div className="p-8 text-red-600 font-bold whitespace-pre-wrap">{error}{'\n\n'}{debug}</div>;
  }

  if (!stats) {
    return <div className="p-8 text-gray-400 animate-pulse whitespace-pre-wrap">⏳ جاري تحميل البيانات...\n\n{debug}</div>;
  }

  return (
    <div className="bg-gradient-to-tr from-black via-[#0f0f2d] to-[#1a1a40] min-h-screen text-white p-6 font-sans">
      <div className="flex items-center justify-between mb-6">
        <Image src="/logo.png" alt="PISPC Logo" width={60} height={60} />
        <div className="text-right text-sm space-y-1">
          <div>اسم المسوق: <span className="text-teal-400 font-bold">{marketerName}</span></div>
          <div>الطبقة: <span className="text-indigo-400 font-bold">{marketerTier}</span></div>
        </div>
      </div>

      <h1 className="text-lg font-bold text-fuchsia-400 border-b border-fuchsia-700 pb-2 mb-6">📊 لوحة تحكم المسوق</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="العمولة المباشرة" value={stats.totalDirectCommission + ' SP'} icon="💼" />
        <StatCard title="عمولة الإحالة" value={stats.totalReferralCommission + ' SP'} icon="👥" />
        <StatCard title="عمولة إحالة الإحالة" value={stats.totalRofRCommission + ' SP'} icon="📡" />
        <StatCard title="العمولات المدفوعة" value={stats.totalPaid} icon="✅" />
        <StatCard title="العمولات غير المدفوعة" value={stats.totalPending} icon="⏳" />
        <StatCard title="عدد ترقياتك" value={stats.upgradeHistory.length} icon="🚀" />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-bold mb-4 text-pink-400">🧑‍🤝‍🧑 فريقك:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TeamCard label="فريق A (الإحالة المباشرة)" members={stats.teamA} />
          <TeamCard label="فريق B (إحالة الإحالة)" members={stats.teamB} />
        </div>
      </div>

      <div className="mt-10 bg-black/30 backdrop-blur-md p-4 rounded-xl text-xs text-gray-300 whitespace-pre-wrap border border-purple-600">
        🛠️ <strong>معلومات تصحيحية (Debug Info):</strong>
        {'\n'}{debug}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 backdrop-blur-lg border border-fuchsia-600 rounded-3xl p-6 shadow-xl hover:shadow-fuchsia-700 transition duration-300"
    >
      <div className="text-sm text-fuchsia-300 mb-1 flex items-center gap-2">
        <span className="text-lg">{icon}</span> {title}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </motion.div>
  );
}

function TeamCard({ label, members }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/5 backdrop-blur-md border border-cyan-700 rounded-3xl p-6 shadow-md"
    >
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
    </motion.div>
  );
}
