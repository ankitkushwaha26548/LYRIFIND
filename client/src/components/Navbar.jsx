import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [dark, toggleTheme] = useTheme();
  const navigate = useNavigate();
  const link = ({ isActive }) => `rounded-md px-2 py-1 text-sm font-medium ${isActive ? 'text-brand-600 dark:text-brand-100' : 'text-slate-600 hover:text-brand-600 dark:text-slate-300'}`;

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-800/90">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3" aria-label="Main">
        <Link to="/" className="text-xl font-bold text-brand-600 dark:text-brand-100">🎵 LyriFind</Link>
        <div className="flex flex-wrap items-center gap-2">
          <NavLink to="/" end className={link}>Home</NavLink>
          {user && <NavLink to="/favorites" className={link}>❤ Favorites</NavLink>}
          {isAdmin && <NavLink to="/admin" className={link}>Admin</NavLink>}
          <button onClick={toggleTheme} className="btn-ghost !px-2 !py-1" aria-label="Toggle dark mode" title="Toggle dark mode">{dark ? '☀️' : '🌙'}</button>
          {user ? (
            <>
              <span className="hidden text-sm text-slate-500 sm:inline">Hi, {user.name}</span>
              <button className="btn-ghost" onClick={() => { logout(); navigate('/'); }}>Logout</button>
            </>
          ) : (
            <>
              <Link className="btn-ghost" to="/login">Login</Link>
              <Link className="btn-primary" to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
