import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Button from '../../components/Button';
import Container from '../../components/Container';
import Input from '../../components/Input';
import api from '../../services/api.js';
import useAuthStore from '../../store/auth.store.js';

const initialForm = { name: '', email: '', password: '', confirmPassword: '' };

const ONBOARDING_STEPS = [
  'Register with your work email.',
  'Admin assigns your role & department.',
  'Manage assets from day one.',
];

export default function RegisterPage() {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setTransitioning = useAuthStore((s) => s.setTransitioning);

  const handleChange = (e) => setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    setTransitioning(true, true);
    try {
      const res = await api.post('/auth/register', formData);
      setAuth({ user: res.data.user, accessToken: res.data.accessToken });
      toast.success('Account created successfully.');
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Registration failed.';
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
            {/* Radial glow behind logo */}
            <div
              className="absolute top-[12%] left-1/2 -translate-x-1/2 h-52 w-52 rounded-full blur-3xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(15,95,115,0.55) 0%, transparent 70%)' }}
            />
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex flex-col items-center gap-5">
                <img src="/logo.png" alt="AssetFlow Logo" className="h-28 w-28 object-contain" style={{ filter: 'drop-shadow(0 0 24px rgba(15,200,180,0.35))' }} />
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
              <div className="mt-8 flex flex-col gap-2.5 w-full max-w-[220px]">
                {ONBOARDING_STEPS.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl px-4 py-2.5 text-left" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-400/20 text-teal-400 text-[10px] font-black mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-[11px] font-semibold tracking-wide text-white/80 leading-snug">{step}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-5 left-0 right-0 z-10 flex items-center justify-between px-10 text-[8px] font-bold uppercase tracking-[0.3em] text-white/20">
              <p>© 2025 AssetFlow</p>
              <p>Odoo Hack 2025 · Esc(Reality);</p>
            </div>
          </section>

          {/* ── Right form panel ── */}
          <section
            className="auth-form-slide flex flex-col justify-center p-8 lg:p-10"
            style={{ backgroundColor: 'var(--app-color-surface-glass)' }}
          >
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-2xl font-bold tracking-tight text-(--app-color-text)">Create your account</h2>
                <p className="mt-0.5 text-xs text-(--app-color-text-muted)">Join your organization's AssetFlow workspace</p>
              </div>
              <form className="space-y-3" onSubmit={handleSubmit}>
                <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Jagdish Padhi" className="h-10 rounded-xl text-sm" />
                <Input label="Work Email" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@company.com" className="h-10 rounded-xl text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="h-10 rounded-xl text-sm" />
                  <Input label="Confirm" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="••••••••" className="h-10 rounded-xl text-sm" />
                </div>
                <p className="text-[10px] text-(--app-color-text-muted)">
                  Your account will be created as an <strong>Employee</strong>. An Admin will assign your role.
                </p>
                <div className="pt-1">
                  <Button type="submit" className="h-10 w-full rounded-xl text-xs font-bold shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]" loading={isSubmitting} disabled={isSubmitting}>
                    Create AssetFlow Account
                  </Button>
                </div>
                <p className="mt-6 text-center text-[11px] text-(--app-color-text-muted)">
                  Already have an account?{' '}
                  <Link to="/login" className="font-black text-(--app-color-primary) hover:text-(--app-color-primary-hover)">Sign in</Link>
                </p>
              </form>
            </div>
          </section>
        </div>
      )}
    </Container>
  );
}
