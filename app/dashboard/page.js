'use client';
import { useEffect, useState } from 'react';

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

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-black via-gray-900 to-gray-800 min-h-screen text-white font-mono">
      <div className="flex items-center justify-between">
        <img src="/logo.png" alt="PISPC Logo" className="h-12" />
        <div className="text-right">
          <div className="text-sm">اسم المسوق: <span className="text-green-400 font-bold">{marketerName}</span></div>
          <div className="text-sm">الطبقة: <span className="text-cyan-400 font-bold">{marketerTier}</span></div>
        </div>
      </div>

      <h1 className="text-xl font-bold text-purple-400 border-b border-purple-700 pb-2">📊 لوحة تحكم المسوق</h1>

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

      <div className="mt-10 bg-gray-900 p-4 rounded-xl text-xs text-gray-400 whitespace-pre-wrap border border-purple-700">
        🛠️ <strong>معلومات تصحيحية (Debug Info):</strong>
        {'\n'}
        {debug}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-gray-950 border border-purple-700 rounded-2xl shadow-lg p-6 hover:shadow-xl transition duration-300">
      <div className="text-sm text-purple-300 mb-1 flex items-center gap-2">
        <span className="text-lg">{icon}</span> {title}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function TeamCard({ label, members }) {
  return (
    <div className="bg-gray-950 border border-cyan-700 rounded-2xl shadow p-6">
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
