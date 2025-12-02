import { Link, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { appRoutes, sectionLabels } from '@/routes/appRoutes';
import logo from '@/assets/logo.svg';

const Icon = ({ name }: { name: string }) => {
  const common = { width: 16, height: 16 };
  switch (name) {
    case 'profile':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="4" />
          <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        </svg>
      );
    case 'overview':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="12" width="4" height="8" rx="1" />
          <rect x="10" y="6" width="4" height="14" rx="1" />
          <rect x="17" y="4" width="4" height="16" rx="1" />
        </svg>
      );
    case 'users':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="8" r="4" />
          <path d="M17 11a3 3 0 1 0-2.8-4" />
          <path d="M3 20c0-3.3 2.7-6 6-6 1.6 0 3.1.6 4.2 1.7" />
          <path d="M17 14c2.2 0 4 1.8 4 4" />
        </svg>
      );
    case 'units':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="10" width="6" height="10" rx="1" />
          <rect x="15" y="4" width="6" height="16" rx="1" />
          <path d="M9 12h6" />
        </svg>
      );
    case 'flows':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 5h8a4 4 0 1 1 0 8H6" />
          <circle cx="6" cy="5" r="2" />
          <circle cx="6" cy="13" r="2" />
          <circle cx="6" cy="19" r="2" />
          <path d="M6 15h8a4 4 0 1 1 0 8H6" />
        </svg>
      );
    case 'tasks':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7h7" />
          <path d="M4 12h7" />
          <path d="M4 17h7" />
          <path d="m14 9 2 2 4-4" />
          <path d="m14 14 2 2 4-4" />
        </svg>
      );
    case 'assigned':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 7h10" />
          <path d="M7 12h6" />
          <path d="M7 17h10" />
          <circle cx="4" cy="7" r="1" />
          <circle cx="4" cy="12" r="1" />
          <circle cx="4" cy="17" r="1" />
        </svg>
      );
    case 'alerts':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M5 20h14L12 4 5 20Z" />
        </svg>
      );
    case 'reports':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 20h12" />
          <rect x="6" y="4" width="12" height="16" rx="2" />
          <path d="M9 8h6" />
          <path d="M9 12h6" />
          <path d="M9 16h3" />
        </svg>
      );
    default:
      return null;
  }
};

export const Sidebar = () => {
  const location = useLocation();
  const { currentUser, roles } = useAppContext();

  const currentRole = roles.find((role) => role.id === currentUser?.roleId);

  const groupedRoutes = useMemo(() => {
    if (!currentRole) return [];
    const allowed = appRoutes.filter((route) => route.roles.includes(currentRole.key));
    const map = new Map<string, typeof allowed>();
    allowed.forEach((route) => {
      const section = route.section;
      const current = map.get(section) ?? [];
      current.push(route);
      map.set(section, current);
    });
    return Array.from(map.entries());
  }, [currentRole, location.pathname]);

  return (
    <aside
      style={{
        padding: '2rem 1.75rem',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        background: 'var(--sidebar-bg)',
        minHeight: '100vh',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <img src={logo} alt="Process SA" style={{ width: '42px', height: '42px' }} />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.3rem', letterSpacing: 0.2 }}>Process SA</h1>
          <small style={{ color: 'rgba(255,255,255,0.7)' }}>
            Perfil: {currentRole?.name ?? 'Sin rol'}
          </small>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {groupedRoutes.map(([section, routes]) => (
          <div key={section}>
            <p style={{ margin: '0 0 0.35rem', color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>
              {sectionLabels[section as keyof typeof sectionLabels]}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {routes.map((route) => {
                const active = location.pathname === route.path;
                return (
                  <Link
                    key={route.path}
                    to={route.path}
                    style={{
                      padding: '0.7rem 0.9rem',
                      borderRadius: '0.95rem',
                      background: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                      color: active ? '#fff' : 'rgba(255,255,255,0.88)',
                      display: 'flex',
                      flexDirection: 'column',
                      border: active ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                      transition: 'all 0.18s ease',
                      boxShadow: active ? '0 10px 24px rgba(0,0,0,0.18)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget.style.background = 'rgba(255,255,255,0.08)');
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget.style.background = active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)');
                    }}
                  >
                    <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Icon name={route.icon} /> {route.label}
                    </span>
                    <small style={{ color: 'rgba(255,255,255,0.65)' }}>{route.description}</small>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};
