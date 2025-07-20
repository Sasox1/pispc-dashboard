'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus('جارٍ التحقق...');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('✅ تم تسجيل الدخول بنجاح!');
        setUserInfo(data);
      } else {
        setStatus('❌ ' + data.message);
        setUserInfo(null);
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ حدث خطأ في الاتصال بالسيرفر');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h2>تسجيل دخول المسوّق</h2>

      <form onSubmit={handleLogin}>
        <div>
          <label>البريد الإلكتروني:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label>كلمة المرور:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <button
          type="submit"
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem',
            width: '100%',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          تسجيل الدخول
        </button>
      </form>

      <p style={{ marginTop: '1rem', color: 'green' }}>{status}</p>

      {userInfo && (
        <div style={{ marginTop: '2rem', background: '#f4f4f4', padding: '1rem' }}>
          <h4>معلومات المستخدم:</h4>
          <p><strong>الاسم:</strong> {userInfo.name}</p>
          <p><strong>رقم المعرف:</strong> {userInfo.marketerId}</p>
          <p><strong>البريد الإلكتروني:</strong> {userInfo.email}</p>
        </div>
      )}
    </div>
  );
}
