'use client';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [debug, setDebug] = useState('');
  const [error, setError] = useState('');

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
        setDebug(prev => prev + `\n✅ تم استلام البيانات من السيرفر بنجاح.`);
        setStats(data.stats);
      })
      .catch((err) => {
        console.error('❌ خطأ أثناء التحميل:', err);
        setError('❌ فشل في تحميل البيانات من السيرفر');
      });
  }, []);

  if (error) {
    return <div className="p-8 text-red-600 font-bold whitespace-pre-wrap">{error}\n{debug}</div>;
  }

  if (!stats) {
    return <div className="p-8 text-gray-500 animate-pulse whitespace-pre-wrap">⏳ جاري تحميل البيانات...\n{debug}</div>;
  }

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-800 border-b pb-4">📊 لوحة تحكم المسوق</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="العمولة المباشرة" value={stats.totalDirectCommission + ' SP'} icon="💼" />
        <StatCard title="عمولة الإحالة" value={stats.totalReferralCommission + ' SP'} icon="👥" />
        <StatCard title="عمولة إحالة الإحالة" value={stats.totalRofRCommission + ' SP'} icon="📡" />
        <StatCard title="العمولات المدفوعة" value={stats.totalPaid} icon="✅" />
        <StatCard title="العمولات غير المدفوعة" value={stats.totalPending} icon="⏳" />
        <StatCard title="عدد ترقياتك" value={stats.upgradeHistory.length} icon="🚀" />
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">🧑‍🤝‍🧑 فريقك:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TeamCard label="فريق A (الإحالة المباشرة)" members={stats.teamA} />
          <TeamCard label="فريق B (إحالة الإحالة)" members={stats.teamB} />
        </div>
      </div>

      {/* ✅ DEBUG SECTION */}
      <div className="mt-10 bg-gray-100 p-4 rounded-xl text-xs text-gray-600 whitespace-pre-wrap">
        🛠️ <strong>معلومات تصحيحية (Debug Info):</strong>
        {debug}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition duration-300">
      <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
        <span className="text-lg">{icon}</span> {title}
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
}

function TeamCard({ label, members }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="text-gray-600 font-semibold mb-2">{label}</div>
      {members.length > 0 ? (
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {members.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 italic">لا يوجد أعضاء</p>
      )}
    </div>
  );
}
