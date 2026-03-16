import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const DEMO = [
  { role: 'Admin', email: 'admin@school.com', password: 'admin123', icon: '🛡️', color: '#4361ee' },
  { role: 'Teacher', email: 'james@school.com', password: 'teacher123', icon: '👩‍🏫', color: '#7c3aed' },
  { role: 'Student', email: 'student1@school.com', password: 'student123', icon: '🎓', color: '#10b981' },
];

export default function Login() {
  const [email, setEmail] = useState('admin@school.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await login(email, password);
      toast.success(`Welcome back, ${user.name}! 👋`);
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      {/* Animated background */}
      <div style={s.bg}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ ...s.blob, ...blobStyles[i] }} />
        ))}
      </div>

      {/* Left panel */}
      <div style={s.left}>
        <div style={s.leftContent}>
          <div style={s.brand}>
            <div style={s.brandIcon}>🏫</div>
            <div>
              <div style={s.brandName}>EduManage</div>
              <div style={s.brandTag}>v2.0 — School Management System</div>
            </div>
          </div>
          <h1 style={s.headline}>
            Managing schools,<br/>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>reimagined.</span>
          </h1>
          <p style={s.subtext}>
            A complete platform for students, teachers and administrators. Everything you need, beautifully designed.
          </p>
          <div style={s.featureGrid}>
            {['📊 Live Analytics', '🎓 Student Portal', '👩‍🏫 Teacher Tools', '💳 Fee Tracking', '📚 Library', '📢 Notices'].map(f => (
              <div key={f} style={s.featureChip}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={s.right}>
        <div style={s.formWrap}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={s.formTitle}>Sign in</h2>
            <p style={s.formSub}>Access your school portal</p>
          </div>

          {/* Demo quick-login */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Quick Demo Access</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {DEMO.map(d => (
                <button
                  key={d.role}
                  onClick={() => { setEmail(d.email); setPassword(d.password); }}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: 10,
                    border: email === d.email ? `2px solid ${d.color}` : '2px solid var(--border)',
                    background: email === d.email ? `${d.color}18` : 'var(--surface-2)',
                    cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 2 }}>{d.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: email === d.email ? d.color : 'var(--text-3)' }}>{d.role}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in...</>
              ) : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: 24, padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 10, fontSize: 12, color: 'var(--text-3)', lineHeight: 1.7, border: '1px solid var(--border)' }}>
            <strong style={{ color: 'var(--text-2)' }}>Demo Credentials</strong><br />
            🛡️ Admin: admin@school.com / admin123<br />
            👩‍🏫 Teacher: james@school.com / teacher123<br />
            🎓 Student: student1@school.com / student123
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30px) scale(1.05); } }
      `}</style>
    </div>
  );
}

const blobStyles = [
  { width: 500, height: 500, top: '-100px', left: '-100px', animationDelay: '0s', animationDuration: '8s' },
  { width: 400, height: 400, bottom: '-80px', right: '10%', animationDelay: '-2s', animationDuration: '10s' },
  { width: 300, height: 300, top: '40%', left: '30%', animationDelay: '-4s', animationDuration: '12s' },
  { width: 250, height: 250, top: '20%', right: '-50px', animationDelay: '-1s', animationDuration: '9s' },
  { width: 200, height: 200, bottom: '20%', left: '15%', animationDelay: '-3s', animationDuration: '11s' },
  { width: 180, height: 180, top: '60%', right: '20%', animationDelay: '-5s', animationDuration: '7s' },
];

const s = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" },
  bg: { position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 },
  blob: {
    position: 'absolute', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(67,97,238,0.15) 0%, rgba(124,58,237,0.08) 60%, transparent 80%)',
    animation: 'float linear infinite',
  },
  left: {
    flex: 1,
    background: 'linear-gradient(145deg, #0b0d1a 0%, #1a1f4e 50%, #0d1230 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '60px 48px', position: 'relative', overflow: 'hidden', zIndex: 1,
  },
  leftContent: { maxWidth: 480, position: 'relative', zIndex: 2 },
  brand: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 },
  brandIcon: {
    width: 52, height: 52, borderRadius: 14,
    background: 'linear-gradient(135deg, #4361ee, #7c3aed)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 26, boxShadow: '0 8px 24px rgba(67,97,238,0.5)',
  },
  brandName: { fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: 'white' },
  brandTag: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  headline: { fontFamily: "'Syne', sans-serif", fontSize: 44, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 16, letterSpacing: '-1px' },
  subtext: { fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 32 },
  featureGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  featureChip: {
    padding: '7px 14px', borderRadius: 100,
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 500,
  },
  right: {
    width: 480,
    background: 'var(--bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px', position: 'relative', zIndex: 1,
  },
  formWrap: { width: '100%', maxWidth: 380 },
  formTitle: { fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' },
  formSub: { fontSize: 14, color: 'var(--text-3)', marginTop: 6 },
};
