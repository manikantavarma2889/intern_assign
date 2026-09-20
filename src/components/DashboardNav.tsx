import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, UserCog } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardNav() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const doLogout = async () => {
    await logout();
    nav('/login', { replace: true });
  };

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
      isActive
        ? 'text-[color:var(--color-text)] bg-[color:var(--color-surface)]'
        : 'text-[color:var(--color-text-dim)] hover:text-[color:var(--color-text)]'
    }`;

  return (
    <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)]/60 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Logo to="/dashboard" />
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/dashboard" className={linkCls}>
              <LayoutDashboard size={15} /> Dashboard
            </NavLink>
            <NavLink to="/profile" className={linkCls}>
              <UserCog size={15} /> Profile
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 pr-3 border-r border-[color:var(--color-border)]">
            <div className="w-8 h-8 rounded-full brass-gradient flex items-center justify-center text-[#0a0f0d] font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="text-sm text-[color:var(--color-text)] leading-tight">
              <div className="font-medium">{user?.name}</div>
              <div className="text-[11px] font-mono text-[color:var(--color-muted)]">signed in</div>
            </div>
          </div>
          <button
            onClick={doLogout}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[color:var(--color-text-dim)] hover:text-[color:var(--color-coral)] transition-colors"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
