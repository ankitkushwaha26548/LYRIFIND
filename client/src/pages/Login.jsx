import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorText } from '../api/client';
import Alert from '../components/Alert';

/** One component serves both /login and /register (mode prop). */
export default function Login({ mode }) {
  const isRegister = mode === 'register';
  const { authenticate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await authenticate(mode, isRegister ? form : { email: form.email, password: form.password });
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(errorText(err));
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-sm">
      <form onSubmit={submit} className="card space-y-3">
        <h1 className="text-xl font-bold">{isRegister ? 'Create your account' : 'Welcome back'}</h1>
        <Alert kind="error">{error}</Alert>
        {isRegister && (
          <label className="block text-sm"><span className="mb-1 block font-medium">Name</span>
            <input className="input" required maxLength={60} value={form.name} onChange={set('name')} autoComplete="name" /></label>
        )}
        <label className="block text-sm"><span className="mb-1 block font-medium">Email</span>
          <input className="input" type="email" required value={form.email} onChange={set('email')} autoComplete="email" /></label>
        <label className="block text-sm"><span className="mb-1 block font-medium">Password</span>
          <input className="input" type="password" required minLength={isRegister ? 8 : undefined} value={form.password} onChange={set('password')} autoComplete={isRegister ? 'new-password' : 'current-password'} />
          {isRegister && <span className="mt-1 block text-xs text-slate-500">At least 8 characters, with a letter and a number.</span>}
        </label>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Register' : 'Login'}</button>
        <p className="text-center text-sm text-slate-500">
          {isRegister ? <>Already registered? <Link className="text-brand-600 underline" to="/login">Login</Link></> : <>New here? <Link className="text-brand-600 underline" to="/register">Create an account</Link></>}
        </p>
      </form>
    </div>
  );
}
