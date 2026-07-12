import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/Button';
import Container from '../../components/Container';
import Input from '../../components/Input';
import api from '../../services/api.js';
import useAuthStore from '../../store/auth.store.js';

const initialForm = { email: '', password: '' };

const FEATURE_BULLETS = [
  'Asset Lifecycle Control',
  'Conflict-Free Booking',
  'Maintenance Workflows',
  'Role-Based Access',
];

export default function LoginPage() {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setTransitioning = useAuthStore((s) => s.setTransitioning);

  const handleChange = (e) => setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTransitioning(true, true);
    try {
      const res = await api.post('/auth/login', formData);
      setAuth({ user: res.data.user, accessToken: res.data.accessToken });
      toast.success('Logged in successfully.');
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Login failed.';
      toast.error(msg);
      setTransitioning(false);
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="flex min-h-screen items-center justify-center py-4 lg:py-6">
      {!isSubmitting && (
        <div
          className="grid w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-(--app-color-border)/40 backdrop-blur-md lg:grid-cols-[1.1fr_0.9fr]"
          style={{ backgroundColor: 'var(--app-color-surface-glass)', boxShadow: 'var(--app-shadow-elevated)' }}
        >
          {/* ── Left branding panel ── */}
          <section
            className="relative flex flex-col items-center justify-center overflow-hidden p-8 text-center text-white lg:p-12"
            style={{ background: 'linear-gradient(160deg, #081420 0%, #0d2436 50%, #0f5f73 100%)' }}
          >
            <div className="noise-overlay pointer-events-none opacity-10" />
            {/* Radial glow behind logo so it blends seamlessly */}
            <div
              className="absolute top-[12%] left-1/2 -translate-x-1/2 h-52 w-52 rounded-full blur-3xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(15,95,115,0.55) 0%, transparent 70%)' }}
            />
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex flex-col items-center gap-5">
                <img src="/logo.svg" alt="AssetFlow Logo" className="h-28 w-28 object-contain" style={{ filter: 'drop-shadow(0 0 24px rgba(15,200,180,0.35))' }} />
                <div className="h-[2px] w-10 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #2dd4bf, transparent)' }} />
              </div>
              <div className="mt-7">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-teal-400/80">Enterprise Asset Management</p>
                <h1 className="text-4xl font-black leading-[1.05] tracking-tight lg:text-[2.8rem]">
                  Know Every Asset.<br />
                  <span style={{ background: 'linear-gradient(90deg, #2dd4bf, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Control Every Move.
                  </span>
                </h1>
                <p className="mx-auto mt-5 max-w-xs text-[0.9rem] leading-relaxed text-white/50">
                  One platform. Every department. Zero blind spots.
                </p>
              </div>
              {/* Clean 4-item single-column pill list */}
              <div className="mt-8 flex flex-col gap-2.5 w-full max-w-[220px]">
                {FEATURE_BULLETS.map((f) => (
                  <div key={f} className="flex items-center gap-3 rounded-xl px-4 py-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-400/20">
                      <svg className="h-2.5 w-2.5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-semibold tracking-wide text-white/80">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-5 left-0 right-0 z-10 flex items-center justify-between px-10 text-[8px] font-bold uppercase tracking-[0.3em] text-white/20">
              <p>© 2026 AssetFlow</p>
              <p>Odoo Hackathon 2026 · Esc(Reality);</p>
            </div>
          </section>

          {/* ── Right form panel ── */}
          <section
            className="auth-form-slide flex flex-col justify-center p-8 lg:p-12"
            style={{ backgroundColor: 'var(--app-color-surface-glass)' }}
          >
            <div className="mx-auto w-full max-w-sm">
              <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-(--app-color-text-muted) hover:text-(--app-color-primary) transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
              </Link>
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-(--app-color-text)">Welcome back</h2>
                <p className="mt-1 text-sm text-(--app-color-text-muted)">Sign in to your AssetFlow workspace</p>
              </div>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input label="Work Email" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@company.com" className="h-11 rounded-xl" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-(--app-color-text)">Password</label>
                    <a href="#" className="text-xs font-medium text-(--app-color-primary) hover:underline">Forgot password?</a>
                  </div>
                  <Input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="h-11 rounded-xl" />
                </div>
                <div className="pt-1">
                  <Button type="submit" className="h-11 w-full rounded-xl text-sm font-bold shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]" loading={isSubmitting} disabled={isSubmitting}>
                    Sign In to AssetFlow
                  </Button>
                </div>
                <p className="mt-8 text-center text-xs text-(--app-color-text-muted)">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-black text-(--app-color-primary) hover:text-(--app-color-primary-hover)">
                    Create one
                  </Link>
                </p>
              </form>
            </div>
          </section>
        </div>
      )}
    </Container>
  );
}
