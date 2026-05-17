import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { Button } from './Button';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = !!user?.isAdmin;
  const adminModePath = isAdmin ? '/admin' : '/admin-login';

  const handleLogout = () => {
    logout();
    navigate('/dashboard');
  };

  return (
    <div className="w-full md:w-1/5 h-screen max-h-screen md:sticky md:top-0 overflow-hidden bg-primary-dark text-dark-text p-6 flex flex-col">
      {/* Logo/Title */}
      <div className="mb-8">
        <h1 className="text-h2 text-dark-text font-bold">Martin System</h1>
        <p className="text-lg text-text-secondary">Process Operatør</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 min-h-0 overflow-y-auto space-y-3 text-xl">
        <SidebarLink label="Dashboard" to="/dashboard" />
        <SidebarLink label="Inventar" to="/inventory" />
        <SidebarLink label="Inventar Log" to="/scanner" />
        <SidebarLink label="Work Log" to="/logging" />
        <SidebarLink
          label={isAdmin ? 'Admin Panel' : 'Admin Mode'}
          to={adminModePath}
          isActive={location.pathname === '/admin' || location.pathname === '/admin-login'}
        />
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-gray-600 pt-4 space-y-3">
        <div className="text-xs">
          {user ? (
            <>
              <p className="text-text-secondary text-lg">Rettigheder:</p>
              <p className="font-semibold text-lg">{user.name}</p>
              {user.group && <p className="text-text-secondary text-lg">{user.group}</p>}
            </>
          ) : (
            <>
              <p className="text-text-secondary text-lg">Rettigheder:</p>
              <p className="font-semibold text-xl">Elev</p>
              <p className="text-text-secondary text-lg">Skift til Admin for at redigere</p>
            </>
          )}
        </div>
        {user && (
          <Button
            variant="secondary"
            size="lg"
            onClick={handleLogout}
            className="w-full text-text-primary"
          >
            Logout
          </Button>
        )}
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  label: string;
  to: string;
  isActive?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ label, to, isActive }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive: routeIsActive }) => `block w-full text-left px-4 py-2 rounded-sm font-semibold transition-colors ${
        isActive ?? routeIsActive
          ? 'bg-accent text-dark-text'
          : 'text-dark-text hover:bg-opacity-50 hover:bg-gray-700'
      }`}
    >
      {label}
    </NavLink>
  );
};
