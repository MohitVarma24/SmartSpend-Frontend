import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  PiggyBank,
  PieChart,
  Lightbulb,
  FileSpreadsheet,
  Settings,
  LogOut,
  Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose, onOpenAddExpense }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Add Expense', action: onOpenAddExpense, icon: PlusCircle, isAction: true },
    { name: 'Budgets', path: '/budgets', icon: PiggyBank },
    { name: 'Analytics', path: '/analytics', icon: PieChart },
    { name: 'Smart Insights', path: '/insights', icon: Lightbulb },
    { name: 'Monthly Reports', path: '/reports', icon: FileSpreadsheet },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      <div 
        className={`mobile-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose} 
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo-icon">
            <Wallet size={22} />
          </div>
          <div className="sidebar-brand-text">
            Smart<span>Spend</span>
          </div>
        </div>

        {/* Navigation */}
        <ul className="sidebar-nav">
          {navLinks.map((item) => {
            const Icon = item.icon;
            if (item.isAction) {
              return (
                <li key={item.name} className="sidebar-item">
                  <button
                    type="button"
                    className="sidebar-link w-100 border-0 bg-transparent text-start"
                    onClick={() => {
                      if (onClose) onClose();
                      item.action?.();
                    }}
                  >
                    <Icon size={19} />
                    <span>{item.name}</span>
                  </button>
                </li>
              );
            }

            return (
              <li key={item.name} className="sidebar-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <Icon size={19} />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* User Card & Logout */}
        <div className="sidebar-footer">
          <div className="d-flex align-items-center justify-content-between px-2 py-1 mb-2">
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                style={{ width: '34px', height: '34px', backgroundColor: '#3B82F6', fontSize: '0.85rem' }}
              >
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-truncate">
                <div className="text-white small fw-bold text-truncate">{user?.fullName || 'User'}</div>
                <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>{user?.email || ''}</div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-link w-100 border-0 bg-transparent text-start text-danger"
            onClick={handleLogout}
            style={{ color: '#F87171' }}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
